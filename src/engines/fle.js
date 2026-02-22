/**
 * FLE v0.3 — Football Line Engine
 * ─────────────────────────────────────────────────────────────
 * Three signal layers, each can strengthen or veto a pick:
 *
 *   Layer 1 — Season stats (football-data.org standings)
 *             Poisson model on goals-for/against averages
 *
 *   Layer 2 — H2H history (football-data.org h2h endpoint)
 *             Historical over/btts rates, blended 60/40 with stats
 *
 *   Layer 3 — Market odds (The Odds API)
 *             Implied probability from bookmaker consensus
 *             Used to: validate picks, show on card, flag conflicts
 *
 * Conflict rules:
 *   - Stats vs H2H diverge >18%  → TRAP
 *   - Model vs Odds diverge >20% → TRAP (market disagrees strongly)
 *   - Odds implied prob < 50%    → TRAP regardless of model
 * ─────────────────────────────────────────────────────────────
 */

const MIN_MATCHES    = 5
const MIN_H2H        = 3
const STAT_H2H_DELTA = 18   // % gap that triggers stat vs H2H conflict
const MODEL_ODDS_DELTA = 20  // % gap that triggers model vs odds conflict
const ODDS_FLOOR     = 50   // if market implies <50%, always TRAP

export function probabilityToStrength(prob) {
  if (prob >= 90) return 'BANKER'
  if (prob >= 85) return 'STRONG'
  if (prob >= 80) return 'SAFE'
  if (prob >= 70) return 'MODERATE'
  if (prob >= 60) return 'RISKY'
  return 'TRAP'
}

/**
 * Main entry point.
 * @param {object} params
 * @param {object} params.fixture        – normalised fixture from football-data.org
 * @param {object} params.homeTeamStats  – from standings endpoint
 * @param {object} params.awayTeamStats  – from standings endpoint
 * @param {object} params.h2hSummary     – from h2h endpoint (optional)
 * @param {object} params.oddsData       – matched odds event from The Odds API (optional)
 * @param {string[]} params.markets      – market IDs to analyse e.g. ['o25', 'btts']
 * @param {object} params.tier           – user tier object
 */
