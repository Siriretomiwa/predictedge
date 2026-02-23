// Returns mock results for demo. In production: read from Vercel KV or database.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()
  return res.status(200).json({ results: getMockResults(), mock: true })
}

function getMockResults() {
  const now = Date.now()
  const day = 86400000
  return [
    { id:'r1', home:'Man City', away:'Arsenal', league:'Premier League', market:'Over 2.5', strength:'BANKER', confidence:91, outcome:'WIN', date: new Date(now-day*1).toISOString(), odds:1.72, modelProb:91 },
    { id:'r2', home:'Real Madrid', away:'Barcelona', league:'La Liga', market:'BTTS', strength:'STRONG', confidence:86, outcome:'WIN', date: new Date(now-day*1).toISOString(), odds:1.85, modelProb:86 },
    { id:'r3', home:'Bayern', away:'Dortmund', league:'Bundesliga', market:'Over 2.5', strength:'BANKER', confidence:93, outcome:'WIN', date: new Date(now-day*2).toISOString(), odds:1.65, modelProb:93 },
    { id:'r4', home:'PSG', away:'Lyon', league:'Ligue 1', market:'Over 1.5', strength:'SAFE', confidence:82, outcome:'WIN', date: new Date(now-day*2).toISOString(), odds:1.35, modelProb:82 },
    { id:'r5', home:'Inter', away:'Napoli', league:'Serie A', market:'BTTS', strength:'MODERATE', confidence:74, outcome:'LOSS', date: new Date(now-day*2).toISOString(), odds:1.90, modelProb:74 },
    { id:'r6', home:'Liverpool', away:'Chelsea', league:'Premier League', market:'Over 2.5', strength:'STRONG', confidence:88, outcome:'WIN', date: new Date(now-day*3).toISOString(), odds:1.78, modelProb:88 },
    { id:'r7', home:'Atletico', away:'Sevilla', league:'La Liga', market:'Over 1.5', strength:'SAFE', confidence:81, outcome:'WIN', date: new Date(now-day*3).toISOString(), odds:1.40, modelProb:81 },
    { id:'r8', home:'Ajax', away:'PSV', league:'Eredivisie', market:'Over 2.5', strength:'BANKER', confidence:90, outcome:'WIN', date: new Date(now-day*4).toISOString(), odds:1.70, modelProb:90 },
    { id:'r9', home:'Benfica', away:'Porto', league:'Primeira Liga', market:'BTTS', strength:'RISKY', confidence:63, outcome:'LOSS', date: new Date(now-day*4).toISOString(), odds:2.10, modelProb:63 },
    { id:'r10', home:'Man United', away:'Tottenham', league:'Premier League', market:'Over 2.5', strength:'STRONG', confidence:87, outcome:'WIN', date: new Date(now-day*5).toISOString(), odds:1.80, modelProb:87 },
    { id:'r11', home:'Juventus', away:'AC Milan', league:'Serie A', market:'Over 1.5', strength:'SAFE', confidence:80, outcome:'WIN', date: new Date(now-day*5).toISOString(), odds:1.45, modelProb:80 },
    { id:'r12', home:'Marseille', away:'Monaco', league:'Ligue 1', market:'Over 2.5', strength:'MODERATE', confidence:72, outcome:'WIN', date: new Date(now-day*6).toISOString(), odds:1.95, modelProb:72 },
    { id:'r13', home:'Feyenoord', away:'AZ', league:'Eredivisie', market:'BTTS', strength:'STRONG', confidence:85, outcome:'WIN', date: new Date(now-day*6).toISOString(), odds:1.88, modelProb:85 },
    { id:'r14', home:'Dortmund', away:'Leipzig', league:'Bundesliga', market:'Over 2.5', strength:'BANKER', confidence:92, outcome:'WIN', date: new Date(now-day*7).toISOString(), odds:1.68, modelProb:92 },
    { id:'r15', home:'Sporting', away:'Braga', league:'Primeira Liga', market:'Over 1.5', strength:'RISKY', confidence:64, outcome:'LOSS', date: new Date(now-day*7).toISOString(), odds:1.50, modelProb:64 },
  ]
}
