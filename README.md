# PredictEdge v5 — Full Platform

## Complete Feature Set
- **Home** — Hero landing with stats, live picks preview, how-it-works, testimonials
- **Free Tips** — Full prediction engine: football-data.org + The Odds API + FLE v1.0
- **Results** — Track record with win/loss history, hit rates by strength level
- **Leaderboard** — Community tipster rankings with podium, badges, profit tracking
- **Daily Challenge** — Pick-5 gamified contest with AI hints and live countdown
- **Pricing** — FREE / PRO (₦5,000/mo) / ELITE (₦12,000/mo) with feature matrix

---

## Deploy to Vercel

```bash
# 1. Unzip, open folder, push to GitHub
git init && git add . && git commit -m "PredictEdge v5"
git remote add origin https://github.com/YOUR_USERNAME/predictedge.git
git push -u origin main

# 2. Import at vercel.com/new — auto-detects Vite

# 3. Add environment variables in Vercel:
#    Settings → Environment Variables
#    FOOTBALL_DATA_KEY = your key from football-data.org/client/register
#    ODDS_API_KEY      = your key from the-odds-api.com
```

---

## API Keys

| Variable | Source | Free Limit |
|---|---|---|
| `FOOTBALL_DATA_KEY` | football-data.org/client/register | 10 req/min · unlimited/day |
| `ODDS_API_KEY` | the-odds-api.com | 500 req/month (30-min cache active) |

---

## User Tiers

Defined in `src/constants.js`. Currently uses localStorage for demo.
To connect real payments:
- **Paystack** (Nigeria): paystack.com — webhook updates user tier in DB
- **Flutterwave**: flutterwave.com — same approach
- **Supabase** (free): store users + tiers, fetch tier on app load

---

## Prediction Engine (FLE v1.0)

```
Layer 1: Season Stats (football-data.org standings)
  → Poisson distribution on goals-for/against averages
  → Expected goals → Over/BTTS probability

Layer 2: H2H Blend (Pro+)
  → Historical over/btts rates from last 10 meetings
  → 60% stats / 40% H2H weighted blend
  → Conflict if gap > 18% → TRAP

Layer 3: Odds Validation (The Odds API)
  → Median implied probability across bookmakers
  → Conflict if gap > 20% from model → TRAP
  → Odds implied < 48% → automatic TRAP
  → If no conflict: final = 70% model + 30% odds

Strength Scale:
  ≥90% → BANKER 🏆
  85-89% → STRONG 💪
  80-84% → SAFE 🛡
  70-79% → MODERATE ⚖️
  60-69% → RISKY ⚠️
  <60% or conflict → TRAP 🚫
```

---

## Project Structure

```
api/
  football/ competitions, fixtures, standings, h2h
  odds/     odds (with 30-min cache)
  results/  save, list, leaderboard
  challenge/ submit

src/
  App.jsx            Router
  constants.js       Tiers, markets, strength config
  apiClient.js       All fetch calls
  engines/fle.js     Prediction engine
  components/
    Layout.jsx       Nav + footer + tier switcher modal
  pages/
    HomePage.jsx     Landing + hero
    TipsPage.jsx     Prediction generator
    ResultsPage.jsx  Track record
    LeaderboardPage  Community rankings
    ChallengePage    Daily pick-5 contest
    PricingPage      Plans + FAQ
```
