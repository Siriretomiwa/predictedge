import { useState, useEffect } from 'react'
import { STRENGTH } from '../constants.js'

const TODAY_MATCHES = [
  { id: 1, home: 'Arsenal',      away: 'Man City',    league: 'Premier League', time: '16:00', options: ['Arsenal Win','Draw','Man City Win','Over 2.5','BTTS'] },
  { id: 2, home: 'Real Madrid',  away: 'Barcelona',   league: 'La Liga',        time: '20:00', options: ['Real Madrid Win','Draw','Barcelona Win','Over 2.5','BTTS'] },
  { id: 3, home: 'Bayern',       away: 'Dortmund',    league: 'Bundesliga',     time: '17:30', options: ['Bayern Win','Draw','Dortmund Win','Over 2.5','Over 3.5'] },
  { id: 4, home: 'PSG',          away: 'Marseille',   league: 'Ligue 1',        time: '20:45', options: ['PSG Win','Draw','Marseille Win','Over 1.5','BTTS'] },
  { id: 5, home: 'Inter',        away: 'AC Milan',    league: 'Serie A',        time: '18:00', options: ['Inter Win','Draw','AC Milan Win','Over 1.5','BTTS'] },
]

const AI_HINTS = {
  1: { pick: 'Over 2.5', conf: 88, strength: 'STRONG' },
  2: { pick: 'BTTS',     conf: 85, strength: 'STRONG' },
  3: { pick: 'Over 2.5', conf: 93, strength: 'BANKER' },
  4: { pick: 'PSG Win',  conf: 82, strength: 'SAFE'   },
  5: { pick: 'BTTS',     conf: 79, strength: 'MODERATE'},
}

