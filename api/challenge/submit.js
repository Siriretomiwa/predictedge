const entries = []
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method === 'GET') {
    return res.status(200).json({ entries: entries.slice(-100), todayTotal: entries.length })
  }
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const body = await new Promise(resolve => {
      let data = ''
      req.on('data', chunk => data += chunk)
      req.on('end', () => resolve(JSON.parse(data)))
    })
    const entry = { id: `${Date.now()}`, ...body, submittedAt: new Date().toISOString() }
    entries.push(entry)
    return res.status(200).json({ success: true, entry })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
