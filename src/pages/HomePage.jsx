import { useState, useEffect } from 'react'
import { useNav } from '../context/NavContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { PLATFORM_STATS, STRENGTH, MOCK_RESULTS } from '../constants.js'

const LIVE_FEED = [
  { home:'Bayern',      away:'Dortmund',   market:'Over 2.5', strength:'BANKER',   conf:93, league:'Bundesliga'     },
  { home:'Ajax',        away:'PSV',        market:'Over 2.5', strength:'BANKER',   conf:90, league:'Eredivisie'     },
  { home:'Liverpool',   away:'Newcastle',  market:'Over 2.5', strength:'STRONG',   conf:88, league:'Premier League' },
  { home:'Real Madrid', away:'Atlético',   market:'BTTS',     strength:'STRONG',   conf:86, league:'La Liga'        },
  { home:'Inter',       away:'Napoli',     market:'Over 1.5', strength:'SAFE',     conf:82, league:'Serie A'        },
  { home:'Marseille',   away:'Nice',       market:'Over 2.5', strength:'MODERATE', conf:74, league:'Ligue 1'        },
]

export default function HomePage() {
  const { navigate } = useNav()
  const { user, setAuthModal } = useAuth()
  const [visible, setVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('BANKER')

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t) }, [])

  const recentWins = MOCK_RESULTS.filter(r => r.outcome === 'WIN').slice(0, 5)
  const bankerRate = Math.round(MOCK_RESULTS.filter(r=>r.strength==='BANKER'&&r.outcome==='WIN').length / MOCK_RESULTS.filter(r=>r.strength==='BANKER').length * 100)

  return (
    <div style={{ fontFamily:'var(--font-sans)' }}>

      {/* ──────────────────────────────── HERO ── */}
      <section style={{ position:'relative', overflow:'hidden', padding:'72px 24px 88px', minHeight:580, display:'flex', alignItems:'center' }}>
        {/* BG glows */}
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 70% 50% at 50% -10%, #00FF6A0A 0%, transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,#00FF6A25,transparent)' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(0,255,106,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,106,.025) 1px,transparent 1px)', backgroundSize:'56px 56px', pointerEvents:'none' }} />

        <div style={{ maxWidth:1200, margin:'0 auto', width:'100%', display:'grid', gridTemplateColumns:'1fr 420px', gap:56, alignItems:'center' }}>

          {/* Copy */}
          <div style={{ opacity:visible?1:0, transform:visible?'none':'translateY(24px)', transition:'all .65s cubic-bezier(.16,1,.3,1)' }}>
            {user ? (
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#00FF6A10', border:'1px solid #00FF6A25', borderRadius:20, padding:'5px 14px', marginBottom:20, fontSize:12, fontWeight:700, color:'var(--green)' }}>
                👋 Welcome back, {user.name.split(' ')[0]}! Today's picks are ready.
              </div>
            ) : (
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#00FF6A10', border:'1px solid #00FF6A25', borderRadius:20, padding:'5px 14px', marginBottom:20, fontSize:12, fontWeight:700, color:'var(--green)', letterSpacing:'0.5px' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', animation:'pulse 2s infinite', display:'inline-block' }} />
                LIVE · TODAY'S ANALYSIS READY
              </div>
            )}

            <h1 style={{ fontFamily:'var(--font-serif)', fontSize:'clamp(44px,5vw,70px)', fontStyle:'italic', lineHeight:1.08, color:'var(--text-1)', marginBottom:18 }}>
              Every pick,<br />
              <span style={{ color:'var(--green)', textShadow:'0 0 48px #00FF6A30' }}>explained by data.</span>
            </h1>

            <p style={{ fontSize:17, color:'var(--text-2)', lineHeight:1.72, marginBottom:32, maxWidth:500 }}>
              PredictEdge runs a Poisson probability model on real league data, then cross-checks every pick against live bookmaker odds. No guesswork. No opinion. Just a confidence score and a clear signal — from BANKER to TRAP.
            </p>

            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:44 }}>
              <button onClick={() => navigate('tips')} className="btn-primary" style={{ padding:'13px 26px', fontSize:15 }}>
                Browse Today's Tips →
              </button>
              {!user && (
                <button onClick={() => setAuthModal(true)} className="btn-ghost" style={{ padding:'13px 26px', fontSize:15 }}>
                  Create Free Account
                </button>
              )}
            </div>

            {/* Stats row */}
            <div style={{ display:'flex', gap:32, flexWrap:'wrap' }}>
              {PLATFORM_STATS.map((s, i) => (
                <div key={i} style={{ opacity:visible?1:0, transition:`all .5s ${.15+i*.1}s ease` }}>
                  <div style={{ fontFamily:'var(--font-serif)', fontSize:30, fontStyle:'italic', color:'var(--green)', lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontSize:11, color:'var(--text-3)', fontWeight:600, letterSpacing:'0.5px', marginTop:4, textTransform:'uppercase' }}>{s.label}</div>
                  <div style={{ fontSize:10, color:'var(--text-3)', marginTop:2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live feed widget */}
          <div style={{ opacity:visible?1:0, transform:visible?'none':'translateY(16px)', transition:'all .65s .12s cubic-bezier(.16,1,.3,1)' }} className="hide-mobile">
            <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden', boxShadow:'0 16px 48px rgba(0,0,0,.4)' }}>
              <div style={{ padding:'12px 18px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10, background:'var(--surface-2)' }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--green)', animation:'pulse 2s infinite', display:'block' }} />
                <span style={{ fontSize:11, fontWeight:700, color:'var(--text-2)', letterSpacing:'1px', textTransform:'uppercase' }}>Live Signal Feed</span>
                <span style={{ marginLeft:'auto', fontSize:11, color:'var(--green)', fontFamily:'var(--font-mono)' }}>TODAY</span>
              </div>
              {LIVE_FEED.map((p, i) => {
                const cfg = STRENGTH[p.strength]
                return (
                  <div key={i} style={{ padding:'11px 18px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10, opacity:visible?1:0, transform:visible?'none':'translateX(8px)', transition:`all .4s ${.2+i*.07}s ease` }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12.5, fontWeight:600, color:'var(--text-1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.home} <span style={{ color:'var(--text-3)' }}>vs</span> {p.away}</div>
                      <div style={{ fontSize:10, color:'var(--text-3)', marginTop:1.5, fontFamily:'var(--font-mono)' }}>{p.league}</div>
                    </div>
                    <span style={{ fontSize:10, color:'var(--text-2)', background:'var(--surface-3)', padding:'2px 7px', borderRadius:4, whiteSpace:'nowrap' }}>{p.market}</span>
                    <span style={{ fontSize:10, fontWeight:700, color:cfg.color, background:cfg.bg, border:`1px solid ${cfg.glow}`, padding:'2px 8px', borderRadius:4, whiteSpace:'nowrap', boxShadow:p.strength==='BANKER'?`0 0 8px ${cfg.glow}`:'none' }}>{cfg.icon} {p.strength}</span>
                  </div>
                )
              })}
              <div onClick={() => navigate('tips')} style={{ padding:'12px 18px', textAlign:'center', fontSize:12, color:'var(--green)', cursor:'pointer', fontWeight:600, background:'var(--surface-2)' }}>
                Generate your analysis →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────── SIGNAL SCALE ── */}
      <section style={{ padding:'72px 24px', background:'var(--surface)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--green)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:10 }}>The Signal System</div>
            <h2 style={{ fontFamily:'var(--font-serif)', fontSize:'clamp(28px,3.5vw,44px)', fontStyle:'italic', color:'var(--text-1)' }}>Know the strength before you stake</h2>
            <p style={{ fontSize:14, color:'var(--text-2)', marginTop:10, maxWidth:560, margin:'10px auto 0' }}>Every prediction is classified into one of six signal levels. Each level is backed by a precise probability threshold — not a gut call.</p>
          </div>

          {/* Tab filter */}
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', marginBottom:28 }}>
            {Object.keys(STRENGTH).map(key => {
              const cfg = STRENGTH[key]
              return (
                <button key={key} onClick={() => setActiveTab(key)} style={{ padding:'7px 16px', borderRadius:20, border:`1px solid ${activeTab===key ? cfg.color : 'var(--border)'}`, background: activeTab===key ? cfg.bg : 'transparent', color: activeTab===key ? cfg.color : 'var(--text-3)', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-sans)', transition:'all .15s' }}>
                  {cfg.icon} {key}
                </button>
              )
            })}
          </div>

          {/* Active signal card */}
          {(() => {
            const cfg = STRENGTH[activeTab]
            const descs = {
              BANKER:   { prob:'≥ 90%', body:'The highest-conviction call we make. Model, H2H, and bookmaker odds all align. These are rare. When one appears, it\'s based on overwhelming statistical consensus.', tip:'Best for single-match confidence bets. Track our BANKER-only record on the Results page.' },
              STRONG:   { prob:'85–89%', body:'High confidence with strong statistical backing. The model sees a clear pattern in team form and goals data, with no significant market conflict.', tip:'Excellent for accumulators when combined with a BANKER.' },
              SAFE:     { prob:'80–84%', body:'A solid signal with good data support. Model and odds mostly agree. No red flags detected.', tip:'Good for smaller stakes on accumulators or single bets.' },
              MODERATE: { prob:'70–79%', body:'The model sees value here but with more uncertainty. Either limited data or a minor market gap creates some doubt.', tip:'Use with caution. Consider smaller stake sizing.' },
              RISKY:    { prob:'60–69%', body:'Borderline confidence. There\'s a statistical basis but uncertainty is high. Bookmakers may see something the model doesn\'t.', tip:'Only for experienced bettors comfortable with variance.' },
              TRAP:     { prob:'Below 60% or conflict',  body:'A conflict has been detected — either the model and H2H history disagree significantly, or bookmaker odds imply a much lower probability than the model. Skip this.', tip:'TRAP picks should never be placed. They exist to protect you.' },
            }
            const d = descs[activeTab]
            return (
              <div style={{ maxWidth:640, margin:'0 auto', padding:'28px 32px', background:cfg.bg, border:`1px solid ${cfg.glow}`, borderRadius:14, animation:'fadeIn .2s ease' }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                  <span style={{ fontSize:36 }}>{cfg.icon}</span>
                  <div>
                    <div style={{ fontSize:22, fontWeight:800, color:cfg.color, letterSpacing:'0.5px' }}>{activeTab}</div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text-2)', marginTop:2 }}>Confidence threshold: {d.prob}</div>
                  </div>
                </div>
                <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.7, marginBottom:14 }}>{d.body}</p>
                <div style={{ fontSize:12, color:cfg.color, background:'var(--surface)', border:`1px solid ${cfg.glow}`, padding:'10px 14px', borderRadius:8 }}>
                  💡 {d.tip}
                </div>
              </div>
            )
          })()}
        </div>
      </section>

      {/* ──────────────────────────────── HOW IT WORKS ── */}
      <section style={{ padding:'72px 24px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--green)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:10 }}>The Engine</div>
            <h2 style={{ fontFamily:'var(--font-serif)', fontSize:'clamp(28px,3.5vw,44px)', fontStyle:'italic', color:'var(--text-1)' }}>How we build each prediction</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16 }}>
            {[
              { n:'01', title:'Live Match Data',     icon:'📡', body:'Upcoming fixtures, current season standings, and team goal averages — pulled from football-data.org every day.' },
              { n:'02', title:'Poisson Probability', icon:'📐', body:'We model expected goals using each team\'s attacking and defensive averages, then apply the Poisson distribution to calculate realistic outcome probabilities.' },
              { n:'03', title:'H2H Cross-Check',     icon:'🔁', body:'Historical head-to-head records are blended into the model. When history contradicts current form by more than 18%, we flag the conflict.' },
              { n:'04', title:'Odds Validation',     icon:'⚡', body:'Live bookmaker consensus from The Odds API validates every pick. If the market implies a significantly different probability to the model, the pick is automatically flagged TRAP.' },
            ].map((s, i) => (
              <div key={i} style={{ padding:'26px 22px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, position:'relative', overflow:'hidden', transition:'border-color .2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='var(--border-hi)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
              >
                <div style={{ position:'absolute', top:14, right:18, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--border-hi)', fontWeight:600 }}>{s.n}</div>
                <div style={{ fontSize:26, marginBottom:14 }}>{s.icon}</div>
                <div style={{ fontSize:15, fontWeight:700, color:'var(--text-1)', marginBottom:8 }}>{s.title}</div>
                <div style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.65 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────── RECENT RESULTS ── */}
      <section style={{ padding:'72px 24px', background:'var(--surface)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:36, flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--green)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:8 }}>Proof of Performance</div>
              <h2 style={{ fontFamily:'var(--font-serif)', fontSize:'clamp(24px,3vw,38px)', fontStyle:'italic', color:'var(--text-1)' }}>Recent results, publicly tracked</h2>
            </div>
            <button onClick={() => navigate('results')} className="btn-ghost" style={{ padding:'9px 18px', fontSize:13 }}>View all results →</button>
          </div>

          {/* Win rate bar */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:32 }}>
            {[
              { label:'Overall Win Rate', value:`${Math.round(MOCK_RESULTS.filter(r=>r.outcome==='WIN').length/MOCK_RESULTS.length*100)}%`, color:'var(--green)' },
              { label:'BANKER Accuracy',  value:`${bankerRate}%`, color:STRENGTH.BANKER.color },
              { label:'Total Tracked',    value:`${MOCK_RESULTS.length}`, color:'var(--text-1)' },
              { label:'Current Streak',   value:`${getStreak(MOCK_RESULTS)}W`, color:'var(--blue)' },
            ].map(s => (
              <div key={s.label} style={{ padding:'16px', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:10, textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-serif)', fontSize:32, fontStyle:'italic', color:s.color, lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginTop:5, textTransform:'uppercase', letterSpacing:'0.5px', fontWeight:600 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {recentWins.map(r => <MiniResultRow key={r.id} r={r} />)}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────── TESTIMONIALS ── */}
      <section style={{ padding:'72px 24px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--green)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:10 }}>Community Voice</div>
            <h2 style={{ fontFamily:'var(--font-serif)', fontSize:'clamp(28px,3.5vw,44px)', fontStyle:'italic', color:'var(--text-1)' }}>From people who use it every day</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:18 }}>
            {[
              { quote:'Finally a platform that explains why a pick is a TRAP instead of just pretending everything is a winner. That transparency alone is worth it.', name:'Tunji A.', role:'Daily User', flag:'🇳🇬', stars:5 },
              { quote:'The BANKER hit rate is something else. I track it myself — 11 out of last 12 correct. Nothing else I have tried comes close to that kind of precision.', name:'Kwame B.', role:'Pro Bettor', flag:'🇬🇭', stars:5 },
              { quote:'The live odds validation is the secret weapon. When the model and the bookies agree, you just know it is a quality pick. Real edge, real transparency.', name:'Sade O.', role:'Data Enthusiast', flag:'🇿🇦', stars:5 },
            ].map((t, i) => (
              <div key={i} style={{ padding:'28px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, display:'flex', flexDirection:'column', gap:16 }}>
                <div style={{ display:'flex', gap:3 }}>{Array.from({length:t.stars}).map((_,j) => <span key={j} style={{ color:'var(--gold)', fontSize:14 }}>★</span>)}</div>
                <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.72, flex:1 }}>"{t.quote}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--green-dim)', border:'1px solid var(--border-hi)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'var(--green)' }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--text-1)' }}>{t.flag} {t.name}</div>
                    <div style={{ fontSize:11, color:'var(--text-3)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────── CTA ── */}
      <section style={{ padding:'96px 24px', textAlign:'center', position:'relative', overflow:'hidden', background:'var(--surface)', borderTop:'1px solid var(--border)' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 50% 70% at 50% 50%, #00FF6A07 0%, transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', maxWidth:580, margin:'0 auto' }}>
          {user ? (
            <>
              <h2 style={{ fontFamily:'var(--font-serif)', fontSize:'clamp(32px,4.5vw,52px)', fontStyle:'italic', color:'var(--text-1)', marginBottom:16, lineHeight:1.2 }}>
                Ready to analyse, <span style={{ color:'var(--green)' }}>{user.name.split(' ')[0]}?</span>
              </h2>
              <p style={{ fontSize:16, color:'var(--text-2)', marginBottom:32, lineHeight:1.7 }}>Your personalised dashboard is waiting. Select your leagues and markets and generate your picks.</p>
              <button onClick={() => navigate('tips')} className="btn-primary" style={{ padding:'16px 40px', fontSize:16, boxShadow:'0 0 48px #00FF6A20' }}>
                Open Free Tips →
              </button>
            </>
          ) : (
            <>
              <h2 style={{ fontFamily:'var(--font-serif)', fontSize:'clamp(32px,4.5vw,52px)', fontStyle:'italic', color:'var(--text-1)', marginBottom:16, lineHeight:1.2 }}>
                Your first <span style={{ color:'var(--green)' }}>data-backed pick</span> is one click away.
              </h2>
              <p style={{ fontSize:16, color:'var(--text-2)', marginBottom:32, lineHeight:1.7 }}>Sign up with your name and email. No password. No card. Personalise your experience in under 20 seconds.</p>
              <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
                <button onClick={() => setAuthModal(true)} className="btn-primary" style={{ padding:'16px 36px', fontSize:16, boxShadow:'0 0 48px #00FF6A20' }}>
                  Create Free Account →
                </button>
                <button onClick={() => navigate('tips')} className="btn-ghost" style={{ padding:'16px 28px', fontSize:16 }}>
                  Browse First
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

function MiniResultRow({ r }) {
  const cfg = STRENGTH[r.strength]
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'var(--surface-2)', border:'1px solid var(--border)', borderLeft:`3px solid ${r.outcome==='WIN'?'var(--green)':'var(--red)'}`, borderRadius:8 }}>
      <span style={{ fontSize:16 }}>{r.outcome==='WIN'?'✅':'❌'}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.home} vs {r.away}</div>
        <div style={{ fontSize:11, color:'var(--text-3)' }}>{r.league} · {r.date}</div>
      </div>
      <span style={{ fontSize:11, color:'var(--blue)', background:'#38B2FF10', padding:'2px 7px', borderRadius:4, whiteSpace:'nowrap' }}>{r.market}</span>
      <span style={{ fontSize:11, fontWeight:700, color:cfg.color, background:cfg.bg, border:`1px solid ${cfg.glow}`, padding:'2px 8px', borderRadius:4, whiteSpace:'nowrap' }}>{cfg.icon} {r.strength}</span>
      <span style={{ fontSize:13, fontWeight:700, color:cfg.color, fontFamily:'var(--font-mono)', minWidth:36, textAlign:'right' }}>{r.conf}%</span>
    </div>
  )
}

function getStreak(results) {
  let s = 0
  for (const r of [...results].reverse()) { if (r.outcome==='WIN') s++; else break }
  return s
}
