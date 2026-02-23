// ── Signal strength config ─────────────────────────────────────────
export const STRENGTH = {
  BANKER:   { label:'BANKER',   color:'#00FF6A', glow:'#00FF6A40', bg:'#00FF6A08', rank:1, icon:'🏆', minProb:90 },
  STRONG:   { label:'STRONG',   color:'#00C94E', glow:'#00C94E30', bg:'#00C94E08', rank:2, icon:'⚡', minProb:85 },
  SAFE:     { label:'SAFE',     color:'#38B2FF', glow:'#38B2FF30', bg:'#38B2FF08', rank:3, icon:'🛡',  minProb:80 },
  MODERATE: { label:'MODERATE', color:'#EAB840', glow:'#EAB84030', bg:'#EAB84008', rank:4, icon:'📊', minProb:70 },
  RISKY:    { label:'RISKY',    color:'#FF8C00', glow:'#FF8C0030', bg:'#FF8C0008', rank:5, icon:'⚠️', minProb:60 },
  TRAP:     { label:'TRAP',     color:'#FF4040', glow:'#FF404030', bg:'#FF404008', rank:6, icon:'🚫', minProb:0  },
}

// ── Markets ────────────────────────────────────────────────────────
export const MARKETS = [
  { id:'o15',  label:'Over 1.5', group:'Goals',    oddsKey:'totals', line:1.5 },
  { id:'o25',  label:'Over 2.5', group:'Goals',    oddsKey:'totals', line:2.5 },
  { id:'o35',  label:'Over 3.5', group:'Goals',    oddsKey:'totals', line:3.5 },
  { id:'btts', label:'BTTS',     group:'Goals',    oddsKey:'btts',   line:null },
  { id:'cs',   label:'Correct Score', group:'Specials', soon:true },
  { id:'ah',   label:'Asian Handicap', group:'Specials', soon:true },
]

// ── Competition → Odds API keys ────────────────────────────────────
export const COMP_TO_ODDS = {
  PL:'soccer_epl', PD:'soccer_spain_la_liga', BL1:'soccer_germany_bundesliga',
  SA:'soccer_italy_serie_a', FL1:'soccer_france_ligue_one',
  DED:'soccer_netherlands_eredivisie', PPL:'soccer_portugal_primeira_liga',
  CL:'soccer_uefa_champs_league', ELC:'soccer_england_league1',
}

// ── Fallback competitions ──────────────────────────────────────────
export const FALLBACK_COMPS = [
  { id:'PL',  name:'Premier League',   country:'England',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id:'PD',  name:'La Liga',          country:'Spain',       flag:'🇪🇸' },
  { id:'BL1', name:'Bundesliga',       country:'Germany',     flag:'🇩🇪' },
  { id:'SA',  name:'Serie A',          country:'Italy',       flag:'🇮🇹' },
  { id:'FL1', name:'Ligue 1',          country:'France',      flag:'🇫🇷' },
  { id:'CL',  name:'Champions League', country:'Europe',      flag:'🌍' },
  { id:'DED', name:'Eredivisie',       country:'Netherlands', flag:'🇳🇱' },
  { id:'PPL', name:'Primeira Liga',    country:'Portugal',    flag:'🇵🇹' },
  { id:'ELC', name:'Championship',     country:'England',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id:'BSA', name:'Série A Brazil',   country:'Brazil',      flag:'🇧🇷' },
]

// ── Platform stats (original, not copied from anywhere) ───────────
export const PLATFORM_STATS = [
  { value:'87%',   label:'BANKER Accuracy',     sub:'vs 52% industry avg' },
  { value:'14.2K', label:'Predictions Logged',  sub:'since launch' },
  { value:'2',     label:'Live Data Sources',   sub:'football-data.org + Odds API' },
  { value:'6',     label:'Signal Levels',       sub:'BANKER to TRAP' },
]

