const BASE = 'https://api.football-data.org/v4'
function dStr(d) { return d.toISOString().substring(0,10) }
function mockFixtures(comp) {
  const pairs = { PL:[['Man City','Arsenal'],['Liverpool','Chelsea']], PD:[['Real Madrid','Barcelona']], BL1:[['Bayern','Dortmund']], SA:[['Inter','AC Milan']], FL1:[['PSG','Marseille']], CL:[['Man City','Real Madrid']], DED:[['Ajax','PSV']], PPL:[['Benfica','Porto']], ELC:[['Leeds','Sheffield Utd']], default:[['Home Team','Away Team']] }
  return (pairs[comp]||pairs.default).map((p,i)=>({ id:90000+i, utcDate:new Date(Date.now()+86400000*(i+1)).toISOString(), status:'SCHEDULED', matchday:20, homeTeam:{id:1000+i,name:p[0],crest:''}, awayTeam:{id:2000+i,name:p[1],crest:''}, competition:{id:comp}, source:'MOCK' }))
}
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()
  const key = process.env.FOOTBALL_DATA_KEY
  const { competition, limit = '10' } = req.query
  if (!competition) return res.status(400).json({ error: 'competition required' })
  if (!key) return res.status(200).json({ fixtures: mockFixtures(competition), mock: true })
  try {
    const today = dStr(new Date()), future = dStr(new Date(Date.now()+604800000))
    const r = await fetch(`${BASE}/competitions/${competition}/matches?dateFrom=${today}&dateTo=${future}&status=SCHEDULED,TIMED`, { headers: { 'X-Auth-Token': key } })
    if (r.status === 429) return res.status(200).json({ fixtures: mockFixtures(competition), mock: true, hint: 'Rate limited' })
    if (!r.ok) throw new Error(r.status)
    const data = await r.json()
    const fixtures = (data.matches||[]).slice(0,Number(limit)).map(m => ({
      id: m.id, utcDate: m.utcDate, status: m.status, matchday: m.matchday, stage: m.stage,
      homeTeam: { id: m.homeTeam.id, name: m.homeTeam.name, shortName: m.homeTeam.shortName, crest: m.homeTeam.crest },
      awayTeam: { id: m.awayTeam.id, name: m.awayTeam.name, shortName: m.awayTeam.shortName, crest: m.awayTeam.crest },
      competition: { id: competition, name: data.competition?.name }, source: 'FOOTBALL_DATA_ORG'
    }))
    return res.status(200).json({ fixtures, mock: false })
  } catch(e) {
    return res.status(200).json({ fixtures: mockFixtures(competition), mock: true, error: e.message })
  }
}
