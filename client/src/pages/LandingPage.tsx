/*
 * WorkforZA Landing Page – "Focused Slate" – Mobile-First Responsive
 * Mobile: Stack-Layout, Hamburger-Nav
 * Tablet (768px+): 2-Spalten Hero
 * Desktop (1024px+): Volle Breite
 */
import { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";

const FEATURES = [
  { icon: "🔍", title: "Präzise Stellensuche", desc: "Boolean-Logik, Standort-Radius, Branchen-Filter. Finde in Sekunden was du brauchst — aus 3,49 Mio. aktuellen Anzeigen." },
  { icon: "⚡", title: "KI-Matching", desc: "Lebenslauf hochladen, fertig. Die KI analysiert Qualifikationen und liefert die besten Matches mit Begründung." },
  { icon: "📊", title: "Marktanalyse", desc: "Gehaltsranges, Nachfrage-Trends, regionale Verteilung. Daten die Personaldienstleister wirklich brauchen." },
  { icon: "🏢", title: "Firmendatenbank", desc: "370.000+ Unternehmen mit Kontaktdaten, offenen Stellen und Branchenprofil — direkt kontaktierbar." },
  { icon: "📋", title: "Listen & Export", desc: "Suchen speichern, Listen anlegen, CSV/Excel exportieren. Dein Workflow, deine Struktur." },
  { icon: "🔔", title: "Job-Alerts", desc: "Automatische Benachrichtigungen bei neuen passenden Stellen. Nie wieder manuell suchen." },
];

const PLANS = [
  { name: "Starter", price: "89", period: "/ Monat", desc: "Für Einzelpersonen", features: ["500 Suchen / Monat", "1 Nutzer", "CSV-Export", "E-Mail-Support"], highlight: false, cta: "Kostenlos testen" },
  { name: "Professional", price: "249", period: "/ Monat", desc: "Für aktive Recruiter", features: ["Unbegrenzte Suchen", "3 Nutzer", "KI-Matching (50/Monat)", "Excel-Export", "Job-Alerts", "Priority Support"], highlight: true, cta: "Jetzt starten" },
  { name: "Team", price: "Auf Anfrage", period: "", desc: "Für Personaldienstleister", features: ["Unbegrenzte Nutzer", "Unbegrenztes KI-Matching", "API-Zugang", "CRM-Integration", "Dedizierter Account Manager"], highlight: false, cta: "Kontakt aufnehmen" },
];

const C = {
  teal: "#0D9488", tealLight: "#f0fdfa", tealMid: "#ccfbf1",
  slate: "#1E2433", bg: "#F4F5F7", text: "#1e293b",
  muted: "#64748b", border: "#e2e8f0", white: "#ffffff",
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", color: C.text }}>

      {/* ── Nav ── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: 60, background: C.white,
        borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 16 }}>⚡</span>
          </div>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 17, color: C.text }}>WorkforZA</span>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex" style={{ gap: 24, fontSize: 14, fontWeight: 500, color: C.muted }}>
          <a href="#features" style={{ color: C.muted, textDecoration: "none" }}>Features</a>
          <a href="#pricing" style={{ color: C.muted, textDecoration: "none" }}>Preise</a>
          <a href="#" style={{ color: C.muted, textDecoration: "none" }}>Dokumentation</a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex" style={{ gap: 8 }}>
          <Link href="/login" style={{ padding: "8px 16px", borderRadius: 6, fontSize: 14, fontWeight: 500, color: C.text, textDecoration: "none", border: `1px solid ${C.border}`, background: C.white }}>Anmelden</Link>
          <Link href="/login" style={{ padding: "8px 16px", borderRadius: 6, fontSize: 14, fontWeight: 600, color: C.white, textDecoration: "none", background: C.teal }}>Kostenlos testen</Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="flex md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}
        >
          {mobileMenuOpen ? <X style={{ width: 22, height: 22 }} /> : <Menu style={{ width: 22, height: 22 }} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 60, zIndex: 49 }}>
          <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 15, color: C.text, textDecoration: "none", fontWeight: 500 }}>Features</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 15, color: C.text, textDecoration: "none", fontWeight: 500 }}>Preise</a>
          <a href="#" style={{ fontSize: 15, color: C.text, textDecoration: "none", fontWeight: 500 }}>Dokumentation</a>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/login" style={{ padding: "10px 16px", borderRadius: 6, fontSize: 14, fontWeight: 500, color: C.text, textDecoration: "none", border: `1px solid ${C.border}`, textAlign: "center" }}>Anmelden</Link>
            <Link href="/login" style={{ padding: "10px 16px", borderRadius: 6, fontSize: 14, fontWeight: 600, color: C.white, textDecoration: "none", background: C.teal, textAlign: "center" }}>Kostenlos testen</Link>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 20px 40px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 40,
          alignItems: "center",
        }}
          className="lg:grid-cols-2"
        >
          {/* Left: Text */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.tealLight, border: `1px solid ${C.tealMid}`, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: C.teal, marginBottom: 20 }}>
              ✦ Neu: KI-Matching mit Gemini 2.0
            </div>
            <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1.15, color: C.text, margin: "0 0 20px" }}>
              Recruiting-Leads.<br />
              <span style={{ color: C.teal }}>Effizienter arbeiten.</span>
            </h1>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, margin: "0 0 28px", maxWidth: 480 }}>
              Die Arbeitsplattform für Personaldienstleister. Über 3,49 Millionen aktuelle Stellenanzeigen aus 5 Quellen — mit KI-Matching, Marktanalyse und direktem Firmenkontakt.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/login" style={{ padding: "12px 22px", borderRadius: 6, fontSize: 15, fontWeight: 600, color: C.white, textDecoration: "none", background: C.teal, display: "inline-flex", alignItems: "center", gap: 6 }}>
                Kostenlos starten →
              </Link>
              <Link href="/dashboard" style={{ padding: "12px 22px", borderRadius: 6, fontSize: 15, fontWeight: 500, color: C.text, textDecoration: "none", background: C.white, border: `1px solid ${C.border}` }}>
                Demo ansehen
              </Link>
            </div>
            {/* Stats row */}
            <div style={{ display: "flex", gap: 28, marginTop: 36, flexWrap: "wrap" }}>
              {[["3,49 Mio.", "Stellenanzeigen"], ["370.578", "Unternehmen"], ["5 Quellen", "Aggregiert"]].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 20, color: C.text }}>{v}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard Mockup — hidden on small mobile, shown md+ */}
          <div className="hidden sm:block" style={{ position: "relative" }}>
            <div style={{ background: C.white, borderRadius: 12, boxShadow: "0 8px 40px rgba(0,0,0,0.12)", border: `1px solid ${C.border}`, overflow: "hidden", fontSize: 12 }}>
              {/* Browser Chrome */}
              <div style={{ background: "#f8fafc", borderBottom: `1px solid ${C.border}`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fc5c57" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fdbc2c" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#33c748" }} />
                </div>
                <div style={{ flex: 1, background: C.bg, borderRadius: 4, padding: "3px 10px", fontSize: 11, color: C.muted, textAlign: "center" }}>app.workforza.de/dashboard</div>
              </div>
              {/* App Shell */}
              <div style={{ display: "flex", height: 300 }}>
                <div style={{ width: 48, background: "#1E2433", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 12, gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, marginBottom: 8 }}>⚡</div>
                  {["🏠", "🔍", "🏢", "📊", "⚡", "📋"].map((icon, i) => (
                    <div key={i} style={{ width: 30, height: 30, borderRadius: 6, background: i === 0 ? "rgba(13,148,136,0.25)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{icon}</div>
                  ))}
                </div>
                <div style={{ flex: 1, background: "#F4F5F7", padding: "12px 14px", overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 10 }}>
                    {[
                      { label: "Neue Stellen", value: "1.247", delta: "+12%", color: C.teal },
                      { label: "Firmen", value: "370.578", delta: "+3%", color: "#7c3aed" },
                      { label: "Repost-Rate", value: "48%", delta: "kritisch", color: "#dc2626" },
                      { label: "Matches", value: "34", delta: "+8", color: "#059669" },
                    ].map((kpi) => (
                      <div key={kpi.label} style={{ background: C.white, borderRadius: 5, padding: "7px 8px", border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 9, color: C.muted, marginBottom: 2 }}>{kpi.label}</div>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, color: C.text }}>{kpi.value}</div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: kpi.color }}>{kpi.delta}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: C.white, borderRadius: 5, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                    <div style={{ padding: "6px 10px", borderBottom: `1px solid ${C.border}`, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 11, color: C.text, display: "flex", justifyContent: "space-between" }}>
                      <span>Aktuelle Stellen</span>
                      <span style={{ fontSize: 9, color: C.teal, fontWeight: 600 }}>3.490.241 gesamt</span>
                    </div>
                    {[
                      { title: "Staplerfahrer (m/w/d)", firma: "Amazon Logistik · Dortmund", repost: 61, quelle: "HR intern", qColor: "#059669" },
                      { title: "Pflegefachkraft", firma: "Caritas Köln · Köln", repost: 78, quelle: "PDL", qColor: "#d97706" },
                      { title: "LKW-Fahrer CE", firma: "DB Schenker · Hamburg", repost: 39, quelle: "HR intern", qColor: "#059669" },
                      { title: "Sicherheitsmitarbeiter", firma: "Securitas AG · Berlin", repost: 82, quelle: "Recruiter", qColor: "#7c3aed" },
                    ].map((job, i) => (
                      <div key={i} style={{ padding: "6px 10px", borderBottom: i < 3 ? `1px solid ${C.border}` : "none", display: "flex", alignItems: "center", justifyContent: "space-between", background: i === 0 ? "#f0fdfa" : C.white }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 10, color: C.text }}>{job.title}</div>
                          <div style={{ fontSize: 9, color: C.muted }}>{job.firma}</div>
                        </div>
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 10, background: job.repost >= 70 ? "#fef2f2" : "#f0fdfa", color: job.repost >= 70 ? "#dc2626" : C.teal, fontWeight: 600 }}>↻ {job.repost}%</span>
                          <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 10, background: "#f8fafc", color: job.qColor, fontWeight: 600 }}>{job.quelle}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div style={{ position: "absolute", bottom: -12, right: -12, background: C.white, borderRadius: 10, padding: "8px 12px", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "#f0fdfa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 11, color: C.text }}>KI-Matching</div>
                <div style={{ fontSize: 10, color: C.teal, fontWeight: 600 }}>34 Matches heute</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "clamp(24px, 4vw, 32px)", color: C.text, margin: "0 0 12px" }}>
            Alles für deinen Recruiting-Alltag
          </h2>
          <p style={{ fontSize: 15, color: C.muted, maxWidth: 500, margin: "0 auto" }}>
            Entwickelt für Sachbearbeiter, die täglich damit arbeiten — schnell, übersichtlich, augenschonend.
          </p>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ background: C.white, borderRadius: 8, padding: "22px", border: `1px solid ${C.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 15, color: C.text, margin: "0 0 8px" }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dark CTA strip ── */}
      <section style={{ background: C.slate, padding: "48px 20px", margin: "20px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 24 }}
          className="md:flex-row md:items-center md:justify-between"
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.teal, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Für den täglichen Einsatz gebaut
            </div>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "clamp(20px, 3vw, 28px)", color: "#f1f5f9", margin: "0 0 12px" }}>
              5–6 Stunden täglich — ohne Augenmüdigkeit.
            </h2>
            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, margin: 0, maxWidth: 560 }}>
              WorkforZA ist für intensive Tagesnutzung optimiert: warmes Off-White statt grellem Weiß, gedämpfte Farben, klare Hierarchie. Kein visuelles Rauschen.
            </p>
          </div>
          <Link href="/login" style={{ padding: "13px 26px", borderRadius: 6, fontSize: 15, fontWeight: 600, color: C.slate, textDecoration: "none", background: C.teal, whiteSpace: "nowrap", flexShrink: 0 }}>
            Jetzt ausprobieren
          </Link>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 20px 64px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "clamp(24px, 4vw, 32px)", color: C.text, margin: "0 0 12px" }}>
            Transparente Preise
          </h2>
          <p style={{ fontSize: 15, color: C.muted }}>Kein Kleingedrucktes. Monatlich kündbar.</p>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {PLANS.map((plan) => (
            <div key={plan.name} style={{
              background: plan.highlight ? C.slate : C.white,
              borderRadius: 8, padding: "24px",
              border: plan.highlight ? `2px solid ${C.teal}` : `1px solid ${C.border}`,
              boxShadow: plan.highlight ? "0 8px 32px rgba(13,148,136,0.15)" : "0 1px 3px rgba(0,0,0,0.05)",
              position: "relative",
            }}>
              {plan.highlight && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: C.teal, color: "white", fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20, whiteSpace: "nowrap" }}>
                  Beliebtester Plan
                </div>
              )}
              <div style={{ fontSize: 12, fontWeight: 700, color: plan.highlight ? C.teal : C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{plan.name}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 32, color: plan.highlight ? "#f1f5f9" : C.text, marginBottom: 2 }}>
                {plan.price === "Auf Anfrage" ? plan.price : `${plan.price} €`}
              </div>
              <div style={{ fontSize: 12, color: plan.highlight ? "#64748b" : C.muted, marginBottom: 20 }}>{plan.desc}{plan.period}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: plan.highlight ? "#94a3b8" : C.muted }}>
                    <span style={{ color: C.teal, fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" style={{
                display: "block", textAlign: "center", padding: "10px 16px",
                borderRadius: 6, fontSize: 14, fontWeight: 600, textDecoration: "none",
                background: plan.highlight ? C.teal : "transparent",
                color: plan.highlight ? "white" : C.teal,
                border: plan.highlight ? "none" : `1.5px solid ${C.teal}`,
              }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}
        className="sm:flex-row sm:justify-between sm:text-left"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>⚡</div>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, color: C.text }}>WorkforZA</span>
        </div>
        <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>© 2026 WorkforZA GmbH. Alle Rechte vorbehalten.</p>
        <div style={{ display: "flex", gap: 16, fontSize: 12, color: C.muted }}>
          <a href="#" style={{ color: C.muted, textDecoration: "none" }}>Datenschutz</a>
          <a href="#" style={{ color: C.muted, textDecoration: "none" }}>Impressum</a>
          <a href="#" style={{ color: C.muted, textDecoration: "none" }}>AGB</a>
        </div>
      </footer>
    </div>
  );
}
