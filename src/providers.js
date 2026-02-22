/**
 * ============================================================
 * API PROVIDER REGISTRY — v4
 * ============================================================
 * ACTIVE:
 *   FOOTBALL_DATA_ORG  → fixtures, results, standings, H2H
 *   ODDS_API           → real bookmaker odds for h2h, totals
 *
 * The two APIs complement each other perfectly:
 *   football-data.org  = WHAT is happening (fixtures, stats)
 *   The Odds API       = WHAT the market thinks (odds)
 *
 * FUTURE (just flip active: true + add env key):
 *   BZZOIRO, API_FOOTBALL, API_BASKETBALL
 * ============================================================
 */

export const PROVIDERS = {

  FOOTBALL_DATA_ORG: {
    id: 'FOOTBALL_DATA_ORG',
    name: 'football-data.org',
    envKey: 'FOOTBALL_DATA_KEY',
    active: true,
    free: true,
    freeLimits: '10 req/min · 12 competitions · No daily cap',
    capabilities: ['fixtures', 'results', 'standings', 'h2h'],
    sports: ['football'],
    color: '#00E676',
    endpoints: {
      competitions: '/api/football/competitions',
      fixtures:     '/api/football/fixtures',
      standings:    '/api/football/standings',
      h2h:          '/api/football/h2h',
    },
  },

  ODDS_API: {
    id: 'ODDS_API',
    name: 'The Odds API',
    envKey: 'ODDS_API_KEY',
    active: true,
    free: true,
    freeLimits: '500 req/month · h2h + totals + outrights · EU bookmakers',
    capabilities: ['odds_h2h', 'odds_totals', 'odds_btts'],
    sports: ['football', 'basketball'],
    color: '#FFD740',
    endpoints: {
      sports:    '/api/odds/sports',
      odds:      '/api/odds/odds',
      remaining: '/api/odds/remaining',
    },
  },

  // ── FUTURE ─────────────────────────────────────────────────
  BZZOIRO: {
    id: 'BZZOIRO',
    name: 'Bzzoiro Sports Data',
    envKey: 'BZZOIRO_KEY',
    active: false,
    free: true,
    freeLimits: 'No rate limit · ML predictions · BTTS/Over built-in',
    capabilities: ['predictions', 'xg'],
    sports: ['football'],
    color: '#40C4FF',
    endpoints: { fixtures: '/api/bzzoiro/fixtures' },
  },

  API_BASKETBALL: {
    id: 'API_BASKETBALL',
    name: 'API-Basketball',
    envKey: 'API_BASKETBALL_KEY',
    active: false,
    free: true,
    freeLimits: '100 req/day',
    capabilities: ['fixtures', 'stats'],
    sports: ['basketball'],
    color: '#FF6D00',
    endpoints: { fixtures: '/api/basketball/fixtures' },
  },
}

export const getActiveProviders  = (sport) => Object.values(PROVIDERS).filter(p => p.active  && p.sports.includes(sport))
export const getInactiveProviders = (sport) => Object.values(PROVIDERS).filter(p => !p.active && p.sports.includes(sport))

/**
 * Maps football-data.org competition codes → The Odds API sport keys.
 * The Odds API uses different identifiers for each league.
 */
export const COMP_TO_ODDS_SPORT = {
  PL:  'soccer_epl',
  PD:  'soccer_spain_la_liga',
  BL1: 'soccer_germany_bundesliga',
  SA:  'soccer_italy_serie_a',
  FL1: 'soccer_france_ligue_one',
  CL:  'soccer_uefa_champs_league',
  DED: 'soccer_netherlands_eredivisie',
  PPL: 'soccer_portugal_primeira_liga',
  ELC: 'soccer_england_championship',
  BSA: 'soccer_brazil_campeonato',
}
