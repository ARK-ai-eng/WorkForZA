/*
 * WorkforZA – Marktanalyse & Rankings für Personaldisponenten
 * "Focused Slate" Design
 *
 * Kernfunktionen:
 * - Top-Berufe Ranking (letzte 30/60/90 Tage, nach Stadt filterbar)
 * - Top-Branchen Ranking
 * - Top-Firmen die am meisten suchen
 * - Repost-Hotspots: Welche Stellen werden am häufigsten repostet?
 * - Quellenverteilung: HR intern vs. Recruiter vs. PDL
 */
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { TrendingUp, Building2, Briefcase, MapPin, RefreshCw, ChevronDown } from "lucide-react";

const s = {
  teal: "#0D9488", tealBg: "#f0fdfa",
  text: "#1e293b", muted: "#64748b", border: "#e2e8f0",
  white: "#ffffff", bg: "#F4F5F7",
  amber: "#d97706", amberBg: "#fffbeb",
  red: "#dc2626", redBg: "#fef2f2",
  green: "#059669", greenBg: "#ecfdf5",
  violet: "#7c3aed", violetBg: "#f5f3ff",
};

const CITIES = ["Alle Städte", "Dortmund", "Köln", "Hamburg", "Berlin", "München", "Frankfurt", "Stuttgart", "Düsseldorf"];
const PERIODS = ["Letzte 30 Tage", "Letzte 60 Tage", "Letzte 90 Tage"];

const TOP_BERUFE = [
  { rang: 1, beruf: "Staplerfahrer (m/w/d)", count: 1847, trend: 12, up: true, repostRate: 68 },
  { rang: 2, beruf: "Pflegefachkraft", count: 1623, trend: 8, up: true, repostRate: 74 },
  { rang: 3, beruf: "LKW-Fahrer CE", count: 1412, trend: 21, up: true, repostRate: 55 },
  { rang: 4, beruf: "Lagerhelfer", count: 1388, trend: 3, up: false, repostRate: 42 },
  { rang: 5, beruf: "Elektriker", count: 1204, trend: 5, up: true, repostRate: 38 },
  { rang: 6, beruf: "Sicherheitsmitarbeiter §34a", count: 1089, trend: 34, up: true, repostRate: 81 },
  { rang: 7, beruf: "Schweißer", count: 987, trend: 2, up: true, repostRate: 47 },
  { rang: 8, beruf: "Altenpfleger", count: 943, trend: 15, up: true, repostRate: 79 },
  { rang: 9, beruf: "Produktionsmitarbeiter", count: 876, trend: 7, up: false, repostRate: 31 },
  { rang: 10, beruf: "Berufskraftfahrer", count: 812, trend: 18, up: true, repostRate: 52 },
];

const TOP_BRANCHEN = [
  { branche: "Logistik & Transport", count: 8420, color: s.teal },
  { branche: "Pflege & Gesundheit", count: 7130, color: "#7c3aed" },
  { branche: "Sicherheit", count: 4890, color: s.amber },
  { branche: "Produktion", count: 4210, color: "#0ea5e9" },
  { branche: "Bau & Handwerk", count: 3780, color: "#f59e0b" },
  { branche: "IT & Software", count: 3120, color: "#10b981" },
  { branche: "Vertrieb", count: 2940, color: "#ef4444" },
  { branche: "Gastronomie", count: 2310, color: "#8b5cf6" },
];

const TOP_FIRMEN = [
  { rang: 1, firma: "Amazon Logistik GmbH", stellen: 234, repostRate: 61, quelle: "hr" },
  { rang: 2, firma: "DHL Supply Chain", stellen: 198, repostRate: 44, quelle: "hr" },
  { rang: 3, firma: "Caritas Köln", stellen: 167, repostRate: 78, quelle: "pdl" },
  { rang: 4, firma: "DB Schenker AG", stellen: 143, repostRate: 39, quelle: "hr" },
  { rang: 5, firma: "Securitas Deutschland", stellen: 128, repostRate: 82, quelle: "recruiter" },
  { rang: 6, firma: "Siemens AG", stellen: 112, repostRate: 28, quelle: "hr" },
  { rang: 7, firma: "Lidl Logistik", stellen: 98, repostRate: 35, quelle: "hr" },
  { rang: 8, firma: "Helios Kliniken", stellen: 94, repostRate: 71, quelle: "pdl" },
];

const TREND_DATA = [
  { monat: "Sep", logistik: 6200, pflege: 5800, sicherheit: 3400 },
  { monat: "Okt", logistik: 6800, pflege: 6100, sicherheit: 3700 },
  { monat: "Nov", logistik: 7100, pflege: 6400, sicherheit: 3900 },
  { monat: "Dez", logistik: 6900, pflege: 6200, sicherheit: 4100 },
  { monat: "Jan", logistik: 7400, pflege: 6700, sicherheit: 4300 },
  { monat: "Feb", logistik: 8420, pflege: 7130, sicherheit: 4890 },
];

