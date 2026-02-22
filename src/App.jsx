import { useState, useEffect } from "react"
import { footballData, oddsApi } from "./apiClient.js"
import { runFLE } from "./engines/fle.js"
import { TIERS, simulateUserTier, setDemoTier } from "./tiers.js"
import { PROVIDERS, getInactiveProviders } from "./providers.js"
import { getOddsKey, matchOddsToFixture } from "./oddsKeyMap.js"

// ── Static config ─────────────────────────────────────────────
const MARKETS_DEF = [
  { id: "o15",  label: "Over 1.5",      group: "Goals" },
  { id: "o25",  label: "Over 2.5",      group: "Goals" },
  { id: "o35",  label: "Over 3.5",      group: "Goals" },
  { id: "btts", label: "BTTS",          group: "Goals" },
  { id: "cs",   label: "Correct Score", group: "Specials", variance: true, soon: true },
]

const S = {
  BANKER:   { color: "#00E676", bg: "#00E67610", border: "#00E67635", rank: 1, icon: "🏆" },
  STRONG:   { color: "#69F0AE", bg: "#69F0AE10", border: "#69F0AE35", rank: 2, icon: "💪" },
  SAFE:     { color: "#40C4FF", bg: "#40C4FF10", border: "#40C4FF35", rank: 3, icon: "🛡" },
  MODERATE: { color: "#FFD740", bg: "#FFD74010", border: "#FFD74035", rank: 4, icon: "⚖️" },
  RISKY:    { color: "#FF6D00", bg: "#FF6D0010", border: "#FF6D0035", rank: 5, icon: "⚠️" },
  TRAP:     { color: "#FF1744", bg: "#FF174410", border: "#FF174435", rank: 6, icon: "🚫" },
}

