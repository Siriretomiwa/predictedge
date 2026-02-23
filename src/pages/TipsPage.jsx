import { useState, useEffect } from 'react'
import { getUserTier, MARKETS, COMP_TO_ODDS, FALLBACK_COMPS, STRENGTH } from '../constants.js'
import { api } from '../apiClient.js'
import { runFLE } from '../engines/fle.js'

export default function TipsPage() {
  const tier = getUserTier()
  const [comps, setComps] = useState([])
  const [compsMock, setCompsMock] = useState(false)
  const [selectedComps, setSelectedComps] = useState([])
  const [selectedMarkets, setSelectedMarkets] = useState(['o25'])
  const [picks, setPicks] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [progress, setProgress] = useState(0)
  const [safeOnly, setSafeOnly] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [apiLive, setApiLive] = useState(false)
  const [oddsLive, setOddsLive] = useState(false)
  const [quota, setQuota] = useState(null)

  useEffect(() => {
    api.competitions().then(r => {
      setComps(r.competitions || FALLBACK_COMPS)
      setCompsMock(r.mock ?? true)
      setApiLive(!r.mock)
    }).catch(() => setComps(FALLBACK_COMPS))
  }, [])

  const toggle = (arr, setArr, val, max) => {
    if (arr.includes(val)) setArr(arr.filter(x => x !== val))
    else if (arr.length < max) setArr([...arr, val])
  }

  const generate = async () => {
    if (!selectedComps.length || !selectedMarkets.length) return
    setLoading(true); setGenerated(false); setPicks([]); setProgress(0)
    const all = [], total = selectedComps.length

    for (let ci = 0; ci < total; ci++) {
      const compId = selectedComps[ci]
      const comp = comps.find(c => c.id === compId) || { id: compId, name: compId }
      setMsg(`Fetching fixtures: ${comp.name}…`)
      setProgress(Math.round((ci / total) * 30))

      let fixtures = []
      try { const r = await api.fixtures({ competition: compId, limit: tier.maxFixtures }); fixtures = r.fixtures || [] }
      catch { continue }

      setMsg(`Loading stats: ${comp.name}…`)
      let teamStats = {}
      try { const r = await api.standings({ competition: compId }); teamStats = r.teamStats || {} }
      catch {}

      // Odds — one call per competition
      let oddsEvents = []
      const oddsKey = COMP_TO_ODDS[compId]
      if (oddsKey) {
        setMsg(`Fetching odds: ${comp.name}…`)
        const needsTotals = selectedMarkets.some(m => ['o15','o25','o35'].includes(m))
        const needsBTTS   = selectedMarkets.includes('btts')
        const mktParam    = [needsTotals && 'totals', needsBTTS && 'btts'].filter(Boolean).join(',')
        try {
          const r = await api.odds({ sport: oddsKey, markets: mktParam })
          oddsEvents = r.odds || []
          if (!r.mock) setOddsLive(true)
          if (r.quota?.remaining) setQuota(r.quota.remaining)
        } catch {}
      }

      setProgress(Math.round((ci / total) * 30) + 20)

      for (const fix of fixtures) {
        setMsg(`Analysing: ${fix.homeTeam.name} vs ${fix.awayTeam.name}`)
        setProgress(Math.round((ci / total) * 30) + 20 + Math.round((fixtures.indexOf(fix) / fixtures.length) * 30))

        let h2h = null
        if (tier.showH2H && apiLive) {
          try { const r = await api.h2h({ matchId: fix.id }); h2h = r.summary } catch {}
        }

        // Match odds to fixture (fuzzy name match)
        const norm = s => s.toLowerCase().replace(/\s+fc$|\s+afc$/,'').replace(/\s+/g,' ').trim()
        const oddsEvent = oddsEvents.find(e => {
          const oh = norm(e.homeTeam), oa = norm(e.awayTeam)
          const fh = norm(fix.homeTeam.name), fa = norm(fix.awayTeam.name)
          return (oh.includes(fh)||fh.includes(oh)) && (oa.includes(fa)||fa.includes(oa))
        }) || null

        const homeStats = teamStats[fix.homeTeam.id] || { matchesPlayed: 4, goalsForAvg: 1.3, goalsAgainstAvg: 1.1, source: 'ESTIMATE' }
        const awayStats = teamStats[fix.awayTeam.id] || { matchesPlayed: 4, goalsForAvg: 1.1, goalsAgainstAvg: 1.3, source: 'ESTIMATE' }

        const results = runFLE({ fixture: fix, homeStats, awayStats, h2hSummary: h2h, oddsEvent, markets: selectedMarkets, tier })

        for (const r of results) {
          all.push({
            id: `${fix.id}-${r.mId}`,
            home: fix.homeTeam.name, away: fix.awayTeam.name,
            homeCrest: fix.homeTeam.crest, awayCrest: fix.awayTeam.crest,
            date: fix.utcDate, matchday: fix.matchday,
            league: comp.name, leagueFlag: comp.flag || '',
            market: MARKETS.find(m => m.id === r.mId)?.label || r.mId,
            marketId: r.mId,
            ...r,
          })
        }
      }
    }

    all.sort((a,b) => (STRENGTH[a.strength]?.rank||9) - (STRENGTH[b.strength]?.rank||9))
    setPicks(all); setProgress(100); setLoading(false); setGenerated(true)
  }

  const filtered = picks.filter(p => safeOnly ? ['BANKER','STRONG','SAFE'].includes(p.strength) : true)
  const grouped  = filtered.reduce((a,p) => { (a[p.league] = a[p.league]||[]).push(p); return a }, {})
  const canGen   = selectedComps.length > 0 && selectedMarkets.length > 0

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px', fontFamily: 'var(--font-ui)' }}>

      {/* Page header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-vivid)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 10 }}>AI Prediction Engine</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,4vw,48px)', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: 12 }}>Free Tips</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Select competitions and markets, then generate data-backed predictions.</p>

        {/* API status row */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <StatusPill label="football-data.org" live={apiLive} />
          <StatusPill label="The Odds API" live={oddsLive} />
          {quota && <StatusPill label={`${quota} odds calls remaining`} live={true} />}
          {compsMock && <StatusPill label="Mock data — add API keys to Vercel" live={false} />}
        </div>
      </div>

      {/* Config row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, marginBottom: 32, alignItems: 'start' }}>
        <div>
          {/* Competitions */}
          <ConfigSection label={`Competitions (${selectedComps.length}/${tier.maxLeagues === 999 ? '∞' : tier.maxLeagues})`}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 8 }}>
              {comps.map(c => {
                const sel = selectedComps.includes(c.id)
                const atMax = !sel && selectedComps.length >= tier.maxLeagues
                const hasOdds = !!COMP_TO_ODDS[c.id]
                return (
                  <div key={c.id} onClick={() => !atMax && toggle(selectedComps, setSelectedComps, c.id, tier.maxLeagues)}
                    style={{ padding: '10px 14px', border: `1px solid ${sel ? 'var(--green-vivid)' : 'var(--border)'}`, borderRadius: 8, cursor: atMax ? 'not-allowed' : 'pointer', background: sel ? '#00FF6A08' : 'var(--surface)', opacity: atMax ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s' }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${sel ? 'var(--green-vivid)' : 'var(--border-bright)'}`, background: sel ? 'var(--green-vivid)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#000', flexShrink: 0 }}>{sel && '✓'}</div>
                    {c.emblem ? <img src={c.emblem} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} onError={e=>e.target.style.display='none'} /> : <span style={{ fontSize: 14 }}>{c.flag||'⚽'}</span>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: sel ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                    </div>
                    {hasOdds && <div style={{ fontSize: 9, color: 'var(--gold)', border: '1px solid #F0C04030', padding: '1px 4px', borderRadius: 3, flexShrink: 0 }}>ODDS</div>}
                  </div>
                )
              })}
            </div>
            {tier.id === 'FREE' && selectedComps.length >= tier.maxLeagues && (
              <div style={{ marginTop: 10, padding: '8px 14px', background: '#00FF6A08', border: '1px solid #00FF6A20', borderRadius: 6, fontSize: 12, color: 'var(--green-vivid)' }}>
                Free plan: {tier.maxLeagues} leagues max. Upgrade to Pro for 10.
              </div>
            )}
          </ConfigSection>

          {/* Markets */}
          <ConfigSection label="Markets" style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {MARKETS.map(m => {
                const locked = !tier.markets.includes(m.id) && !m.soon
                const sel    = selectedMarkets.includes(m.id)
                return (
                  <div key={m.id} onClick={() => !m.soon && !locked && toggle(selectedMarkets, setSelectedMarkets, m.id, 10)}
                    style={{ padding: '8px 16px', border: `1px solid ${sel ? '#40B4FF' : locked ? 'var(--border)' : 'var(--border)'}`, borderRadius: 20, cursor: locked || m.soon ? 'not-allowed' : 'pointer', background: sel ? '#40B4FF10' : 'var(--surface)', color: sel ? '#40B4FF' : locked ? 'var(--text-muted)' : m.soon ? 'var(--text-muted)' : 'var(--text-secondary)', fontSize: 13, fontWeight: sel ? 600 : 400, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {m.label}
                    {locked && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>🔒</span>}
                    {m.soon && <span style={{ fontSize: 10 }}>soon</span>}
                  </div>
                )
              })}
            </div>
          </ConfigSection>
        </div>

        {/* Generate button */}
        <div style={{ paddingTop: 28 }}>
          <button onClick={generate} disabled={!canGen || loading}
            style={{ padding: '14px 28px', background: canGen && !loading ? 'var(--green-vivid)' : 'var(--surface-3)', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, color: canGen && !loading ? '#000' : 'var(--text-muted)', cursor: canGen && !loading ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-ui)', whiteSpace: 'nowrap', boxShadow: canGen && !loading ? '0 0 24px #00FF6A20' : 'none', transition: 'all 0.2s' }}>
            {loading ? '⏳ Generating…' : '⚡ Generate Picks'}
          </button>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
            {tier.showH2H ? '+ H2H analysis' : 'H2H: Pro+'}<br/>
            {tier.showOdds ? '+ Odds validation' : 'Odds: Pro+'}
          </div>
        </div>
      </div>

      {/* Loading bar */}
      {loading && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--green-vivid)', fontFamily: 'var(--font-mono)' }}>{msg}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{progress}%</span>
          </div>
          <div style={{ height: 3, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--green-vivid), #40B4FF)', transition: 'width 0.4s', borderRadius: 2 }} />
          </div>
        </div>
      )}

      {/* Results */}
      {generated && !loading && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{filtered.length}</span> picks across <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{Object.keys(grouped).length}</span> leagues
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Safe+ only</span>
              <div onClick={() => setSafeOnly(!safeOnly)} style={{ width: 40, height: 22, borderRadius: 11, background: safeOnly ? 'var(--green-vivid)' : 'var(--surface-3)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 3, left: safeOnly ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px #0004' }} />
              </div>
            </div>
          </div>

          {compsMock && (
            <div style={{ marginBottom: 20, padding: '12px 16px', background: '#F0C04008', border: '1px solid #F0C04025', borderRadius: 8, fontSize: 13, color: 'var(--gold)' }}>
              ⚠️ Using mock data. Add <code style={{ background: 'var(--surface-3)', padding: '1px 6px', borderRadius: 3 }}>FOOTBALL_DATA_KEY</code> and <code style={{ background: 'var(--surface-3)', padding: '1px 6px', borderRadius: 3 }}>ODDS_API_KEY</code> to Vercel for real predictions.
            </div>
          )}

          {filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 12 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ color: 'var(--text-muted)' }}>No picks match this filter.</div>
              {safeOnly && <button onClick={() => setSafeOnly(false)} style={{ marginTop: 14, background: 'var(--surface-3)', border: 'none', color: 'var(--text-secondary)', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13 }}>Show all picks</button>}
            </div>
          ) : (
            Object.entries(grouped).map(([league, lp]) => <LeagueBlock key={league} league={league} picks={lp} tier={tier} />)
          )}
        </>
      )}
    </div>
  )
}

