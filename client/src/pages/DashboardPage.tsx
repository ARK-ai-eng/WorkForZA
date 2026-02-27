/*
 * WorkforZA Dashboard – "Focused Slate"
 * Kompaktes Tages-Dashboard für Sachbearbeiter
 * Hintergrund: #F4F5F7 | Karten: white | Akzent: #0D9488 Teal
 */
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Link } from "wouter";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Search, TrendingUp, ArrowRight, Zap, Building2, ListChecks, BarChart3, AlertTriangle, Clock, Users, RefreshCw, Bell } from "lucide-react";
import { toast } from "sonner";

const s = {
  teal: "#0D9488", tealBg: "#f0fdfa", tealMid: "#ccfbf1",
  text: "#1e293b", muted: "#64748b", border: "#e2e8f0",
  white: "#ffffff", bg: "#F4F5F7", green: "#059669",
};

const TREND_DATA = [
  { day: "Mo", jobs: 4200 }, { day: "Di", jobs: 5100 },
  { day: "Mi", jobs: 4800 }, { day: "Do", jobs: 6200 },
  { day: "Fr", jobs: 5900 }, { day: "Sa", jobs: 3100 }, { day: "So", jobs: 2800 },
];

const RECENT_SEARCHES = [
  { query: "Java Developer München", results: 847, time: "vor 2 Min." },
  { query: "Pflegefachkraft NRW", results: 1243, time: "vor 18 Min." },
  { query: "Vertrieb Remote", results: 562, time: "vor 1 Std." },
  { query: "IT-Projektleiter Berlin", results: 391, time: "vor 2 Std." },
  { query: "Buchhalter Frankfurt", results: 228, time: "vor 3 Std." },
];

const TOP_SECTORS = [
  { name: "IT & Software", count: 142300, pct: 82 },
  { name: "Pflege & Gesundheit", count: 98700, pct: 67 },
  { name: "Vertrieb", count: 87200, pct: 59 },
  { name: "Logistik", count: 71400, pct: 48 },
  { name: "Finanzen", count: 54100, pct: 37 },
];

// Tages-Briefing Daten
const BRIEFING_ITEMS = [
  { type: "alert" as const, icon: RefreshCw, color: "#dc2626", bg: "#fef2f2", title: "3 Firmen mit kritischer Repost-Rate", desc: "Securitas AG (82%), Caritas Köln (78%), Helios Kliniken (71%) — seit >30 Tagen unbesetzt", href: "/companies" },
  { type: "warning" as const, icon: Clock, color: "#d97706", bg: "#fffbeb", title: "2 Kandidaten: Verfügbarkeit läuft ab", desc: "Sandra W. (6 Tage), Kevin B. (11 Tage) — jetzt handeln!", href: "/pipeline" },
  { type: "info" as const, icon: Bell, color: "#0D9488", bg: "#f0fdfa", title: "47 neue Stellen seit gestern", desc: "Davon 12 in Logistik Dortmund, 8 in Pflege Köln — passend zu deinen gespeicherten Suchen", href: "/jobs" },
  { type: "info" as const, icon: Users, color: "#7c3aed", bg: "#f5f3ff", title: "1 Kandidat sofort verfügbar", desc: "Thomas K. (Staplerfahrer) — noch kein Match zugewiesen", href: "/pipeline" },
];

const KPIS = [
  { label: "Neue Stellen heute", value: "6.284", delta: "+12%", icon: "📋" },
  { label: "Aktive Unternehmen", value: "370.578", delta: "+0,3%", icon: "🏢" },
  { label: "KI-Matches heute", value: "47", delta: "+8", icon: "⚡" },
  { label: "Offene Listen", value: "6", delta: "2 neu", icon: "📌" },
];

