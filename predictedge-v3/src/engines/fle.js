/**
 * FLE v0.2 — Football Line Engine
 * Works with data from football-data.org standings endpoint.
 * Uses goals-for/against averages + H2H summary.
 */

const MIN_MATCHES    = 5
const MIN_H2H        = 3
const CONFLICT_DELTA = 18

export function probabilityToStrength(prob) {
  if (prob >= 90) return 'BANKER'
  if (prob >= 85) return 'STRONG'
  if (prob >= 80) return 'SAFE'
  if (prob >= 70) return 'MODERATE'
  if (prob >= 60) return 'RISKY'
  return 'TRAP'
}

export function runFLE({ fixture, homeTeamStats, awayTeamStats, h2hSummary, markets, tier }) {
  const results = []

  const homeOk = (homeTeamStats?.matchesPlayed ?? 0) >= MIN_MATCHES
  const awayOk = (awayTeamStats?.matchesPlayed ?? 0) >= MIN_MATCHES
  const h2hOk  = (h2hSummary?.totalMatches ?? 0)    >= MIN_H2H

  const allowedMarkets = tier.markets

  for (const marketId of markets) {
    if (!allowedMarkets.includes(marketId)) continue

    if (!homeOk || !awayOk) {
      results.push({
        marketId,
        strength: 'TRAP',
        confidence: 0,
        explanation: `Insufficient season data. Need ${MIN_MATCHES}+ matches; home has ${homeTeamStats?.matchesPlayed ?? 0}, away has ${awayTeamStats?.matchesPlayed ?? 0}.`,
        noBet: true,
        source: homeTeamStats?.source ?? 'UNKNOWN',
      })
      continue
    }

    let prob = 0
    let explanation = ''
    let conflict = false

    if (marketId === 'o15') {
      ;({ prob, explanation, conflict } = calcOver(1.5, homeTeamStats, awayTeamStats, h2hSummary, h2hOk))
    } else if (marketId === 'o25') {
      ;({ prob, explanation, conflict } = calcOver(2.5, homeTeamStats, awayTeamStats, h2hSummary, h2hOk))
    } else if (marketId === 'o35') {
      ;({ prob, explanation, conflict } = calcOver(3.5, homeTeamStats, awayTeamStats, h2hSummary, h2hOk))
    } else if (marketId === 'btts') {
      ;({ prob, explanation, conflict } = calcBTTS(homeTeamStats, awayTeamStats, h2hSummary, h2hOk))
    } else {
      continue
    }

    const finalStrength = conflict ? 'TRAP' : probabilityToStrength(prob)
    const conflictNote  = conflict ? '⚡ Conflict between season stats and H2H. ' : ''

    results.push({
      marketId,
      strength: finalStrength,
      confidence: Math.round(prob),
      explanation: conflictNote + explanation,
      noBet: conflict || finalStrength === 'TRAP',
      source: homeTeamStats?.source ?? 'FOOTBALL_DATA_ORG',
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
    h2hNote = ` H2H: ${h2hProb}% of last ${h2h.totalMatches} meetings went Over ${line}.`
  }

  const conflict = h2hOk && Math.abs(statProb - h2hProb) > CONFLICT_DELTA
  const blended  = h2hOk ? statProb * 0.6 + h2hProb * 0.4 : statProb

  const explanation =
    `Expected goals: ${expGoals.toFixed(2)} (home avg ${home.goalsForAvg.toFixed(2)} for + ${away.goalsAgainstAvg.toFixed(2)} against; away avg ${away.goalsForAvg.toFixed(2)} for + ${home.goalsAgainstAvg.toFixed(2)} against). ` +
    `Season model: ${statProb}% probability Over ${line}.` +
    h2hNote

  return { prob: Math.min(97, Math.round(blended)), explanation, conflict }
}

// ── BTTS ─────────────────────────────────────────────────────
function calcBTTS(home, away, h2h, h2hOk) {
  // Approximate P(team scores) from avg goals using Poisson
  const pHomeScores = 1 - poissonPMF(home.goalsForAvg, 0)
  const pAwayScores = 1 - poissonPMF(away.goalsForAvg, 0)
  const statProb    = Math.round(pHomeScores * pAwayScores * 100)

  let h2hProb = statProb
  let h2hNote = ''
  if (h2hOk) {
    h2hProb = h2h.bttsRate
    h2hNote = ` H2H: ${h2hProb}% BTTS in last ${h2h.totalMatches} meetings.`
  }

  const conflict = h2hOk && Math.abs(statProb - h2hProb) > CONFLICT_DELTA
  const blended  = h2hOk ? statProb * 0.6 + h2hProb * 0.4 : statProb

  const explanation =
    `Home avg ${home.goalsForAvg.toFixed(2)} goals/game → ${Math.round(pHomeScores * 100)}% chance of scoring. ` +
    `Away avg ${away.goalsForAvg.toFixed(2)} goals/game → ${Math.round(pAwayScores * 100)}% chance of scoring. ` +
    `Season BTTS estimate: ${statProb}%.` +
    h2hNote

  return { prob: Math.min(97, Math.round(blended)), explanation, conflict }
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