export default function App() {
  const tier = simulateUserTier()

  const [competitions, setCompetitions]       = useState([])
  const [compLoading, setCompLoading]         = useState(false)
  const [selectedComps, setSelectedComps]     = useState([])
  const [selectedMarkets, setSelectedMarkets] = useState([])
  const [picks, setPicks]                     = useState([])
  const [loading, setLoading]                 = useState(false)
  const [loadingMsg, setLoadingMsg]           = useState("")
  const [progress, setProgress]               = useState(0)
  const [safeOnly, setSafeOnly]               = useState(false)
  const [apiStatus, setApiStatus]             = useState({ football: "unknown", odds: "unknown" })
  const [quotaInfo, setQuotaInfo]             = useState(null)
  const [showTierSwitcher, setShowTierSwitcher] = useState(false)
  const [showApiGuide, setShowApiGuide]       = useState(false)
  const [step, setStep]                       = useState(1)

  // Load competitions on mount
  useEffect(() => {
    setCompLoading(true)
    footballData.competitions()
      .then(res => {
        setCompetitions(res.competitions || [])
        setApiStatus(prev => ({ ...prev, football: res.mock ? "mock" : "live" }))
      })
      .catch(() => setApiStatus(prev => ({ ...prev, football: "error" })))
      .finally(() => setCompLoading(false))
  }, [])

  const toggleComp = (id) => {
    if (selectedComps.includes(id)) {
      setSelectedComps(prev => prev.filter(x => x !== id))
    } else {
      if (selectedComps.length >= tier.maxLeagues) return
      setSelectedComps(prev => [...prev, id])
    }
  }

  const toggleMarket = (id) => {
    if (!tier.markets.includes(id)) return
    setSelectedMarkets(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const generate = async () => {
    if (!selectedComps.length || !selectedMarkets.length) return
    setLoading(true)
    setPicks([])
    setProgress(0)
    setStep(3)

    const allPicks   = []
    const total      = selectedComps.length
    let done         = 0

    for (const compId of selectedComps) {
      const comp = competitions.find(c => c.id === compId)
      const compName = comp?.name ?? compId

      // ── 1. Fixtures ──────────────────────────────────────
      setLoadingMsg(`Fetching fixtures: ${compName}...`)
      setProgress(Math.round((done / total) * 30))

      let fixtures = []
      try {
        const res = await footballData.fixtures({ competition: compId, limit: tier.maxFixturesPerLeague })
        fixtures = (res.fixtures || []).slice(0, tier.maxFixturesPerLeague)
      } catch (e) {
        console.error(`[fixtures] ${compId}:`, e.message)
        done++; continue
      }

      // ── 2. Standings → team stats ────────────────────────
      setLoadingMsg(`Loading season stats: ${compName}...`)
      setProgress(Math.round((done / total) * 30) + 10)

      let teamStats = {}
      try {
        const res = await footballData.standings({ competition: compId })
        teamStats = res.teamStats || {}
      } catch (e) {
        console.error(`[standings] ${compId}:`, e.message)
      }

      // ── 3. Odds (one call per competition) ───────────────
      setLoadingMsg(`Fetching odds: ${compName}...`)
      setProgress(Math.round((done / total) * 30) + 15)

      let oddsEvents = []
      const oddsKey = getOddsKey(compId)
      if (oddsKey) {
        try {
          const needsBTTS   = selectedMarkets.includes('btts')
          const needsTotals = selectedMarkets.some(m => ['o15','o25','o35'].includes(m))
          const mkts = [needsTotals && 'totals', needsBTTS && 'btts'].filter(Boolean).join(',')

          const res = await oddsApi.odds({ sport: oddsKey, markets: mkts })
          oddsEvents = res.odds || []

          if (res.quota?.remaining !== null) {
            setQuotaInfo({ remaining: res.quota.remaining, used: res.quota.used })
          }
          setApiStatus(prev => ({ ...prev, odds: res.mock ? "mock" : "live" }))
        } catch (e) {
          console.error(`[odds] ${compId}:`, e.message)
          setApiStatus(prev => ({ ...prev, odds: "error" }))
        }
      }

      // ── 4. Per-fixture analysis ──────────────────────────
      for (const fixture of fixtures) {
        setLoadingMsg(`Analysing: ${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`)
        setProgress(
          Math.round((done / total) * 30) + 20 +
          Math.round((fixtures.indexOf(fixture) / fixtures.length) * 20)
        )

        // H2H (Pro+ only)
        let h2hSummary = null
        if (tier.showH2H && apiStatus.football === "live") {
          try {
            const res = await footballData.h2h({ matchId: fixture.id })
            h2hSummary = res.summary
          } catch (_) {}
        }

        // Match odds event to this fixture
        const matchedOdds = oddsEvents.find(e => matchOddsToFixture(e, fixture)) ?? null

        const homeStats = teamStats[fixture.homeTeam.id] || makeGuessStats(fixture.homeTeam.name)
        const awayStats = teamStats[fixture.awayTeam.id] || makeGuessStats(fixture.awayTeam.name)

        // ── 5. Run FLE engine ────────────────────────────
        const flePicks = runFLE({
          fixture,
          homeTeamStats: homeStats,
          awayTeamStats: awayStats,
          h2hSummary,
          oddsData: matchedOdds,
          markets: selectedMarkets,
          tier,
        })

        for (const pick of flePicks) {
          allPicks.push({
            id: `${fixture.id}-${pick.marketId}`,
            home:       fixture.homeTeam.name,
            away:       fixture.awayTeam.name,
            homeCrest:  fixture.homeTeam.crest,
            awayCrest:  fixture.awayTeam.crest,
            league:     compName,
            country:    comp?.country ?? "",
            date:       fixture.utcDate,
            matchday:   fixture.matchday,
            marketId:   pick.marketId,
            market:     MARKETS_DEF.find(m => m.id === pick.marketId)?.label ?? pick.marketId,
            strength:   pick.strength,
            confidence: pick.confidence,
            modelProb:  pick.modelProb,
            oddsImpliedProb: pick.oddsImpliedProb,
            oddsDisplay:     pick.oddsDisplay,
            explanation:     pick.explanation,
            conflictReason:  pick.conflictReason,
            noBet:      pick.noBet,
            sources:    pick.sources,
            tier,
          })
        }
      }

      done++
    }

    setProgress(100)
    allPicks.sort((a, b) => (S[a.strength]?.rank ?? 9) - (S[b.strength]?.rank ?? 9))
    setPicks(allPicks)
    setLoading(false)
  }

  const filtered = picks.filter(p => {
    if (safeOnly && p.noBet) return false
    if (safeOnly) return ["BANKER","STRONG","SAFE"].includes(p.strength)
    return true
  })

  const grouped = filtered.reduce((acc, p) => {
    (acc[p.league] = acc[p.league] || []).push(p); return acc
  }, {})

  const footballLive = apiStatus.football === "live"
  const oddsLive     = apiStatus.odds === "live"

  return (
    <div style={{ minHeight: "100vh", background: "#080B12", color: "#E8EAF0", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: `linear-gradient(rgba(0,230,118,0.03) 1px, transparent 1px),linear-gradient(90deg, rgba(0,230,118,0.03) 1px, transparent 1px)`, backgroundSize: "48px 48px" }} />
      <div style={{ position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "800px", height: "400px", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,230,118,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", padding: "0 20px 80px" }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 0 24px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "linear-gradient(135deg, #00E676, #00BCD4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", boxShadow: "0 0 20px rgba(0,230,118,0.3)" }}>⚡</div>
            <div>
              <div style={{ fontSize: "17px", fontWeight: 700, color: "#fff" }}>PredictEdge</div>
              <div style={{ fontSize: "11px", color: "#4CAF50", letterSpacing: "1.5px", textTransform: "uppercase" }}>Analytics v3 · Dual API</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <StatusChip label="football-data.org" live={footballLive} onClick={() => setShowApiGuide(!showApiGuide)} />
            <StatusChip label="The Odds API" live={oddsLive} />
            {quotaInfo && (
              <div style={{ fontSize: "11px", color: "#546E7A", padding: "4px 10px", border: "1px solid #1C2A38", borderRadius: "20px" }}>
                Odds quota: {quotaInfo.remaining} remaining
              </div>
            )}
            <div onClick={() => setShowTierSwitcher(!showTierSwitcher)} style={{ padding: "5px 12px", borderRadius: "20px", border: `1px solid ${tier.color}40`, fontSize: "12px", color: tier.color, cursor: "pointer", fontWeight: 600 }}>
              {tier.badge} {tier.label}
            </div>
          </div>
        </header>

        {/* ── API Guide ───────────────────────────────────────── */}
        {showApiGuide && (
          <div style={{ background: "#0D1520", border: "1px solid #FFD74030", borderRadius: "12px", padding: "20px 24px", marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#FFD740" }}>🔑 Add API Keys to Vercel</div>
              <button onClick={() => setShowApiGuide(false)} style={{ background: "none", border: "none", color: "#546E7A", cursor: "pointer", fontSize: "18px" }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <KeyCard name="football-data.org" envKey="FOOTBALL_DATA_KEY" url="https://www.football-data.org/client/register" live={footballLive} note="Free key — instant email registration" />
              <KeyCard name="The Odds API" envKey="ODDS_API_KEY" url="https://the-odds-api.com" live={oddsLive} note="500 free requests/month · cached 30 min" />
            </div>
            <div style={{ marginTop: "14px", fontSize: "12px", color: "#37474F" }}>
              Vercel → Your Project → Settings → Environment Variables → Add new
            </div>
          </div>
        )}

        {/* ── Tier Switcher ───────────────────────────────────── */}
        {showTierSwitcher && (
          <div style={{ background: "#0D1520", border: "1px solid #1C2A38", borderRadius: "12px", padding: "20px 24px", marginBottom: "28px" }}>
            <div style={{ fontSize: "12px", color: "#546E7A", marginBottom: "14px" }}>Demo: switch user tier to test the experience. Replace with real auth when ready.</div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {Object.values(TIERS).map(t => (
                <button key={t.id} onClick={() => setDemoTier(t.id)} style={{ padding: "10px 20px", borderRadius: "8px", border: `1px solid ${t.color}50`, background: tier.id === t.id ? `${t.color}15` : "transparent", color: tier.id === t.id ? t.color : "#607D8B", cursor: "pointer", fontSize: "13px", fontWeight: tier.id === t.id ? 700 : 400 }}>
                  {t.badge} {t.label}
                  <div style={{ fontSize: "10px", opacity: 0.7, marginTop: "2px" }}>
                    {t.id === "FREE" ? "2 leagues · basic markets" : t.id === "PRO" ? "10 leagues · all markets + H2H" : "Unlimited · everything"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <StepBar step={step} />

        {/* ── Sport selector ──────────────────────────────────── */}
        <Section title="Sport" subtitle="Football active — Basketball & Table Tennis coming soon">
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {[
              { id: "football", label: "Football", icon: "⚽", color: "#00E676", active: true },
              { id: "basketball", label: "Basketball", icon: "🏀", color: "#FF6D00", active: false },
              { id: "tt", label: "Table Tennis", icon: "🏓", color: "#7C4DFF", active: false },
            ].map(s => (
              <div key={s.id} style={{ padding: "24px 28px", border: `1px solid ${s.active ? s.color : "#1C2A38"}`, borderRadius: "14px", cursor: s.active ? "default" : "not-allowed", background: s.active ? `${s.color}10` : "#0D1520", opacity: s.active ? 1 : 0.45, minWidth: "160px", position: "relative", boxShadow: s.active ? `0 0 24px ${s.color}20` : "none" }}>
                {!s.active && <div style={{ position: "absolute", top: "10px", right: "10px", fontSize: "10px", color: "#546E7A", background: "#1C2A38", padding: "2px 8px", borderRadius: "20px" }}>SOON</div>}
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>{s.icon}</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: s.active ? s.color : "#607D8B" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Competitions ────────────────────────────────────── */}
        <Section title="Select Competitions" subtitle={
          compLoading ? "Loading from football-data.org..." :
          `${competitions.length} competitions · max ${tier.maxLeagues === 999 ? "unlimited" : tier.maxLeagues} for ${tier.label}`
        }>
          {compLoading ? (
            <div style={{ color: "#546E7A", fontSize: "13px" }}>⏳ Fetching competitions...</div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "10px" }}>
                {competitions.map(c => {
                  const sel = selectedComps.includes(c.id)
                  const atMax = !sel && selectedComps.length >= tier.maxLeagues
                  return (
                    <div key={c.id} onClick={() => !atMax && toggleComp(c.id)} style={{ padding: "14px 16px", border: `1px solid ${sel ? "#00E676" : "#1C2A38"}`, borderRadius: "10px", cursor: atMax ? "not-allowed" : "pointer", background: sel ? "#00E67608" : "#0D1520", opacity: atMax ? 0.4 : 1, display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "18px", height: "18px", borderRadius: "4px", border: `2px solid ${sel ? "#00E676" : "#2C3E50"}`, background: sel ? "#00E676" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", flexShrink: 0 }}>{sel && "✓"}</div>
                      {c.emblem && <img src={c.emblem} alt="" style={{ width: "20px", height: "20px", objectFit: "contain" }} onError={e => e.target.style.display = "none"} />}
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: sel ? "#fff" : "#B0BEC5" }}>{c.name}</div>
                        <div style={{ fontSize: "11px", color: "#546E7A" }}>{c.country}</div>
                      </div>
                      {getOddsKey(c.id) && (
                        <div style={{ marginLeft: "auto", fontSize: "10px", color: "#FFD740", border: "1px solid #FFD74030", padding: "2px 6px", borderRadius: "4px", flexShrink: 0 }}>ODDS</div>
                      )}
                    </div>
                  )
                })}
              </div>
              {tier.id === "FREE" && selectedComps.length >= tier.maxLeagues && (
                <div onClick={() => setShowTierSwitcher(true)} style={{ marginTop: "12px", padding: "10px 16px", background: "#00E67608", border: "1px solid #00E67630", borderRadius: "8px", fontSize: "13px", color: "#00E676", cursor: "pointer" }}>
                  ⚡ Free plan: {tier.maxLeagues} league max. Upgrade to Pro for 10. →
                </div>
              )}
            </>
          )}
        </Section>

        {/* ── Markets ─────────────────────────────────────────── */}
        <Section title="Select Markets">
          {Object.entries(
            MARKETS_DEF.reduce((acc, m) => { (acc[m.group] = acc[m.group] || []).push(m); return acc }, {})
          ).map(([group, items]) => (
            <div key={group} style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", color: "#607D8B", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: "8px" }}>{group}</div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {items.map(m => {
                  const locked   = !tier.markets.includes(m.id) && !m.soon
                  const selected = selectedMarkets.includes(m.id)
                  return (
                    <div key={m.id} onClick={() => !m.soon && !locked && toggleMarket(m.id)} style={{ padding: "8px 16px", border: `1px solid ${selected ? "#40C4FF" : locked ? "#FF174430" : "#1C2A38"}`, borderRadius: "20px", cursor: locked || m.soon ? "not-allowed" : "pointer", background: selected ? "#40C4FF12" : locked ? "#FF174408" : "#0D1520", color: selected ? "#40C4FF" : locked ? "#FF5252" : m.soon ? "#37474F" : "#90A4AE", fontSize: "13px", fontWeight: selected ? 600 : 400, display: "flex", alignItems: "center", gap: "6px" }}>
                      {m.label}
                      {locked && <span style={{ fontSize: "10px" }}>🔒 PRO</span>}
                      {m.soon && <span style={{ fontSize: "10px", color: "#546E7A" }}>SOON</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </Section>

        {/* ── Generate ────────────────────────────────────────── */}
        <button onClick={generate} disabled={!selectedComps.length || !selectedMarkets.length}
          style={{ width: "100%", padding: "16px", background: (!selectedComps.length || !selectedMarkets.length) ? "#1C2A38" : "linear-gradient(135deg, #00C853, #00BCD4)", border: "none", borderRadius: "12px", color: (!selectedComps.length || !selectedMarkets.length) ? "#37474F" : "#080B12", fontSize: "15px", fontWeight: 700, cursor: (!selectedComps.length || !selectedMarkets.length) ? "not-allowed" : "pointer", boxShadow: (!selectedComps.length || !selectedMarkets.length) ? "none" : "0 0 20px rgba(0,230,118,0.2)", marginBottom: "8px" }}>
          {(!selectedComps.length || !selectedMarkets.length) ? "Select competitions & markets to continue" : "⚡ Generate Picks"}
        </button>
        <div style={{ fontSize: "11px", color: "#37474F", textAlign: "center" }}>
          Pulls from football-data.org + The Odds API · H2H {tier.showH2H ? "✓" : "Pro+"}
        </div>

        {/* ── Results ─────────────────────────────────────────── */}
        {step >= 3 && (
          <Section title="Generated Picks" subtitle={loading ? loadingMsg : `${filtered.length} picks · ${Object.keys(grouped).length} leagues`} style={{ marginTop: "36px" }}>
            {loading ? (
              <LoadingState progress={progress} msg={loadingMsg} />
            ) : (
              <>
                {/* Source banner */}
                <SourceBanner footballLive={footballLive} oddsLive={oddsLive} onSetupClick={() => setShowApiGuide(true)} />

                <ControlBar safeOnly={safeOnly} setSafeOnly={setSafeOnly} total={picks.length} filtered={filtered.length} />

                {filtered.length === 0 ? (
                  <div style={{ padding: "48px", textAlign: "center", border: "1px dashed #1C2A38", borderRadius: "12px" }}>
                    <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
                    <div style={{ fontSize: "14px", color: "#607D8B" }}>No picks match the current filter.</div>
                    {safeOnly && <button onClick={() => setSafeOnly(false)} style={{ marginTop: "14px", background: "#1C2A38", border: "none", color: "#90A4AE", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>Show all picks</button>}
                  </div>
                ) : (
                  Object.entries(grouped).map(([league, lPicks]) => (
                    <LeagueGroup key={league} league={league} picks={lPicks} />
                  ))
                )}

                <div style={{ marginTop: "32px", textAlign: "center" }}>
                  <button onClick={() => { setStep(1); setPicks([]); setSelectedComps([]); setSelectedMarkets([]) }} style={{ background: "transparent", border: "1px solid #1C2A38", color: "#607D8B", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>← New Analysis</button>
                </div>
              </>
            )}
          </Section>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function StepBar({ step }) {
  const steps = ["Sport", "Configure", "Results"]
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "36px" }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: step > i ? "#00E676" : "transparent", border: `2px solid ${step > i ? "#00E676" : step === i + 1 ? "#00E676" : "#1C2A38"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: step > i ? "#080B12" : step === i + 1 ? "#00E676" : "#37474F" }}>
            {step > i + 1 ? "✓" : i + 1}
          </div>
          <span style={{ fontSize: "12px", color: step === i + 1 ? "#E8EAF0" : "#37474F", fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
          {i < steps.length - 1 && <div style={{ width: "32px", height: "1px", background: step > i + 1 ? "#00E676" : "#1C2A38" }} />}
        </div>
      ))}
    </div>
  )
}

function Section({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: "36px", marginTop: "16px" }}>
      <div style={{ marginBottom: "18px" }}>
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#fff" }}>{title}</h2>
        {subtitle && <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#546E7A" }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function StatusChip({ label, live, onClick }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "20px", border: `1px solid ${live ? "#00E67640" : "#FFD74040"}`, fontSize: "11px", color: live ? "#00E676" : "#FFD740", cursor: onClick ? "pointer" : "default" }}>
      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: live ? "#00E676" : "#FFD740", boxShadow: `0 0 6px ${live ? "#00E676" : "#FFD740"}` }} />
      {label} {live ? "Live" : "Key needed"}
    </div>
  )
}

function KeyCard({ name, envKey, url, live, note }) {
  return (
    <div style={{ background: "#080B12", border: `1px solid ${live ? "#00E67630" : "#1C2A38"}`, borderRadius: "10px", padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#E8EAF0" }}>{name}</span>
        <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: live ? "#00E67615" : "#FFD74015", color: live ? "#00E676" : "#FFD740" }}>{live ? "✅ Live" : "⚠️ Key missing"}</span>
      </div>
      <code style={{ display: "block", fontSize: "11px", color: "#40C4FF", background: "#0D1520", padding: "6px 10px", borderRadius: "6px", marginBottom: "8px" }}>
        {envKey}
      </code>
      <div style={{ fontSize: "11px", color: "#546E7A", marginBottom: "8px" }}>{note}</div>
      {!live && <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#00E676", textDecoration: "none" }}>Register free →</a>}
    </div>
  )
}

function SourceBanner({ footballLive, oddsLive, onSetupClick }) {
  if (footballLive && oddsLive) return null
  const missing = [!footballLive && "football-data.org", !oddsLive && "The Odds API"].filter(Boolean)
  return (
    <div style={{ background: "#FFD74008", border: "1px solid #FFD74025", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
      <span style={{ color: "#FFD740" }}>⚠️ Using mock data for: <b>{missing.join(", ")}</b> — predictions are illustrative only.</span>
      <span onClick={onSetupClick} style={{ color: "#40C4FF", cursor: "pointer", textDecoration: "underline", flexShrink: 0 }}>Setup API keys →</span>
    </div>
  )
}

function LoadingState({ progress, msg }) {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <div style={{ fontSize: "11px", color: "#00E676", letterSpacing: "2px", marginBottom: "24px", textTransform: "uppercase" }}>{msg || "Processing..."}</div>
      <div style={{ background: "#0D1520", borderRadius: "4px", height: "4px", overflow: "hidden", maxWidth: "320px", margin: "0 auto 12px" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #00E676, #00BCD4)", transition: "width 0.3s", borderRadius: "4px" }} />
      </div>
      <div style={{ fontSize: "13px", color: "#37474F" }}>{progress}%</div>
    </div>
  )
}

function ControlBar({ safeOnly, setSafeOnly, total, filtered }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#0D1520", borderRadius: "10px", border: "1px solid #1C2A38", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
      <div onClick={() => setSafeOnly(!safeOnly)} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
        <div style={{ width: "36px", height: "20px", borderRadius: "10px", background: safeOnly ? "#00E676" : "#1C2A38", position: "relative", transition: "background 0.2s" }}>
          <div style={{ position: "absolute", top: "2px", left: safeOnly ? "18px" : "2px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
        </div>
        <span style={{ fontSize: "13px", color: safeOnly ? "#E8EAF0" : "#607D8B", fontWeight: safeOnly ? 600 : 400 }}>Safe+ Only</span>
      </div>
      <div style={{ fontSize: "12px", color: "#546E7A" }}>
        Showing <b style={{ color: "#E8EAF0" }}>{filtered}</b> of <b style={{ color: "#E8EAF0" }}>{total}</b> picks
      </div>
    </div>
  )
}

function LeagueGroup({ league, picks }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ marginBottom: "20px" }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "#0D1520", borderRadius: "8px", cursor: "pointer", border: "1px solid #1C2A38", marginBottom: "10px" }}>
        <span style={{ fontSize: "13px", fontWeight: 700 }}>{league}</span>
        <span style={{ fontSize: "12px", color: "#546E7A" }}>{picks.length} picks</span>
        <div style={{ marginLeft: "auto", color: "#546E7A", fontSize: "12px" }}>{open ? "▲" : "▼"}</div>
      </div>
      {open && <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>{picks.map(p => <PickCard key={p.id} pick={p} />)}</div>}
    </div>
  )
}

function PickCard({ pick }) {
  const cfg  = S[pick.strength] || S.TRAP
  const tier = pick.tier
  const [expanded, setExpanded] = useState(false)
  const dateStr = pick.date ? new Date(pick.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""

  return (
    <div onClick={() => setExpanded(!expanded)} style={{ border: `1px solid ${cfg.border}`, borderLeft: `3px solid ${cfg.color}`, borderRadius: "10px", background: cfg.bg, padding: "16px", cursor: "pointer" }}>

      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {dateStr && <div style={{ fontSize: "11px", color: "#546E7A", marginBottom: "5px" }}>{dateStr}{pick.matchday ? ` · MD${pick.matchday}` : ""}</div>}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {pick.homeCrest && <img src={pick.homeCrest} alt="" style={{ width: "18px", height: "18px", objectFit: "contain" }} onError={e => e.target.style.display = "none"} />}
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>{pick.home}</span>
            <span style={{ color: "#37474F" }}>vs</span>
            {pick.awayCrest && <img src={pick.awayCrest} alt="" style={{ width: "18px", height: "18px", objectFit: "contain" }} onError={e => e.target.style.display = "none"} />}
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>{pick.away}</span>
          </div>

          {/* Market + source tags */}
          <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
            <Tag label={pick.market} color="#40C4FF" />
            {(pick.sources || []).map(s => (
              <Tag key={s} label={s === "FOOTBALL_DATA_ORG" ? "FD.org" : s === "ODDS_API" ? "Odds API" : s} color={s === "FOOTBALL_DATA_ORG" ? "#00E676" : s === "ODDS_API" ? "#FFD740" : "#546E7A"} />
            ))}
            {pick.noBet && <Tag label="NO BET" color="#FF1744" />}
          </div>
        </div>

        {/* Right column: strength + confidence + odds */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
          <div style={{ padding: "6px 14px", background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: "20px", fontSize: "12px", fontWeight: 700, color: cfg.color }}>
            {cfg.icon} {pick.strength}
          </div>

          {tier.showConfidence ? (
            <div style={{ textAlign: "right" }}>
              {pick.confidence > 0 && (
                <div style={{ fontSize: "22px", fontWeight: 800, color: cfg.color, letterSpacing: "-1px", lineHeight: 1 }}>{pick.confidence}%</div>
              )}
              {/* Odds implied probability comparison */}
              {pick.oddsImpliedProb !== null && (
                <div style={{ fontSize: "11px", color: "#546E7A", marginTop: "4px" }}>
                  Market: <span style={{ color: pick.conflictReason ? "#FF6D00" : "#90A4AE", fontWeight: 600 }}>{pick.oddsImpliedProb}%</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: "11px", color: "#546E7A" }}>🔒 PRO</div>
          )}

          {/* Odds display */}
          {pick.oddsDisplay && (
            <div style={{ fontSize: "11px", background: "#0D1520", border: "1px solid #FFD74030", padding: "4px 10px", borderRadius: "6px", color: "#FFD740", textAlign: "right" }}>
              <div style={{ fontWeight: 700 }}>{pick.oddsDisplay.medianOdds.toFixed(2)}</div>
              <div style={{ fontSize: "10px", color: "#546E7A" }}>{pick.oddsDisplay.bookmakerCount} books</div>
            </div>
          )}
        </div>
      </div>

      {/* Expanded explanation */}
      {expanded && (
        tier.showExplanation ? (
          <div style={{ marginTop: "14px", padding: "12px 14px", background: "#080B12", borderRadius: "8px", fontSize: "12px", color: "#90A4AE", lineHeight: "1.7", borderLeft: `2px solid ${cfg.color}` }}>
            {pick.conflictReason && (
              <div style={{ marginBottom: "8px", color: "#FF6D00", fontWeight: 600 }}>
                ⚡ Conflict ({pick.conflictReason.replace(/_/g, " ")}) — treat as NO BET
              </div>
            )}
            💡 {pick.explanation}
          </div>
        ) : (
          <div style={{ marginTop: "14px", padding: "12px 14px", background: "#080B12", borderRadius: "8px", fontSize: "12px", color: "#546E7A", borderLeft: "2px solid #1C2A38" }}>
            🔒 Detailed explanation available on Pro plan.
          </div>
        )
      )}
      {!expanded && <div style={{ marginTop: "8px", fontSize: "11px", color: "#37474F" }}>Click for explanation</div>}
    </div>
  )
}

function Tag({ label, color }) {
  return <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "4px", border: `1px solid ${color}40`, color, background: `${color}10` }}>{label}</span>
}

function makeGuessStats(teamName) {
  return { teamId: 0, teamName, goalsForAvg: 1.3, goalsAgainstAvg: 1.1, matchesPlayed: 5, source: "ESTIMATE" }
}
