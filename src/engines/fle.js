const MIN_MATCHES = 5, MIN_H2H = 3, STAT_H2H_GAP = 18, MODEL_ODDS_GAP = 20, ODDS_FLOOR = 48

export function strengthFromProb(p) {
  if (p >= 90) return 'BANKER'
  if (p >= 85) return 'STRONG'
  if (p >= 80) return 'SAFE'
  if (p >= 70) return 'MODERATE'
  if (p >= 60) return 'RISKY'
  return 'TRAP'
}

export function runFLE({ homeStats, awayStats, h2hSummary, oddsEvent, markets, showH2H, showOdds }) {
  return markets.map(mId => analyse(mId, homeStats, awayStats, h2hSummary, oddsEvent, showH2H, showOdds)).filter(Boolean)
}

function analyse(mId, home, away, h2h, odds, showH2H, showOdds) {
  const homeOk = (home?.matchesPlayed||0) >= MIN_MATCHES
  const awayOk = (away?.matchesPlayed||0) >= MIN_MATCHES
  const h2hOk  = showH2H && (h2h?.totalMatches||0) >= MIN_H2H

  if (!homeOk || !awayOk) return {
    mId, strength:'TRAP', confidence:0, modelProb:0, oddsImplied:null, oddsDisplay:null,
    noBet:true, conflict:'insufficient_data',
    explanation:`Insufficient season data (home: ${home?.matchesPlayed||0} matches, away: ${away?.matchesPlayed||0}). Min ${MIN_MATCHES} required.`,
    sources:['ESTIMATE']
  }

  let modelProb = 0, note = ''
  if      (mId==='o15')  { const r=overProb(1.5,home,away,h2h,h2hOk); modelProb=r.prob; note=r.note }
  else if (mId==='o25')  { const r=overProb(2.5,home,away,h2h,h2hOk); modelProb=r.prob; note=r.note }
  else if (mId==='o35')  { const r=overProb(3.5,home,away,h2h,h2hOk); modelProb=r.prob; note=r.note }
  else if (mId==='btts') { const r=bttsProb(home,away,h2h,h2hOk);     modelProb=r.prob; note=r.note }
  else return null

  let oddsImplied=null, oddsDisplay=null, oddsNote='', oddsConflict=null
  if (showOdds && odds) {
    const params = {o15:['totals',1.5],o25:['totals',2.5],o35:['totals',3.5],btts:['btts',null]}[mId]
    if (params) {
      const ex = extractOdds(odds, params[0], params[1])
      if (ex) {
        oddsImplied = ex.impliedProb; oddsDisplay = ex
        if (oddsImplied < ODDS_FLOOR)                            { oddsConflict='odds_low';          oddsNote=`Market implies only ${oddsImplied}% — bookmakers disagree.` }
        else if (Math.abs(modelProb-oddsImplied)>MODEL_ODDS_GAP) { oddsConflict='model_odds_diverge'; oddsNote=`Model (${modelProb}%) vs market (${oddsImplied}%) — ${Math.abs(modelProb-oddsImplied)}% gap.` }
        else oddsNote=`${ex.bookmakerCount} bookmakers: ${ex.medianOdds.toFixed(2)} odds → ${oddsImplied}% implied probability.`
      }
    }
  }

  const isConflict = !!oddsConflict
  let finalProb = modelProb
  if (oddsImplied !== null && !isConflict) finalProb = Math.round(modelProb*.7 + oddsImplied*.3)
  finalProb = Math.min(97, Math.round(finalProb))

  const strength = isConflict ? 'TRAP' : strengthFromProb(finalProb)
  return {
    mId, strength, confidence:finalProb, modelProb, oddsImplied, oddsDisplay,
    noBet: isConflict||strength==='TRAP',
    conflict: isConflict ? oddsConflict : null,
    explanation: [note, oddsNote].filter(Boolean).join(' '),
    sources: [home?.source||'FOOTBALL_DATA_ORG', ...(oddsDisplay?['ODDS_API']:[])]
  }
}

function overProb(line, home, away, h2h, h2hOk) {
  const exp = ((home.goalsForAvg+away.goalsAgainstAvg)/2) + ((away.goalsForAvg+home.goalsAgainstAvg)/2)
  const statP = poissonOver(exp, line)
  let h2hP = statP, h2hNote = ''
  if (h2hOk) {
    h2hP = line===1.5?h2h.over15:line===2.5?h2h.over25:h2h.over35
    h2hNote = ` H2H (${h2h.totalMatches} games): ${h2hP}% Over ${line}.`
  }
  const conflict = h2hOk && Math.abs(statP-h2hP) > STAT_H2H_GAP
  const blended = h2hOk ? Math.round(statP*.6+h2hP*.4) : statP
  return { prob:Math.min(97,blended), note:`Expected goals: ${exp.toFixed(2)}. Poisson model: ${statP}% Over ${line}.${h2hNote}${conflict?' ⚡ Stat/H2H conflict detected.':''}` }
}

function bttsProb(home, away, h2h, h2hOk) {
  const pH = 1-pmf(home.goalsForAvg,0), pA = 1-pmf(away.goalsForAvg,0)
  const statP = Math.round(pH*pA*100)
  let h2hP = statP, h2hNote = ''
  if (h2hOk) { h2hP=h2h.bttsRate; h2hNote=` H2H: ${h2hP}% BTTS in ${h2h.totalMatches} games.` }
  const conflict = h2hOk && Math.abs(statP-h2hP) > STAT_H2H_GAP
  const blended = h2hOk ? Math.round(statP*.6+h2hP*.4) : statP
  return { prob:Math.min(97,blended), note:`Home ${Math.round(pH*100)}% to score, Away ${Math.round(pA*100)}% to score. BTTS model: ${statP}%.${h2hNote}${conflict?' ⚡ Conflict.':''}` }
}

function extractOdds(ev, key, line) {
  const data = ev?.markets?.[key]; if (!data?.length) return null
  const prices = []
  for (const bm of data) for (const o of bm.outcomes) {
    if ((o.name==='Over'||o.name==='Yes') && (line===null||o.point===line)) prices.push(o.price)
  }
  if (!prices.length) return null
  prices.sort((a,b)=>a-b)
  const med = prices[Math.floor(prices.length/2)]
  return { medianOdds:med, bestOdds:Math.max(...prices), impliedProb:Math.round(100/med), bookmakerCount:data.length, line }
}

function poissonOver(lambda, line) {
  let under=0; for (let k=0;k<=Math.floor(line);k++) under+=pmf(lambda,k)
  return Math.round((1-under)*100)
}
function pmf(lambda, k) { let r=Math.exp(-lambda); for(let i=1;i<=k;i++) r*=lambda/i; return r }
