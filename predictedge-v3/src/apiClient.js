/**
 * apiClient.js — All frontend → backend API calls
 */

async function get(path, params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null))
  ).toString()
  const url = `${path}${qs ? '?' + qs : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)
  return res.json()
}

// ── football-data.org ─────────────────────────────────────────
export const footballData = {
  competitions: ()                          => get('/api/football/competitions'),
  fixtures:     ({ competition, dateFrom, dateTo, limit }) =>
                                               get('/api/football/fixtures', { competition, dateFrom, dateTo, limit }),
  standings:    ({ competition, season })   => get('/api/football/standings', { competition, season }),
  h2h:          ({ matchId, limit })        => get('/api/football/h2h', { matchId, limit }),
}

// ── Future: Bzzoiro ───────────────────────────────────────────
// export const bzzoiro = {
//   fixtures: ({ league }) => get('/api/bzzoiro/fixtures', { league }),
// }

// ── Future: API-Football ──────────────────────────────────────
// export const apiFootball = {
//   leagues:  ()                    => get('/api/apifootball/leagues'),
//   fixtures: ({ league, season })  => get('/api/apifootball/fixtures', { league, season }),
//   stats:    ({ team, league })    => get('/api/apifootball/stats', { team, league }),
// }

// ── Future: The Odds API ──────────────────────────────────────
// export const oddsApi = {
//   odds: ({ sport, league }) => get('/api/odds/odds', { sport, league }),
// }
