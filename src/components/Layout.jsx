import { useState } from 'react'
import { useNav } from '../context/NavContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { TICKER } from '../constants.js'

const NAV = [
  { path:'home',        label:'Home'        },
  { path:'tips',        label:'Free Tips'   },
  { path:'results',     label:'Results'     },
  { path:'leaderboard', label:'Leaderboard' },
  { path:'challenge',   label:'Challenge',  live:true },
  { path:'saved',       label:'My Picks',   authOnly:true },
  { path:'pricing',     label:'Pricing'     },
]

export default function Layout({ children }) {
  const { page, navigate } = useNav()
  const { user, setAuthModal, logOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const go = (p) => { navigate(p); setMenuOpen(false); setUserMenuOpen(false) }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>

      {/* ── Ticker ── */}
      <div style={{ background:'var(--surface)', borderBottom:'1px solid var(--border)', height:32, overflow:'hidden', position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', height:'100%', position:'absolute', whiteSpace:'nowrap', animation:'ticker 40s linear infinite' }}>
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} style={{ fontSize:11, color:'var(--text-2)', padding:'0 32px', borderRight:'1px solid var(--border)', fontFamily:'var(--font-mono)' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ position:'sticky', top:0, zIndex:200, background:'rgba(5,9,6,0.97)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)', padding:'0 20px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', height:60, gap:8 }}>

          {/* Logo */}
          <div onClick={() => go('home')} style={{ display:'flex', alignItems:'center', gap:9, cursor:'pointer', flexShrink:0, marginRight:8 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,var(--green),var(--green-mid))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:15, color:'#000', boxShadow:'0 0 14px #00FF6A30', animation:'glow 3s ease-in-out infinite' }}>P</div>
            <span style={{ fontFamily:'var(--font-serif)', fontSize:18, fontStyle:'italic', color:'var(--text-1)', letterSpacing:'-.2px' }}>PredictEdge</span>
          </div>

          {/* Desktop links */}
          <div className="hide-mobile" style={{ display:'flex', gap:2, flex:1 }}>
            {NAV.filter(l => !l.authOnly || user).map(l => (
              <button key={l.path} onClick={() => go(l.path)} style={{ background: page===l.path ? 'var(--green-dim)' : 'none', border:'none', borderRadius:7, padding:'6px 12px', fontFamily:'var(--font-sans)', fontSize:13, fontWeight:600, color: page===l.path ? 'var(--green)' : 'var(--text-2)', cursor:'pointer', transition:'all .15s', display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap' }}>
                {l.label}
                {l.live && <span style={{ fontSize:9, background:'var(--green-dark)', color:'var(--green)', padding:'1px 5px', borderRadius:3, letterSpacing:'0.5px' }}>LIVE</span>}
              </button>
            ))}
          </div>

          {/* Right: auth */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto', flexShrink:0 }}>
            {user ? (
              <div style={{ position:'relative' }}>
                <div onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 12px 5px 5px', border:'1px solid var(--border-hi)', borderRadius:20, cursor:'pointer', background:'var(--surface-2)' }}>
                  <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,var(--green),var(--green-mid))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#000' }}>{user.avatar}</div>
                  <span style={{ fontSize:13, fontWeight:600, color:'var(--text-1)', maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</span>
                  <span style={{ fontSize:10, color:'var(--text-3)' }}>▾</span>
                </div>
                {userMenuOpen && (
                  <div onClick={e => e.stopPropagation()} style={{ position:'absolute', top:'calc(100% + 8px)', right:0, background:'var(--surface-2)', border:'1px solid var(--border-hi)', borderRadius:10, padding:8, minWidth:160, zIndex:300, animation:'fadeUp .15s ease', boxShadow:'0 8px 32px rgba(0,0,0,.5)' }}>
                    <div style={{ padding:'6px 10px', fontSize:12, color:'var(--text-3)', borderBottom:'1px solid var(--border)', marginBottom:4 }}>{user.email}</div>
                    {[['My Picks','saved'],['Results','results'],['Challenge','challenge']].map(([l,p]) => (
                      <button key={p} onClick={() => { go(p); setUserMenuOpen(false) }} style={{ display:'block', width:'100%', textAlign:'left', padding:'8px 10px', background:'none', border:'none', color:'var(--text-2)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-sans)', borderRadius:6, transition:'all .1s' }}>{l}</button>
                    ))}
                    <div style={{ borderTop:'1px solid var(--border)', marginTop:4, paddingTop:4 }}>
                      <button onClick={logOut} style={{ display:'block', width:'100%', textAlign:'left', padding:'8px 10px', background:'none', border:'none', color:'var(--red)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-sans)' }}>Log out</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button onClick={() => setAuthModal(true)} className="btn-ghost hide-mobile" style={{ padding:'7px 14px', fontSize:13 }}>Log in</button>
                <button onClick={() => setAuthModal(true)} className="btn-primary" style={{ padding:'7px 16px', fontSize:13 }}>Get Started</button>
              </>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="show-mobile" style={{ background:'none', border:'1px solid var(--border)', borderRadius:7, color:'var(--text-2)', cursor:'pointer', fontSize:16, padding:'6px 10px', alignItems:'center', justifyContent:'center' }}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ borderTop:'1px solid var(--border)', padding:'12px 0', animation:'fadeUp .15s ease' }}>
            {NAV.filter(l => !l.authOnly || user).map(l => (
              <button key={l.path} onClick={() => go(l.path)} style={{ display:'flex', alignItems:'center', gap:8, width:'100%', textAlign:'left', padding:'11px 4px', background:'none', border:'none', cursor:'pointer', fontSize:15, fontWeight:600, fontFamily:'var(--font-sans)', color: page===l.path ? 'var(--green)' : 'var(--text-2)' }}>
                {l.label}
                {l.live && <span style={{ fontSize:9, background:'var(--green-dark)', color:'var(--green)', padding:'1px 5px', borderRadius:3 }}>LIVE</span>}
              </button>
            ))}
            {!user && (
              <button onClick={() => { setAuthModal(true); setMenuOpen(false) }} className="btn-primary" style={{ width:'100%', padding:'12px', fontSize:14, marginTop:8 }}>
                Get Started Free
              </button>
            )}
          </div>
        )}
      </nav>

      {/* ── Main ── */}
      <main style={{ flex:1 }}>{children}</main>

      {/* ── Footer ── */}
      <footer style={{ borderTop:'1px solid var(--border)', background:'var(--surface)', padding:'48px 24px 32px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:40, marginBottom:40 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:14 }}>
                <div style={{ width:28, height:28, borderRadius:7, background:'linear-gradient(135deg,var(--green),var(--green-mid))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:14, color:'#000' }}>P</div>
                <span style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontSize:18, color:'var(--text-1)' }}>PredictEdge</span>
              </div>
              <p style={{ fontSize:12, color:'var(--text-3)', lineHeight:1.7, maxWidth:220 }}>The intelligence layer for football bettors. Real data, real maths, real edge.</p>
              <div style={{ marginTop:16, fontSize:11, color:'var(--text-3)' }}>Powered by football-data.org + The Odds API</div>
            </div>
            {[
              { title:'Platform', links:[['Free Tips','tips'],['Results','results'],['Leaderboard','leaderboard'],['Daily Challenge','challenge']] },
              { title:'Account',  links:[['Sign Up','home'],['Log In','home'],['My Picks','saved'],['Pricing','pricing']] },
              { title:'Contact',  links:[['WhatsApp','#'],['Email Us','#'],['FAQ','#']] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:14 }}>{col.title}</div>
                {col.links.map(([label, p]) => (
                  <div key={label} onClick={() => p !== '#' && go(p)} style={{ fontSize:13, color:'var(--text-2)', marginBottom:8, cursor: p !== '#' ? 'pointer' : 'default', transition:'color .15s' }}
                    onMouseEnter={e => { if(p!=='#') e.target.style.color='var(--green)' }}
                    onMouseLeave={e => e.target.style.color='var(--text-2)'}
                  >{label}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid var(--border)', paddingTop:20, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <span style={{ fontSize:11, color:'var(--text-3)' }}>© 2026 PredictEdge. All rights reserved.</span>
            <span style={{ fontSize:11, color:'var(--text-3)' }}>For analysis purposes only. Please bet responsibly. 18+</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
