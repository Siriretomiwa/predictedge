const BASE = 'https://api.football-data.org/v4'
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()
  const key = process.env.FOOTBALL_DATA_KEY
  const { competition } = req.query
  if (!competition) return res.status(400).json({ error: 'competition required' })
  if (!key) return res.status(200).json({ teamStats: {}, mock: true })
  try {
    const r = await fetch(`${BASE}/competitions/${competition}/standings`, { headers: { 'X-Auth-Token': key } })
    if (r.status === 429) return res.status(200).json({ teamStats: {}, mock: true })
    if (!r.ok) throw new Error(r.status)
    const data = await r.json()
    const table = (data.standings||[]).find(s => s.type === 'TOTAL')?.table || []
    const teamStats = {}
    for (const row of table) {
      const p = row.playedGames || 1
      teamStats[row.team.id] = {
        teamId: row.team.id, teamName: row.team.name, crest: row.team.crest,
        matchesPlayed: p, position: row.position, points: row.points, form: row.form,
        goalsForAvg: row.goalsFor / p, goalsAgainstAvg: row.goalsAgainst / p,
        goalsFor: row.goalsFor, goalsAgainst: row.goalsAgainst,
        source: 'FOOTBALL_DATA_ORG'
      }
    }
    return res.status(200).json({ teamStats, standings: table.map(r=>({...r, teamId:r.team.id})), mock: false })
  } catch(e) {
    return res.status(200).json({ teamStats: {}, mock: true, error: e.message })
  }
}
