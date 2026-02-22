/**
 * /api/football/h2h.js
 * Fetches head-to-head results between two teams.
 * football-data.org provides H2H via the match endpoint.
 *
 * Query params:
 *   matchId  – a fixture ID (h2h data is attached to match records)
 *   limit    – number of past meetings to return (default 10)
 */

const BASE = 'https://api.football-data.org/v4'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const apiKey = process.env.FOOTBALL_DATA_KEY
  const { matchId, limit = '10' } = req.query

  if (!matchId) {
    return res.status(400).json({ error: 'matchId required' })
  }

  if (!apiKey) {
    return res.status(200).json({ summary: getMockH2HSummary(), matches: [], source: 'MOCK', mock: true })
  }

  try {
    const response = await fetch(
      `${BASE}/matches/${matchId}/head2head?limit=${limit}`,
      { headers: { 'X-Auth-Token': apiKey } }
    )

    if (response.status === 429) {
      return res.status(200).json({ summary: getMockH2HSummary(), matches: [], source: 'MOCK', mock: true })
    }
    if (!response.ok) throw new Error(`football-data.org ${response.status}`)

    const data = await response.json()
    const matches = (data.matches || [])
      .filter(m => m.status === 'FINISHED')
      .map(m => {
        const hg = m.score?.fullTime?.home ?? 0
        const ag = m.score?.fullTime?.away ?? 0
        return {
          id: m.id,
          date: m.utcDate,
          homeTeam: m.homeTeam.name,
          awayTeam: m.awayTeam.name,
          goalsHome: hg,
          goalsAway: ag,
          totalGoals: hg + ag,
          btts: hg > 0 && ag > 0,
        }
      })

    const summary = computeSummary(matches)
    return res.status(200).json({ matches, summary, source: 'FOOTBALL_DATA_ORG', mock: false })

  } catch (err) {
    console.error('[h2h]', err.message)
    return res.status(200).json({ summary: getMockH2HSummary(), matches: [], source: 'MOCK', mock: true })
  }
}

function computeSummary(matches) {
  if (!matches.length) return getMockH2HSummary()
  const n = matches.length
  const avgGoals = matches.reduce((s, m) => s + m.totalGoals, 0) / n
  return {
    totalMatches: n,
    avgGoals: Math.round(avgGoals * 100) / 100,
    bttsRate:   Math.round((matches.filter(m => m.btts).length / n) * 100),
    over15Rate: Math.round((matches.filter(m => m.totalGoals > 1.5).length / n) * 100),
    over25Rate: Math.round((matches.filter(m => m.totalGoals > 2.5).length / n) * 100),
    over35Rate: Math.round((matches.filter(m => m.totalGoals > 3.5).length / n) * 100),
  }
}

function getMockH2HSummary() {
  return { totalMatches: 8, avgGoals: 2.75, bttsRate: 62, over15Rate: 87, over25Rate: 62, over35Rate: 37 }
}
