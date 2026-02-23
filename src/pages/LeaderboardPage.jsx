import { useState, useEffect } from 'react'
import { api } from '../apiClient.js'

export default function LeaderboardPage() {
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('ALL')

  useEffect(() => {
    api.getLeaderboard().then(r => { setBoard(r.leaderboard || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px', fontFamily: 'var(--font-ui)' }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-vivid)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 10 }}>Community Rankings</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,4vw,48px)', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: 12 }}>Leaderboard</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Top community tipsters ranked by win rate. Updated daily.</p>
      </div>

      {/* Podium — top 3 */}
      {board.length >= 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: 12, marginBottom: 40, alignItems: 'end' }}>
          {[board[1], board[0], board[2]].map((user, i) => {
            const rank = [2,1,3][i]
            const height = [160, 200, 140][i]
            const colors = { 1: '#F0C040', 2: '#B0B8C0', 3: '#CD7F32' }
            const col = colors[rank]
            return (
              <div key={user.username} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{user.country}</div>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${col}20`, border: `2px solid ${col}`, margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: col }}>{user.avatar}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{user.username}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{user.badge}</div>
                <div style={{ height, background: `${col}15`, border: `1px solid ${col}30`, borderRadius: '8px 8px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontStyle: 'italic', color: col }}>{rank}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: col, marginTop: 4 }}>{user.winRate}%</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.picks} picks</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Period filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['ALL','MONTH','WEEK'].map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{ padding: '7px 18px', borderRadius: 20, border: `1px solid ${period===p ? 'var(--green-vivid)' : 'var(--border)'}`, background: period===p ? '#00FF6A10' : 'transparent', color: period===p ? 'var(--green-vivid)' : 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
            {p === 'ALL' ? 'All Time' : p === 'MONTH' ? 'This Month' : 'This Week'}
          </button>
        ))}
      </div>

      {/* Full table */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 80px 80px 80px 80px 90px', gap: 0, padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
            {['#', 'Tipster', 'Picks', 'Wins', 'Win %', 'Streak', 'Profit'].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{h}</div>
            ))}
          </div>
          {board.map((user, i) => <LeaderRow key={user.username} user={user} i={i} />)}
        </div>
      )}

      {/* Join CTA */}
      <div style={{ marginTop: 32, padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Think you can do better?</div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Submit your picks daily and climb the rankings. Top tipsters earn badges and community recognition.</p>
        <button style={{ background: 'var(--green-vivid)', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 700, color: '#000', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
          Join as Tipster
        </button>
      </div>
    </div>
  )
}

function LeaderRow({ user, i }) {
  const rankColors = { 1: '#F0C040', 2: '#B0B8C0', 3: '#CD7F32' }
  const col = rankColors[user.rank] || 'var(--text-secondary)'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 80px 80px 80px 80px 90px', gap: 0, padding: '14px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center', background: i % 2 === 0 ? 'transparent' : 'var(--surface-2)', transition: 'background 0.15s' }}>
      {/* Rank */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: col }}>{user.rank}</div>

      {/* Tipster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--green-deep)', border: `1px solid ${col}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: col, flexShrink: 0 }}>{user.avatar}</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{user.country} {user.username}</span>
            {user.rank <= 3 && <span style={{ fontSize: 11, background: `${col}20`, color: col, padding: '1px 6px', borderRadius: 10, border: `1px solid ${col}40` }}>{user.badge}</span>}
          </div>
          {user.streak > 3 && <div style={{ fontSize: 11, color: 'var(--green-vivid)', marginTop: 1 }}>🔥 {user.streak} win streak</div>}
        </div>
      </div>

      <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{user.picks}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{user.wins}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: user.winRate >= 85 ? 'var(--green-vivid)' : user.winRate >= 75 ? 'var(--gold)' : 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{user.winRate}%</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{user.streak > 0 ? `🔥${user.streak}` : '–'}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-vivid)', fontFamily: 'var(--font-mono)' }}>{user.profit}</div>
    </div>
  )
}
