# PredictEdge v6 — Complete Platform

## What's New in v6
- ✅ Full auth system — name + email signup, no password, no card
- ✅ Personalised greeting & dashboard (My Picks page)
- ✅ Save picks to profile (☆ Save button on every pick card)
- ✅ Navigation via React Context — no prop drilling, zero broken buttons
- ✅ Live scrolling ticker in nav bar
- ✅ Mobile-responsive hamburger menu
- ✅ All premiums marked "Coming Soon" — everything free for signups
- ✅ Leaderboard shows user's position when logged in
- ✅ Challenge requires login to submit (prompts signup gracefully)
- ✅ Zero copied GreenPicks content — all original copy

## Deploy to Vercel (30 seconds)

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "PredictEdge v6"
git remote add origin https://github.com/YOUR/predictedge.git
git push -u origin main

# 2. vercel.com → New Project → Import your repo
#    Framework: Vite (auto-detected)

# 3. Settings → Environment Variables → Add:
FOOTBALL_DATA_KEY = your_key   # football-data.org/client/register
ODDS_API_KEY      = your_key   # the-odds-api.com
```

## Pages
| Route  | Page         | Description |
|--------|-------------|-------------|
| home   | Home        | Hero, signal explainer, recent results, testimonials, CTA |
| tips   | Free Tips   | Prediction engine: select leagues + markets → generate |
| results| Results     | Full track record, filterable by outcome + strength |
| leaderboard | Leaderboard | Community rankings with podium |
| challenge | Challenge  | Daily pick-5 contest with AI hints + countdown |
| saved  | My Picks    | Personal saved picks + user stats (auth required) |
| pricing| Pricing     | Free now, Pro/Elite coming soon, FAQ |

## Auth System
- `src/context/AuthContext.jsx` — signup/login, savedPicks, updateUser
- Stored in `localStorage` under key `pe_user_v1`
- `src/context/NavContext.jsx` — single source of truth for routing
- Auth modal triggered globally via `setAuthModal(true)` from any component

## Prediction Engine (FLE v1.0)
```
Season stats (football-data.org)
  → Poisson model → expected goals → Over/BTTS probability

H2H cross-check (optional, when API live)
  → 60% stats / 40% H2H blend
  → Gap > 18% → conflict flag

Odds validation (The Odds API, 30-min cached)
  → Model vs market gap > 20% → TRAP
  → Market implies < 48% → TRAP
  → Clean: final = 70% model + 30% odds

Strength scale:
  ≥90% = BANKER 🏆 | 85-89% = STRONG ⚡ | 80-84% = SAFE 🛡
  70-79% = MODERATE 📊 | 60-69% = RISKY ⚠️ | conflict = TRAP 🚫
```
