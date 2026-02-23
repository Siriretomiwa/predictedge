import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function AuthModal() {
  const { setAuthModal, signUp } = useAuth()
  const [mode, setMode]       = useState('signup') // 'signup' | 'login'
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)

  const submit = () => {
    setError('')
    if (mode === 'signup') {
      if (!name.trim())             { setError('Please enter your name.'); return }
      if (!email.includes('@'))     { setError('Please enter a valid email.'); return }
      signUp({ name, email })
      setDone(true)
      setTimeout(() => setAuthModal(false), 1800)
    } else {
      // Login: just verify email exists in localStorage (simplified)
      const stored = localStorage.getItem('pe_user_v1')
      if (stored) {
        const u = JSON.parse(stored)
        if (u.email === email.trim().toLowerCase()) {
          localStorage.setItem('pe_user_v1', JSON.stringify(u))
          window.location.reload()
        } else {
          setError('No account found with that email. Please sign up.')
        }
      } else {
        setError('No account found. Please sign up first.')
      }
    }
  }

  return (
    <div
      onClick={() => setAuthModal(false)}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(6px)', animation:'fadeIn .15s ease' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:'var(--surface-2)', border:'1px solid var(--border-hi)', borderRadius:16, padding:36, maxWidth:420, width:'100%', animation:'fadeUp .2s ease', position:'relative' }}
      >
        {/* Close */}
        <button onClick={() => setAuthModal(false)} style={{ position:'absolute', top:16, right:16, background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:20, lineHeight:1 }}>×</button>

        {/* Logo mark */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:'linear-gradient(135deg,var(--green),var(--green-mid))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:18, color:'#000', boxShadow:'0 0 18px #00FF6A30' }}>P</div>
          <span style={{ fontFamily:'var(--font-serif)', fontSize:20, fontStyle:'italic', color:'var(--text-1)' }}>PredictEdge</span>
        </div>

        {done ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
            <div style={{ fontFamily:'var(--font-serif)', fontSize:24, fontStyle:'italic', color:'var(--green)', marginBottom:8 }}>Welcome aboard!</div>
            <div style={{ fontSize:14, color:'var(--text-2)' }}>Setting up your personalised dashboard…</div>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontSize:28, color:'var(--text-1)', marginBottom:6 }}>
              {mode === 'signup' ? 'Join for free' : 'Welcome back'}
            </h2>
            <p style={{ fontSize:13, color:'var(--text-2)', marginBottom:28, lineHeight:1.6 }}>
              {mode === 'signup'
                ? 'Name + email only. No password, no credit card. Personalise your picks experience instantly.'
                : 'Enter your email to pick up where you left off.'}
            </p>

            {/* Mode tabs */}
            <div style={{ display:'flex', gap:0, marginBottom:24, border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
              {['signup','login'].map(m => (
                <button key={m} onClick={() => { setMode(m); setError('') }} style={{ flex:1, padding:'9px', border:'none', background: mode===m ? 'var(--surface-3)' : 'transparent', color: mode===m ? 'var(--text-1)' : 'var(--text-3)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--font-sans)', transition:'all .15s' }}>
                  {m === 'signup' ? 'Create Account' : 'Log In'}
                </button>
              ))}
            </div>

            {/* Fields */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {mode === 'signup' && (
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name (e.g. Tunji)"
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  style={{ padding:'12px 14px', borderRadius:8, fontSize:14, width:'100%' }}
                />
              )}
              <input
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                type="email"
                onKeyDown={e => e.key === 'Enter' && submit()}
                style={{ padding:'12px 14px', borderRadius:8, fontSize:14, width:'100%' }}
              />
            </div>

            {error && <div style={{ marginTop:10, fontSize:12, color:'var(--red)', padding:'8px 12px', background:'#FF404010', border:'1px solid #FF404030', borderRadius:6 }}>{error}</div>}

            <button onClick={submit} className="btn-primary" style={{ width:'100%', marginTop:18, padding:'13px', fontSize:15 }}>
              {mode === 'signup' ? 'Create Free Account →' : 'Log In →'}
            </button>

            <p style={{ marginTop:16, fontSize:12, color:'var(--text-3)', textAlign:'center', lineHeight:1.6 }}>
              No spam. No credit card. Your data stays on your device.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
