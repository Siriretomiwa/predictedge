import { useAuth } from '../context/AuthContext.jsx'
import { useNav } from '../context/NavContext.jsx'
import { STRENGTH } from '../constants.js'

export default function SavedPage() {
  const { user, savedPicks, savePick } = useAuth()
  const { navigate } = useNav()

  if (!user) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 20px', textAlign: 'center', fontFamily: 'var(--font-sans)' }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 32, color: 'var(--text-1)', marginBottom: 12 }}>My Picks</h1>
        <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 28 }}>Sign up free to save picks, track your record, and personalise your experience.</p>
        <button onClick={() => navigate('home')} className="btn-primary" style={{ padding: '13px 32px', fontSize: 15 }}>Create Free Account →</button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px 80px', fontFamily: 'var(--font-sans)' }}>

      {/* Header with greeting */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,var(--green),var(--green-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#000', flexShrink: 0 }}>{user.avatar}</div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(24px,3.5vw,36px)', color: 'var(--text-1)', lineHeight: 1.1 }}>
              {user.name}'s Picks
            </h1>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Member since {new Date(user.joinedAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })} · {user.email}</div>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10 }}>
          {[
            { label: 'Saved Picks',    value: savedPicks.length, color: 'var(--green)' },
            { label: 'Challenge Picks', value: user.totalPicks || 0, color: 'var(--blue)' },
            { label: 'Points',         value: user.points || 0, color: 'var(--gold)' },
            { label: 'Plan',           value: 'Free ✦', color: 'var(--text-1)' },
          ].map(s => (
            <div key={s.label} style={{ padding: '14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 26, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved picks list */}
      <div style={{ marginBottom: 12, fontSize: 11, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Saved Picks ({savedPicks.length})</div>

      {savedPicks.length === 0 ? (
        <div style={{ padding: '52px 20px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 14 }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>📌</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 20, color: 'var(--text-1)', marginBottom: 8 }}>No saved picks yet</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>Generate picks on the Free Tips page and tap ☆ Save to bookmark them here.</div>
          <button onClick={() => navigate('tips')} className="btn-primary" style={{ padding: '10px 24px', fontSize: 13 }}>Browse Free Tips →</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {savedPicks.map(p => {
            const cfg = STRENGTH[p.strength] || STRENGTH.TRAP
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', background: 'var(--surface)', border: `1px solid ${cfg.glow}`, borderLeft: `3px solid ${cfg.color}`, borderRadius: 10, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.home} vs {p.away}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{p.league} · Saved {new Date(p.savedAt).toLocaleDateString('en-GB')}</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--blue)', background: '#38B2FF10', border: '1px solid #38B2FF25', padding: '2px 7px', borderRadius: 4 }}>{p.market}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.glow}`, padding: '2px 9px', borderRadius: 4 }}>{cfg.icon} {cfg.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: cfg.color }}>{p.confidence}%</span>
                <button onClick={() => savePick(p)} style={{ background: 'none', border: '1px solid var(--border-hi)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 11, color: 'var(--red)', fontFamily: 'var(--font-sans)' }}>✕ Remove</button>
              </div>
            )
          })}
        </div>
      )}

      {/* Premium coming soon */}
      <div style={{ marginTop: 40, padding: '28px', background: 'var(--surface)', border: '1px solid var(--border-hi)', borderRadius: 12, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,var(--gold),transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>✦ Premium — Coming Soon</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>Advanced features on the way</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65, maxWidth: 480 }}>WhatsApp alerts for BANKER picks, H2H deep-dive reports, expected value calculator, and custom competition watchlists — all in development. Currently free for everyone.</div>
          </div>
          <div style={{ padding: '8px 16px', background: '#EAB84010', border: '1px solid #EAB84030', borderRadius: 20, fontSize: 12, fontWeight: 700, color: 'var(--gold)', whiteSpace: 'nowrap' }}>Coming Soon</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginTop: 20 }}>
          {['📱 WhatsApp BANKER alerts', '📊 H2H deep reports', '💹 Expected value calculator', '🔔 Competition watchlists'].map(f => (
            <div key={f} style={{ padding: '10px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-2)' }}>{f}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
