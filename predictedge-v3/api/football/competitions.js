/**
 * /api/football/competitions.js
 * Returns available competitions from football-data.org
 *
 * HOW TO GET YOUR FREE KEY:
 * 1. Go to: https://www.football-data.org/client/register
 * 2. Enter your email — key sent instantly, no credit card
 * 3. Add to Vercel: Settings → Environment Variables → FOOTBALL_DATA_KEY
 *
 * Free tier covers: PL, La Liga, Bundesliga, Serie A, Ligue 1,
 * UCL, Eredivisie, Primeira Liga, Championship, Serie A Brazil, World Cup
 */

const BASE = 'https://api.football-data.org/v4'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const apiKey = process.env.FOOTBALL_DATA_KEY

  if (!apiKey) {
    return res.status(200).json({
      competitions: FALLBACK_COMPETITIONS,
      source: 'MOCK',
      mock: true,
      hint: 'Add FOOTBALL_DATA_KEY to Vercel environment variables. Free key at football-data.org/client/register'
    })
  }

  try {
    const response = await fetch(`${BASE}/competitions`, {
      headers: { 'X-Auth-Token': apiKey }
    })

    if (response.status === 429) {
      return res.status(200).json({
        competitions: FALLBACK_COMPETITIONS,
        source: 'MOCK',
        mock: true,
        hint: 'Rate limit hit (10 req/min). Using fallback data.'
      })
    }

    if (!response.ok) throw new Error(`football-data.org responded with ${response.status}`)

    const data = await response.json()

    const competitions = (data.competitions || [])
      .filter(c => c.plan === 'TIER_ONE')  // free tier only
      .map(c => ({
        id: c.code,          // e.g. "PL", "PD", "BL1"
        numericId: c.id,
        name: c.name,
        country: c.area?.name,
        countryCode: c.area?.code,
        emblem: c.emblem,
        type: c.type,        // LEAGUE or CUP
        currentSeason: c.currentSeason?.startDate?.substring(0, 4),
        source: 'FOOTBALL_DATA_ORG',
      }))

    return res.status(200).json({ competitions, source: 'FOOTBALL_DATA_ORG', mock: false })

  } catch (err) {
    console.error('[competitions]', err.message)
    return res.status(200).json({
      competitions: FALLBACK_COMPETITIONS,
      source: 'MOCK',
      mock: true,
      error: err.message
    })
  }
}

// All free-tier competitions hardcoded as fallback
const FALLBACK_COMPETITIONS = [
  { id: 'PL',   numericId: 2021, name: 'Premier League',       country: 'England',     countryCode: 'ENG' },
  { id: 'PD',   numericId: 2014, name: 'La Liga',              country: 'Spain',       countryCode: 'ESP' },
  { id: 'BL1',  numericId: 2002, name: 'Bundesliga',           country: 'Germany',     countryCode: 'DEU' },
  { id: 'SA',   numericId: 2019, name: 'Serie A',              country: 'Italy',       countryCode: 'ITA' },
  { id: 'FL1',  numericId: 2015, name: 'Ligue 1',              country: 'France',      countryCode: 'FRA' },
  { id: 'CL',   numericId: 2001, name: 'Champions League',     country: 'Europe',      countryCode: 'EUR' },
  { id: 'DED',  numericId: 2003, name: 'Eredivisie',           country: 'Netherlands', countryCode: 'NLD' },
  { id: 'PPL',  numericId: 2017, name: 'Primeira Liga',        country: 'Portugal',    countryCode: 'PRT' },
  { id: 'ELC',  numericId: 2016, name: 'Championship',         country: 'England',     countryCode: 'ENG' },
  { id: 'BSA',  numericId: 2013, name: 'Série A (Brazil)',     country: 'Brazil',      countryCode: 'BRA' },
  { id: 'WC',   numericId: 2000, name: 'FIFA World Cup',       country: 'World',       countryCode: 'INT' },
  { id: 'EC',   numericId: 2018, name: 'European Championship',country: 'Europe',      countryCode: 'EUR' },
].map(c => ({ ...c, source: 'MOCK' }))
