# PredictEdge – Multi-Sport Predictive Analytics Platform

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy to Vercel

### Option A – Vercel CLI (fastest)
```bash
npm install -g vercel
npm install
vercel
```
Follow the prompts. On first deploy it will ask you to log in and name the project.

### Option B – GitHub + Vercel Dashboard
1. Push this folder to a GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Initial PredictEdge deploy"
   git remote add origin https://github.com/YOUR_USERNAME/predictedge.git
   git push -u origin main
   ```
2. Go to https://vercel.com/new
3. Import your GitHub repo
4. Vercel auto-detects Vite — just click **Deploy**

### Option C – Drag & Drop (no Git needed)
1. Run locally: `npm install && npm run build`
2. Go to https://vercel.com/new
3. Drag the `dist/` folder onto the page

## Project Structure

```
predictedge/
├── index.html          # Entry HTML
├── vite.config.js      # Vite config
├── vercel.json         # Vercel build settings
├── package.json
└── src/
    ├── main.jsx        # React root
    └── App.jsx         # Full application
```

## Connecting The Odds API

In `src/App.jsx`, replace the `generateMockPicks()` function with real API calls:

```js
const API_KEY = import.meta.env.VITE_ODDS_API_KEY

// Fetch sports
fetch(`https://api.the-odds-api.com/v4/sports/?apiKey=${API_KEY}`)

// Fetch odds for a sport
fetch(`https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey=${API_KEY}&regions=eu&markets=totals,btts`)
```

Add your key to Vercel as an environment variable:
- Name: `VITE_ODDS_API_KEY`
- Value: your key from the-odds-api.com
