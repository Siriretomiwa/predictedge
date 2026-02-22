# PredictEdge v4 — Dual API Edition

## What's new
- **The Odds API** fully wired alongside football-data.org
- **Odds shown on every pick card** — median decimal odds + bookmaker count
- **Odds validate model** — if market implied probability conflicts with model, pick is flagged TRAP
- **Quota tracker** — remaining Odds API calls shown in header
- **30-min cache** on odds calls to protect your 500 free requests/month

---

## You have both keys — add them to Vercel now

Go to: **Vercel → Your Project → Settings → Environment Variables**

| Name | Value |
|---|---|
| `FOOTBALL_DATA_KEY` | your football-data.org key |
| `ODDS_API_KEY` | your The Odds API key |

After adding both, go to **Deployments → ··· → Redeploy**.
Both status chips in the header will turn green.

---

## Push to GitHub (to trigger redeploy)

Replace the files in your repo with the contents of this zip.
If you're using the GitHub web editor:

1. Go to your repo on github.com
2. Press `.` to open github.dev (VS Code in browser)
3. Drag the unzipped files in
4. Commit from the sidebar — Vercel auto-redeploys

---

## How the dual-API prediction works

```
football-data.org                The Odds API
      │                                │
 Standings → team stats          Pre-match odds
 Fixtures → upcoming games       (totals, btts)
 H2H → historical rates               │
      │                                │
      └──────────┬─────────────────────┘
                 │
            FLE Engine v0.3
                 │
         Three-layer analysis:
         1. Poisson model (season stats)
         2. H2H blend (Pro+)
         3. Odds validation
                 │
         Conflict detection:
         - Stats vs H2H > 18% gap → TRAP
         - Model vs Odds > 20% gap → TRAP
         - Odds imply < 50% → TRAP
                 │
         BANKER / STRONG / SAFE
         MODERATE / RISKY / TRAP
```

---

## Odds API quota management

Free tier: 500 requests/month.

The app fetches odds once per competition per "Generate" click (not per fixture).
30-minute in-memory cache means repeated clicks don't burn quota.

With 3 competitions selected: 3 requests per Generate click.
At daily use: ~90 requests/month, well within free tier.

---

## Project structure

```
api/
  football/
    competitions.js  ← football-data.org
    fixtures.js
    standings.js
    h2h.js
  odds/
    odds.js          ← The Odds API (NEW)

src/
  App.jsx            ← Full UI with odds display
  apiClient.js       ← Fetch calls (football + odds)
  providers.js       ← Both providers now active
  oddsKeyMap.js      ← Maps comp codes to odds sport keys (NEW)
  tiers.js           ← FREE / PRO / ELITE
  engines/fle.js     ← v0.3 with odds layer (NEW)
```
