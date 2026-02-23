import { useState } from 'react'
import { getUserTier, setUserTier, TIERS } from '../constants.js'

const NAV_LINKS = [
  { path: 'home',       label: 'Home'      },
  { path: 'tips',       label: 'Free Tips' },
  { path: 'results',    label: 'Results'   },
  { path: 'leaderboard',label: 'Leaderboard'},
  { path: 'challenge',  label: 'Challenge' },
  { path: 'pricing',    label: 'Pricing'   },
]

export default function Layout({ page, setPage, children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showTierModal, setShowTierModal] = useState(false)
  const tier = getUserTier()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6,10,7,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', height: 64, gap: 32 }}>
          {/* Logo */}
          <div onClick={() => setPage('home')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--green-vivid), var(--green-mid))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 900, color: '#000', fontFamily: 'var(--font-ui)',
              boxShadow: '0 0 16px #00FF6A40',
            }}>P</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-primary)', fontStyle: 'italic' }}>PredictEdge</span>
          </div>

          {/* Desktop nav */}
          <div style={{ display: 'flex', gap: 4, flex: 1, '@media(maxWidth:768px)': { display: 'none' } }}>
            {NAV_LINKS.map(l => (
              <button key={l.path} onClick={() => setPage(l.path)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '6px 14px', borderRadius: 6,
                fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600,
                color: page === l.path ? 'var(--green-vivid)' : 'var(--text-secondary)',
                background: page === l.path ? 'var(--green-deep)' : 'transparent',
                transition: 'all 0.15s',
              }}>
                {l.label}
                {l.path === 'challenge' && <span style={{ marginLeft: 5, fontSize: 10, background: 'var(--green-dark)', color: 'var(--green-vivid)', padding: '1px 5px', borderRadius: 3 }}>LIVE</span>}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            {/* Tier badge */}
            <div onClick={() => setShowTierModal(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
              border: `1px solid ${tier.color}40`, borderRadius: 20,
              background: `${tier.color}10`, cursor: 'pointer',
              fontSize: 12, fontWeight: 700, color: tier.color,
            }}>
              {tier.badge} {tier.label}
            </div>
            {/* CTA */}
            <button onClick={() => setPage('pricing')} style={{
              background: 'var(--green-vivid)', border: 'none', borderRadius: 8,
              padding: '8px 16px', fontSize: 13, fontWeight: 700,
              color: '#000', cursor: 'pointer', fontFamily: 'var(--font-ui)',
            }}>Get Started</button>
            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 20 }} className="hamburger">☰</button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '16px 0', animation: 'slide-up 0.2s ease' }}>
            {NAV_LINKS.map(l => (
              <button key={l.path} onClick={() => { setPage(l.path); setMenuOpen(false) }} style={{
                display: 'block', width: '100%', textAlign: 'left', background: 'none',
                border: 'none', padding: '10px 0', cursor: 'pointer',
                fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-ui)',
                color: page === l.path ? 'var(--green-vivid)' : 'var(--text-secondary)',
              }}>{l.label}</button>
            ))}
          </div>
        )}
      </nav>

      {/* Main content */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 24px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 40 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: 10 }}>PredictEdge</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>AI-powered football predictions backed by real data. For entertainment and analysis purposes.</p>
          </div>
          {[
            { title: 'Platform', links: [['Free Tips','tips'],['Results','results'],['Leaderboard','leaderboard'],['Daily Challenge','challenge']] },
            { title: 'Account', links: [['Pricing','pricing'],['Log In','home'],['Sign Up','home']] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 14 }}>{col.title}</div>
              {col.links.map(([label, p]) => (
                <div key={label} onClick={() => setPage(p)} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, cursor: 'pointer' }}>{label}</div>
              ))}
            </div>
          ))}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 14 }}>Contact</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>📱 WhatsApp Support</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>support@predictedge.app</div>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '32px auto 0', paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>© 2026 PredictEdge. All rights reserved.</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Please gamble responsibly. 18+</span>
        </div>
      </footer>

      {/* Tier switcher modal */}
      {showTierModal && (
        <div onClick={() => setShowTierModal(false)} style={{ position: 'fixed', inset: 0, background: '#000000AA', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, maxWidth: 480, width: '100%', animation: 'slide-up 0.2s ease' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Switch Plan <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>(demo mode)</span></div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>In production this connects to real payments. For now switch freely to test each experience.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.values(TIERS).map(t => (
                <div key={t.id} onClick={() => { setUserTier(t.id) }} style={{ padding: '14px 18px', border: `1px solid ${tier.id === t.id ? t.color : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', background: tier.id === t.id ? `${t.color}10` : 'var(--surface)', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 20 }}>{t.badge}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: tier.id === t.id ? t.color : 'var(--text-primary)' }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{t.id === 'FREE' ? '2 leagues · Over 1.5 & 2.5 only' : t.id === 'PRO' ? '10 leagues · All markets · H2H + Odds' : 'Unlimited · Everything'}</div>
                  </div>
                  {tier.id === t.id && <div style={{ marginLeft: 'auto', fontSize: 12, color: t.color, fontWeight: 700 }}>ACTIVE</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
