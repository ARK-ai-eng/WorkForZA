/*
 * WorkforZA – KI-Kandidaten-Matching
 * "Focused Slate" Design
 *
 * Workflow für Personaldisponenten:
 * 1. Kandidaten-Profil aus Pipeline wählen oder manuell eingeben
 * 2. KI analysiert Qualifikationen und findet passende offene Stellen
 * 3. Disponent sieht Match-Score, KI-Begründung, Repost-Rate, Quelle
 * 4. Disponent sendet Kandidaten-Profil direkt an die Firma
 *
 * KEIN "Bewerben"-Button — der Disponent vermittelt, er bewirbt sich nicht!
 */
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import {
  Sparkles, User, Building2, MapPin, Send,
  BookmarkPlus, CheckCircle, X, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

const s = {
  teal: "#0D9488", tealBg: "#f0fdfa", tealMid: "#99f6e4",
  text: "#1e293b", muted: "#64748b", border: "#e2e8f0",
  white: "#ffffff", bg: "#F4F5F7",
  amber: "#d97706", amberBg: "#fffbeb",
  red: "#dc2626", redBg: "#fef2f2",
  green: "#059669", greenBg: "#ecfdf5",
  violet: "#7c3aed", violetBg: "#f5f3ff",
};

const DEMO_PROFILES = [
  {
    id: 1,
    name: "Thomas K.",
    alter: 34,
    beruf: "Staplerfahrer / Lagerlogistiker",
    erfahrung: "8 Jahre",
    qualifikationen: ["Staplerschein", "Führerschein B", "Schichtbereitschaft", "Körperliche Belastbarkeit"],
    wunschgehalt: "14–16 €/h",
    wunschort: "Dortmund, Köln, Duisburg",
    verfuegbar: "sofort",
    schicht: ["Früh", "Spät", "Nacht"],
    notizen: "Sucht Festanstellung. Bevorzugt Logistik.",
  },
  {
    id: 2,
    name: "Maria S.",
    alter: 42,
    beruf: "Pflegefachkraft (examiniert)",
    erfahrung: "15 Jahre",
    qualifikationen: ["Examen Altenpflege", "Wundmanagement", "Schichtbereitschaft", "Wochenendbereitschaft"],
    wunschgehalt: "2.900–3.400 €",
    wunschort: "Köln, Bonn",
    verfuegbar: "ab 01.04.2026",
    schicht: ["Früh", "Spät"],
    notizen: "Keine Nachtschicht. Teilzeit möglich (30h).",
  },
];

const MATCH_RESULTS: Record<number, Array<{
  id: number; firma: string; stelle: string; ort: string;
  score: number; begruendung: string; gehalt: string;
  repostRate: number; quelle: string;
}>> = {
  1: [
    { id: 1, firma: "Amazon Logistik GmbH", stelle: "Staplerfahrer (m/w/d)", ort: "Dortmund, NRW", score: 97, begruendung: "Staplerschein vorhanden, Schichtbereitschaft passt, Gehalt im Zielbereich, Standort Wunschregion.", gehalt: "14,50–16,00 €/h", repostRate: 61, quelle: "hr" },
    { id: 2, firma: "Lidl Logistik GmbH", stelle: "Staplerfahrer Frühschicht", ort: "Dortmund, NRW", score: 91, begruendung: "Staplerschein und Frühschicht-Präferenz passen. Gehalt leicht unter Wunsch.", gehalt: "13,50–15,00 €/h", repostRate: 35, quelle: "hr" },
    { id: 3, firma: "Rhenus Logistics GmbH", stelle: "Lagerlogistiker", ort: "Holzwickede, NRW", score: 84, begruendung: "Erfahrung in Logistik passt gut. Staplerschein bevorzugt, nicht Pflicht.", gehalt: "13,00–15,50 €/h", repostRate: 44, quelle: "hr" },
    { id: 4, firma: "DB Schenker AG", stelle: "Lagerlogistiker", ort: "Dortmund, NRW", score: 79, begruendung: "Standort passt, Erfahrung relevant. Führerschein B vorhanden.", gehalt: "14,00–15,50 €/h", repostRate: 39, quelle: "hr" },
  ],
  2: [
    { id: 1, firma: "Caritas Köln", stelle: "Pflegefachkraft Altenpflege", ort: "Köln, NRW", score: 96, begruendung: "Examen Altenpflege, Standort Wunschregion, Teilzeit möglich. Keine Nachtschicht erforderlich.", gehalt: "2.900–3.200 €", repostRate: 78, quelle: "pdl" },
    { id: 2, firma: "Helios Kliniken GmbH", stelle: "Gesundheits- und Krankenpfleger", ort: "Köln, NRW", score: 88, begruendung: "Examen passt, Standort Wunschregion. Wochenendbereitschaft vorhanden.", gehalt: "3.000–3.500 €", repostRate: 71, quelle: "pdl" },
    { id: 3, firma: "AWO Bonn", stelle: "Pflegefachkraft (30h)", ort: "Bonn, NRW", score: 82, begruendung: "Teilzeit 30h möglich, Standort Bonn im Wunschbereich.", gehalt: "2.600–3.000 €", repostRate: 55, quelle: "hr" },
  ],
};

function scoreColor(score: number) {
  if (score >= 90) return { color: s.green, bg: s.greenBg };
  if (score >= 75) return { color: s.teal, bg: s.tealBg };
  if (score >= 60) return { color: s.amber, bg: s.amberBg };
  return { color: s.muted, bg: s.bg };
}

function repostColor(rate: number) {
  if (rate >= 70) return s.red;
  if (rate >= 45) return s.amber;
  return s.green;
}

function quelleLabel(q: string) {
  if (q === "hr") return "HR intern";
  if (q === "recruiter") return "Recruiter";
  return "PDL";
}

type Profile = typeof DEMO_PROFILES[0];

export default function PerformanceMatchingPage() {
  const [step, setStep] = useState<"select" | "analyzing" | "results">("select");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [manualName, setManualName] = useState("");
  const [manualBeruf, setManualBeruf] = useState("");
  const [manualQual, setManualQual] = useState("");
  const [manualOrt, setManualOrt] = useState("");

  const startAnalysis = (profile: Profile) => {
    setSelectedProfile(profile);
    setSelectedMatch(null);
    setStep("analyzing");
    setTimeout(() => setStep("results"), 2200);
  };

  const startManualAnalysis = () => {
    if (!manualBeruf.trim()) { toast.error("Bitte Berufsbezeichnung eingeben"); return; }
    const fakeProfile: Profile = {
      id: 99, name: manualName || "Kandidat", alter: 0,
      beruf: manualBeruf, erfahrung: "unbekannt",
      qualifikationen: manualQual.split(",").map((q) => q.trim()).filter(Boolean),
      wunschgehalt: "–", wunschort: manualOrt || "flexibel",
      verfuegbar: "sofort", schicht: ["Früh", "Spät"], notizen: "",
    };
    startAnalysis(fakeProfile);
  };

  const matches = selectedProfile ? (MATCH_RESULTS[selectedProfile.id] ?? MATCH_RESULTS[1]) : [];

  return (
    <AppLayout title="KI-Kandidaten-Matching" subtitle="Passende Stellen für Kandidaten finden — Profil direkt an Firmen senden">
      <div style={{ padding: "20px 24px", overflowY: "auto", height: "calc(100vh - 64px)" }}>

        {/* ── Schritt 1: Profil auswählen ── */}
        {step === "select" && (
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: 14, background: s.tealBg, marginBottom: 12 }}>
                <Sparkles style={{ width: 24, height: 24, color: s.teal }} />
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 20, color: s.text, marginBottom: 6 }}>
                Kandidaten-Profil auswählen
              </div>
              <div style={{ fontSize: 13.5, color: s.muted, maxWidth: 460, margin: "0 auto" }}>
                Wähle ein Kandidaten-Profil aus deiner Pipeline — die KI findet die besten passenden Stellen aus über 3,4 Mio. Angeboten.
              </div>
            </div>

            {/* Pipeline-Profile */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: s.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Kandidaten aus deiner Pipeline</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {DEMO_PROFILES.map((profile) => (
                  <div key={profile.id}
                    style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "border-color 0.15s" }}
                    onClick={() => startAnalysis(profile)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: "50%", background: s.tealBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <User style={{ width: 18, height: 18, color: s.teal }} />
                      </div>
                      <div>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: s.text }}>{profile.name}</div>
                        <div style={{ fontSize: 12, color: s.muted, marginBottom: 5 }}>{profile.beruf} · {profile.erfahrung} · verfügbar {profile.verfuegbar}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {profile.qualifikationen.slice(0, 3).map((q) => (
                            <span key={q} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 20, background: s.tealBg, color: s.teal, border: `1px solid ${s.tealMid}` }}>{q}</span>
                          ))}
                          {profile.qualifikationen.length > 3 && (
                            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 20, background: s.bg, color: s.muted }}>+{profile.qualifikationen.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: s.muted }}>Wunschort</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: s.text }}>{profile.wunschort.split(",")[0]}</div>
                        <div style={{ fontSize: 11, color: s.muted, marginTop: 2 }}>{profile.wunschgehalt}</div>
                      </div>
                      <div style={{ padding: "8px 14px", borderRadius: 6, background: s.teal, color: "white", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                        <Sparkles style={{ width: 12, height: 12 }} /> Matchen
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manuelle Eingabe */}
            <div style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: s.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Neues Profil manuell eingeben</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                {[
                  { label: "Name (optional)", val: manualName, set: setManualName, ph: "z.B. Max M." },
                  { label: "Berufsbezeichnung *", val: manualBeruf, set: setManualBeruf, ph: "z.B. Staplerfahrer" },
                  { label: "Qualifikationen (kommagetrennt)", val: manualQual, set: setManualQual, ph: "Staplerschein, Führerschein B, ..." },
                  { label: "Wunschort", val: manualOrt, set: setManualOrt, ph: "z.B. Dortmund, Köln" },
                ].map(({ label, val, set, ph }) => (
                  <div key={label}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: s.muted, display: "block", marginBottom: 4 }}>{label}</label>
                    <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 5, border: `1px solid ${s.border}`, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box", color: s.text }} />
                  </div>
                ))}
              </div>
              <button onClick={startManualAnalysis}
                style={{ padding: "9px 18px", borderRadius: 6, border: "none", background: s.teal, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Sparkles style={{ width: 14, height: 14 }} /> KI-Matching starten
              </button>
            </div>
          </div>
        )}

        {/* ── Schritt 2: Analysiere ── */}
        {step === "analyzing" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: s.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles style={{ width: 28, height: 28, color: s.teal, animation: "spin 1.5s linear infinite" }} />
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 18, color: s.text }}>KI analysiert Kandidaten-Profil...</div>
            <div style={{ fontSize: 13, color: s.muted, textAlign: "center", maxWidth: 360 }}>
              Profil von <strong>{selectedProfile?.name}</strong> wird mit {">"}3,4 Mio. Stellenanzeigen abgeglichen.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 300 }}>
              {["Qualifikationen analysieren", "Standort-Matching", "Gehaltsabgleich", "Repost-Rate berücksichtigen", "Ergebnisse sortieren"].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: s.muted }}>
                  <CheckCircle style={{ width: 14, height: 14, color: s.teal }} />{item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Schritt 3: Ergebnisse ── */}
        {step === "results" && selectedProfile && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => { setStep("select"); setSelectedProfile(null); setSelectedMatch(null); }}
                  style={{ background: "none", border: `1px solid ${s.border}`, borderRadius: 6, padding: "6px 10px", fontSize: 12, color: s.muted, cursor: "pointer" }}>
                  ← Zurück
                </button>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, color: s.text }}>
                    Matching-Ergebnisse für {selectedProfile.name}
                  </div>
                  <div style={{ fontSize: 12, color: s.muted }}>{selectedProfile.beruf} · {matches.length} passende Stellen</div>
                </div>
              </div>
              <span style={{ padding: "5px 12px", borderRadius: 20, background: s.tealBg, fontSize: 12, fontWeight: 700, color: s.teal, border: `1px solid ${s.tealMid}` }}>
                ✓ KI-Analyse abgeschlossen
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, alignItems: "start" }} className={selectedMatch !== null ? "lg:grid-cols-[1fr_380px]" : ""}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                {/* Kandidaten-Zusammenfassung */}
                <div style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "14px 16px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: s.tealBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <User style={{ width: 20, height: 20, color: s.teal }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: s.text, marginBottom: 2 }}>{selectedProfile.name}</div>
                    <div style={{ fontSize: 12, color: s.muted, marginBottom: 6 }}>{selectedProfile.beruf} · {selectedProfile.erfahrung} · verfügbar {selectedProfile.verfuegbar}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {selectedProfile.qualifikationen.map((q) => (
                        <span key={q} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: s.tealBg, color: s.teal, border: `1px solid ${s.tealMid}` }}>{q}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: s.muted }}>Wunschgehalt</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: s.text }}>{selectedProfile.wunschgehalt}</div>
                    <div style={{ fontSize: 11, color: s.muted, marginTop: 3 }}>Wunschort</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: s.text }}>{selectedProfile.wunschort}</div>
                  </div>
                </div>

                {/* Match-Karten */}
                {matches.map((match, idx) => {
                  const sc = scoreColor(match.score);
                  const isSelected = selectedMatch === match.id;
                  return (
                    <div key={match.id} onClick={() => setSelectedMatch(isSelected ? null : match.id)}
                      style={{ background: s.white, borderRadius: 8, border: `1px solid ${isSelected ? s.teal : s.border}`, borderLeft: `3px solid ${isSelected ? s.teal : sc.color}`, padding: "13px 15px", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: sc.bg, color: sc.color }}>{match.score}% Match</span>
                            {idx === 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: s.tealBg, color: s.teal }}>⭐ Bester Match</span>}
                          </div>
                          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: s.text }}>{match.stelle}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: s.muted }}>
                            <Building2 style={{ width: 11, height: 11 }} />{match.firma}
                            <span>·</span>
                            <MapPin style={{ width: 11, height: 11 }} />{match.ort}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: s.text }}>{match.gehalt}</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: repostColor(match.repostRate), display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end", marginTop: 2 }}>
                            <RefreshCw style={{ width: 9, height: 9 }} /> Repost {match.repostRate}%
                          </div>
                          <div style={{ fontSize: 10, color: s.muted, marginTop: 2 }}>{quelleLabel(match.quelle)}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: s.muted, lineHeight: 1.55, marginBottom: 9 }}>
                        <strong style={{ color: s.text }}>KI:</strong> {match.begruendung}
                      </div>
                      <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => toast.success(`Profil von ${selectedProfile.name} wird an ${match.firma} gesendet`)}
                          style={{ padding: "5px 10px", borderRadius: 5, border: "none", background: s.teal, color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                          <Send style={{ width: 11, height: 11 }} /> Profil senden
                        </button>
                        <button onClick={() => toast.info("Zur Liste hinzugefügt")}
                          style={{ padding: "5px 10px", borderRadius: 5, border: `1px solid ${s.border}`, background: s.white, fontSize: 12, color: s.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                          <BookmarkPlus style={{ width: 11, height: 11 }} /> Liste
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detail-Panel */}
              {selectedMatch !== null && (() => {
                const match = matches.find((m) => m.id === selectedMatch);
                if (!match) return null;
                const sc = scoreColor(match.score);
                return (
                  <div style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, position: "sticky", top: 0 }}>
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: s.text }}>Match-Details</div>
                      <button onClick={() => setSelectedMatch(null)} style={{ background: "none", border: "none", cursor: "pointer", color: s.muted }}>
                        <X style={{ width: 16, height: 16 }} />
                      </button>
                    </div>
                    <div style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                        <div style={{ width: 80, height: 80, borderRadius: "50%", background: sc.bg, border: `3px solid ${sc.color}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 22, color: sc.color }}>{match.score}%</div>
                          <div style={{ fontSize: 10, color: sc.color, fontWeight: 600 }}>Match</div>
                        </div>
                      </div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, color: s.text, marginBottom: 3 }}>{match.stelle}</div>
                      <div style={{ fontSize: 12, color: s.muted, marginBottom: 14 }}>{match.firma} · {match.ort}</div>
                      <div style={{ background: s.tealBg, borderRadius: 7, padding: "10px 12px", marginBottom: 14, border: `1px solid ${s.tealMid}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: s.teal, marginBottom: 5 }}>KI-BEGRÜNDUNG</div>
                        <div style={{ fontSize: 12.5, color: s.text, lineHeight: 1.65 }}>{match.begruendung}</div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                        {[
                          ["Gehalt", match.gehalt],
                          ["Repost-Rate", `${match.repostRate}%`],
                          ["Quelle", quelleLabel(match.quelle)],
                          ["Verfügbar", selectedProfile.verfuegbar],
                        ].map(([label, val]) => (
                          <div key={label} style={{ background: s.bg, borderRadius: 6, padding: "8px 10px" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: s.muted, marginBottom: 2 }}>{label}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: s.text }}>{val}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        <button onClick={() => toast.success(`Profil von ${selectedProfile.name} wird an ${match.firma} gesendet`)}
                          style={{ width: "100%", padding: "10px", borderRadius: 6, border: "none", background: s.teal, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <Send style={{ width: 14, height: 14 }} /> Kandidaten-Profil senden
                        </button>
                        <button onClick={() => toast.info("Zur Liste hinzugefügt")}
                          style={{ width: "100%", padding: "8px", borderRadius: 6, border: `1px solid ${s.border}`, background: s.white, fontSize: 12, color: s.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                          <BookmarkPlus style={{ width: 12, height: 12 }} /> Zur Liste hinzufügen
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  );
}
