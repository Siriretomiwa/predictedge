import { useState } from 'react'
import { useNav } from '../context/NavContext.jsx'
import { MOCK_RESULTS, STRENGTH } from '../constants.js'

export default function ResultsPage() {
  const { navigate } = useNav()
  const [filter, setFilter] = useState('ALL')
  const [strengthFilter, setStrengthFilter] = useState('ALL')

  const shown = MOCK_RESULTS.filter(r => {
    const outcomeOk = filter === 'ALL' || r.outcome === filter
    const strengthOk = strengthFilter === 'ALL' || r.strength === strengthFilter
    return outcomeOk && strengthOk
  })

  const wins    = MOCK_RESULTS.filter(r => r.outcome === 'WIN').length
  const total   = MOCK_RESULTS.length
  const winRate = Math.round((wins / total) * 100)
  const streak  = (() => { let s=0; for (const r of [...MOCK_RESULTS].reverse()) { if(r.outcome==='WIN') s++; else break }; return s })()

  const byStrength = ['BANKER','STRONG','SAFE','MODERATE','RISKY'].map(s => {
    const g = MOCK_RESULTS.filter(r => r.strength === s)
    const w = g.filter(r => r.outcome === 'WIN').length
    return { s, total: g.length, wins: w, rate: g.length ? Math.round(w/g.length*100) : 0 }
  }).filter(x => x.total > 0)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px 80px', fontFamily: 'var(--font-sans)' }}>

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>Full Transparency</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(28px,4vw,44px)', color: 'var(--text-1)', marginBottom: 10 }}>Results</h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Every prediction we have made, publicly tracked. Win and loss.</p>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Win Rate',     value: `${winRate}%`, sub: `${wins} of ${total} predictions`, color: 'var(--green)' },
          { label: 'BANKER Rate',  value: `${byStrength.find(x=>x.s==='BANKER')?.rate??0}%`, sub: `${byStrength.find(x=>x.s==='BANKER')?.total??0} BANKER picks`, color: STRENGTH.BANKER.color },
          { label: 'Win Streak',   value: `${streak}`, sub: 'Current consecutive wins', color: 'var(--blue)' },
          { label: 'Tracked',      value: `${total}`, sub: 'Total predictions logged', color: 'var(--text-1)' },
        ].map(s => (
          <div key={s.label} style={{ padding: '18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontStyle: 'italic', color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* By-strength breakdown */}
      <div style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 20 }}>Hit rate by signal level</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {byStrength.map(({ s, total, wins, rate }) => {
            const cfg = STRENGTH[s]
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 86, fontSize: 12, fontWeight: 700, color: cfg.color, display: 'flex', alignItems: 'center', gap: 5 }}>{cfg.icon} {s}</div>
                <div style={{ flex: 1, height: 7, background: 'var(--surface-3)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${rate}%`, background: cfg.color, borderRadius: 4, transition: 'width 1s ease', boxShadow: s==='BANKER'?`0 0 8px ${cfg.color}`:'' }} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: cfg.color, width: 40, textAlign: 'right' }}>{rate}%</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', width: 48, textAlign: 'right' }}>{wins}/{total}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {['ALL','WIN','LOSS'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: 20, border: `1px solid ${filter===f?'var(--green)':'var(--border)'}`, background: filter===f?'#00FF6A10':'transparent', color: filter===f?'var(--green)':'var(--text-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            {f==='ALL'?`All (${total})`:f==='WIN'?`✅ Wins (${wins})`:`❌ Losses (${total-wins})`}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['ALL',...Object.keys(STRENGTH)].map(s => (
          <button key={s} onClick={() => setStrengthFilter(s)} style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${strengthFilter===s?(STRENGTH[s]?.color||'var(--green)'):'var(--border)'}`, background: strengthFilter===s?(STRENGTH[s]?STRENGTH[s].bg:'#00FF6A10'):'transparent', color: strengthFilter===s?(STRENGTH[s]?.color||'var(--green)'):'var(--text-3)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            {s==='ALL'?'All Levels':s}
          </button>
        ))}
      </div>

      {/* Results rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {shown.length === 0
          ? <div style={{ padding: 40, textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-3)' }}>No results match this filter.</div>
          : shown.map(r => <ResultRow key={r.id} r={r} />)
        }
      </div>

      {/* CTA */}
      <div style={{ marginTop: 40, padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>Want predictions with this track record?</div>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>Generate today's picks free — no card, no commitment.</p>
        <button onClick={() => navigate('tips')} className="btn-primary" style={{ padding: '10px 28px', fontSize: 13 }}>Browse Free Tips →</button>
      </div>
    </div>
  )
}

function ResultRow({ r }) {
  const cfg = STRENGTH[r.strength] || STRENGTH.MODERATE
  const win = r.outcome === 'WIN'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', background: 'var(--surface)', border: `1px solid ${win?'#00FF6A15':'#FF404015'}`, borderLeft: `3px solid ${win?'var(--green)':'var(--red)'}`, borderRadius: 9, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{win?'✅':'❌'}</span>
      <div style={{ flex: 1, minWidth: 120 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.home} vs {r.away}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{r.league} · {r.date}</div>
      </div>
      <span style={{ fontSize: 11, color: 'var(--blue)', background: '#38B2FF10', border: '1px solid #38B2FF25', padding: '2px 7px', borderRadius: 4, whiteSpace: 'nowrap' }}>{r.market}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.glow}`, padding: '2px 9px', borderRadius: 4, whiteSpace: 'nowrap' }}>{cfg.icon} {r.strength}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color, fontFamily: 'var(--font-mono)', minWidth: 38, textAlign: 'right' }}>{r.conf}%</span>
      {r.odds && <span style={{ fontSize: 12, color: 'var(--gold)', fontFamily: 'var(--font-mono)', minWidth: 34, textAlign: 'right' }}>{r.odds.toFixed(2)}</span>}
    </div>
  )
}
