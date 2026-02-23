/**
 * FLE v1.0 — Football Line Engine
 * Three signal layers: Season Stats → H2H → Odds Validation
 */

const MIN_MATCHES    = 5
const MIN_H2H        = 3
const STAT_H2H_GAP   = 18
const MODEL_ODDS_GAP = 20
const ODDS_FLOOR     = 48

export function strengthFromProb(p) {
  if (p >= 90) return 'BANKER'
  if (p >= 85) return 'STRONG'
  if (p >= 80) return 'SAFE'
  if (p >= 70) return 'MODERATE'
  if (p >= 60) return 'RISKY'
  return 'TRAP'
}

export function runFLE({ fixture, homeStats, awayStats, h2hSummary, oddsEvent, markets, tier }) {
  return markets
    .filter(mId => tier.markets.includes(mId))
    .map(mId => analyseMarket(mId, homeStats, awayStats, h2hSummary, oddsEvent, tier))
    .filter(Boolean)
}

function analyseMarket(mId, home, away, h2h, oddsEvent, tier) {
  const homeOk = (home?.matchesPlayed ?? 0) >= MIN_MATCHES
  const awayOk = (away?.matchesPlayed ?? 0) >= MIN_MATCHES
  const h2hOk  = (h2h?.totalMatches    ?? 0) >= MIN_H2H

  if (!homeOk || !awayOk) {
    return { mId, strength: 'TRAP', confidence: 0, modelProb: 0, oddsImplied: null, oddsDisplay: null, noBet: true, conflict: 'insufficient_data', explanation: `Not enough season data (home: ${home?.matchesPlayed ?? 0}, away: ${away?.matchesPlayed ?? 0} games). Min ${MIN_MATCHES} required.`, sources: ['ESTIMATE'] }
  }

  // Layer 1: stat model
  let modelProb, statNote
  if (mId === 'o15') { const r = overProb(1.5, home, away, h2h, h2hOk); modelProb = r.prob; statNote = r.note }
  else if (mId === 'o25') { const r = overProb(2.5, home, away, h2h, h2hOk); modelProb = r.prob; statNote = r.note }
  else if (mId === 'o35') { const r = overProb(3.5, home, away, h2h, h2hOk); modelProb = r.prob; statNote = r.note }
  else if (mId === 'btts') { const r = bttsProb(home, away, h2h, h2hOk); modelProb = r.prob; statNote = r.note }
  else return null

  // Layer 2: odds validation
  let oddsImplied = null, oddsDisplay = null, oddsNote = '', oddsConflict = null
  const oddsParams = { o15: ['totals',1.5], o25: ['totals',2.5], o35: ['totals',3.5], btts: ['btts',null] }[mId]
  if (oddsEvent && oddsParams) {
    const ex = extractOdds(oddsEvent, oddsParams[0], oddsParams[1])
    if (ex) {
      oddsImplied = ex.impliedProb
      oddsDisplay = ex
      if (oddsImplied < ODDS_FLOOR) { oddsConflict = 'odds_low'; oddsNote = `Market only implies ${oddsImplied}% — bookmakers disagree.` }
      else if (Math.abs(modelProb - oddsImplied) > MODEL_ODDS_GAP) { oddsConflict = 'model_odds_diverge'; oddsNote = `Model (${modelProb}%) vs market (${oddsImplied}%) gap is ${Math.abs(modelProb - oddsImplied)}%.` }
      else oddsNote = `${ex.bookmakerCount} bookmakers: ${ex.medianOdds.toFixed(2)} odds → ${oddsImplied}% implied.`
    }
  }

  // Layer 3: final verdict
  const isConflict = oddsConflict !== null
  let finalProb = modelProb
  if (oddsImplied !== null && !isConflict) finalProb = Math.round(modelProb * 0.7 + oddsImplied * 0.3)
  finalProb = Math.min(97, Math.round(finalProb))

  const strength = isConflict ? 'TRAP' : strengthFromProb(finalProb)
  const sources = [home?.source ?? 'FOOTBALL_DATA_ORG']
  if (oddsDisplay) sources.push('ODDS_API')

  return {
    mId, strength, confidence: finalProb, modelProb, oddsImplied, oddsDisplay,
    noBet: isConflict || strength === 'TRAP',
    conflict: isConflict ? oddsConflict : null,
    explanation: [statNote, oddsNote].filter(Boolean).join(' '),
    sources,
  }
}

function overProb(line, home, away, h2h, h2hOk) {
  const exp = ((home.goalsForAvg + away.goalsAgainstAvg) / 2) + ((away.goalsForAvg + home.goalsAgainstAvg) / 2)
  const statP = poissonOver(exp, line)
  let h2hP = statP, h2hNote = ''
  if (h2hOk) {
    h2hP = line === 1.5 ? h2h.over15 : line === 2.5 ? h2h.over25 : h2h.over35
    h2hNote = ` H2H ${h2h.totalMatches} games: ${h2hP}% Over ${line}.`
  }
  const conflict = h2hOk && Math.abs(statP - h2hP) > STAT_H2H_GAP
  const blended = h2hOk ? Math.round(statP * 0.6 + h2hP * 0.4) : statP
  const note = `xG: ${exp.toFixed(2)}. Season model: ${statP}% Over ${line}.${h2hNote}${conflict ? ' ⚡ Stat/H2H conflict.' : ''}`
  return { prob: Math.min(97, blended), note, conflict }
}

function bttsProb(home, away, h2h, h2hOk) {
  const pH = 1 - poissonPMF(home.goalsForAvg, 0)
  const pA = 1 - poissonPMF(away.goalsForAvg, 0)
  const statP = Math.round(pH * pA * 100)
  let h2hP = statP, h2hNote = ''
  if (h2hOk) {
    h2hP = h2h.bttsRate
    h2hNote = ` H2H: ${h2hP}% BTTS in ${h2h.totalMatches} games.`
  }
  const conflict = h2hOk && Math.abs(statP - h2hP) > STAT_H2H_GAP
  const blended = h2hOk ? Math.round(statP * 0.6 + h2hP * 0.4) : statP
  const note = `Home scores ${Math.round(pH*100)}%, Away scores ${Math.round(pA*100)}%. BTTS: ${statP}%.${h2hNote}${conflict ? ' ⚡ Conflict.' : ''}`
  return { prob: Math.min(97, blended), note, conflict }
}

function extractOdds(event, key, line) {
  const data = event?.markets?.[key]
  if (!data?.length) return null
  const prices = []
  for (const bm of data) {
    for (const o of bm.outcomes) {
      const ok = (o.name === 'Over' || o.name === 'Yes')
      const lineOk = line === null || o.point === line
      if (ok && lineOk) prices.push(o.price)
    }
  }
  if (!prices.length) return null
  prices.sort((a,b) => a-b)
  const med = prices[Math.floor(prices.length/2)]
  return { medianOdds: med, bestOdds: Math.max(...prices), impliedProb: Math.round(100/med), bookmakerCount: data.length, line }
}

function poissonOver(lambda, line) {
  let under = 0
  for (let k = 0; k <= Math.floor(line); k++) under += poissonPMF(lambda, k)
  return Math.round((1 - under) * 100)
}

function poissonPMF(lambda, k) {
  let r = Math.exp(-lambda)
  for (let i = 1; i <= k; i++) r *= lambda / i
  return r
}