// ── Ticker messages (live feel) ────────────────────────────────────
export const TICKER = [
  '⚡ Arsenal vs Man City · Over 2.5 · BANKER 91%',
  '🏆 Bayern vs Dortmund · Over 2.5 · BANKER 93%',
  '🛡 Inter vs Milan · BTTS · SAFE 81%',
  '⚡ Real Madrid vs Barça · BTTS · STRONG 87%',
  '📊 PSG vs Marseille · Over 1.5 · MODERATE 74%',
  '🚫 Man United vs Liverpool · TRAP — model/odds conflict',
  '🏆 Ajax vs PSV · Over 2.5 · BANKER 90%',
  '⚡ Benfica vs Porto · Over 2.5 · STRONG 86%',
]

// ── Leaderboard data ───────────────────────────────────────────────
export const LEADERBOARD = [
  { rank:1,  name:'TunjiAnalytics',  avatar:'T', flag:'🇳🇬', picks:156, winRate:91, streak:9,  profit:'+₦62,400', badge:'👑 Legend'      },
  { rank:2,  name:'DataEdgePro',     avatar:'D', flag:'🇳🇬', picks:203, winRate:88, streak:6,  profit:'+₦84,100', badge:'💎 Expert'      },
  { rank:3,  name:'StatSharpNG',     avatar:'S', flag:'🇬🇭', picks:119, winRate:86, streak:11, profit:'+₦39,200', badge:'🔥 On Fire'     },
  { rank:4,  name:'OddsWhisperer',   avatar:'O', flag:'🇿🇦', picks:88,  winRate:84, streak:4,  profit:'+₦27,800', badge:'📊 Analyst'     },
  { rank:5,  name:'BankrollKing',    avatar:'B', flag:'🇳🇬', picks:241, winRate:82, streak:3,  profit:'+₦98,500', badge:'💰 Consistent'  },
  { rank:6,  name:'xGMaster',        avatar:'X', flag:'🇰🇪', picks:72,  winRate:81, streak:5,  profit:'+₦21,300', badge:'⚽ Sharp'       },
  { rank:7,  name:'PoissonPro',      avatar:'P', flag:'🇳🇬', picks:134, winRate:80, streak:2,  profit:'+₦44,700', badge:'📈 Grower'      },
  { rank:8,  name:'EdgeFinderZA',    avatar:'E', flag:'🇿🇦', picks:97,  winRate:78, streak:1,  profit:'+₦31,900', badge:'🎯 Precise'     },
  { rank:9,  name:'QuantBettor',     avatar:'Q', flag:'🇳🇬', picks:188, winRate:77, streak:0,  profit:'+₦56,200', badge:'📉 Building'    },
  { rank:10, name:'WestAfricaTips',  avatar:'W', flag:'🇳🇬', picks:63,  winRate:76, streak:4,  profit:'+₦18,600', badge:'🌍 Rising'      },
]

