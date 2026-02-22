/**
 * /api/football/standings.js
 * Fetches standings + team form for a competition.
 *
 * Query params:
 *   competition – e.g. "PL", "PD"
 *   season      – e.g. "2024" (optional)
 */

const BASE = 'https://api.football-data.org/v4'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const apiKey = process.env.FOOTBALL_DATA_KEY
  const { competition, season } = req.query

  if (!competition) return res.status(400).json({ error: 'competition required' })

  if (!apiKey) {
    return res.status(200).json({ standings: [], teamStats: {}, source: 'MOCK', mock: true })
  }

  try {
    const params = season ? `?season=${season}` : ''
    const response = await fetch(
      `${BASE}/competitions/${competition}/standings${params}`,
      { headers: { 'X-Auth-Token': apiKey } }
    )

    if (response.status === 429) {
      return res.status(200).json({ standings: [], teamStats: {}, source: 'MOCK', mock: true })
    }
    if (!response.ok) throw new Error(`football-data.org ${response.status}`)

    const data = await response.json()

    // Extract total standings table
    const totalTable = (data.standings || []).find(s => s.type === 'TOTAL')
    const standings = (totalTable?.table || []).map(row => ({
      position: row.position,
      team: { id: row.team.id, name: row.team.name, crest: row.team.crest },
      played: row.playedGames,
      won: row.won,
      draw: row.draw,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDiff: row.goalDifference,
      points: row.points,
      form: row.form,   // e.g. "W,W,D,L,W"
    }))

    // Build per-team stat map for quick FLE lookups
    const teamStats = {}
    for (const row of standings) {
      const played = row.played || 1
      teamStats[row.team.id] = {
        teamId: row.team.id,
        teamName: row.team.name,
        goalsForAvg: row.goalsFor / played,
        goalsAgainstAvg: row.goalsAgainst / played,
        matchesPlayed: played,
        form: row.form,
        position: row.position,
        source: 'FOOTBALL_DATA_ORG',
      }
    }

    return res.status(200).json({ standings, teamStats, source: 'FOOTBALL_DATA_ORG', mock: false })

  } catch (err) {
    console.error('[standings]', err.message)
    return res.status(200).json({ standings: [], teamStats: {}, source: 'MOCK', mock: true, error: err.message })
  }
}
