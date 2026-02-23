async function get(path, params = {}) {
  const q = Object.fromEntries(Object.entries(params).filter(([,v]) => v != null))
  const qs = new URLSearchParams(q).toString()
  const res = await fetch(`${path}${qs ? '?'+qs : ''}`)
  if (!res.ok) throw new Error(`${path} → ${res.status}`)
  return res.json()
}

export const api = {
  competitions: ()                        => get('/api/football/competitions'),
  fixtures:     ({ competition, limit })  => get('/api/football/fixtures',  { competition, limit }),
  standings:    ({ competition })         => get('/api/football/standings', { competition }),
  h2h:          ({ matchId })             => get('/api/football/h2h',       { matchId }),
  odds:         ({ sport, markets })      => get('/api/odds/odds',          { sport, markets }),
}
