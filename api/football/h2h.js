const BASE = 'https://api.football-data.org/v4'
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()
  const key = process.env.FOOTBALL_DATA_KEY
  const { matchId } = req.query
  if (!matchId) return res.status(400).json({ error: 'matchId required' })
  if (!key) return res.status(200).json({ summary: null, mock: true })
  try {
    const r = await fetch(`${BASE}/matches/${matchId}/head2head?limit=10`, { headers: { 'X-Auth-Token': key } })
    if (!r.ok) throw new Error(r.status)
    const data = await r.json()
    const matches = (data.matches||[]).filter(m=>m.status==='FINISHED').map(m=>{
      const hg = m.score?.fullTime?.home??0, ag = m.score?.fullTime?.away??0
      return { totalGoals: hg+ag, btts: hg>0&&ag>0 }
    })
    if (!matches.length) return res.status(200).json({ summary: null, mock: false })
    const n = matches.length
    const summary = {
      totalMatches: n,
      avgGoals: Math.round(matches.reduce((s,m)=>s+m.totalGoals,0)/n*100)/100,
      bttsRate:  Math.round(matches.filter(m=>m.btts).length/n*100),
      over15:    Math.round(matches.filter(m=>m.totalGoals>1.5).length/n*100),
      over25:    Math.round(matches.filter(m=>m.totalGoals>2.5).length/n*100),
      over35:    Math.round(matches.filter(m=>m.totalGoals>3.5).length/n*100),
    }
    return res.status(200).json({ summary, mock: false })
  } catch(e) {
    return res.status(200).json({ summary: null, mock: true, error: e.message })
  }
}
