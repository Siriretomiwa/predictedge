/**
 * ============================================================
 * USER TIER SYSTEM
 * ============================================================
 * FREE    → limited leagues, basic markets, no H2H, watermarked
 * PRO     → all leagues, all markets, H2H, full explanations
 * ELITE   → everything + multi-league bulk analysis
 *
 * In production: replace simulateUserTier() with real auth
 * e.g. Supabase, Clerk, Firebase Auth, etc.
 * ============================================================
 */

export const TIERS = {
  FREE: {
    id: 'FREE',
    label: 'Free',
    color: '#546E7A',
    badge: '⚪',
    maxLeagues: 2,
    maxFixturesPerLeague: 2,
    markets: ['o15', 'o25'],               // only basic markets
    showH2H: false,
    showExplanation: false,                 // teaser only
    showConfidence: false,                  // hidden behind upgrade
    strengthFilter: ['BANKER', 'STRONG', 'SAFE', 'MODERATE', 'RISKY', 'TRAP'],
    dataSource: 'FOOTBALL_DATA_ORG',       // uses the fully free API
    canExport: false,
    watermark: true,
  },
  PRO: {
    id: 'PRO',
    label: 'Pro',
    color: '#00E676',
    badge: '🟢',
    maxLeagues: 10,
    maxFixturesPerLeague: 5,
    markets: ['o15', 'o25', 'o35', 'btts'],
    showH2H: true,
    showExplanation: true,
    showConfidence: true,
    strengthFilter: ['BANKER', 'STRONG', 'SAFE', 'MODERATE', 'RISKY', 'TRAP'],
    dataSource: 'FOOTBALL_DATA_ORG',
    canExport: true,
    watermark: false,
  },
  ELITE: {
    id: 'ELITE',
    label: 'Elite',
    color: '#FFD740',
    badge: '⭐',
    maxLeagues: 999,
    maxFixturesPerLeague: 10,
    markets: ['o15', 'o25', 'o35', 'btts', 'cs'],
    showH2H: true,
    showExplanation: true,
    showConfidence: true,
    strengthFilter: ['BANKER', 'STRONG', 'SAFE', 'MODERATE', 'RISKY', 'TRAP'],
    dataSource: 'FOOTBALL_DATA_ORG',       // future: can swap to paid API
    canExport: true,
    watermark: false,
  },
}

/**
 * Simulate user tier for demo purposes.
 * Replace this with your real auth system when ready.
 *
 * Options:
 *   - Supabase (free): supabase.com — store user + tier in DB
 *   - Clerk (free tier): clerk.com — easy React auth
 *   - Firebase Auth (free): google firebase
 *
 * Once you have auth, check user's tier from DB and return here.
 */
export function simulateUserTier() {
  // For demo: reads from localStorage so you can test different tiers
  // In production: fetch from your auth provider / database
  const stored = typeof window !== 'undefined' ? window.localStorage.getItem('pe_tier') : null
  return TIERS[stored] || TIERS.FREE
}

export function setDemoTier(tierId) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('pe_tier', tierId)
    window.location.reload()
  }
}
