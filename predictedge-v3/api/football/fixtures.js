/**
 * /api/football/fixtures.js
 * Fetches upcoming matches for a competition from football-data.org
 *
 * Query params:
 *   competition  – competition code e.g. "PL", "PD", "BL1"
 *   dateFrom     – YYYY-MM-DD (optional, defaults to today)
 *   dateTo       – YYYY-MM-DD (optional, defaults to +7 days)
 *   limit        – max fixtures to return (default 10)
 */

const BASE = 'https://api.football-data.org/v4'

function todayStr() {
  return new Date().toISOString().substring(0, 10)
}
function plusDays(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().substring(0, 10)
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const apiKey = process.env.FOOTBALL_DATA_KEY
  const { competition, dateFrom = todayStr(), dateTo = plusDays(7), limit = '10' } = req.query

  if (!competition) {
    return res.status(400).json({ error: 'competition parameter required (e.g. PL, PD, BL1)' })
  }

  if (!apiKey) {
    return res.status(200).json({
      fixtures: getMockFixtures(competition),
      source: 'MOCK',
      mock: true,
    })
  }

  try {
    const params = new URLSearchParams({ dateFrom, dateTo })
    const response = await fetch(
      `${BASE}/competitions/${competition}/matches?${params}`,
      { headers: { 'X-Auth-Token': apiKey } }
    )

    if (response.status === 429) {
      return res.status(200).json({ fixtures: getMockFixtures(competition), source: 'MOCK', mock: true, hint: 'Rate limited' })
    }
    if (!response.ok) throw new Error(`football-data.org ${response.status}`)

    const data = await response.json()

    const fixtures = (data.matches || [])
      .filter(m => m.status === 'SCHEDULED' || m.status === 'TIMED')
      .slice(0, Number(limit))
      .map(m => ({
        id: m.id,
        utcDate: m.utcDate,
        status: m.status,
        matchday: m.matchday,
        stage: m.stage,
        homeTeam: {
          id: m.homeTeam.id,
          name: m.homeTeam.name,
          shortName: m.homeTeam.shortName,
          crest: m.homeTeam.crest,
        },
        awayTeam: {
          id: m.awayTeam.id,
          name: m.awayTeam.name,
          shortName: m.awayTeam.shortName,
          crest: m.awayTeam.crest,
        },
        competition: { id: competition, name: data.competition?.name, area: data.competition?.area?.name },
        source: 'FOOTBALL_DATA_ORG',
      }))

    return res.status(200).json({ fixtures, source: 'FOOTBALL_DATA_ORG', mock: false })

  } catch (err) {
    console.error('[fixtures]', err.message)
    return res.status(200).json({ fixtures: getMockFixtures(competition), source: 'MOCK', mock: true, error: err.message })
  }
}

function getMockFixtures(competition) {
  const tomorrow = plusDays(1)
  const teams = {
    PL:  [['Manchester City', 'Arsenal'], ['Liverpool', 'Chelsea'], ['Man United', 'Tottenham']],
    PD:  [['Real Madrid', 'Barcelona'], ['Atletico Madrid', 'Sevilla']],
    BL1: [['Bayern Munich', 'Dortmund'], ['RB Leipzig', 'Leverkusen']],
    SA:  [['Inter Milan', 'AC Milan'], ['Juventus', 'Napoli']],
    FL1: [['PSG', 'Marseille'], ['Lyon', 'Monaco']],
    CL:  [['Man City', 'Real Madrid'], ['PSG', 'Bayern']],
    DED: [['Ajax', 'PSV'], ['Feyenoord', 'AZ']],
    PPL: [['Benfica', 'Porto'], ['Sporting', 'Braga']],
  }
  const pairs = teams[competition] || [['Home Team', 'Away Team']]
  return pairs.map((pair, i) => ({
    id: 90000 + i,
    utcDate: `${tomorrow}T${15 + i}:00:00Z`,
    status: 'SCHEDULED',
    matchday: 20,
    homeTeam: { id: 1000 + i, name: pair[0], shortName: pair[0], crest: '' },
    awayTeam: { id: 2000 + i, name: pair[1], shortName: pair[1], crest: '' },
    competition: { id: competition, name: competition },
    source: 'MOCK',
  }))
}
