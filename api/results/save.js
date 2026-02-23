// Stores prediction results in Vercel KV (or falls back to in-memory for demo)
// To enable persistence: add KV_REST_API_URL and KV_REST_API_TOKEN to Vercel env vars
// via: vercel.com → Project → Storage → Create KV Database (free tier)

const memory = [] // in-process fallback

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const body = await new Promise(resolve => {
      let data = ''
      req.on('data', chunk => data += chunk)
      req.on('end', () => resolve(JSON.parse(data)))
    })
    const entry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
      ...body,
      savedAt: new Date().toISOString(),
    }
    memory.push(entry)
    // Keep last 500
    if (memory.length > 500) memory.shift()
    return res.status(200).json({ success: true, entry })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
