import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { CHALLENGE_MATCHES, STRENGTH } from '../constants.js'

export default function ChallengePage() {
  const { user, setAuthModal, updateUser } = useAuth()
  const [picks, setPicks]       = useState({})
  const [showHints, setShowHints] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]   = useState(false)
  const time = useCountdown()
  const entries = 312 // static for demo

  const allPicked = CHALLENGE_MATCHES.every(m => picks[m.id])

  const submit = async () => {
    if (!allPicked) return
    if (!user) { setAuthModal(true); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 900)) // simulate submit
    setSubmitted(true)
    setLoading(false)
    updateUser({ totalPicks: (user.totalPicks || 0) + 5 })
  }

  // How many match AI hint
  const aiMatches = Object.entries(picks).filter(([id, pick]) => {
    const m = CHALLENGE_MATCHES.find(m => m.id === Number(id))
    return m && m.aiPick === pick
  }).length

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 20px 80px', fontFamily: 'var(--font-sans)' }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', letterSpacing: '2px', textTransform: 'uppercase' }}>Daily Challenge</div>
          <div style={{ fontSize: 10, background: '#00FF6A15', border: '1px solid #00FF6A25', color: 'var(--green)', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>LIVE</div>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(28px,4vw,44px)', color: 'var(--text-1)', marginBottom: 10 }}>Pick 5 Challenge</h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Predict the outcome for each of today's 5 featured matches. Scores are settled at full time.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 28 }}>
        {[
          { label: 'Today\'s Entries', value: entries, color: 'var(--green)' },
          { label: 'Closes In',        value: time,    color: 'var(--blue)' },
          { label: 'Your Picks',       value: `${Object.keys(picks).length}/5`, color: 'var(--gold)' },
        ].map(s => (
          <div key={s.label} style={{ padding: '14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* AI hints toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Show AI model hints</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Reveals what PredictEdge recommends for each match</div>
        </div>
        <div onClick={() => setShowHints(!showHints)} style={{ width: 44, height: 24, borderRadius: 12, background: showHints ? 'var(--green)' : 'var(--surface-3)', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: 3, left: showHints ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px #0005' }} />
        </div>
      </div>

      {/* Match cards or submitted view */}
      {submitted ? (
        <SubmittedView picks={picks} user={user} aiMatches={aiMatches} entries={entries} />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            {CHALLENGE_MATCHES.map((m, i) => (
              <MatchCard key={m.id} match={m} picks={picks} setPicks={setPicks} hint={showHints} index={i} />
            ))}
          </div>

          {/* Progress indicator */}
          {Object.keys(picks).length > 0 && Object.keys(picks).length < 5 && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-2)' }}>
              {5 - Object.keys(picks).length} more {5 - Object.keys(picks).length === 1 ? 'pick' : 'picks'} needed to submit
              {showHints && ` · ${aiMatches} of ${Object.keys(picks).length} match the AI hint`}
            </div>
          )}

          {!user && allPicked && (
            <div style={{ marginBottom: 12, padding: '12px 16px', background: '#00FF6A08', border: '1px solid #00FF6A25', borderRadius: 8, fontSize: 13, color: 'var(--green)' }}>
              👆 Almost there! <span onClick={() => setAuthModal(true)} style={{ fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Sign up free</span> to submit your picks and appear on the leaderboard.
            </div>
          )}

          <button
            onClick={submit}
            disabled={!allPicked || loading}
            className="btn-primary"
            style={{ width: '100%', padding: '15px', fontSize: 15, opacity: allPicked ? 1 : 0.45, boxShadow: allPicked ? '0 0 28px #00FF6A18' : 'none' }}>
            {loading ? '⏳ Submitting…' : allPicked ? '🏆 Submit My Picks' : `Pick ${5-Object.keys(picks).length} more to unlock submit`}
          </button>
        </>
      )}

      {/* Scoring rules */}
      <div style={{ marginTop: 36, padding: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14 }}>Scoring rules</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[
            ['Correct pick', '+3 points', 'var(--text-2)'],
            ['Correct pick + matched AI hint', '+5 points (bonus)', 'var(--green)'],
            ['5/5 correct', 'PERFECT SCORE badge 🏅', 'var(--gold)'],
            ['Wrong pick', '0 points', 'var(--text-3)'],
          ].map(([rule, pts, col]) => (
            <div key={rule} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, alignItems: 'center' }}>
              <span style={{ color: 'var(--text-2)' }}>{rule}</span>
              <span style={{ color: col, fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 12 }}>{pts}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MatchCard({ match, picks, setPicks, hint, index }) {
  const sel = picks[match.id]
  const cfg = STRENGTH[match.aiStrength] || STRENGTH.MODERATE
  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${sel ? 'var(--green)' : 'var(--border)'}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color .2s' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)' }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--green-dim)', border: '1px solid var(--border-hi)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>{index+1}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{match.home} <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>vs</span> {match.away}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{match.league} · {match.time}</div>
        </div>
        {hint && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: cfg.bg, border: `1px solid ${cfg.glow}`, borderRadius: 6 }}>
            <span style={{ fontSize: 10 }}>{cfg.icon}</span>
            <span style={{ fontSize: 11, color: cfg.color, fontWeight: 700 }}>AI: {match.aiPick}</span>
            <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{match.aiConf}%</span>
          </div>
        )}
      </div>
      {/* Options */}
      <div style={{ padding: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {match.options.map(opt => {
          const isSel = sel === opt
          const isAI  = match.aiPick === opt
          return (
            <button key={opt}
              onClick={() => setPicks(prev => ({ ...prev, [match.id]: opt }))}
              style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${isSel?'var(--green)':isAI&&hint?'#00FF6A28':'var(--border-hi)'}`, background: isSel?'#00FF6A14':isAI&&hint?'#00FF6A06':'var(--surface-2)', color: isSel?'var(--green)':isAI&&hint?'var(--green-mid)':'var(--text-2)', fontSize: 13, fontWeight: isSel?700:400, cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all .14s', position: 'relative' }}>
              {opt}
              {isAI && hint && !isSel && <span style={{ position: 'absolute', top: -5, right: -4, fontSize: 8, background: 'var(--green-dark)', color: 'var(--green)', padding: '1px 4px', borderRadius: 3, fontWeight: 700 }}>AI</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SubmittedView({ picks, user, aiMatches, entries }) {
  return (
    <div style={{ padding: '44px 32px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, textAlign: 'center', animation: 'fadeUp .3s ease' }}>
      <div style={{ fontSize: 52, marginBottom: 18 }}>🎉</div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 30, color: 'var(--green)', marginBottom: 8 }}>Picks Submitted!</h2>
      <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 4 }}>
        {user ? `Great work, ${user.name.split(' ')[0]}!` : 'Your picks are in!'}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 28 }}>
        You're entry #{entries} today · {aiMatches}/5 picks matched the AI model
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, textAlign: 'left', maxWidth: 380, margin: '0 auto 28px' }}>
        {CHALLENGE_MATCHES.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{m.home} vs {m.away}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: picks[m.id]===m.aiPick?'var(--green)':'var(--text-1)' }}>
              {picks[m.id]} {picks[m.id]===m.aiPick?'✓ AI':''}
            </span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Results posted on the Leaderboard after tonight's final whistle.</div>
    </div>
  )
}

function useCountdown() {
  const [t, setT] = useState('')
  useEffect(() => {
    const tick = () => {
      const now = new Date(), end = new Date(now)
      end.setHours(23,59,59,0)
      const d = end - now
      const h = Math.floor(d/3600000), m = Math.floor((d%3600000)/60000), s = Math.floor((d%60000)/1000)
      setT(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return t
}
