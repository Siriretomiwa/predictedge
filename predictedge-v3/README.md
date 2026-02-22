# PredictEdge v3

## Free APIs Used (ranked by ease of access)

| API | Sign Up | Env Variable | Free Limits |
|---|---|---|---|
| football-data.org ⭐ | Email only, instant | `FOOTBALL_DATA_KEY` | 10 req/min, major leagues, no daily cap |
| Bzzoiro Sports | Email, instant | `BZZOIRO_KEY` | No rate limit, 30+ leagues, ML predictions |
| API-Football | Email, no card | `API_FOOTBALL_KEY` | 100 req/day, richest stats |

---

## Step 1 — Get Your Free football-data.org Key

1. Go to: **https://www.football-data.org/client/register**
2. Enter your email
3. Key arrives instantly in your inbox
4. Copy it

Free leagues included: Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Champions League, Eredivisie, Primeira Liga, Championship, Serie A Brazil, World Cup.

---

## Step 2 — Add Key to Vercel

1. Open your project on **vercel.com**
2. Go to **Settings → Environment Variables**
3. Click **Add New**
4. Name: `FOOTBALL_DATA_KEY`
5. Value: paste your key
6. Click **Save**
7. Go to **Deployments → Redeploy** (top right → ··· → Redeploy)

The header will change from "Mock Data" to "football-data.org Live" ✅

---

## Step 3 (Optional) — Add Bzzoiro for BTTS/Over Predictions

1. Go to: **https://sports.bzzoiro.com**
2. Register free
3. Copy API token
4. Add to Vercel: Name `BZZOIRO_KEY`, Value: your token
5. In `src/providers.js`, change `BZZOIRO.active` to `true`
6. Redeploy

---

## Deploy to Vercel (GitHub method)

```bash
# On your computer after unzipping
git init
git add .
git commit -m "PredictEdge v3"
git remote add origin https://github.com/YOUR_USERNAME/predictedge.git
git push -u origin main
```

Then import at vercel.com/new → auto-detects Vite → Deploy.

---

## User Tier System

Tiers are defined in `src/tiers.js`:

| Tier | Leagues | Markets | H2H | Confidence | Explanations |
|---|---|---|---|---|---|
| FREE | 2 max | Over 1.5, Over 2.5 | ❌ | ❌ | ❌ |
| PRO | 10 max | All 4 markets | ✅ | ✅ | ✅ |
| ELITE | Unlimited | All + future | ✅ | ✅ | ✅ |

To connect real payments/auth, replace `simulateUserTier()` in `src/tiers.js` with:
- **Supabase** (free): store user tier in DB, fetch on load
- **Clerk** (free tier): React auth with user metadata
- **Firebase Auth** (free): Google's auth platform

---

## Project Structure

```
predictedge-v3/
├── api/football/
│   ├── competitions.js   ← GET /api/football/competitions
│   ├── fixtures.js       ← GET /api/football/fixtures
│   ├── standings.js      ← GET /api/football/standings
│   └── h2h.js            ← GET /api/football/h2h
├── src/
│   ├── App.jsx           ← Full UI
│   ├── tiers.js          ← User tier definitions
│   ├── providers.js      ← API provider registry
│   ├── apiClient.js      ← All fetch calls
│   └── engines/fle.js    ← Football prediction engine
└── README.md
```
