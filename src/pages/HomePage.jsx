import { useState, useEffect } from 'react'
import { PLATFORM_STATS, STRENGTH, FALLBACK_COMPS } from '../constants.js'

const HERO_PICKS = [
  { home: 'Arsenal', away: 'Man City',   market: 'Over 2.5', strength: 'BANKER',   conf: 91, league: 'Premier League', time: '3:00 PM' },
  { home: 'Real Madrid', away: 'Barça',  market: 'BTTS',     strength: 'STRONG',   conf: 87, league: 'La Liga',         time: '8:00 PM' },
  { home: 'Bayern', away: 'Dortmund',    market: 'Over 2.5', strength: 'BANKER',   conf: 93, league: 'Bundesliga',      time: '5:30 PM' },
  { home: 'PSG', away: 'Marseille',      market: 'Over 1.5', strength: 'SAFE',     conf: 82, league: 'Ligue 1',         time: '8:45 PM' },
  { home: 'Inter', away: 'AC Milan',     market: 'BTTS',     strength: 'STRONG',   conf: 85, league: 'Serie A',         time: '6:00 PM' },
]

export default function HomePage({ setPage }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 50) }, [])

  return (
    <div style={{ fontFamily: 'var(--font-ui)' }}>

      {/* ── Hero ── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: '80px 24px 100px', minHeight: 580,
        display: 'flex', alignItems: 'center',
      }}>
        {/* Atmospheric background */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #00FF6A08 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, #00FF6A30, transparent)' }} />
        {/* Diagonal grid lines */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,255,106,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,106,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

          {/* Left: copy */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(30px)', transition: 'all 0.7s cubic-bezier(.16,1,.3,1)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#00FF6A10', border: '1px solid #00FF6A30', borderRadius: 20, padding: '5px 14px', marginBottom: 24, fontSize: 12, fontWeight: 700, color: 'var(--green-vivid)', letterSpacing: '1px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-vivid)', animation: 'pulse-glow 2s infinite', display: 'inline-block' }} />
              LIVE — TODAY'S PICKS READY
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 5vw, 68px)', fontStyle: 'italic', lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: 20 }}>
              Smarter Bets,<br />
              <span style={{ color: 'var(--green-vivid)', textShadow: '0 0 40px #00FF6A40' }}>Driven by Data.</span>
            </h1>

            <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
              Stop guessing. PredictEdge uses real football statistics, Poisson modelling, and live bookmaker odds to classify every pick from BANKER to TRAP — before you stake a penny.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => setPage('tips')} style={{
                background: 'var(--green-vivid)', border: 'none', borderRadius: 10,
                padding: '14px 28px', fontSize: 15, fontWeight: 700,
                color: '#000', cursor: 'pointer', fontFamily: 'var(--font-ui)',
                boxShadow: '0 0 32px #00FF6A30', transition: 'all 0.2s',
              }}>
                Browse Free Tips →
              </button>
              <button onClick={() => setPage('pricing')} style={{
                background: 'transparent', border: '1px solid var(--border-bright)', borderRadius: 10,
                padding: '14px 28px', fontSize: 15, fontWeight: 600,
                color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-ui)',
                transition: 'all 0.2s',
              }}>
                View Plans
              </button>
            </div>

            {/* Trust bar */}
            <div style={{ display: 'flex', gap: 28, marginTop: 40, flexWrap: 'wrap' }}>
              {PLATFORM_STATS.map((s, i) => (
                <div key={i} style={{ opacity: visible ? 1 : 0, transition: `all 0.5s ${0.2 + i * 0.1}s` }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontStyle: 'italic', color: 'var(--green-vivid)', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', marginTop: 4, textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: live pick feed preview */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s 0.15s cubic-bezier(.16,1,.3,1)' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Today's Top Picks</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--green-vivid)', background: '#00FF6A10', border: '1px solid #00FF6A30', padding: '2px 8px', borderRadius: 20 }}>LIVE</span>
              </div>
              {HERO_PICKS.map((pick, i) => (
                <MiniPickRow key={i} pick={pick} delay={i * 80} visible={visible} />
              ))}
              <div onClick={() => setPage('tips')} style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 13, color: 'var(--green-vivid)', cursor: 'pointer', fontWeight: 600 }}>
                View all picks →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '80px 24px', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-vivid)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>The Engine</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,4vw,48px)', fontStyle: 'italic', color: 'var(--text-primary)' }}>How It Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 24 }}>
            {[
              { step: '01', title: 'Real Data',        body: 'We pull live fixtures, league standings, and team form from football-data.org — updated daily.',                icon: '📡' },
              { step: '02', title: 'Poisson Model',    body: 'Expected goals are calculated from attack vs defence averages and fed through a Poisson distribution.',       icon: '📊' },
              { step: '03', title: 'H2H Validation',   body: 'Historical head-to-head records are blended with the model to catch teams that defy their season form.',     icon: '🔄' },
              { step: '04', title: 'Odds Intelligence', body: 'Bookmaker odds from The Odds API validate the model. A 20%+ gap between model and market flags the pick as TRAP.', icon: '⚡' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '28px 24px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 16, right: 20, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--border-bright)', fontWeight: 600 }}>{s.step}</div>
                <div style={{ fontSize: 28, marginBottom: 16 }}>{s.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Strength legend ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-vivid)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>The Signal Scale</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,3.5vw,42px)', fontStyle: 'italic', color: 'var(--text-primary)' }}>Every Pick Has a Strength Level</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px,1fr))', gap: 12 }}>
            {Object.values(STRENGTH).map(s => (
              <div key={s.label} style={{ padding: '18px 16px', background: s.bg, border: `1px solid ${s.glow}`, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: s.color, letterSpacing: '1px' }}>{s.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  {s.label === 'BANKER' ? '≥90% confidence' : s.label === 'STRONG' ? '85–89%' : s.label === 'SAFE' ? '80–84%' : s.label === 'MODERATE' ? '70–79%' : s.label === 'RISKY' ? '60–69%' : 'Conflict detected'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: '80px 24px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-vivid)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>Community</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,3.5vw,42px)', fontStyle: 'italic', color: 'var(--text-primary)' }}>What Our Users Say</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 20 }}>
            {[
              { text: 'The BANKER picks alone changed my week. 8/10 landed in 7 days. Nothing else comes close.', name: 'Adewale O.', role: 'Pro Member', country: '🇳🇬' },
              { text: 'I love that they actually show when something is a TRAP. Most tipsters never admit doubt.', name: 'Chisom E.', role: 'VIP Since 2025', country: '🇳🇬' },
              { text: 'The odds validation feature is genius. When the model and bookies agree, you know it\'s real.', name: 'Femi A.', role: 'Elite Tipster', country: '🇬🇭' },
            ].map((t, i) => (
              <div key={i} style={{ padding: '28px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12 }}>
                <div style={{ fontSize: 24, color: 'var(--green-vivid)', fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: 16, lineHeight: 1 }}>"</div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--green-vivid)' }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{t.country} {t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 50%, #00FF6A06 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px,5vw,56px)', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: 20, lineHeight: 1.2 }}>
            Ready to start <span style={{ color: 'var(--green-vivid)' }}>winning?</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 36, lineHeight: 1.7 }}>Free tips daily. No credit card. No guesswork. Just data.</p>
          <button onClick={() => setPage('tips')} style={{
            background: 'var(--green-vivid)', border: 'none', borderRadius: 12,
            padding: '18px 40px', fontSize: 16, fontWeight: 700,
            color: '#000', cursor: 'pointer', fontFamily: 'var(--font-ui)',
            boxShadow: '0 0 48px #00FF6A25', letterSpacing: '0.5px',
          }}>
            Browse Today's Picks →
          </button>
        </div>
      </section>
    </div>
  )
}

function MiniPickRow({ pick, delay, visible }) {
  const cfg = STRENGTH[pick.strength]
  return (
    <div style={{
      padding: '12px 20px', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 12,
      opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateX(10px)',
      transition: `all 0.5s ${delay}ms cubic-bezier(.16,1,.3,1)`,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {pick.home} <span style={{ color: 'var(--text-muted)' }}>vs</span> {pick.away}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{pick.league} · {pick.time}</div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'var(--surface-3)', padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>{pick.market}</div>
      <div style={{
        fontSize: 11, fontWeight: 700, color: cfg.color,
        background: cfg.bg, border: `1px solid ${cfg.glow}`,
        padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap',
        boxShadow: pick.strength === 'BANKER' ? `0 0 10px ${cfg.glow}` : 'none',
      }}>{cfg.icon} {pick.strength}</div>
    </div>
  )
}
