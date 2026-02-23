export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()
  return res.status(200).json({ leaderboard: getMockLeaderboard(), mock: true })
}

function getMockLeaderboard() {
  return [
    { rank:1,  username:'AdeAnalytics',  avatar:'A', picks:142, wins:127, winRate:89, profit:'+₦48,200', streak:7,  badge:'🏆 Legend',    country:'🇳🇬' },
    { rank:2,  username:'OlusegunTips',   avatar:'O', picks:98,  wins:84,  winRate:86, profit:'+₦31,500', streak:5,  badge:'💎 Expert',    country:'🇳🇬' },
    { rank:3,  username:'DataDrivenFC',   avatar:'D', picks:211, wins:178, winRate:84, profit:'+₦67,800', streak:12, badge:'🔥 On Fire',   country:'🇬🇭' },
    { rank:4,  username:'ChisomBeats',    avatar:'C', picks:76,  wins:63,  winRate:83, profit:'+₦22,100', streak:3,  badge:'⚡ Rising',    country:'🇳🇬' },
    { rank:5,  username:'StatsPunter',    avatar:'S', picks:189, wins:155, winRate:82, profit:'+₦54,300', streak:4,  badge:'📊 Analyst',   country:'🇰🇪' },
    { rank:6,  username:'FemiWins',       avatar:'F', picks:134, wins:108, winRate:81, profit:'+₦38,900', streak:2,  badge:'🎯 Sharp',     country:'🇳🇬' },
    { rank:7,  username:'BolarindeFC',    avatar:'B', picks:67,  wins:54,  winRate:81, profit:'+₦19,400', streak:6,  badge:'🌟 Consistent',country:'🇳🇬' },
    { rank:8,  username:'KweseAnalyse',   avatar:'K', picks:156, wins:124, winRate:79, profit:'+₦43,200', streak:1,  badge:'📈 Grower',    country:'🇿🇦' },
    { rank:9,  username:'TundePredict',   avatar:'T', picks:88,  wins:69,  winRate:78, profit:'+₦24,700', streak:0,  badge:'🎲 Gambler',   country:'🇳🇬' },
    { rank:10, username:'AfricaFootball', avatar:'A', picks:201, wins:155, winRate:77, profit:'+₦51,000', streak:3,  badge:'⚽ Baller',    country:'🇿🇦' },
  ]
}