export function runFLE({ fixture, homeTeamStats, awayTeamStats, h2hSummary, oddsData, markets, tier }) {
  const results = []

  const homeOk = (homeTeamStats?.matchesPlayed ?? 0) >= MIN_MATCHES
  const awayOk = (awayTeamStats?.matchesPlayed ?? 0) >= MIN_MATCHES
  const h2hOk  = (h2hSummary?.totalMatches ?? 0)    >= MIN_H2H
  const hasOdds = !!oddsData

  for (const marketId of markets) {
    if (!tier.markets.includes(marketId)) continue

    // ── Layer 1: Stats model ────────────────────────────────
    if (!homeOk || !awayOk) {
      results.push({
        marketId,
        strength: 'TRAP',
        confidence: 0,
        modelProb: 0,
        oddsImpliedProb: null,
        oddsData: null,
        explanation: `Insufficient season data (home: ${homeTeamStats?.matchesPlayed ?? 0} matches, away: ${awayTeamStats?.matchesPlayed ?? 0}). Minimum ${MIN_MATCHES} required.`,
        conflictReason: 'insufficient_data',
        noBet: true,
        sources: ['INSUFFICIENT_DATA'],
      })
      continue
    }

    let modelProb  = 0
    let statExpl   = ''
    let statH2HConflict = false

    if (marketId === 'o15') {
      ;({ prob: modelProb, explanation: statExpl, conflict: statH2HConflict } = calcOver(1.5, homeTeamStats, awayTeamStats, h2hSummary, h2hOk))
    } else if (marketId === 'o25') {
      ;({ prob: modelProb, explanation: statExpl, conflict: statH2HConflict } = calcOver(2.5, homeTeamStats, awayTeamStats, h2hSummary, h2hOk))
    } else if (marketId === 'o35') {
      ;({ prob: modelProb, explanation: statExpl, conflict: statH2HConflict } = calcOver(3.5, homeTeamStats, awayTeamStats, h2hSummary, h2hOk))
    } else if (marketId === 'btts') {
      ;({ prob: modelProb, explanation: statExpl, conflict: statH2HConflict } = calcBTTS(homeTeamStats, awayTeamStats, h2hSummary, h2hOk))
    } else {
      continue
    }

    // ── Layer 2: Odds validation ────────────────────────────
    let oddsImpliedProb = null
    let oddsDisplay     = null
    let oddsConflict    = false
    let oddsConflictReason = null
    let oddsExpl        = ''
    const sources       = [homeTeamStats?.source ?? 'FOOTBALL_DATA_ORG']

    if (hasOdds) {
      const oddsParams = marketIdToParams(marketId)
      if (oddsParams) {
        const extracted = extractBestOdds(oddsData, oddsParams.key, oddsParams.line)
        if (extracted) {
          oddsImpliedProb = extracted.impliedProb
          oddsDisplay     = extracted
          sources.push('ODDS_API')

          // Conflict: market thinks <50% chance
          if (oddsImpliedProb < ODDS_FLOOR) {
            oddsConflict = true
            oddsConflictReason = `market_low_prob`
            oddsExpl = `⚡ Odds imply only ${oddsImpliedProb}% — market disagrees with model.`
          }
          // Conflict: model and market diverge significantly
          else if (Math.abs(modelProb - oddsImpliedProb) > MODEL_ODDS_DELTA) {
            oddsConflict = true
            oddsConflictReason = `model_odds_diverge`
            oddsExpl = `⚡ Model (${modelProb}%) and odds implied (${oddsImpliedProb}%) diverge by ${Math.abs(modelProb - oddsImpliedProb)}%.`
          } else {
            // Odds agree — note it in explanation
            oddsExpl = `Bookmaker consensus (${extracted.bookmakerCount} books): ${extracted.medianOdds.toFixed(2)} odds → implies ${oddsImpliedProb}% probability.`
          }
        }
      }
    }

    // ── Final verdict ───────────────────────────────────────
    const isConflict  = statH2HConflict || oddsConflict
    const conflictReason = statH2HConflict ? 'stat_h2h_diverge' : oddsConflictReason

    // When odds available and agree, slightly boost confidence toward odds-implied
    let finalProb = modelProb
    if (hasOdds && oddsImpliedProb !== null && !oddsConflict) {
      finalProb = Math.round(modelProb * 0.7 + oddsImpliedProb * 0.3)
    }
    finalProb = Math.min(97, Math.round(finalProb))

    const strength = isConflict ? 'TRAP' : probabilityToStrength(finalProb)

    // Build full explanation
    const fullExpl = [
      statExpl,
      oddsExpl,
      isConflict && conflictReason === 'stat_h2h_diverge'
        ? `⚡ Season stats and H2H history conflict — no reliable signal.`
        : '',
    ].filter(Boolean).join(' ')

    results.push({
      marketId,
      strength,
      confidence: finalProb,
      modelProb,
      oddsImpliedProb,
      oddsDisplay,
      explanation: fullExpl,
      conflictReason: isConflict ? conflictReason : null,
      noBet: isConflict || strength === 'TRAP',
      sources,
    })
  }

  return results
}

