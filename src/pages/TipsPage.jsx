import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNav } from '../context/NavContext.jsx'
import { MARKETS, FALLBACK_COMPS, COMP_TO_ODDS, STRENGTH } from '../constants.js'
import { api } from '../apiClient.js'
import { runFLE } from '../engines/fle.js'

export default function TipsPage() {
  const { user, setAuthModal, savedPicks, savePick, isPickSaved } = useAuth()
  const { navigate } = useNav()
  const [comps, setComps]             = useState([])
  const [isMock, setIsMock]           = useState(true)
  const [selComps, setSelComps]       = useState([])
  const [selMarkets, setSelMarkets]   = useState(['o25'])
  const [picks, setPicks]             = useState([])
  const [loading, setLoading]         = useState(false)
  const [progress, setProgress]       = useState(0)
  const [msg, setMsg]                 = useState('')
  const [generated, setGenerated]     = useState(false)
  const [safeOnly, setSafeOnly]       = useState(false)
  const [apiLive, setApiLive]         = useState(false)
  const [oddsLive, setOddsLive]       = useState(false)
  const [quota, setQuota]             = useState(null)

  const MAX_LEAGUES  = 10   // all free now
  const MAX_FIXTURES = 5

  useEffect(() => {
    api.competitions()
      .then(r => { setComps(r.competitions || FALLBACK_COMPS); setIsMock(r.mock ?? true); setApiLive(!r.mock) })
      .catch(() => setComps(FALLBACK_COMPS))
  }, [])

  const toggle = (arr, setArr, val) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : arr.length < MAX_LEAGUES ? [...arr, val] : arr)
  }

  const generate = async () => {
    if (!selComps.length || !selMarkets.length) return
    setLoading(true); setGenerated(false); setPicks([]); setProgress(2)
    const all = []

    for (let ci = 0; ci < selComps.length; ci++) {
      const compId = selComps[ci]
      const comp   = comps.find(c => c.id === compId) || { id: compId, name: compId, flag: '⚽' }

      setMsg(`Fetching fixtures — ${comp.name}`)
      setProgress(5 + Math.round(ci / selComps.length * 25))

      let fixtures = []
      try { const r = await api.fixtures({ competition: compId, limit: MAX_FIXTURES }); fixtures = r.fixtures || [] } catch { continue }

      setMsg(`Loading team stats — ${comp.name}`)
      let teamStats = {}
      try { const r = await api.standings({ competition: compId }); teamStats = r.teamStats || {} } catch {}

      let oddsEvents = []
      const oddsKey  = COMP_TO_ODDS[compId]
      if (oddsKey) {
        setMsg(`Fetching bookmaker odds — ${comp.name}`)
        const needs = [
          selMarkets.some(m => ['o15','o25','o35'].includes(m)) && 'totals',
          selMarkets.includes('btts') && 'btts',
        ].filter(Boolean).join(',')
        try {
          const r = await api.odds({ sport: oddsKey, markets: needs })
          oddsEvents = r.odds || []
          if (!r.mock) setOddsLive(true)
          if (r.quota?.remaining) setQuota(r.quota.remaining)
        } catch {}
      }

      setProgress(30 + Math.round(ci / selComps.length * 40))

      for (const fix of fixtures) {
        setMsg(`Analysing — ${fix.homeTeam.name} vs ${fix.awayTeam.name}`)

        let h2h = null
        if (apiLive) {
          try { const r = await api.h2h({ matchId: fix.id }); h2h = r.summary } catch {}
        }

        const norm = s => s.toLowerCase().replace(/\s+fc$|\s+afc$/,'').trim()
        const oddsEvent = oddsEvents.find(e => {
          const [oh, oa] = [norm(e.homeTeam), norm(e.awayTeam)]
          const [fh, fa] = [norm(fix.homeTeam.name), norm(fix.awayTeam.name)]
          return (oh.includes(fh) || fh.includes(oh)) && (oa.includes(fa) || fa.includes(oa))
        }) || null

        const homeStats = teamStats[fix.homeTeam.id] || { matchesPlayed: 4, goalsForAvg: 1.3, goalsAgainstAvg: 1.1, source: 'ESTIMATE' }
        const awayStats = teamStats[fix.awayTeam.id] || { matchesPlayed: 4, goalsForAvg: 1.1, goalsAgainstAvg: 1.3, source: 'ESTIMATE' }

        const results = runFLE({ homeStats, awayStats, h2hSummary: h2h, oddsEvent, markets: selMarkets, showH2H: !!h2h, showOdds: !!oddsEvent })

        for (const r of results) {
          all.push({
            id: `${fix.id}-${r.mId}`,
            home: fix.homeTeam.name, away: fix.awayTeam.name,
            homeCrest: fix.homeTeam.crest, awayCrest: fix.awayTeam.crest,
            date: fix.utcDate, matchday: fix.matchday,
            league: comp.name, leagueFlag: comp.flag || '⚽',
            market: MARKETS.find(m => m.id === r.mId)?.label || r.mId,
            marketId: r.mId, ...r
          })
        }
      }
    }

    all.sort((a,b) => (STRENGTH[a.strength]?.rank||9) - (STRENGTH[b.strength]?.rank||9))
    setPicks(all); setProgress(100); setLoading(false); setGenerated(true)
  }

  const shown   = picks.filter(p => safeOnly ? ['BANKER','STRONG','SAFE'].includes(p.strength) : true)
  const grouped = shown.reduce((acc,p) => { (acc[p.league] = acc[p.league]||[]).push(p); return acc }, {})

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px 80px', fontFamily: 'var(--font-sans)' }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>AI Prediction Engine</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(28px,4vw,44px)', color: 'var(--text-1)', marginBottom: 10 }}>Free Tips</h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Choose your leagues and markets — the model does the rest.</p>

        {user && (
          <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'var(--green-dim)', border: '1px solid #00FF6A20', borderRadius: 20, fontSize: 12, color: 'var(--green)' }}>
            <span>👤</span> Personalised for {user.name.split(' ')[0]} · All markets unlocked
          </div>
        )}

        {/* API status */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <Pill live={apiLive} label={apiLive ? 'football-data.org · LIVE' : 'football-data.org · Mock data'} />
          <Pill live={oddsLive} label={oddsLive ? `The Odds API · LIVE (${quota || '?'} calls left)` : 'The Odds API · Offline'} />
          {isMock && <Pill live={false} label="Add API keys to Vercel for real data" />}
        </div>
      </div>

      {/* Config grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 28, marginBottom: 32, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Leagues */}
          <div>
            <Label text={`Leagues — select up to ${MAX_LEAGUES} (${selComps.length} chosen)`} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(195px,1fr))', gap: 7 }}>
              {comps.map(c => {
                const sel    = selComps.includes(c.id)
                const atMax  = !sel && selComps.length >= MAX_LEAGUES
                const hasOdds= !!COMP_TO_ODDS[c.id]
                return (
                  <div key={c.id}
                    onClick={() => !atMax && toggle(selComps, setSelComps, c.id)}
                    style={{ padding: '9px 12px', border: `1px solid ${sel ? 'var(--green)' : 'var(--border)'}`, borderRadius: 8, cursor: atMax ? 'not-allowed' : 'pointer', background: sel ? '#00FF6A08' : 'var(--surface)', opacity: atMax ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 8, transition: 'all .14s' }}>
                    <div style={{ width: 15, height: 15, borderRadius: 4, border: `2px solid ${sel ? 'var(--green)' : 'var(--border-hi)'}`, background: sel ? 'var(--green)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#000', flexShrink: 0, fontWeight: 800 }}>{sel && '✓'}</div>
                    <span style={{ fontSize: 13 }}>{c.flag || '⚽'}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: sel ? 'var(--text-1)' : 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{c.name}</span>
                    {hasOdds && <span style={{ fontSize: 9, color: 'var(--gold)', border: '1px solid #EAB84030', padding: '1px 4px', borderRadius: 3, flexShrink: 0 }}>ODDS</span>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Markets */}
          <div>
            <Label text="Markets" />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {MARKETS.map(m => {
                const sel = selMarkets.includes(m.id)
                return (
                  <button key={m.id}
                    disabled={!!m.soon}
                    onClick={() => !m.soon && toggle(selMarkets, setSelMarkets, m.id)}
                    style={{ padding: '8px 16px', borderRadius: 20, border: `1px solid ${sel ? 'var(--blue)' : m.soon ? 'var(--border)' : 'var(--border-hi)'}`, background: sel ? '#38B2FF10' : 'transparent', color: sel ? 'var(--blue)' : m.soon ? 'var(--text-3)' : 'var(--text-2)', fontSize: 13, fontWeight: sel ? 700 : 400, cursor: m.soon ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)', transition: 'all .14s', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {m.label}
                    {m.soon && <span style={{ fontSize: 9, color: 'var(--text-3)', border: '1px solid var(--border)', padding: '1px 4px', borderRadius: 3 }}>SOON</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Generate CTA */}
        <div style={{ paddingTop: 26, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
          <button
            onClick={generate}
            disabled={loading || !selComps.length || !selMarkets.length}
            className="btn-primary"
            style={{ padding: '13px 24px', fontSize: 14, opacity: loading || !selComps.length || !selMarkets.length ? 0.5 : 1, boxShadow: selComps.length && selMarkets.length ? '0 0 24px #00FF6A18' : 'none', minWidth: 160 }}>
            {loading ? '⏳ Analysing…' : '⚡ Generate Picks'}
          </button>
          {!user && (
            <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', maxWidth: 160, lineHeight: 1.5 }}>
              <span onClick={() => setAuthModal(true)} style={{ color: 'var(--green)', cursor: 'pointer', textDecoration: 'underline' }}>Sign up free</span> to save your picks
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      {loading && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{msg}</span>
            <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{progress}%</span>
          </div>
          <div style={{ height: 3, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,var(--green),var(--blue))', transition: 'width .35s', borderRadius: 2 }} />
          </div>
        </div>
      )}

      {/* Results */}
      {generated && !loading && (
        <>
          {isMock && (
            <div style={{ marginBottom: 20, padding: '11px 16px', background: '#EAB84008', border: '1px solid #EAB84025', borderRadius: 8, fontSize: 13, color: 'var(--gold)' }}>
              ⚠️ Running on mock data. Add <code style={{ background: 'var(--surface-3)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>FOOTBALL_DATA_KEY</code> + <code style={{ background: 'var(--surface-3)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>ODDS_API_KEY</code> in Vercel → Settings → Environment Variables.
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>
              <b style={{ color: 'var(--text-1)' }}>{shown.length}</b> picks · <b style={{ color: 'var(--text-1)' }}>{Object.keys(grouped).length}</b> leagues
              {!user && <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-3)' }}>— <span onClick={() => setAuthModal(true)} style={{ color: 'var(--green)', cursor: 'pointer' }}>sign up</span> to save picks</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>BANKER/STRONG/SAFE only</span>
              <Toggle on={safeOnly} onToggle={() => setSafeOnly(!safeOnly)} />
            </div>
          </div>

          {shown.length === 0
            ? <EmptyState onReset={() => setSafeOnly(false)} safeOnly={safeOnly} />
            : Object.entries(grouped).map(([league, lp]) => (
                <LeagueBlock key={league} league={league} picks={lp} user={user} setAuthModal={setAuthModal} savePick={savePick} isPickSaved={isPickSaved} />
              ))
          }
        </>
      )}

      {/* First-time prompt */}
      {!generated && !loading && (
        <div style={{ padding: '60px 20px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 14 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--text-1)', marginBottom: 8 }}>Select leagues above, then generate</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>The engine will pull live data, run the Poisson model, and classify every pick.</div>
        </div>
      )}
    </div>
  )
}

function Label({ text }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10 }}>{text}</div>
}

function Pill({ live, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 20, border: `1px solid ${live ? '#00FF6A25' : '#EAB84025'}`, fontSize: 11, color: live ? 'var(--green)' : 'var(--gold)', fontWeight: 600 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: live ? 'var(--green)' : 'var(--gold)', animation: live ? 'pulse 2s infinite' : 'none', display: 'inline-block' }} />
      {label}
    </div>
  )
}

function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} style={{ width: 42, height: 23, borderRadius: 12, background: on ? 'var(--green)' : 'var(--surface-3)', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 22 : 3, width: 17, height: 17, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px #0005' }} />
    </div>
  )
}

function EmptyState({ onReset, safeOnly }) {
  return (
    <div style={{ padding: 48, textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 12 }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
      <div style={{ color: 'var(--text-2)', marginBottom: 12 }}>No picks match this filter.</div>
      {safeOnly && <button onClick={onReset} className="btn-ghost" style={{ padding: '8px 20px', fontSize: 13 }}>Show all picks</button>}
    </div>
  )
}

function LeagueBlock({ league, picks, user, setAuthModal, savePick, isPickSaved }) {
  const [open, setOpen] = useState(true)
  const bankersCount = picks.filter(p => p.strength === 'BANKER').length
  return (
    <div style={{ marginBottom: 20 }}>
      <div onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', flex: 1 }}>{league}</span>
        {bankersCount > 0 && <span style={{ fontSize: 11, color: 'var(--green)', background: '#00FF6A10', border: '1px solid #00FF6A25', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>🏆 {bankersCount} BANKER</span>}
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{picks.length} picks {open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {picks.map(p => <PickCard key={p.id} pick={p} user={user} setAuthModal={setAuthModal} savePick={savePick} isSaved={isPickSaved(p.id)} />)}
        </div>
      )}
    </div>
  )
}

function PickCard({ pick, user, setAuthModal, savePick, isSaved }) {
  const [exp, setExp] = useState(false)
  const cfg = STRENGTH[pick.strength] || STRENGTH.TRAP
  const dateStr = pick.date ? new Date(pick.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''

  const handleSave = (e) => {
    e.stopPropagation()
    if (!user) { setAuthModal(true); return }
    savePick(pick)
  }

  return (
    <div style={{ border: `1px solid ${cfg.glow}`, borderLeft: `3px solid ${cfg.color}`, borderRadius: 10, background: cfg.bg, overflow: 'hidden' }}>
      {pick.strength === 'BANKER' && (
        <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${cfg.color},transparent)`, animation: 'pulse 2.5s infinite' }} />
      )}
      <div style={{ padding: '13px 15px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 10 }} onClick={() => setExp(!exp)}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {dateStr && <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3, fontFamily: 'var(--font-mono)' }}>{dateStr}{pick.matchday ? ` · MD${pick.matchday}` : ''}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {pick.homeCrest && <img src={pick.homeCrest} alt="" style={{ width: 15, height: 15, objectFit: 'contain' }} onError={e=>e.target.style.display='none'} />}
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{pick.home}</span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>vs</span>
            {pick.awayCrest && <img src={pick.awayCrest} alt="" style={{ width: 15, height: 15, objectFit: 'contain' }} onError={e=>e.target.style.display='none'} />}
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{pick.away}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap' }}>
            <Tag label={pick.market} color="var(--blue)" />
            {pick.sources?.includes('ODDS_API') && <Tag label="Odds validated" color="var(--gold)" />}
            {pick.noBet && <Tag label="SKIP — conflict" color="var(--red)" />}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <div style={{ padding: '4px 11px', background: cfg.bg, border: `1px solid ${cfg.glow}`, borderRadius: 20, fontSize: 11, fontWeight: 700, color: cfg.color, boxShadow: pick.strength === 'BANKER' ? `0 0 10px ${cfg.glow}` : 'none', animation: pick.strength === 'BANKER' ? 'glow 3s infinite' : 'none' }}>
            {cfg.icon} {cfg.label}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 800, color: cfg.color, letterSpacing: '-1px', lineHeight: 1 }}>{pick.confidence}<span style={{ fontSize: 11 }}>%</span></div>
          {pick.oddsDisplay && (
            <div style={{ textAlign: 'right', padding: '3px 8px', background: 'var(--surface)', border: '1px solid #EAB84018', borderRadius: 5 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>{pick.oddsDisplay.medianOdds?.toFixed(2)}</div>
              <div style={{ fontSize: 9, color: 'var(--text-3)' }}>{pick.oddsDisplay.bookmakerCount} bks</div>
            </div>
          )}
          <button onClick={handleSave} style={{ background: 'none', border: `1px solid ${isSaved ? cfg.color : 'var(--border-hi)'}`, borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 11, color: isSaved ? cfg.color : 'var(--text-3)', fontFamily: 'var(--font-sans)', transition: 'all .14s' }}>
            {isSaved ? '★ Saved' : '☆ Save'}
          </button>
        </div>
      </div>
      {exp && (
        <div style={{ padding: '11px 15px', borderTop: `1px solid ${cfg.glow}20`, background: 'var(--surface)' }}>
          {pick.conflict && <div style={{ fontSize: 12, color: '#FF8C00', fontWeight: 600, marginBottom: 6 }}>⚡ Conflict detected: {pick.conflict.replace(/_/g,' ')} — treat as NO BET</div>}
          <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7, borderLeft: `2px solid ${cfg.color}`, paddingLeft: 12 }}>{pick.explanation || 'No explanation available for this pick.'}</div>
        </div>
      )}
      {!exp && <div style={{ padding: '3px 15px 9px', fontSize: 10, color: 'var(--text-3)' }}>↓ tap for full analysis</div>}
    </div>
  )
}

function Tag({ label, color }) {
  return <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, border: `1px solid ${color}35`, color, background: `${color}10` }}>{label}</span>
}
