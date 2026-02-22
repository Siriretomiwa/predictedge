import { useState, useEffect, useRef } from "react";

const SPORTS = [
  { id: "football", label: "Football", icon: "⚽", color: "#00E676" },
  { id: "basketball", label: "Basketball", icon: "🏀", color: "#FF6D00" },
  { id: "table_tennis", label: "Table Tennis", icon: "🏓", color: "#7C4DFF", soon: true },
];

const LEAGUES = {
  football: [
    { id: "epl", name: "Premier League", country: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England" },
    { id: "laliga", name: "La Liga", country: "🇪🇸 Spain" },
    { id: "bundesliga", name: "Bundesliga", country: "🇩🇪 Germany" },
    { id: "seriea", name: "Serie A", country: "🇮🇹 Italy" },
    { id: "ligue1", name: "Ligue 1", country: "🇫🇷 France" },
    { id: "cl", name: "Champions League", country: "🌍 Europe" },
    { id: "eredivisie", name: "Eredivisie", country: "🇳🇱 Netherlands" },
    { id: "liganos", name: "Liga NOS", country: "🇵🇹 Portugal" },
  ],
  basketball: [
    { id: "nba", name: "NBA", country: "🇺🇸 USA" },
    { id: "euroleague", name: "EuroLeague", country: "🌍 Europe" },
    { id: "ncaa", name: "NCAA", country: "🇺🇸 USA" },
    { id: "aba", name: "ABA League", country: "🌍 Balkans" },
  ],
};

const MARKETS = {
  football: [
    { id: "o15", label: "Over 1.5", group: "Goals" },
    { id: "o25", label: "Over 2.5", group: "Goals" },
    { id: "o35", label: "Over 3.5", group: "Goals" },
    { id: "btts", label: "BTTS", group: "Goals" },
    { id: "cs", label: "Correct Score", group: "Specials", variance: true },
    { id: "corners", label: "Corners", group: "Specials", soon: true },
  ],
  basketball: [
    { id: "1h_total", label: "1H Total Over", group: "Totals" },
    { id: "ft_total", label: "Full Game Total Over", group: "Totals" },
    { id: "team_total", label: "Team Total Over", group: "Totals" },
  ],
};

const STRENGTH_CONFIG = {
  BANKER: { color: "#00E676", bg: "#00E67614", border: "#00E67640", rank: 1, icon: "🏆" },
  STRONG: { color: "#69F0AE", bg: "#69F0AE14", border: "#69F0AE40", rank: 2, icon: "💪" },
  SAFE: { color: "#40C4FF", bg: "#40C4FF14", border: "#40C4FF40", rank: 3, icon: "🛡" },
  MODERATE: { color: "#FFD740", bg: "#FFD74014", border: "#FFD74040", rank: 4, icon: "⚖️" },
  RISKY: { color: "#FF6D00", bg: "#FF6D0014", border: "#FF6D0040", rank: 5, icon: "⚠️" },
  TRAP: { color: "#FF1744", bg: "#FF174414", border: "#FF174440", rank: 6, icon: "🚫" },
};

const SOURCE_BADGE = {
  API: { label: "API", color: "#40C4FF" },
  "API+UPLOAD": { label: "API + Upload", color: "#69F0AE" },
  UPLOAD: { label: "Upload Only", color: "#FFD740" },
};

function generateMockPicks(sport, leagues, markets) {
  const allPicks = [];
  const strengths = ["BANKER", "STRONG", "SAFE", "MODERATE", "RISKY", "TRAP"];
  const sources = ["API", "API", "API", "API+UPLOAD", "UPLOAD"];
  const footballTeams = [
    ["Manchester City", "Arsenal"], ["Real Madrid", "Barcelona"], ["Bayern Munich", "Dortmund"],
    ["PSG", "Marseille"], ["Inter Milan", "AC Milan"], ["Ajax", "PSV"],
    ["Atletico Madrid", "Sevilla"], ["Liverpool", "Chelsea"],
  ];
  const basketballTeams = [
    ["LA Lakers", "Golden State"], ["Boston Celtics", "Miami Heat"],
    ["Real Madrid B", "Barcelona B"], ["Fenerbahce", "CSKA Moscow"],
  ];
  const explanations = {
    football: {
      o25: ["Both teams average 3.1 goals/game. 14 of last 16 H2H produced 2+ goals.", "Home side 78% of games go over 2.5 this season. League avg 2.8 goals.", "High-scoring league, both offenses in form. Defensive injuries noted."],
      btts: ["Both teams scored in 11 of last 13 away games for visitor side.", "Home team clean sheet rate only 22%. Both sides with 4+ goals last 3 games."],
      o15: ["Over 1.5 hit in 91% of matches this season for both clubs combined.", "Historically low clean sheet rate for this matchup."],
    },
    basketball: {
      ft_total: ["BLE V2: Historical line 218.5. Tier A – 14 comparable matchup records. Avg score 227.3.", "BLE V2: Tier B – Controlled support. 9 records within range. Line 221 sits within safe band."],
      "1h_total": ["BLE V2: First half totals confirm Tier A signal. 12-of-14 records exceed line.", "BLE V2: 1H pace data from 137-record DB. Moderate fit detected."],
    },
  };

  const teams = sport === "football" ? footballTeams : basketballTeams;
  const mktExplanations = sport === "football" ? explanations.football : explanations.basketball;

  leagues.forEach((leagueId) => {
    const league = LEAGUES[sport]?.find((l) => l.id === leagueId);
    if (!league) return;
    const numPicks = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numPicks; i++) {
      const team = teams[Math.floor(Math.random() * teams.length)];
      markets.forEach((mkt) => {
        const mktDef = MARKETS[sport]?.find((m) => m.id === mkt);
        if (!mktDef || mktDef.soon) return;
        const strength = strengths[Math.floor(Math.random() * strengths.length)];
        const conf = strength === "BANKER" ? 90 + Math.floor(Math.random() * 8)
          : strength === "STRONG" ? 85 + Math.floor(Math.random() * 4)
          : strength === "SAFE" ? 80 + Math.floor(Math.random() * 4)
          : strength === "MODERATE" ? 70 + Math.floor(Math.random() * 9)
          : strength === "RISKY" ? 60 + Math.floor(Math.random() * 9)
          : 45 + Math.floor(Math.random() * 14);
        const explPool = mktExplanations[mkt] || ["Insufficient data for strong signal. Conflict detected between indicators."];
        const expl = explPool[Math.floor(Math.random() * explPool.length)];
        const line = sport === "basketball"
          ? (mkt === "1h_total" ? (105 + Math.floor(Math.random() * 20) + 0.5) : (210 + Math.floor(Math.random() * 30) + 0.5))
          : mkt === "o15" ? 1.5 : mkt === "o25" ? 2.5 : mkt === "o35" ? 3.5 : null;
        allPicks.push({
          id: `${leagueId}-${team[0]}-${mkt}-${Math.random()}`,
          home: team[0], away: team[1],
          league: league.name, country: league.country,
          market: mktDef.label,
          line,
          strength,
          confidence: conf,
          explanation: expl,
          source: sources[Math.floor(Math.random() * sources.length)],
          time: `${Math.floor(Math.random() * 4) + 15}:${["00", "15", "30", "45"][Math.floor(Math.random() * 4)]}`,
        });
      });
    }
  });

  return allPicks.sort((a, b) => STRENGTH_CONFIG[a.strength].rank - STRENGTH_CONFIG[b.strength].rank);
}

