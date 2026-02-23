import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNav } from '../context/NavContext.jsx'
import { LEADERBOARD } from '../constants.js'

export default function LeaderboardPage() {
  const { user, setAuthModal } = useAuth()
  const { navigate } = useNav()
  const [period, setPeriod] = useState('ALL')

  // Slightly vary rankings by period (demo)
  const board = period === 'WEEK'
    ? [...LEADERBOARD].sort(() => Math.random() > 0.7 ? 1 : -1).slice(0, 10)
    : LEADERBOARD

  const podium = board.slice(0, 3)
  const rankColors = { 1: '#EAB840', 2: '#B0B8C0', 3: '#CD7F32' }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px 80px', fontFamily: 'var(--font-sans)' }}>

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>Community Rankings</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(28px,4vw,44px)', color: 'var(--text-1)', marginBottom: 10 }}>Leaderboard</h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Top community tipsters ranked by win rate. Updated daily.</p>
      </div>

      {/* Podium */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: 10, marginBottom: 40, alignItems: 'end' }}>
        {[podium[1], podium[0], podium[2]].map((u, i) => {
          const rank   = [2, 1, 3][i]
          const height = [150, 192, 130][i]
          const col    = rankColors[rank]
          return (
            <div key={u.name} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{u.flag}</div>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${col}18`, border: `2px solid ${col}`, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: col }}>{u.avatar}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 1 }}>{u.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 10 }}>{u.badge}</div>
              <div style={{ height, background: `${col}12`, border: `1px solid ${col}28`, borderRadius: '8px 8px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontStyle: 'italic', color: col, lineHeight: 1 }}>{rank}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: col }}>{u.winRate}%</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{u.picks} picks</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Period filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['ALL','MONTH','WEEK'].map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{ padding: '6px 16px', borderRadius: 20, border: `1px solid ${period===p?'var(--green)':'var(--border)'}`, background: period===p?'#00FF6A10':'transparent', color: period===p?'var(--green)':'var(--text-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            {p==='ALL'?'All Time':p==='MONTH'?'This Month':'This Week'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 70px 70px 70px 80px 88px', padding: '9px 14px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', gap: 0 }}>
          {['#','Tipster','Picks','Wins','Win %','Streak','Profit'].map(h => (
            <div key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>
        {board.map((u, i) => {
          const col = rankColors[u.rank] || 'var(--text-2)'
          return (
            <div key={u.name} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 70px 70px 70px 80px 88px', padding: '13px 14px', borderBottom: '1px solid var(--border)', alignItems: 'center', background: i%2===0?'transparent':'var(--surface-2)', gap: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: col }}>{u.rank}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--green-dim)', border: `1px solid ${col}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: col, flexShrink: 0 }}>{u.avatar}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{u.flag} {u.name}</div>
                  {u.rank <= 3 && <div style={{ fontSize: 10, color: col, marginTop: 1 }}>{u.badge}</div>}
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{u.picks}</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{u.wins}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: u.winRate>=85?'var(--green)':u.winRate>=75?'var(--gold)':'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{u.winRate}%</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{u.streak>0?`🔥${u.streak}`:'–'}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{u.profit}</div>
            </div>
          )
        })}
      </div>

      {/* Your position */}
      {user && (
        <div style={{ marginTop: 20, padding: '18px 20px', background: 'var(--green-dim)', border: '1px solid #00FF6A20', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,var(--green),var(--green-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#000' }}>{user.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Your position: <span style={{ color: 'var(--green)' }}>Unranked</span></div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>Submit picks via the Daily Challenge to earn your ranking.</div>
          </div>
          <button onClick={() => navigate('challenge')} className="btn-primary" style={{ padding: '8px 16px', fontSize: 12 }}>Join Challenge</button>
        </div>
      )}

      {!user && (
        <div style={{ marginTop: 24, padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>Think you can crack the top 10?</div>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>Sign up free and start submitting picks in the Daily Challenge to earn your spot on the board.</p>
          <button onClick={() => setAuthModal(true)} className="btn-primary" style={{ padding: '10px 24px', fontSize: 13 }}>Create Free Account →</button>
        </div>
      )}
    </div>
  )
}
