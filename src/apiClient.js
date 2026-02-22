/**
 * apiClient.js — All frontend → serverless function calls
 *
 * Adding a new provider = add a new section below.
 * All calls go through /api/* which Vercel routes to serverless functions.
 */

async function get(path, params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
  )
  const qs  = new URLSearchParams(clean).toString()
  const url = `${path}${qs ? '?' + qs : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)
  return res.json()
}

// ── football-data.org ─────────────────────────────────────────
export const footballData = {
  competitions: () =>
    get('/api/football/competitions'),

  fixtures: ({ competition, dateFrom, dateTo, limit }) =>
    get('/api/football/fixtures', { competition, dateFrom, dateTo, limit }),

  standings: ({ competition, season }) =>
    get('/api/football/standings', { competition, season }),

  h2h: ({ matchId, limit }) =>
    get('/api/football/h2h', { matchId, limit }),
}

// ── The Odds API ──────────────────────────────────────────────
export const oddsApi = {
  /**
   * Fetch odds for a sport.
   * @param {string} sport   – The Odds API sport key e.g. "soccer_epl"
   * @param {string} markets – comma-separated: "totals,btts"
   * @param {string} regions – "eu" recommended
   */
  odds: ({ sport, markets = 'totals,btts', regions = 'eu' }) =>
    get('/api/odds/odds', { sport, markets, regions }),
}

// ── Future: Bzzoiro ───────────────────────────────────────────
// export const bzzoiro = {
//   fixtures: ({ league }) => get('/api/bzzoiro/fixtures', { league }),
// }

// ── Future: API-Football ──────────────────────────────────────
// export const apiFootball = {
//   leagues:  ()                  => get('/api/apifootball/leagues'),
//   fixtures: ({ league, season}) => get('/api/apifootball/fixtures', { league, season }),
//   stats:    ({ team, league })  => get('/api/apifootball/stats', { team, league }),
// }