function ConfigSection({ label, children, style }) {
  return (
    <div style={style}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 }}>{label}</div>
      {children}
    </div>
  )
}

function StatusPill({ label, live }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, border: `1px solid ${live ? '#00FF6A30' : '#F0C04030'}`, fontSize: 11, color: live ? 'var(--green-vivid)' : 'var(--gold)', fontWeight: 600 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: live ? 'var(--green-vivid)' : 'var(--gold)', animation: live ? 'pulse-glow 2s infinite' : 'none' }} />
      {label}
    </div>
  )
}

function LeagueBlock({ league, picks, tier }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ marginBottom: 24 }}>
      <div onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{league}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{picks.length} picks</span>
        <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 12 }}>{open ? '▲' : '▼'}</div>
      </div>
      {open && <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{picks.map(p => <PickCard key={p.id} pick={p} tier={tier} />)}</div>}
    </div>
  )
}

function PickCard({ pick, tier }) {
  const [exp, setExp] = useState(false)
  const cfg = STRENGTH[pick.strength] || STRENGTH.TRAP
  const dateStr = pick.date ? new Date(pick.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''

  return (
    <div style={{ border: `1px solid ${cfg.glow}`, borderLeft: `3px solid ${cfg.color}`, borderRadius: 10, background: cfg.bg, overflow: 'hidden', transition: 'all 0.15s' }}>
      {/* Signal bar at top */}
      {pick.strength === 'BANKER' && (
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`, animation: 'pulse-glow 2s infinite' }} />
      )}

      <div onClick={() => setExp(!exp)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {dateStr && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>{dateStr}{pick.matchday ? ` · MD${pick.matchday}` : ''}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {pick.homeCrest && <img src={pick.homeCrest} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} onError={e=>e.target.style.display='none'} />}
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{pick.home}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>vs</span>
            {pick.awayCrest && <img src={pick.awayCrest} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} onError={e=>e.target.style.display='none'} />}
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{pick.away}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <Tag label={pick.market} color="#40B4FF" />
            {pick.sources?.map(s => <Tag key={s} label={s === 'FOOTBALL_DATA_ORG' ? 'FD.org' : s === 'ODDS_API' ? 'Odds' : s} color={s === 'FOOTBALL_DATA_ORG' ? 'var(--green-mid)' : s === 'ODDS_API' ? 'var(--gold)' : 'var(--text-muted)'} />)}
            {pick.noBet && <Tag label="NO BET" color="var(--red)" />}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <div style={{ padding: '5px 12px', background: cfg.bg, border: `1px solid ${cfg.glow}`, borderRadius: 20, fontSize: 11, fontWeight: 700, color: cfg.color, boxShadow: pick.strength === 'BANKER' ? `0 0 12px ${cfg.glow}` : 'none' }}>
            {cfg.icon} {cfg.label}
          </div>
          {tier.showConfidence && pick.confidence > 0 && (
            <div style={{ fontSize: 24, fontWeight: 800, color: cfg.color, fontFamily: 'var(--font-mono)', letterSpacing: '-1px', lineHeight: 1 }}>{pick.confidence}<span style={{ fontSize: 13 }}>%</span></div>
          )}
          {!tier.showConfidence && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>🔒 Pro</div>}
          {pick.oddsDisplay && tier.showOdds && (
            <div style={{ fontSize: 11, background: 'var(--surface-3)', border: '1px solid #F0C04020', padding: '3px 8px', borderRadius: 5, color: 'var(--gold)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
              <div style={{ fontWeight: 700 }}>{pick.oddsDisplay.medianOdds?.toFixed(2)}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{pick.oddsDisplay.bookmakerCount} books</div>
            </div>
          )}
        </div>
      </div>

      {exp && (
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${cfg.glow}20`, background: 'var(--surface)' }}>
          {tier.showExplanation ? (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, borderLeft: `2px solid ${cfg.color}`, paddingLeft: 12 }}>
              {pick.conflict && <div style={{ color: '#FF8C00', fontWeight: 600, marginBottom: 6 }}>⚡ Conflict: {pick.conflict.replace(/_/g,' ')} — treat as NO BET</div>}
              {pick.explanation}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', borderLeft: '2px solid var(--border)', paddingLeft: 12 }}>🔒 Full analysis available on Pro plan.</div>
          )}
        </div>
      )}
      {!exp && <div style={{ padding: '4px 16px 10px', fontSize: 11, color: 'var(--text-muted)' }}>Click for explanation ↓</div>}
    </div>
  )
}

function Tag({ label, color }) {
  return <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, border: `1px solid ${color}40`, color, background: `${color}10` }}>{label}</span>
}