// ── Over X.5 ─────────────────────────────────────────────────
function calcOver(line, home, away, h2h, h2hOk) {
  const expGoals =
    ((home.goalsForAvg + away.goalsAgainstAvg) / 2) +
    ((away.goalsForAvg + home.goalsAgainstAvg) / 2)

  const statProb = poissonOverProb(expGoals, line)

  let h2hProb = statProb
  let h2hNote = ''
  if (h2hOk) {
    h2hProb = line === 1.5 ? h2h.over15Rate : line === 2.5 ? h2h.over25Rate : h2h.over35Rate
    h2hNote = ` H2H ${h2h.totalMatches} meetings: ${h2hProb}% went Over ${line}.`
  }

  const conflict = h2hOk && Math.abs(statProb - h2hProb) > STAT_H2H_DELTA
  const blended  = h2hOk ? Math.round(statProb * 0.6 + h2hProb * 0.4) : statProb

  const explanation =
    `Expected goals: ${expGoals.toFixed(2)} (home ${home.goalsForAvg.toFixed(2)} for / ${away.goalsAgainstAvg.toFixed(2)} against; away ${away.goalsForAvg.toFixed(2)} for / ${home.goalsAgainstAvg.toFixed(2)} against). ` +
    `Season model: ${statProb}% Over ${line}.` + h2hNote

  return { prob: Math.min(97, blended), explanation, conflict }
}

// ── BTTS ─────────────────────────────────────────────────────
function calcBTTS(home, away, h2h, h2hOk) {
  const pHomeScores = 1 - poissonPMF(home.goalsForAvg, 0)
  const pAwayScores = 1 - poissonPMF(away.goalsForAvg, 0)
  const statProb    = Math.round(pHomeScores * pAwayScores * 100)

  let h2hProb = statProb
  let h2hNote = ''
  if (h2hOk) {
    h2hProb = h2h.bttsRate
    h2hNote = ` H2H ${h2h.totalMatches} meetings: ${h2hProb}% BTTS.`
  }

  const conflict = h2hOk && Math.abs(statProb - h2hProb) > STAT_H2H_DELTA
  const blended  = h2hOk ? Math.round(statProb * 0.6 + h2hProb * 0.4) : statProb

  const explanation =
    `Home avg ${home.goalsForAvg.toFixed(2)} goals → ${Math.round(pHomeScores * 100)}% chance to score. ` +
    `Away avg ${away.goalsForAvg.toFixed(2)} goals → ${Math.round(pAwayScores * 100)}% chance to score. ` +
    `Season BTTS estimate: ${statProb}%.` + h2hNote

  return { prob: Math.min(97, blended), explanation, conflict }
}

// ── Odds helpers ──────────────────────────────────────────────
function marketIdToParams(marketId) {
  switch (marketId) {
    case 'o15':  return { key: 'totals', line: 1.5 }
    case 'o25':  return { key: 'totals', line: 2.5 }
    case 'o35':  return { key: 'totals', line: 3.5 }
    case 'btts': return { key: 'btts',   line: null }
    default:     return null
  }
}

function extractBestOdds(oddsEvent, marketKey, line) {
  const marketData = oddsEvent?.markets?.[marketKey]
  if (!marketData?.length) return null

  const prices = []
  for (const bm of marketData) {
    for (const outcome of bm.outcomes) {
      const isTarget = outcome.name === 'Over' || outcome.name === 'Yes'
      const lineOk   = line === null || outcome.point === line || outcome.point === undefined
      if (isTarget && lineOk) prices.push(outcome.price)
    }
  }

  if (!prices.length) return null

  prices.sort((a, b) => a - b)
  const median = prices[Math.floor(prices.length / 2)]

  return {
    medianOdds:     Math.round(median * 100) / 100,
    bestOdds:       Math.max(...prices),
    impliedProb:    Math.round((1 / median) * 100),
    bookmakerCount: marketData.length,
    line,
  }
}

// ── Poisson helpers ───────────────────────────────────────────
function poissonOverProb(lambda, line) {
  let under = 0
  for (let k = 0; k <= Math.floor(line); k++) under += poissonPMF(lambda, k)
  return Math.round((1 - under) * 100)
}

function poissonPMF(lambda, k) {
  let result = Math.exp(-lambda)
  for (let i = 1; i <= k; i++) result *= lambda / i
  return result
}