export default function DashboardPage() {
  const [searchVal, setSearchVal] = useState("");
  const [briefingDismissed, setBriefingDismissed] = useState<number[]>([]);

  const activeBriefing = BRIEFING_ITEMS.filter((_, i) => !briefingDismissed.includes(i));

  return (
    <AppLayout
      title="Dashboard"
      subtitle={`Guten Morgen, Birol — ${new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}`}
    >
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Tages-Briefing */}
        {activeBriefing.length > 0 && (
          <div style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${s.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <Bell style={{ width: 14, height: 14, color: s.teal }} />
              <span style={{ fontWeight: 700, fontSize: 13, color: s.text }}>Tages-Briefing</span>
              <span style={{ fontSize: 11, color: s.muted, marginLeft: 4 }}>{activeBriefing.length} Hinweise</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {BRIEFING_ITEMS.map((item, i) => {
                if (briefingDismissed.includes(i)) return null;
                const Icon = item.icon;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 16px", borderBottom: i < BRIEFING_ITEMS.length - 1 ? `1px solid ${s.border}` : "none" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 7, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <Icon style={{ width: 14, height: 14, color: item.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link href={item.href}>
                        <a style={{ fontWeight: 600, fontSize: 13, color: s.text, textDecoration: "none", display: "block" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = s.teal)}
                          onMouseLeave={(e) => (e.currentTarget.style.color = s.text)}>
                          {item.title}
                        </a>
                      </Link>
                      <div style={{ fontSize: 12, color: s.muted, marginTop: 2, lineHeight: 1.4 }}>{item.desc}</div>
                    </div>
                    <button onClick={() => setBriefingDismissed((prev) => [...prev, i])}
                      style={{ width: 22, height: 22, borderRadius: 5, border: `1px solid ${s.border}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, fontSize: 12, color: s.muted }}>
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick search */}
        <div style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <Search style={{ width: 16, height: 16, color: s.muted, flexShrink: 0 }} />
          <input
            placeholder="Schnellsuche: Berufsbezeichnung, Ort, Unternehmen..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && searchVal) toast.info(`Suche nach "${searchVal}"`); }}
            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: s.text, background: "transparent" }}
          />
          <Link href="/jobs">
            <a style={{ padding: "6px 14px", borderRadius: 6, background: s.teal, color: "white", fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
              Suchen
            </a>
          </Link>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }} className="sm:grid-cols-4">
          {KPIS.map((kpi) => (
            <div key={kpi.label} style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: s.muted, fontWeight: 500 }}>{kpi.label}</span>
                <span style={{ fontSize: 18 }}>{kpi.icon}</span>
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 24, color: s.text, lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                <TrendingUp style={{ width: 11, height: 11, color: s.green }} />
                <span style={{ fontSize: 12, color: s.green, fontWeight: 600 }}>{kpi.delta}</span>
                <span style={{ fontSize: 12, color: s.muted }}>vs. gestern</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }} className="md:grid-cols-[1fr_280px]">
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Chart */}
            <div style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: s.text }}>Neue Stellenanzeigen</div>
                  <div style={{ fontSize: 12, color: s.muted }}>Diese Woche</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={TREND_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={s.teal} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={s.teal} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: s.muted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: s.muted }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${s.border}` }} />
                  <Area type="monotone" dataKey="jobs" stroke={s.teal} strokeWidth={2} fill="url(#tealGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Recent searches */}
            <div style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: s.text }}>Letzte Suchen</div>
                <Link href="/jobs">
                  <a style={{ fontSize: 12, color: s.teal, textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                    Alle <ArrowRight style={{ width: 12, height: 12 }} />
                  </a>
                </Link>
              </div>
              {RECENT_SEARCHES.map((item, i) => (
                <div
                  key={i}
                  onClick={() => toast.info(`Suche "${item.query}" wird wiederholt`)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < RECENT_SEARCHES.length - 1 ? `1px solid ${s.border}` : "none", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Search style={{ width: 12, height: 12, color: s.muted, flexShrink: 0 }} />
                    <span style={{ fontSize: 13.5, color: s.text }}>{item.query}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: s.teal, fontWeight: 600 }}>{item.results.toLocaleString("de-DE")}</span>
                    <span style={{ fontSize: 11, color: s.muted }}>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Top sectors */}
            <div style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: s.text, marginBottom: 14 }}>Top Branchen</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {TOP_SECTORS.map((sec) => (
                  <div key={sec.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: s.text }}>{sec.name}</span>
                      <span style={{ fontSize: 12, color: s.muted }}>{sec.count.toLocaleString("de-DE")}</span>
                    </div>
                    <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2 }}>
                      <div style={{ height: 4, width: `${sec.pct}%`, background: s.teal, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: s.text, marginBottom: 12 }}>Schnellzugriff</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { href: "/matching", icon: <Zap style={{ width: 14, height: 14 }} />, label: "KI-Matching starten" },
                  { href: "/companies", icon: <Building2 style={{ width: 14, height: 14 }} />, label: "Unternehmen suchen" },
                  { href: "/analytics", icon: <BarChart3 style={{ width: 14, height: 14 }} />, label: "Marktanalyse öffnen" },
                  { href: "/lists", icon: <ListChecks style={{ width: 14, height: 14 }} />, label: "Neue Liste anlegen" },
                ].map((action) => (
                  <Link key={action.href} href={action.href}>
                    <a style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 6, background: "#f8fafc", border: `1px solid ${s.border}`, textDecoration: "none", fontSize: 13.5, color: s.text, fontWeight: 500 }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = s.tealBg)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    >
                      <span style={{ color: s.teal }}>{action.icon}</span>
                      {action.label}
                      <ArrowRight style={{ width: 12, height: 12, color: s.muted, marginLeft: "auto" }} />
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
