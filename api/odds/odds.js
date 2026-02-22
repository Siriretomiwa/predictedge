/**
 * /api/odds/odds.js
 * Fetches pre-match odds from The Odds API.
 *
 * Docs: https://the-odds-api.com/lapi-reference/
 *
 * Query params:
 *   sport    – odds API sport key e.g. "soccer_epl"
 *   markets  – comma-separated: "totals,btts" (default: totals,btts)
 *   regions  – "eu" recommended (default: eu)
 *
 * Free tier: 500 requests/month. We cache 30 min to preserve quota.
 */

const BASE = 'https://api.the-odds-api.com/v4'

const cache = {}
const CACHE_TTL_MS = 30 * 60 * 1000

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const apiKey = process.env.ODDS_API_KEY
  if (!apiKey) {
    return res.status(200).json({
      odds: [], source: 'MOCK', mock: true,
      hint: 'Add ODDS_API_KEY to Vercel environment variables.',
    })
  }

  const { sport = 'soccer_epl', markets = 'totals,btts', regions = 'eu' } = req.query

  const cacheKey = `${sport}__${markets}__${regions}`
  const cached = cache[cacheKey]
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return res.status(200).json({ ...cached.data, cached: true })
  }

  try {
    const params = new URLSearchParams({ apiKey, regions, markets, oddsFormat: 'decimal', dateFormat: 'iso' })
    const response = await fetch(`${BASE}/sports/${sport}/odds?${params}`)

    const remaining = response.headers.get('x-requests-remaining')
    const used      = response.headers.get('x-requests-used')

    if (response.status === 401) return res.status(200).json({ odds: [], source: 'MOCK', mock: true, error: 'Invalid ODDS_API_KEY' })
    if (response.status === 422) return res.status(200).json({ odds: [], source: 'MOCK', mock: true, error: `Unknown sport key: ${sport}` })
    if (!response.ok) throw new Error(`The Odds API responded with ${response.status}`)

    const data = await response.json()

    const odds = (data || []).map(event => {
      const normalised = {
        oddsEventId:  event.id,
        commenceTime: event.commence_time,
        homeTeam:     event.home_team,
        awayTeam:     event.away_team,
        sport:        event.sport_key,
        markets:      {},
      }
      for (const bookmaker of (event.bookmakers || [])) {
        for (const market of (bookmaker.markets || [])) {
          if (!normalised.markets[market.key]) normalised.markets[market.key] = []
          normalised.markets[market.key].push({
            bookmaker: bookmaker.title,
            outcomes: market.outcomes.map(o => ({ name: o.name, point: o.point, price: o.price })),
          })
        }
      }
      return normalised
    })

    const result = { odds, source: 'ODDS_API', mock: false, quota: { remaining, used }, sport }
    cache[cacheKey] = { ts: Date.now(), data: result }
    return res.status(200).json(result)

  } catch (err) {
    console.error('[odds]', err.message)
    return res.status(200).json({ odds: [], source: 'MOCK', mock: true, error: err.message })
  }
}