const QUELLEN_DATA = [
  { name: "HR intern", value: 48, color: s.green },
  { name: "Recruiter", value: 31, color: s.violet },
  { name: "PDL", value: 21, color: s.amber },
];

function repostColor(rate: number) {
  if (rate >= 70) return { color: s.red, bg: s.redBg };
  if (rate >= 45) return { color: s.amber, bg: s.amberBg };
  return { color: s.green, bg: s.greenBg };
}

function quelleColor(q: string) {
  if (q === "hr") return { color: s.green, label: "HR" };
  if (q === "recruiter") return { color: s.violet, label: "Recruiter" };
  return { color: s.amber, label: "PDL" };
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ width: 30, height: 30, borderRadius: 7, background: s.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon style={{ width: 14, height: 14, color: s.teal }} />
      </div>
      <div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: s.text }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: s.muted }}>{subtitle}</div>}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [city, setCity] = useState("Alle Städte");
  const [period, setPeriod] = useState("Letzte 30 Tage");
  const [showCityDrop, setShowCityDrop] = useState(false);
  const [showPeriodDrop, setShowPeriodDrop] = useState(false);

  return (
    <AppLayout title="Marktanalyse" subtitle="Rankings & Trends für Personaldisponenten">
      <div style={{ padding: "16px 20px", overflowY: "auto", height: "calc(100vh - 64px)" }}>

        {/* Filter bar */}
        <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center" }}>
          <div style={{ fontSize: 13, color: s.muted, fontWeight: 500 }}>Zeige Daten für:</div>
          <div style={{ position: "relative" }}>
            <button onClick={() => { setShowCityDrop(!showCityDrop); setShowPeriodDrop(false); }}
              style={{ padding: "7px 12px", borderRadius: 6, border: `1px solid ${s.border}`, background: s.white, fontSize: 13, color: s.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
              <MapPin style={{ width: 13, height: 13, color: s.teal }} />
              {city}
              <ChevronDown style={{ width: 11, height: 11, color: s.muted }} />
            </button>
            {showCityDrop && (
              <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, background: s.white, border: `1px solid ${s.border}`, borderRadius: 7, zIndex: 50, minWidth: 160, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                {CITIES.map((c) => (
                  <button key={c} onClick={() => { setCity(c); setShowCityDrop(false); }}
                    style={{ display: "block", width: "100%", padding: "8px 12px", border: "none", background: c === city ? s.tealBg : "transparent", color: c === city ? s.teal : s.text, fontSize: 13, cursor: "pointer", textAlign: "left", fontWeight: c === city ? 600 : 400 }}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ position: "relative" }}>
            <button onClick={() => { setShowPeriodDrop(!showPeriodDrop); setShowCityDrop(false); }}
              style={{ padding: "7px 12px", borderRadius: 6, border: `1px solid ${s.border}`, background: s.white, fontSize: 13, color: s.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
              {period}
              <ChevronDown style={{ width: 11, height: 11, color: s.muted }} />
            </button>
            {showPeriodDrop && (
              <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, background: s.white, border: `1px solid ${s.border}`, borderRadius: 7, zIndex: 50, minWidth: 160, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                {PERIODS.map((p) => (
                  <button key={p} onClick={() => { setPeriod(p); setShowPeriodDrop(false); }}
                    style={{ display: "block", width: "100%", padding: "8px 12px", border: "none", background: p === period ? s.tealBg : "transparent", color: p === period ? s.teal : s.text, fontSize: 13, cursor: "pointer", textAlign: "left", fontWeight: p === period ? 600 : 400 }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: s.muted }}>Aktualisiert: heute 08:00 Uhr</div>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 18 }} className="lg:grid-cols-4">
          {[
            { label: "Neue Stellen (30d)", value: "38.420", change: "+12% vs. Vormonat", up: true },
            { label: "Ø Repost-Rate", value: "54%", change: "+3% — steigend", up: false },
            { label: "Aktive Firmen", value: "4.218", change: "+7% vs. Vormonat", up: true },
            { label: "Schwer zu besetzen", value: "1.847", change: "+18% — kritisch", up: false },
          ].map((kpi) => (
            <div key={kpi.label} style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "13px 15px" }}>
              <div style={{ fontSize: 11, color: s.muted, marginBottom: 5 }}>{kpi.label}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 22, color: s.text, marginBottom: 3 }}>{kpi.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: kpi.up ? s.green : s.red }}>{kpi.change}</div>
            </div>
          ))}
        </div>

        {/* Main grid row 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, marginBottom: 14 }} className="lg:grid-cols-2">

          {/* Top-Berufe Ranking */}
          <div style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "15px" }}>
            <SectionHeader icon={TrendingUp} title="Top-Berufe Ranking" subtitle={`${period} · ${city}`} />
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "24px 1fr 60px 48px 58px", gap: 6, padding: "4px 5px", borderBottom: `1px solid ${s.border}`, marginBottom: 3 }}>
                {["#", "Beruf", "Stellen", "Trend", "Repost"].map((h) => (
                  <div key={h} style={{ fontSize: 10, fontWeight: 700, color: s.muted, textTransform: "uppercase" }}>{h}</div>
                ))}
              </div>
              {TOP_BERUFE.map((item) => {
                const { color, bg } = repostColor(item.repostRate);
                return (
                  <div key={item.rang} style={{ display: "grid", gridTemplateColumns: "24px 1fr 60px 48px 58px", gap: 6, padding: "6px 5px", borderBottom: `1px solid ${s.border}`, alignItems: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: item.rang <= 3 ? s.teal : s.muted }}>{item.rang}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: s.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.beruf}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: s.text }}>{item.count.toLocaleString("de-DE")}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: item.up ? s.green : s.red }}>
                      {item.up ? "↑" : "↓"} {item.trend}%
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 20, background: bg, color, display: "inline-block" }}>{item.repostRate}%</span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 7, fontSize: 10, color: s.muted }}>
              🔴 ≥70% schwer zu besetzen &nbsp;·&nbsp; 🟡 45–69% mittel &nbsp;·&nbsp; 🟢 &lt;45% normal
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Top-Branchen */}
            <div style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "15px" }}>
              <SectionHeader icon={Briefcase} title="Top-Branchen" subtitle="Offene Stellen nach Branche" />
              <ResponsiveContainer width="100%" height={185}>
                <BarChart data={TOP_BRANCHEN} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: s.muted }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="branche" tick={{ fontSize: 10, fill: s.text }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip formatter={(v: number) => [v.toLocaleString("de-DE"), "Stellen"]} contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {TOP_BRANCHEN.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quellenverteilung */}
            <div style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "15px" }}>
              <SectionHeader icon={RefreshCw} title="Quellenverteilung" subtitle="HR intern vs. Recruiter vs. PDL" />
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <ResponsiveContainer width={110} height={110}>
                  <PieChart>
                    <Pie data={QUELLEN_DATA} dataKey="value" cx="50%" cy="50%" innerRadius={32} outerRadius={50} paddingAngle={3}>
                      {QUELLEN_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {QUELLEN_DATA.map((item) => (
                    <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${s.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: item.color }} />
                        <span style={{ fontSize: 12, color: s.text }}>{item.name}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: s.text }}>{item.value}%</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 7, fontSize: 10, color: s.muted }}>PDL-Stellen haben höhere Repost-Raten</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Trend + Top-Firmen */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }} className="lg:grid-cols-2">

          {/* Branchen-Trend */}
          <div style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "15px" }}>
            <SectionHeader icon={TrendingUp} title="Branchen-Trend (6 Monate)" subtitle="Entwicklung der Top-3-Branchen" />
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={TREND_DATA} margin={{ left: -10, right: 10, top: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={s.border} />
                <XAxis dataKey="monat" tick={{ fontSize: 11, fill: s.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: s.muted }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Line type="monotone" dataKey="logistik" stroke={s.teal} strokeWidth={2} dot={false} name="Logistik" />
                <Line type="monotone" dataKey="pflege" stroke={s.violet} strokeWidth={2} dot={false} name="Pflege" />
                <Line type="monotone" dataKey="sicherheit" stroke={s.amber} strokeWidth={2} dot={false} name="Sicherheit" />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
              {[["Logistik", s.teal], ["Pflege", s.violet], ["Sicherheit", s.amber]].map(([label, color]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: s.muted }}>
                  <div style={{ width: 14, height: 2, background: color, borderRadius: 1 }} /> {label}
                </div>
              ))}
            </div>
          </div>

          {/* Top-Firmen */}
          <div style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "15px" }}>
            <SectionHeader icon={Building2} title="Top-Firmen (meiste Suchen)" subtitle="Welche Unternehmen suchen am aktivsten?" />
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "22px 1fr 55px 58px 50px", gap: 6, padding: "4px 5px", borderBottom: `1px solid ${s.border}`, marginBottom: 3 }}>
                {["#", "Unternehmen", "Stellen", "Repost", "Typ"].map((h) => (
                  <div key={h} style={{ fontSize: 10, fontWeight: 700, color: s.muted, textTransform: "uppercase" }}>{h}</div>
                ))}
              </div>
              {TOP_FIRMEN.map((item) => {
                const { color, bg } = repostColor(item.repostRate);
                const q = quelleColor(item.quelle);
                return (
                  <div key={item.rang} style={{ display: "grid", gridTemplateColumns: "22px 1fr 55px 58px 50px", gap: 6, padding: "7px 5px", borderBottom: `1px solid ${s.border}`, alignItems: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: item.rang <= 3 ? s.teal : s.muted }}>{item.rang}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: s.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.firma}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: s.text }}>{item.stellen}</div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 20, background: bg, color, display: "inline-block" }}>{item.repostRate}%</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 6px", borderRadius: 20, background: `${q.color}18`, color: q.color, display: "inline-block" }}>{q.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
