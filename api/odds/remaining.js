/**
 * /api/odds/remaining.js
 * Returns remaining request quota for The Odds API.
 * Costs 0 credits — it's a free status check.
 */

const BASE = 'https://api.the-odds-api.com/v4'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const apiKey = process.env.ODDS_API_KEY
  if (!apiKey) return res.status(200).json({ remaining: null, used: null, configured: false })

  try {
    // Fetching sports list costs 0 credits and returns quota headers
    const response = await fetch(`${BASE}/sports?apiKey=${apiKey}&all=false`)
    const remaining = response.headers.get('x-requests-remaining')
    const used      = response.headers.get('x-requests-used')

    return res.status(200).json({
      remaining: remaining ? Number(remaining) : null,
      used: used ? Number(used) : null,
      configured: true,
    })
  } catch (err) {
    return res.status(200).json({ remaining: null, used: null, configured: true, error: err.message })
  }
}
