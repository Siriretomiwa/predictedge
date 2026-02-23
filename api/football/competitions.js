const BASE = 'https://api.football-data.org/v4'
const FALLBACK = [
  { id:'PL', name:'Premier League', country:'England', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id:'PD', name:'La Liga', country:'Spain', flag:'🇪🇸' },
  { id:'BL1', name:'Bundesliga', country:'Germany', flag:'🇩🇪' },
  { id:'SA', name:'Serie A', country:'Italy', flag:'🇮🇹' },
  { id:'FL1', name:'Ligue 1', country:'France', flag:'🇫🇷' },
  { id:'CL', name:'Champions League', country:'Europe', flag:'🌍' },
  { id:'DED', name:'Eredivisie', country:'Netherlands', flag:'🇳🇱' },
  { id:'PPL', name:'Primeira Liga', country:'Portugal', flag:'🇵🇹' },
  { id:'ELC', name:'Championship', country:'England', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id:'BSA', name:'Série A Brazil', country:'Brazil', flag:'🇧🇷' },
].map(c => ({ ...c, source:'MOCK' }))

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()
  const key = process.env.FOOTBALL_DATA_KEY
  if (!key) return res.status(200).json({ competitions: FALLBACK, mock: true })
  try {
    const r = await fetch(`${BASE}/competitions`, { headers: { 'X-Auth-Token': key } })
    if (!r.ok) throw new Error(r.status)
    const data = await r.json()
    const comps = (data.competitions || []).filter(c => c.plan === 'TIER_ONE').map(c => ({
      id: c.code, name: c.name, country: c.area?.name, emblem: c.emblem, source: 'FOOTBALL_DATA_ORG'
    }))
    return res.status(200).json({ competitions: comps, mock: false })
  } catch (e) {
    return res.status(200).json({ competitions: FALLBACK, mock: true, error: e.message })
  }
}