export default function App() {
  const [step, setStep] = useState(1);
  const [sport, setSport] = useState(null);
  const [selectedLeagues, setSelectedLeagues] = useState([]);
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [safeOnly, setSafeOnly] = useState(false);
  const [sortBy, setSortBy] = useState("strength");
  const [uploadMode, setUploadMode] = useState(false);
  const [progress, setProgress] = useState(0);

  const selectSport = (s) => {
    setSport(s);
    setSelectedLeagues([]);
    setSelectedMarkets([]);
    setPicks([]);
    setStep(2);
  };

  const toggleLeague = (id) => {
    setSelectedLeagues((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleMarket = (id) => {
    setSelectedMarkets((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const generate = async () => {
    if (!selectedLeagues.length || !selectedMarkets.length) return;
    setLoading(true);
    setProgress(0);
    setStep(3);
    for (let i = 0; i <= 100; i += 5) {
      await new Promise((r) => setTimeout(r, 40));
      setProgress(i);
    }
    const result = generateMockPicks(sport, selectedLeagues, selectedMarkets);
    setPicks(result);
    setLoading(false);
  };

  const filtered = picks.filter((p) => {
    if (safeOnly) return ["BANKER", "STRONG", "SAFE"].includes(p.strength);
    return true;
  });

  const grouped = {};
  filtered.forEach((p) => {
    if (!grouped[p.league]) grouped[p.league] = [];
    grouped[p.league].push(p);
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080B12",
      color: "#E8EAF0",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(0,230,118,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,230,118,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }} />

      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)",
        width: "800px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(0,230,118,0.06) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", padding: "0 20px 60px" }}>
        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "38px", height: "38px", borderRadius: "10px",
              background: "linear-gradient(135deg, #00E676, #00BCD4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", boxShadow: "0 0 20px rgba(0,230,118,0.3)",
            }}>⚡</div>
            <div>
              <div style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.3px", color: "#fff" }}>PredictEdge</div>
              <div style={{ fontSize: "11px", color: "#4CAF50", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "1px" }}>Analytics Platform</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Chip label="API Live" dot="#00E676" />
            <Chip label="v2.1.0" dot="#40C4FF" />
          </div>
        </header>

        {/* Step Indicator */}
        <StepBar step={step} sport={sport} />

        {/* STEP 1: Sport Selection */}
        {step >= 1 && (
          <Section title="Select Sport" subtitle="Choose a sport module to activate">
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {SPORTS.map((s) => (
                <SportCard key={s.id} sport={s} selected={sport === s.id} onClick={() => !s.soon && selectSport(s.id)} />
              ))}
            </div>
          </Section>
        )}

        {/* STEP 2: League + Market Selection */}
        {step >= 2 && sport && (
          <>
            <Section title="Select Leagues" subtitle="Multi-select enabled">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
                {(LEAGUES[sport] || []).map((l) => (
                  <LeagueCard
                    key={l.id}
                    league={l}
                    selected={selectedLeagues.includes(l.id)}
                    onClick={() => toggleLeague(l.id)}
                  />
                ))}
              </div>
            </Section>

            <Section title="Select Markets" subtitle="Choose prediction markets">
              {Object.entries(
                (MARKETS[sport] || []).reduce((acc, m) => {
                  (acc[m.group] = acc[m.group] || []).push(m);
                  return acc;
                }, {})
              ).map(([group, items]) => (
                <div key={group} style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", color: "#607D8B", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: "8px" }}>{group}</div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {items.map((m) => (
                      <MarketPill
                        key={m.id}
                        market={m}
                        selected={selectedMarkets.includes(m.id)}
                        onClick={() => !m.soon && toggleMarket(m.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </Section>

            {/* Upload Section */}
            <Section title="Data Enhancement" subtitle="Optional — API data is used by default">
              <UploadZone />
            </Section>

            <div style={{ marginTop: "8px" }}>
              <GenerateButton
                disabled={!selectedLeagues.length || !selectedMarkets.length}
                onClick={generate}
              />
              {(!selectedLeagues.length || !selectedMarkets.length) && (
                <div style={{ fontSize: "12px", color: "#546E7A", marginTop: "10px", textAlign: "center" }}>
                  Select at least 1 league and 1 market to generate picks
                </div>
              )}
            </div>
          </>
        )}

        {/* STEP 3: Results */}
        {step >= 3 && (
          <Section title="Generated Picks" subtitle={loading ? "Analysing fixtures..." : `${filtered.length} picks across ${Object.keys(grouped).length} leagues`}>
            {loading ? (
              <LoadingState progress={progress} />
            ) : (
              <>
                <ControlBar safeOnly={safeOnly} setSafeOnly={setSafeOnly} sortBy={sortBy} setSortBy={setSortBy} total={picks.length} filtered={filtered.length} />
                {filtered.length === 0 ? (
                  <div style={{
                    padding: "48px", textAlign: "center", border: "1px dashed #1C2A38",
                    borderRadius: "12px", color: "#546E7A",
                  }}>
                    <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "#607D8B" }}>No picks match the current filter</div>
                    <div style={{ fontSize: "13px", marginTop: "6px" }}>Try disabling "Safe+ Only" to see all predictions</div>
                  </div>
                ) : (
                  Object.entries(grouped).map(([league, lPicks]) => (
                    <LeagueGroup key={league} league={league} picks={lPicks} />
                  ))
                )}
                <div style={{ marginTop: "32px", textAlign: "center" }}>
                  <button
                    onClick={() => { setSport(null); setStep(1); setPicks([]); setSelectedLeagues([]); setSelectedMarkets([]); }}
                    style={{
                      background: "transparent", border: "1px solid #1C2A38",
                      color: "#607D8B", padding: "10px 24px", borderRadius: "8px",
                      cursor: "pointer", fontSize: "13px",
                    }}
                  >← New Analysis</button>
                </div>
              </>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function StepBar({ step, sport }) {
  const steps = ["Sport", "Configure", "Results"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "36px" }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: step > i ? "#00E676" : step === i + 1 ? "transparent" : "transparent",
            border: `2px solid ${step > i ? "#00E676" : step === i + 1 ? "#00E676" : "#1C2A38"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: 700,
            color: step > i ? "#080B12" : step === i + 1 ? "#00E676" : "#37474F",
            transition: "all 0.3s",
          }}>{step > i + 1 ? "✓" : i + 1}</div>
          <span style={{ fontSize: "12px", color: step === i + 1 ? "#E8EAF0" : "#37474F", fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
          {i < steps.length - 1 && <div style={{ width: "32px", height: "1px", background: step > i + 1 ? "#00E676" : "#1C2A38", transition: "all 0.3s" }} />}
        </div>
      ))}
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: "36px" }}>
      <div style={{ marginBottom: "18px" }}>
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>{title}</h2>
        {subtitle && <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#546E7A" }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function SportCard({ sport, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "24px 28px",
        border: `1px solid ${selected ? sport.color : "#1C2A38"}`,
        borderRadius: "14px",
        cursor: sport.soon ? "not-allowed" : "pointer",
        background: selected ? `${sport.color}10` : "#0D1520",
        transition: "all 0.2s",
        opacity: sport.soon ? 0.5 : 1,
        minWidth: "160px",
        position: "relative",
        boxShadow: selected ? `0 0 24px ${sport.color}20` : "none",
      }}
    >
      {sport.soon && (
        <div style={{
          position: "absolute", top: "10px", right: "10px",
          fontSize: "10px", color: "#546E7A", background: "#1C2A38",
          padding: "2px 8px", borderRadius: "20px", letterSpacing: "0.8px",
        }}>SOON</div>
      )}
      <div style={{ fontSize: "32px", marginBottom: "10px" }}>{sport.icon}</div>
      <div style={{ fontSize: "15px", fontWeight: 700, color: selected ? sport.color : "#E8EAF0" }}>{sport.label}</div>
    </div>
  );
}

function LeagueCard({ league, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "14px 16px",
        border: `1px solid ${selected ? "#00E676" : "#1C2A38"}`,
        borderRadius: "10px",
        cursor: "pointer",
        background: selected ? "#00E67608" : "#0D1520",
        transition: "all 0.15s",
        display: "flex", alignItems: "center", gap: "10px",
      }}
    >
      <div style={{
        width: "18px", height: "18px", borderRadius: "4px",
        border: `2px solid ${selected ? "#00E676" : "#2C3E50"}`,
        background: selected ? "#00E676" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "11px", flexShrink: 0,
        transition: "all 0.15s",
      }}>{selected && "✓"}</div>
      <div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: selected ? "#fff" : "#B0BEC5" }}>{league.name}</div>
        <div style={{ fontSize: "11px", color: "#546E7A", marginTop: "1px" }}>{league.country}</div>
      </div>
    </div>
  );
}

function MarketPill({ market, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "8px 16px",
        border: `1px solid ${selected ? "#40C4FF" : "#1C2A38"}`,
        borderRadius: "20px",
        cursor: market.soon ? "not-allowed" : "pointer",
        background: selected ? "#40C4FF12" : "#0D1520",
        color: selected ? "#40C4FF" : market.soon ? "#37474F" : "#90A4AE",
        fontSize: "13px", fontWeight: selected ? 600 : 400,
        transition: "all 0.15s",
        opacity: market.soon ? 0.5 : 1,
        display: "flex", alignItems: "center", gap: "6px",
      }}
    >
      {market.label}
      {market.variance && <span style={{ fontSize: "10px", color: "#FFD740", letterSpacing: "0.5px" }}>HIGH VAR</span>}
      {market.soon && <span style={{ fontSize: "10px", color: "#546E7A" }}>SOON</span>}
    </div>
  );
}

function UploadZone() {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px dashed ${hovered ? "#40C4FF" : "#1C2A38"}`,
        borderRadius: "12px",
        padding: "24px",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.2s",
        background: hovered ? "#40C4FF06" : "transparent",
      }}
    >
      <div style={{ fontSize: "24px", marginBottom: "8px" }}>📁</div>
      <div style={{ fontSize: "13px", color: "#607D8B", fontWeight: 600 }}>Drop Excel / CSV to enhance predictions</div>
      <div style={{ fontSize: "12px", color: "#37474F", marginTop: "4px" }}>Smart column detection · Auto team mapping · Optional</div>
      <div style={{ marginTop: "14px", display: "flex", gap: "8px", justifyContent: "center" }}>
        {["Fixtures", "Results", "Football Corners"].map((t) => (
          <span key={t} style={{
            fontSize: "11px", color: "#546E7A",
            border: "1px solid #1C2A38", borderRadius: "4px",
            padding: "2px 8px",
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function GenerateButton({ disabled, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%",
        padding: "16px",
        background: disabled ? "#1C2A38" : hov ? "linear-gradient(135deg, #00E676, #00BCD4)" : "linear-gradient(135deg, #00C853, #00BCD4)",
        border: "none",
        borderRadius: "12px",
        color: disabled ? "#37474F" : "#080B12",
        fontSize: "15px",
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        letterSpacing: "0.5px",
        boxShadow: disabled ? "none" : hov ? "0 0 32px rgba(0,230,118,0.4)" : "0 0 20px rgba(0,230,118,0.2)",
      }}
    >
      {disabled ? "Select leagues & markets to continue" : "⚡ Generate Picks"}
    </button>
  );
}

function LoadingState({ progress }) {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <div style={{ fontSize: "11px", color: "#00E676", letterSpacing: "2px", marginBottom: "24px", textTransform: "uppercase" }}>
        {progress < 30 ? "Fetching fixtures..." : progress < 60 ? "Running engine..." : progress < 90 ? "Classifying picks..." : "Finalising..."}
      </div>
      <div style={{ background: "#0D1520", borderRadius: "4px", height: "4px", overflow: "hidden", maxWidth: "320px", margin: "0 auto 12px" }}>
        <div style={{
          height: "100%", width: `${progress}%`,
          background: "linear-gradient(90deg, #00E676, #00BCD4)",
          transition: "width 0.1s", borderRadius: "4px",
          boxShadow: "0 0 10px rgba(0,230,118,0.5)",
        }} />
      </div>
      <div style={{ fontSize: "13px", color: "#37474F" }}>{progress}%</div>
    </div>
  );
}

function ControlBar({ safeOnly, setSafeOnly, sortBy, setSortBy, total, filtered }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 16px", background: "#0D1520", borderRadius: "10px",
      border: "1px solid #1C2A38", marginBottom: "20px", flexWrap: "wrap", gap: "12px",
    }}>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <Toggle label="Safe+ Only" value={safeOnly} onChange={setSafeOnly} color="#00E676" />
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={{ fontSize: "12px", color: "#546E7A" }}>Sort:</span>
        {["strength", "confidence"].map((s) => (
          <button key={s} onClick={() => setSortBy(s)} style={{
            padding: "5px 12px", borderRadius: "6px", fontSize: "12px",
            border: `1px solid ${sortBy === s ? "#40C4FF" : "#1C2A38"}`,
            background: sortBy === s ? "#40C4FF12" : "transparent",
            color: sortBy === s ? "#40C4FF" : "#607D8B",
            cursor: "pointer",
          }}>{s === "strength" ? "Banker First" : "Confidence"}</button>
        ))}
      </div>
      <div style={{ fontSize: "12px", color: "#546E7A" }}>
        Showing <span style={{ color: "#E8EAF0", fontWeight: 600 }}>{filtered}</span> of <span style={{ color: "#E8EAF0", fontWeight: 600 }}>{total}</span> picks
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange, color }) {
  return (
    <div onClick={() => onChange(!value)} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
      <div style={{
        width: "36px", height: "20px", borderRadius: "10px",
        background: value ? color : "#1C2A38",
        position: "relative", transition: "all 0.2s",
        boxShadow: value ? `0 0 12px ${color}40` : "none",
      }}>
        <div style={{
          position: "absolute", top: "2px",
          left: value ? "18px" : "2px",
          width: "16px", height: "16px",
          borderRadius: "50%", background: "#fff",
          transition: "left 0.2s",
        }} />
      </div>
      <span style={{ fontSize: "13px", color: value ? "#E8EAF0" : "#607D8B", fontWeight: value ? 600 : 400 }}>{label}</span>
    </div>
  );
}

function LeagueGroup({ league, picks }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: "20px" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "10px 14px", background: "#0D1520",
          borderRadius: "8px", cursor: "pointer",
          border: "1px solid #1C2A38", marginBottom: "10px",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#E8EAF0" }}>{league}</span>
        <span style={{ fontSize: "12px", color: "#546E7A" }}>{picks.length} picks</span>
        <div style={{ marginLeft: "auto", color: "#546E7A", fontSize: "12px" }}>{open ? "▲" : "▼"}</div>
      </div>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {picks.map((pick) => <PickCard key={pick.id} pick={pick} />)}
        </div>
      )}
    </div>
  );
}

function PickCard({ pick }) {
  const cfg = STRENGTH_CONFIG[pick.strength];
  const srcCfg = SOURCE_BADGE[pick.source] || SOURCE_BADGE.API;
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      border: `1px solid ${cfg.border}`,
      borderLeft: `3px solid ${cfg.color}`,
      borderRadius: "10px",
      background: cfg.bg,
      padding: "16px",
      transition: "all 0.2s",
      cursor: "pointer",
    }} onClick={() => setExpanded(!expanded)}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        {/* Match Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", color: "#546E7A" }}>{pick.time}</span>
            <span style={{ fontSize: "11px", color: "#37474F" }}>·</span>
            <span style={{ fontSize: "11px", color: "#546E7A" }}>{pick.country}</span>
          </div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", letterSpacing: "-0.2px" }}>
            {pick.home} <span style={{ color: "#37474F", fontWeight: 400 }}>vs</span> {pick.away}
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
            <Tag label={pick.market} color="#40C4FF" />
            {pick.line && <Tag label={`Line: ${pick.line}`} color="#90A4AE" />}
          </div>
        </div>

        {/* Strength + Confidence */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <div style={{
            padding: "6px 14px",
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            borderRadius: "20px",
            fontSize: "12px", fontWeight: 700, color: cfg.color,
            letterSpacing: "0.5px",
          }}>
            {cfg.icon} {pick.strength}
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: cfg.color, letterSpacing: "-1px" }}>
            {pick.confidence}%
          </div>
          <div style={{
            fontSize: "10px",
            background: "#0D1520",
            border: "1px solid #1C2A38",
            color: srcCfg.color,
            padding: "2px 8px",
            borderRadius: "4px",
            letterSpacing: "0.5px",
          }}>{srcCfg.label}</div>
        </div>
      </div>

      {/* Explanation (expandable) */}
      {expanded && (
        <div style={{
          marginTop: "14px",
          padding: "12px 14px",
          background: "#080B12",
          borderRadius: "8px",
          fontSize: "12px",
          color: "#90A4AE",
          lineHeight: "1.6",
          borderLeft: `2px solid ${cfg.color}`,
        }}>
          💡 {pick.explanation}
        </div>
      )}

      {!expanded && (
        <div style={{ marginTop: "8px", fontSize: "11px", color: "#37474F" }}>Click to see explanation</div>
      )}
    </div>
  );
}

function Tag({ label, color }) {
  return (
    <span style={{
      fontSize: "11px",
      padding: "3px 8px",
      borderRadius: "4px",
      border: `1px solid ${color}40`,
      color: color,
      background: `${color}10`,
    }}>{label}</span>
  );
}

function Chip({ label, dot }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "6px",
      padding: "4px 10px", borderRadius: "20px",
      border: "1px solid #1C2A38", fontSize: "11px", color: "#607D8B",
    }}>
      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: dot, boxShadow: `0 0 6px ${dot}` }} />
      {label}
    </div>
  );
}
