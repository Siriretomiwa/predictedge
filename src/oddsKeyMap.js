/**
 * oddsKeyMap.js
 * Maps football-data.org competition codes → The Odds API sport keys.
 *
 * football-data.org uses short codes like "PL", "PD", "BL1"
 * The Odds API uses keys like "soccer_epl", "soccer_spain_la_liga"
 *
 * Add new entries here as you add more competitions.
 * If a competition isn't mapped, odds are simply skipped for it.
 */

export const COMPETITION_TO_ODDS_KEY = {
  PL:  'soccer_epl',               // Premier League
  PD:  'soccer_spain_la_liga',      // La Liga
  BL1: 'soccer_germany_bundesliga', // Bundesliga
  SA:  'soccer_italy_serie_a',      // Serie A
  FL1: 'soccer_france_ligue_one',   // Ligue 1
  DED: 'soccer_netherlands_eredivisie',
  PPL: 'soccer_portugal_primeira_liga',
  ELC: 'soccer_england_league1',    // Championship (closest available)
  CL:  'soccer_uefa_champs_league',
  EC:  'soccer_uefa_european_championship',
  // Add more as needed — full list at:
  // https://api.the-odds-api.com/v4/sports/?apiKey=YOUR_KEY
}

export function getOddsKey(competitionCode) {
  return COMPETITION_TO_ODDS_KEY[competitionCode] ?? null
}

/**
 * Given an odds event and a fixture, determine if they match.
 * The Odds API uses team names in English — we do fuzzy matching.
 */
export function matchOddsToFixture(oddsEvent, fixture) {
  const normalize = str =>
    str.toLowerCase()
       .replace(/\s+fc$/i, '')
       .replace(/\s+afc$/i, '')
       .replace(/\bman\b/g, 'manchester')
       .replace(/\bspurs\b/g, 'tottenham')
       .replace(/\batletico\b/g, 'atletico')
       .replace(/[^a-z0-9]/g, '')
       .trim()

  const oddsHome = normalize(oddsEvent.homeTeam)
  const oddsAway = normalize(oddsEvent.awayTeam)
  const fixHome  = normalize(fixture.homeTeam.name)
  const fixAway  = normalize(fixture.awayTeam.name)

  // Exact match
  if (oddsHome === fixHome && oddsAway === fixAway) return true

  // Partial match (one contains the other — handles "Man City" vs "Manchester City")
  const homeMatch = oddsHome.includes(fixHome) || fixHome.includes(oddsHome)
  const awayMatch = oddsAway.includes(fixAway) || fixAway.includes(oddsAway)

  return homeMatch && awayMatch
}

/**
 * Extract the best (sharpest) odds for a given market from an odds event.
 * We use the median across bookmakers to avoid outliers.
 */
export function extractMarketOdds(oddsEvent, marketKey, line = null) {
  const marketData = oddsEvent.markets?.[marketKey]
  if (!marketData?.length) return null

  // Collect all "Over" or "Yes" prices across bookmakers
  const prices = []
  for (const bm of marketData) {
    for (const outcome of bm.outcomes) {
      const isOver = outcome.name === 'Over' || outcome.name === 'Yes'
      const lineMatch = line === null || outcome.point === line || outcome.point === undefined
      if (isOver && lineMatch) prices.push(outcome.price)
    }
  }

  if (!prices.length) return null

  prices.sort((a, b) => a - b)
  const median = prices[Math.floor(prices.length / 2)]
  const best   = Math.max(...prices)
  const worst  = Math.min(...prices)

  // Convert decimal odds to implied probability
  const impliedProb = Math.round((1 / median) * 100)

  return {
    medianOdds:  median,
    bestOdds:    best,
    worstOdds:   worst,
    impliedProb, // e.g. 65 means market implies 65% chance
    bookmakerCount: marketData.length,
    marketKey,
  }
}

/**
 * Map our internal market ID to The Odds API market key + line.
 */
export function marketIdToOddsParams(marketId) {
  switch (marketId) {
    case 'o15': return { key: 'totals', line: 1.5 }
    case 'o25': return { key: 'totals', line: 2.5 }
    case 'o35': return { key: 'totals', line: 3.5 }
    case 'btts': return { key: 'btts', line: null }
    default:    return null
  }
}
