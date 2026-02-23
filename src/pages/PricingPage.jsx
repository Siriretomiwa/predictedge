import { useAuth } from '../context/AuthContext.jsx'
import { useNav } from '../context/NavContext.jsx'

const PLANS = [
  {
    id: 'FREE', name: 'Free', badge: '○', color: '#8BA090',
    price: '₦0', period: '/forever',
    tag: 'ACTIVE FOR EVERYONE',
    tagColor: 'var(--green)',
    desc: 'Full access right now. No card, no commitment.',
    features: [
      { ok: true,  text: 'All 9 competitions' },
      { ok: true,  text: 'All markets — Over 1.5, 2.5, 3.5, BTTS' },
      { ok: true,  text: 'BANKER to TRAP signal classification' },
      { ok: true,  text: 'Full match analysis & explanation' },
      { ok: true,  text: 'Confidence % on every pick' },
      { ok: true,  text: 'Bookmaker odds validation' },
      { ok: true,  text: 'Daily Challenge access' },
      { ok: true,  text: 'Community Leaderboard' },
      { ok: true,  text: 'Save picks to My Picks' },
      { ok: false, text: 'WhatsApp BANKER alerts', soon: true },
      { ok: false, text: 'H2H deep-dive reports', soon: true },
    ],
    cta: 'Get Started Free',
    active: true,
  },
  {
    id: 'PRO', name: 'Pro', badge: '◆', color: '#00C94E',
    price: '₦5,000', period: '/month',
    tag: 'COMING SOON',
    tagColor: 'var(--gold)',
    desc: 'Advanced tools for serious punters.',
    features: [
      { ok: true,  text: 'Everything in Free' },
      { ok: true,  text: 'WhatsApp alerts — BANKER picks only' },
      { ok: true,  text: 'H2H deep-dive: last 20 meetings' },
      { ok: true,  text: 'Expected value calculator per pick' },
      { ok: true,  text: 'Competition watchlists + alerts' },
      { ok: true,  text: 'Export picks as PDF / CSV' },
      { ok: true,  text: 'Priority email support' },
      { ok: true,  text: '10 fixtures per league (vs 5)' },
      { ok: false, text: 'Correct Score predictions', soon: true },
      { ok: false, text: 'Asian Handicap', soon: true },
    ],
    cta: 'Join Waitlist',
    active: false,
  },
  {
    id: 'ELITE', name: 'Elite', badge: '★', color: '#EAB840',
    price: '₦12,000', period: '/month',
    tag: 'COMING SOON',
    tagColor: 'var(--gold)',
    desc: 'Maximum edge. Unlimited everything.',
    features: [
      { ok: true,  text: 'Everything in Pro' },
      { ok: true,  text: 'Unlimited leagues & fixtures' },
      { ok: true,  text: 'All future markets on launch' },
      { ok: true,  text: 'VIP badge on Leaderboard' },
      { ok: true,  text: 'Correct Score + Asian Handicap' },
      { ok: true,  text: 'WhatsApp alerts for ALL signals' },
      { ok: true,  text: 'Monthly personal performance report' },
      { ok: true,  text: 'Dedicated WhatsApp support' },
      { ok: true,  text: 'Early access to every new feature' },
      { ok: true,  text: 'API access (developer-friendly)' },
    ],
    cta: 'Join Waitlist',
    active: false,
  },
]

