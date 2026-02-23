// ── Strength signal config ────────────────────────────────────
export const STRENGTH = {
  BANKER:   { label: 'BANKER',   color: '#00FF6A', glow: '#00FF6A40', bg: '#00FF6A08', rank: 1, icon: '🏆', pulse: true  },
  STRONG:   { label: 'STRONG',   color: '#00C94E', glow: '#00C94E30', bg: '#00C94E08', rank: 2, icon: '💪', pulse: false },
  SAFE:     { label: 'SAFE',     color: '#40B4FF', glow: '#40B4FF30', bg: '#40B4FF08', rank: 3, icon: '🛡',  pulse: false },
  MODERATE: { label: 'MODERATE', color: '#F0C040', glow: '#F0C04030', bg: '#F0C04008', rank: 4, icon: '⚖️', pulse: false },
  RISKY:    { label: 'RISKY',    color: '#FF8C00', glow: '#FF8C0030', bg: '#FF8C0008', rank: 5, icon: '⚠️', pulse: false },
  TRAP:     { label: 'TRAP',     color: '#FF3B3B', glow: '#FF3B3B30', bg: '#FF3B3B08', rank: 6, icon: '🚫', pulse: false },
}

// ── User tiers ────────────────────────────────────────────────
export const TIERS = {
  FREE: {
    id: 'FREE', label: 'Free', color: '#4A6050', badge: '○',
    maxLeagues: 2, maxFixtures: 2,
    markets: ['o15', 'o25'],
    showH2H: false, showConfidence: false, showExplanation: false,
    showOdds: false, canChallenge: true, canExport: false,
  },
  PRO: {
    id: 'PRO', label: 'Pro', color: '#00C94E', badge: '◆',
    maxLeagues: 10, maxFixtures: 5,
    markets: ['o15', 'o25', 'o35', 'btts'],
    showH2H: true, showConfidence: true, showExplanation: true,
    showOdds: true, canChallenge: true, canExport: true,
  },
  ELITE: {
    id: 'ELITE', label: 'Elite', color: '#F0C040', badge: '★',
    maxLeagues: 999, maxFixtures: 10,
    markets: ['o15', 'o25', 'o35', 'btts'],
    showH2H: true, showConfidence: true, showExplanation: true,
    showOdds: true, canChallenge: true, canExport: true,
  },
}

export function getUserTier() {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('pe_tier') : null
  return TIERS[stored] || TIERS.FREE
}

export function setUserTier(id) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pe_tier', id)
    window.location.reload()
  }
}

// ── Markets ───────────────────────────────────────────────────
export const MARKETS = [
  { id: 'o15',  label: 'Over 1.5',      group: 'Goals',    oddsKey: 'totals', line: 1.5 },
  { id: 'o25',  label: 'Over 2.5',      group: 'Goals',    oddsKey: 'totals', line: 2.5 },
  { id: 'o35',  label: 'Over 3.5',      group: 'Goals',    oddsKey: 'totals', line: 3.5 },
  { id: 'btts', label: 'BTTS',          group: 'Goals',    oddsKey: 'btts',   line: null },
  { id: 'cs',   label: 'Correct Score', group: 'Specials', soon: true },
]

// ── Competition → Odds API sport key map ─────────────────────
export const COMP_TO_ODDS = {
  PL:  'soccer_epl',
  PD:  'soccer_spain_la_liga',
  BL1: 'soccer_germany_bundesliga',
  SA:  'soccer_italy_serie_a',
  FL1: 'soccer_france_ligue_one',
  DED: 'soccer_netherlands_eredivisie',
  PPL: 'soccer_portugal_primeira_liga',
  CL:  'soccer_uefa_champs_league',
  ELC: 'soccer_england_league1',
}

// ── Fallback competitions ─────────────────────────────────────
export const FALLBACK_COMPS = [
  { id: 'PL',  name: 'Premier League',    country: 'England',     flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'PD',  name: 'La Liga',           country: 'Spain',       flag: '🇪🇸' },
  { id: 'BL1', name: 'Bundesliga',        country: 'Germany',     flag: '🇩🇪' },
  { id: 'SA',  name: 'Serie A',           country: 'Italy',       flag: '🇮🇹' },
  { id: 'FL1', name: 'Ligue 1',           country: 'France',      flag: '🇫🇷' },
  { id: 'CL',  name: 'Champions League',  country: 'Europe',      flag: '🌍' },
  { id: 'DED', name: 'Eredivisie',        country: 'Netherlands', flag: '🇳🇱' },
  { id: 'PPL', name: 'Primeira Liga',     country: 'Portugal',    flag: '🇵🇹' },
  { id: 'ELC', name: 'Championship',      country: 'England',     flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'BSA', name: 'Série A Brazil',    country: 'Brazil',      flag: '🇧🇷' },
]

// ── Platform stats (update periodically) ─────────────────────
export const PLATFORM_STATS = [
  { value: '87%',   label: 'BANKER Hit Rate' },
  { value: '12.4K', label: 'Predictions Made' },
  { value: '6.2K',  label: 'Active Users' },
  { value: '2',     label: 'Live APIs' },
]
