import { useState, useEffect } from 'react'
import { api } from '../apiClient.js'
import { STRENGTH } from '../constants.js'

export default function ResultsPage() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL') // ALL | WIN | LOSS

  useEffect(() => {
    api.getResults().then(r => { setResults(r.results || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const shown = results.filter(r => filter === 'ALL' ? true : r.outcome === filter)
  const wins  = results.filter(r => r.outcome === 'WIN').length
  const total = results.length
  const winRate = total ? Math.round((wins / total) * 100) : 0

  // Stats by strength
  const byStrength = ['BANKER','STRONG','SAFE','MODERATE','RISKY'].map(s => {
    const group = results.filter(r => r.strength === s)
    const w = group.filter(r => r.outcome === 'WIN').length
    return { strength: s, total: group.length, wins: w, rate: group.length ? Math.round(w/group.length*100) : 0 }
  }).filter(s => s.total > 0)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px', fontFamily: 'var(--font-ui)' }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-vivid)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 10 }}>Track Record</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,4vw,48px)', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: 12 }}>Results</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Full transparency on every prediction we've made.</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px,1fr))', gap: 16, marginBottom: 36 }}>
        {[
          { label: 'Win Rate',     value: `${winRate}%`,  color: 'var(--green-vivid)', sub: `${wins}/${total} predictions` },
          { label: 'Total Picks',  value: total,          color: 'var(--text-primary)', sub: 'All time' },
          { label: 'BANKER Rate',  value: `${byStrength.find(s=>s.strength==='BANKER')?.rate ?? 0}%`, color: STRENGTH.BANKER.color, sub: `${byStrength.find(s=>s.strength==='BANKER')?.total ?? 0} BANKER picks` },
          { label: 'Streak',       value: getStreak(results), color: '#40B4FF', sub: 'Current win streak' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '20px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontStyle: 'italic', color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* By strength breakdown */}
      {byStrength.length > 0 && (
        <div style={{ marginBottom: 36, padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 20 }}>Hit Rate by Strength Level</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {byStrength.map(s => {
              const cfg = STRENGTH[s.strength]
              return (
                <div key={s.strength} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 80, fontSize: 12, fontWeight: 700, color: cfg.color }}>{cfg.icon} {s.strength}</div>
                  <div style={{ flex: 1, height: 8, background: 'var(--surface-3)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.rate}%`, background: cfg.color, borderRadius: 4, transition: 'width 1s ease', boxShadow: s.strength === 'BANKER' ? `0 0 8px ${cfg.color}` : 'none' }} />
                  </div>
                  <div style={{ width: 60, textAlign: 'right', fontSize: 13, fontWeight: 700, color: cfg.color, fontFamily: 'var(--font-mono)' }}>{s.rate}%</div>
                  <div style={{ width: 60, textAlign: 'right', fontSize: 11, color: 'var(--text-muted)' }}>{s.wins}/{s.total}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['ALL','WIN','LOSS'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 18px', borderRadius: 20, border: `1px solid ${filter === f ? 'var(--green-vivid)' : 'var(--border)'}`, background: filter === f ? '#00FF6A10' : 'transparent', color: filter === f ? 'var(--green-vivid)' : 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
            {f === 'ALL' ? `All (${results.length})` : f === 'WIN' ? `✅ Wins (${wins})` : `❌ Losses (${results.length - wins})`}
          </button>
        ))}
      </div>

      {/* Results list */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading results…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {shown.map(r => <ResultRow key={r.id} r={r} />)}
        </div>
      )}
    </div>
  )
}

function ResultRow({ r }) {
  const cfg = STRENGTH[r.strength] || STRENGTH.MODERATE
  const win = r.outcome === 'WIN'
  const dateStr = new Date(r.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface)', border: `1px solid ${win ? '#00FF6A15' : '#FF3B3B15'}`, borderLeft: `3px solid ${win ? 'var(--green-vivid)' : 'var(--red)'}`, borderRadius: 10, flexWrap: 'wrap' }}>
      {/* Outcome icon */}
      <div style={{ fontSize: 18, flexShrink: 0 }}>{win ? '✅' : '❌'}</div>

      {/* Match info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.home} vs {r.away}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{r.league} · {dateStr}</div>
      </div>

      {/* Market */}
      <div style={{ fontSize: 12, color: '#40B4FF', background: '#40B4FF10', border: '1px solid #40B4FF30', padding: '3px 8px', borderRadius: 4 }}>{r.market}</div>

      {/* Strength */}
      <div style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.glow}`, padding: '3px 10px', borderRadius: 4 }}>{cfg.icon} {r.strength}</div>

      {/* Confidence */}
      <div style={{ fontSize: 13, fontWeight: 700, color: cfg.color, fontFamily: 'var(--font-mono)', minWidth: 40, textAlign: 'right' }}>{r.confidence}%</div>

      {/* Odds */}
      {r.odds && (
        <div style={{ fontSize: 13, color: 'var(--gold)', fontFamily: 'var(--font-mono)', minWidth: 36, textAlign: 'right' }}>{r.odds.toFixed(2)}</div>
      )}
    </div>
  )
}

function getStreak(results) {
  let streak = 0
  for (const r of [...results].reverse()) {
    if (r.outcome === 'WIN') streak++
    else break
  }
  return streak
}