export default function PricingPage() {
  const { user, setAuthModal } = useAuth()
  const { navigate } = useNav()

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', padding: '60px 20px 80px', fontFamily: 'var(--font-sans)' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 10 }}>Pricing</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(36px,5vw,56px)', color: 'var(--text-1)', marginBottom: 14, lineHeight: 1.15 }}>
          Free while we build.<br />
          <span style={{ color: 'var(--green)' }}>Premium coming soon.</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-2)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
          Right now, every feature is free for everyone who signs up. Pro and Elite tiers are in development — join the waitlist to get early access and a founding-member discount.
        </p>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18, marginBottom: 60 }}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{ padding: '30px 26px', background: plan.id==='PRO'?'var(--surface-2)':'var(--surface)', border: `2px solid ${plan.id==='PRO'?plan.color+'50':'var(--border)'}`, borderRadius: 14, position: 'relative', boxShadow: plan.id==='PRO'?`0 0 36px ${plan.color}12`:'' }}>
            {/* Tag */}
            <div style={{ position: 'absolute', top: -11, left: 24, background: plan.id==='FREE'?'var(--green)':plan.id==='PRO'?'var(--surface-3)':'var(--surface-3)', border: `1px solid ${plan.id==='FREE'?'var(--green)':'var(--gold)50'}`, color: plan.tagColor, fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 20, letterSpacing: '1px' }}>
              {plan.tag}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: 8 }}>
              <span style={{ fontSize: 18, color: plan.color }}>{plan.badge}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>{plan.name}</span>
            </div>

            <div style={{ marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 38, color: plan.color, lineHeight: 1 }}>{plan.price}</span>
              <span style={{ fontSize: 13, color: 'var(--text-3)', marginLeft: 4 }}>{plan.period}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24, lineHeight: 1.5 }}>{plan.desc}</p>

            {plan.active ? (
              user ? (
                <button onClick={() => navigate('tips')} className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: 14, marginBottom: 24 }}>
                  Open Free Tips →
                </button>
              ) : (
                <button onClick={() => setAuthModal(true)} className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: 14, marginBottom: 24 }}>
                  {plan.cta} →
                </button>
              )
            ) : (
              <a href={`mailto:waitlist@predictedge.app?subject=Waitlist - ${plan.name}&body=I want early access to ${plan.name} when it launches.`}
                style={{ display: 'block', width: '100%', padding: '12px', fontSize: 14, marginBottom: 24, textAlign: 'center', borderRadius: 'var(--radius)', border: `1px solid ${plan.color}50`, color: plan.color, fontFamily: 'var(--font-sans)', fontWeight: 700, textDecoration: 'none', boxSizing: 'border-box', transition: 'all .15s', background: `${plan.color}08` }}
                onMouseEnter={e => e.target.style.background=`${plan.color}15`}
                onMouseLeave={e => e.target.style.background=`${plan.color}08`}>
                Join Waitlist →
              </a>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                  <span style={{ color: f.ok ? 'var(--green)' : 'var(--text-3)', fontSize: 13, flexShrink: 0, marginTop: 1 }}>{f.ok ? '✓' : '·'}</span>
                  <span style={{ fontSize: 13, color: f.ok ? 'var(--text-2)' : 'var(--text-3)', lineHeight: 1.4 }}>
                    {f.text} {f.soon && <span style={{ fontSize: 10, color: 'var(--gold)', border: '1px solid #EAB84030', padding: '0px 5px', borderRadius: 3, marginLeft: 4 }}>SOON</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(26px,3.5vw,38px)', color: 'var(--text-1)', marginBottom: 10 }}>Common questions</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 14 }}>
        {[
          { q: 'Is it really free right now?', a: 'Yes. Every feature — all leagues, all markets, full analysis, challenge, leaderboard — is completely free while we build the platform. No credit card ever required.' },
          { q: 'What does "Coming Soon" mean for Pro/Elite?', a: 'We are building extra features like WhatsApp alerts and H2H deep reports. Once ready, they will be paid tiers. Signing up now locks in founding-member pricing.' },
          { q: 'What data do you actually use?', a: 'Real data from football-data.org (live standings, fixtures) and The Odds API (bookmaker odds from 30+ bookmakers). Not scraped. Not made up.' },
          { q: 'How accurate is the model?', a: 'Our BANKER picks — those at ≥90% confidence — have hit at an 87% rate across all logged predictions. Every result is tracked publicly on the Results page.' },
          { q: 'What is a TRAP pick?', a: 'A TRAP means the model detected a conflict — either model vs H2H disagreement, or a large gap between model probability and what bookmakers imply. You should skip TRAPs entirely.' },
          { q: 'How do I sign up?', a: 'Just enter your name and email. That is it. No password, no phone number, no card. Takes about 10 seconds.' },
        ].map(faq => (
          <div key={faq.q} style={{ padding: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>{faq.q}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65 }}>{faq.a}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
