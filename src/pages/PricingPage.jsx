import { getUserTier, setUserTier } from '../constants.js'

const PLANS = [
  {
    id: 'FREE', name: 'Free', price: '₦0', period: '/mo',
    color: '#4A6050', badge: '○',
    description: 'Start for free. No credit card.',
    features: [
      { text: '2 leagues per analysis', ok: true },
      { text: 'Over 1.5 & Over 2.5 markets', ok: true },
      { text: 'Strength labels (BANKER → TRAP)', ok: true },
      { text: 'Daily Challenge access', ok: true },
      { text: 'Community leaderboard', ok: true },
      { text: 'Confidence % scores', ok: false },
      { text: 'Full match explanations', ok: false },
      { text: 'H2H analysis', ok: false },
      { text: 'Odds validation layer', ok: false },
      { text: 'Up to 10 leagues', ok: false },
      { text: 'BTTS & Over 3.5 markets', ok: false },
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    id: 'PRO', name: 'Pro', price: '₦5,000', period: '/mo',
    color: '#00C94E', badge: '◆',
    description: 'For serious punters. Everything you need.',
    features: [
      { text: 'Up to 10 leagues per analysis', ok: true },
      { text: 'All 4 markets (O1.5, O2.5, O3.5, BTTS)', ok: true },
      { text: 'Strength labels (BANKER → TRAP)', ok: true },
      { text: 'Daily Challenge + bonus features', ok: true },
      { text: 'Community leaderboard', ok: true },
      { text: 'Confidence % scores', ok: true },
      { text: 'Full match analysis & explanation', ok: true },
      { text: 'Head-to-head historical data', ok: true },
      { text: 'Live odds validation (The Odds API)', ok: true },
      { text: 'Priority support', ok: true },
      { text: 'Export picks as PDF', ok: true },
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    id: 'ELITE', name: 'Elite', price: '₦12,000', period: '/mo',
    color: '#F0C040', badge: '★',
    description: 'Unlimited access. Maximum edge.',
    features: [
      { text: 'Unlimited leagues', ok: true },
      { text: 'All markets (including future)', ok: true },
      { text: 'Everything in Pro', ok: true },
      { text: 'VIP tipster badge on leaderboard', ok: true },
      { text: 'Early access to new features', ok: true },
      { text: 'WhatsApp alerts for BANKER picks', ok: true },
      { text: 'Dedicated support channel', ok: true },
      { text: '10 fixtures per league (vs 5 on Pro)', ok: true },
      { text: 'Monthly performance report', ok: true },
      { text: 'Custom market requests', ok: true },
      { text: 'API access (coming soon)', ok: true },
    ],
    cta: 'Go Elite',
    popular: false,
  },
]

export default function PricingPage() {
  const tier = getUserTier()

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px 80px', fontFamily: 'var(--font-ui)' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-vivid)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>Simple Pricing</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px,5vw,56px)', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: 16, lineHeight: 1.2 }}>
          Start free.<br /><span style={{ color: 'var(--green-vivid)' }}>Upgrade when you win.</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
          No hidden fees. Cancel anytime. Your free tier never expires.
        </p>
      </div>

      {/* Demo mode notice */}
      <div style={{ padding: '12px 20px', background: '#40B4FF08', border: '1px solid #40B4FF20', borderRadius: 8, marginBottom: 40, textAlign: 'center', fontSize: 13, color: '#40B4FF' }}>
        💡 <strong>Demo mode</strong> — click any plan to switch your experience. Connect real payments (Paystack / Flutterwave) to go live.
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 20 }}>
        {PLANS.map(plan => {
          const isActive = tier.id === plan.id
          return (
            <div key={plan.id} style={{
              padding: '32px 28px',
              background: plan.popular ? 'var(--surface-2)' : 'var(--surface)',
              border: `2px solid ${isActive ? plan.color : plan.popular ? plan.color + '60' : 'var(--border)'}`,
              borderRadius: 16,
              position: 'relative',
              boxShadow: plan.popular ? `0 0 40px ${plan.color}15` : 'none',
            }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: '#000', fontSize: 11, fontWeight: 700, padding: '4px 16px', borderRadius: 20, letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                  MOST POPULAR
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 20, color: plan.color }}>{plan.badge}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{plan.name}</div>
                {isActive && <div style={{ marginLeft: 'auto', fontSize: 11, color: plan.color, background: `${plan.color}15`, padding: '2px 8px', borderRadius: 10, fontWeight: 700, border: `1px solid ${plan.color}40` }}>ACTIVE</div>}
              </div>

              <div style={{ marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontStyle: 'italic', color: plan.color }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{plan.period}</span>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.5 }}>{plan.description}</p>

              <button onClick={() => setUserTier(plan.id)} style={{
                width: '100%', padding: '13px', borderRadius: 9,
                background: isActive ? 'transparent' : plan.id === 'FREE' ? 'var(--surface-3)' : plan.color,
                border: isActive ? `2px solid ${plan.color}` : 'none',
                color: isActive ? plan.color : plan.id === 'FREE' ? 'var(--text-secondary)' : '#000',
                fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-ui)',
                marginBottom: 28, transition: 'all 0.2s',
                boxShadow: !isActive && plan.popular ? `0 0 24px ${plan.color}30` : 'none',
              }}>
                {isActive ? '✓ Current Plan' : plan.cta}
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: 13, color: f.ok ? 'var(--green-vivid)' : 'var(--text-muted)', flexShrink: 0, marginTop: 1 }}>{f.ok ? '✓' : '✗'}</span>
                    <span style={{ fontSize: 13, color: f.ok ? 'var(--text-secondary)' : 'var(--text-muted)', lineHeight: 1.4 }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* FAQ */}
      <div style={{ marginTop: 80 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontStyle: 'italic', color: 'var(--text-primary)', textAlign: 'center', marginBottom: 40 }}>Common Questions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px,1fr))', gap: 20 }}>
          {[
            { q: 'Is the free tier really free forever?', a: 'Yes. Your free plan never expires. You get daily access to predictions for 2 leagues with no time limit.' },
            { q: 'How accurate are the predictions?', a: 'Our BANKER picks hit at ~87%. All predictions use real statistical models, not gut feel. Results are publicly tracked on the Results page.' },
            { q: 'How do I pay?', a: 'We support Paystack and Flutterwave for Nigerian users. Card, bank transfer, and USSD all accepted.' },
            { q: 'Can I cancel anytime?', a: 'Yes, cancel from your account settings. No questions asked. Your plan downgrades to Free at end of billing period.' },
            { q: 'What data sources do you use?', a: 'football-data.org for league statistics and fixtures, The Odds API for bookmaker odds. Both are real, live data sources.' },
            { q: 'What is the TRAP label?', a: 'TRAP means our model detected a conflict — either the stats and H2H history disagree, or the bookmakers\' implied probability is far below our model\'s. Always skip TRAPs.' },
          ].map(faq => (
            <div key={faq.q} style={{ padding: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{faq.q}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
