const BASE = 'https://api.the-odds-api.com/v4'
const cache = {}
const TTL = 30 * 60 * 1000

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()
  const key = process.env.ODDS_API_KEY
  if (!key) return res.status(200).json({ odds: [], mock: true })
  const { sport = 'soccer_epl', markets = 'totals,btts', regions = 'eu' } = req.query
  const cacheKey = `${sport}_${markets}`
  if (cache[cacheKey] && Date.now() - cache[cacheKey].ts < TTL) return res.status(200).json({ ...cache[cacheKey].data, cached: true })
  try {
    const params = new URLSearchParams({ apiKey: key, regions, markets, oddsFormat: 'decimal', dateFormat: 'iso' })
    const r = await fetch(`${BASE}/sports/${sport}/odds?${params}`)
    const remaining = r.headers.get('x-requests-remaining')
    if (!r.ok) throw new Error(r.status)
    const data = await r.json()
    const odds = (data||[]).map(ev => {
      const markets = {}
      for (const bm of ev.bookmakers||[]) {
        for (const m of bm.markets||[]) {
          if (!markets[m.key]) markets[m.key] = []
          markets[m.key].push({ bookmaker: bm.title, outcomes: m.outcomes.map(o=>({ name:o.name, point:o.point, price:o.price })) })
        }
      }
      return { id: ev.id, commenceTime: ev.commence_time, homeTeam: ev.home_team, awayTeam: ev.away_team, markets }
    })
    const result = { odds, mock: false, quota: { remaining } }
    cache[cacheKey] = { ts: Date.now(), data: result }
    return res.status(200).json(result)
  } catch(e) {
    return res.status(200).json({ odds: [], mock: true, error: e.message })
  }
}
