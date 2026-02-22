/**
 * ============================================================
 * API PROVIDER REGISTRY
 * ============================================================
 * PRIMARY:   football-data.org  — free, instant key, major leagues
 * SECONDARY: Bzzoiro Sports     — free, no rate limit, has BTTS/Over built-in
 * FUTURE:    API-Football       — 100/day free, richest data
 *            The Odds API       — odds data
 *            API-Basketball     — basketball
 * ============================================================
 */

export const PROVIDERS = {

  // ── PRIMARY ───────────────────────────────────────────────
  FOOTBALL_DATA_ORG: {
    id: 'FOOTBALL_DATA_ORG',
    name: 'football-data.org',
    signupUrl: 'https://www.football-data.org/client/register',
    envKey: 'FOOTBALL_DATA_KEY',
    active: true,
    free: true,
    freeLimits: '10 requests/min · 12 competitions · No daily cap',
    howToGetKey: [
      'Go to football-data.org/client/register',
      'Enter your email address',
      'Check your email — key arrives instantly',
      'Copy the key and paste it into Vercel env vars as FOOTBALL_DATA_KEY',
    ],
    capabilities: ['fixtures', 'results', 'standings', 'h2h', 'teams'],
    sports: ['football'],
    color: '#00E676',
    endpoints: {
      competitions: '/api/football/competitions',
      fixtures:     '/api/football/fixtures',
      standings:    '/api/football/standings',
      h2h:          '/api/football/h2h',
      team:         '/api/football/team',
    },
  },

  // ── SECONDARY (also free, no rate limit, has ML predictions) ─
  BZZOIRO: {
    id: 'BZZOIRO',
    name: 'Bzzoiro Sports Data',
    signupUrl: 'https://sports.bzzoiro.com',
    envKey: 'BZZOIRO_KEY',
    active: false,   // flip true once you register at sports.bzzoiro.com
    free: true,
    freeLimits: 'No rate limit · 30+ leagues · ML predictions included',
    howToGetKey: [
      'Go to sports.bzzoiro.com',
      'Click Register — free, no credit card',
      'Copy your API token',
      'Add to Vercel as BZZOIRO_KEY',
    ],
    capabilities: ['fixtures', 'predictions', 'odds', 'btts', 'over_under', 'xg'],
    sports: ['football'],
    color: '#40C4FF',
    endpoints: {
      leagues:  '/api/bzzoiro/leagues',
      fixtures: '/api/bzzoiro/fixtures',
    },
  },

  // ── FUTURE: API-Football (richest stats) ─────────────────
  API_FOOTBALL: {
    id: 'API_FOOTBALL',
    name: 'API-Football',
    signupUrl: 'https://dashboard.api-football.com/register',
    envKey: 'API_FOOTBALL_KEY',
    active: false,
    free: true,
    freeLimits: '100 requests/day free · All endpoints',
    howToGetKey: [
      'Go to dashboard.api-football.com/register',
      'Sign up with email — no credit card',
      'Find your key in the Dashboard',
      'Add to Vercel as API_FOOTBALL_KEY',
    ],
    capabilities: ['fixtures', 'stats', 'h2h', 'standings', 'form', 'lineups', 'predictions'],
    sports: ['football'],
    color: '#69F0AE',
    endpoints: {
      leagues:  '/api/apifootball/leagues',
      fixtures: '/api/apifootball/fixtures',
      stats:    '/api/apifootball/stats',
    },
  },

  // ── FUTURE: The Odds API ──────────────────────────────────
  ODDS_API: {
    id: 'ODDS_API',
    name: 'The Odds API',
    signupUrl: 'https://the-odds-api.com',
    envKey: 'ODDS_API_KEY',
    active: false,
    free: true,
    freeLimits: '500 requests/month free',
    capabilities: ['odds'],
    sports: ['football', 'basketball'],
    color: '#FFD740',
    endpoints: {
      odds: '/api/odds/odds',
    },
  },

  // ── FUTURE: Basketball ────────────────────────────────────
  API_BASKETBALL: {
    id: 'API_BASKETBALL',
    name: 'API-Basketball',
    signupUrl: 'https://dashboard.api-basketball.com/register',
    envKey: 'API_BASKETBALL_KEY',
    active: false,
    free: true,
    freeLimits: '100 requests/day free',
    capabilities: ['fixtures', 'stats'],
    sports: ['basketball'],
    color: '#FF6D00',
    endpoints: {
      leagues:  '/api/basketball/leagues',
      fixtures: '/api/basketball/fixtures',
    },
  },
}

export function getActiveProviders(sport) {
  return Object.values(PROVIDERS).filter(p => p.active && p.sports.includes(sport))
}

export function getInactiveProviders(sport) {
  return Object.values(PROVIDERS).filter(p => !p.active && p.sports.includes(sport))
}