export default function ChallengePage() {
  const [picks, setPicks] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [showHints, setShowHints] = useState(false)
  const [score, setScore] = useState(null)
  const [username, setUsername] = useState('')
  const [todayEntries, setTodayEntries] = useState(247)
  const timeLeft = useCountdown()

  const allPicked = TODAY_MATCHES.every(m => picks[m.id])

  const submit = async () => {
    if (!allPicked) return
    setSubmitted(true)
    // Simulate score (in prod: calculate after matches finish)
    const mockScore = Math.floor(Math.random() * 3) + 2
    setScore(mockScore)
    setTodayEntries(prev => prev + 1)
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px', fontFamily: 'var(--font-ui)' }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-vivid)', letterSpacing: '2px', textTransform: 'uppercase' }}>Daily Challenge</div>
          <div style={{ fontSize: 11, background: '#00FF6A15', border: '1px solid #00FF6A30', color: 'var(--green-vivid)', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>LIVE</div>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,4vw,48px)', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: 12 }}>Pick 5 Challenge</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Make your prediction for each of today's 5 featured matches. Scores calculated at full time.</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Entries Today',   value: todayEntries, color: 'var(--green-vivid)' },
          { label: 'Time Remaining',  value: timeLeft,     color: '#40B4FF' },
          { label: 'Your Picks',      value: `${Object.keys(picks).length}/5`, color: 'var(--gold)' },
        ].map(s => (
          <div key={s.label} style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* AI Hint toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Show AI hints</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Reveal what the model recommends for each match</div>
        </div>
        <div onClick={() => setShowHints(!showHints)} style={{ width: 44, height: 24, borderRadius: 12, background: showHints ? 'var(--green-vivid)' : 'var(--surface-3)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
          <div style={{ position: 'absolute', top: 3, left: showHints ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px #0004' }} />
        </div>
      </div>

      {/* Match cards */}
      {!submitted ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {TODAY_MATCHES.map((match, i) => (
            <MatchCard key={match.id} match={match} picks={picks} setPicks={setPicks} hint={showHints ? AI_HINTS[match.id] : null} index={i} />
          ))}
        </div>
      ) : (
        <SubmittedView picks={picks} score={score} username={username} setUsername={setUsername} todayEntries={todayEntries} />
      )}

      {/* Username + submit */}
      {!submitted && (
        <div style={{ marginTop: 28 }}>
          <input
            value={username} onChange={e => setUsername(e.target.value)}
            placeholder="Your username (optional)"
            style={{ width: '100%', padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font-ui)', marginBottom: 12, outline: 'none' }}
          />
          <button onClick={submit} disabled={!allPicked}
            style={{ width: '100%', padding: '16px', background: allPicked ? 'var(--green-vivid)' : 'var(--surface-3)', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, color: allPicked ? '#000' : 'var(--text-muted)', cursor: allPicked ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-ui)', boxShadow: allPicked ? '0 0 28px #00FF6A20' : 'none', transition: 'all 0.2s' }}>
            {allPicked ? '🏆 Submit My Picks' : `Pick ${5 - Object.keys(picks).length} more to submit`}
          </button>
        </div>
      )}

      {/* Rules */}
      <div style={{ marginTop: 40, padding: '20px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14 }}>How Scoring Works</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            ['Correct prediction', '+3 points'],
            ['Correct + AI agreed', '+5 points (bonus)'],
            ['Wrong prediction', '0 points'],
            ['5/5 correct', 'PERFECT SCORE badge'],
          ].map(([rule, pts]) => (
            <div key={rule} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{rule}</span>
              <span style={{ color: 'var(--green-vivid)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{pts}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MatchCard({ match, picks, setPicks, hint, index }) {
  const selected = picks[match.id]
  const cfg = hint ? (STRENGTH[hint.strength] || STRENGTH.MODERATE) : null

  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${selected ? 'var(--green-vivid)' : 'var(--border)'}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s' }}>
      {/* Match header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--green-deep)', border: '1px solid var(--border-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--green-vivid)', flexShrink: 0 }}>{index + 1}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{match.home} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>vs</span> {match.away}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{match.league} · {match.time}</div>
        </div>
        {hint && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: cfg.bg, border: `1px solid ${cfg.glow}`, borderRadius: 6 }}>
            <span style={{ fontSize: 10 }}>{cfg.icon}</span>
            <span style={{ fontSize: 11, color: cfg.color, fontWeight: 700 }}>AI: {hint.pick}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{hint.conf}%</span>
          </div>
        )}
      </div>

      {/* Options */}
      <div style={{ padding: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {match.options.map(opt => {
          const isSel = selected === opt
          const isAI  = hint?.pick === opt
          return (
            <button key={opt} onClick={() => setPicks(prev => ({ ...prev, [match.id]: opt }))}
              style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${isSel ? 'var(--green-vivid)' : isAI ? '#00FF6A30' : 'var(--border)'}`, background: isSel ? '#00FF6A15' : isAI ? '#00FF6A06' : 'var(--surface-2)', color: isSel ? 'var(--green-vivid)' : isAI ? '#00C94E' : 'var(--text-secondary)', fontSize: 13, fontWeight: isSel ? 700 : 400, cursor: 'pointer', fontFamily: 'var(--font-ui)', transition: 'all 0.15s', position: 'relative' }}>
              {opt}
              {isAI && !isSel && <span style={{ position: 'absolute', top: -6, right: -4, fontSize: 8, background: 'var(--green-dark)', color: 'var(--green-vivid)', padding: '1px 4px', borderRadius: 4 }}>AI</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SubmittedView({ picks, score, username, todayEntries }) {
  return (
    <div style={{ padding: 40, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{score >= 4 ? '🏆' : score >= 3 ? '🎉' : '💪'}</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontStyle: 'italic', color: 'var(--green-vivid)', marginBottom: 8 }}>Picks Submitted!</h2>
      {username && <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>Good luck, <strong>{username}</strong>!</div>}
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 32 }}>You're entry #{todayEntries} today. Results calculated at full time.</div>

      {/* Summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', maxWidth: 400, margin: '0 auto' }}>
        {TODAY_MATCHES.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{m.home} vs {m.away}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-vivid)' }}>{picks[m.id]}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, fontSize: 13, color: 'var(--text-muted)' }}>Check the leaderboard tomorrow to see your final score.</div>
    </div>
  )
}

function useCountdown() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const midnight = new Date(now); midnight.setHours(23,59,59,0)
      const diff = midnight - now
      const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000)
      setTime(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [])
  return time
}