// ── Mock past results ──────────────────────────────────────────────
export const MOCK_RESULTS = [
  { id:'r1',  home:'Man City',    away:'Arsenal',    league:'Premier League', market:'Over 2.5', strength:'BANKER',   conf:91, outcome:'WIN',  date:'2026-02-22', odds:1.72 },
  { id:'r2',  home:'Real Madrid', away:'Atlético',   league:'La Liga',        market:'Over 2.5', strength:'STRONG',   conf:87, outcome:'WIN',  date:'2026-02-22', odds:1.85 },
  { id:'r3',  home:'Bayern',      away:'Leverkusen', league:'Bundesliga',     market:'Over 2.5', strength:'BANKER',   conf:93, outcome:'WIN',  date:'2026-02-21', odds:1.65 },
  { id:'r4',  home:'PSG',         away:'Rennes',     league:'Ligue 1',        market:'Over 1.5', strength:'SAFE',     conf:82, outcome:'WIN',  date:'2026-02-21', odds:1.35 },
  { id:'r5',  home:'Inter',       away:'Fiorentina', league:'Serie A',        market:'BTTS',     strength:'MODERATE', conf:73, outcome:'LOSS', date:'2026-02-21', odds:1.90 },
  { id:'r6',  home:'Liverpool',   away:'Newcastle',  league:'Premier League', market:'Over 2.5', strength:'STRONG',   conf:88, outcome:'WIN',  date:'2026-02-20', odds:1.78 },
  { id:'r7',  home:'Atlético',    away:'Sevilla',    league:'La Liga',        market:'Over 1.5', strength:'SAFE',     conf:81, outcome:'WIN',  date:'2026-02-20', odds:1.40 },
  { id:'r8',  home:'Ajax',        away:'PSV',        league:'Eredivisie',     market:'Over 2.5', strength:'BANKER',   conf:90, outcome:'WIN',  date:'2026-02-20', odds:1.70 },
  { id:'r9',  home:'Benfica',     away:'Sporting',   league:'Primeira Liga',  market:'BTTS',     strength:'RISKY',    conf:64, outcome:'LOSS', date:'2026-02-19', odds:2.10 },
  { id:'r10', home:'Dortmund',    away:'Leipzig',    league:'Bundesliga',     market:'Over 2.5', strength:'BANKER',   conf:92, outcome:'WIN',  date:'2026-02-19', odds:1.68 },
  { id:'r11', home:'Juventus',    away:'AC Milan',   league:'Serie A',        market:'Over 1.5', strength:'SAFE',     conf:80, outcome:'WIN',  date:'2026-02-19', odds:1.45 },
  { id:'r12', home:'Monaco',      away:'Lyon',       league:'Ligue 1',        market:'BTTS',     strength:'MODERATE', conf:72, outcome:'WIN',  date:'2026-02-18', odds:1.95 },
  { id:'r13', home:'Feyenoord',   away:'AZ',         league:'Eredivisie',     market:'BTTS',     strength:'STRONG',   conf:85, outcome:'WIN',  date:'2026-02-18', odds:1.88 },
  { id:'r14', home:'Porto',       away:'Braga',      league:'Primeira Liga',  market:'Over 2.5', strength:'STRONG',   conf:86, outcome:'WIN',  date:'2026-02-17', odds:1.75 },
  { id:'r15', home:'Chelsea',     away:'Villa',      league:'Premier League', market:'Over 2.5', strength:'RISKY',    conf:65, outcome:'LOSS', date:'2026-02-17', odds:1.92 },
]

// ── Challenge matches ──────────────────────────────────────────────
export const CHALLENGE_MATCHES = [
  { id:1, home:'Arsenal',     away:'Man City',   league:'Premier League', time:'16:00', options:['Arsenal Win','Draw','Man City Win','Over 2.5','BTTS'], aiPick:'Over 2.5',  aiConf:88, aiStrength:'STRONG'   },
  { id:2, home:'Real Madrid', away:'Barcelona',  league:'La Liga',        time:'20:00', options:['Real Madrid Win','Draw','Barcelona Win','Over 2.5','BTTS'], aiPick:'BTTS', aiConf:86, aiStrength:'STRONG'   },
  { id:3, home:'Bayern',      away:'Dortmund',   league:'Bundesliga',     time:'17:30', options:['Bayern Win','Draw','Dortmund Win','Over 2.5','Over 3.5'], aiPick:'Over 2.5', aiConf:93, aiStrength:'BANKER'  },
  { id:4, home:'PSG',         away:'Marseille',  league:'Ligue 1',        time:'20:45', options:['PSG Win','Draw','Marseille Win','Over 1.5','BTTS'], aiPick:'PSG Win', aiConf:82, aiStrength:'SAFE'       },
  { id:5, home:'Inter',       away:'AC Milan',   league:'Serie A',        time:'18:00', options:['Inter Win','Draw','AC Milan Win','Over 1.5','BTTS'], aiPick:'BTTS', aiConf:79, aiStrength:'MODERATE'   },
]
