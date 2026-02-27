/*
 * WorkforZA – Unternehmenssuche für Personaldisponenten
 * "Focused Slate" Design
 *
 * Kernfunktionen:
 * - Firmen-Profil direkt versenden (an Kandidaten, per E-Mail)
 * - Kennzeichnung: HR intern / externer Recruiter / PDL
 * - Filter: Branche, Quelle, hohe Repost-Rate
 * - Firmen-Detailpanel: Ansprechpartner, offene Stellen, Repost-Rate
 * - Schnellaktionen: Anrufen, E-Mail, Profil senden, zur Liste
 * KEIN "Bewerben"-Button — das ist ein Disponenten-Werkzeug!
 */
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import {
  Search, Building2, MapPin, Users, Briefcase,
  Phone, Mail, Send, BookmarkPlus, ExternalLink,
  X, ChevronDown, RefreshCw, AlertTriangle, Filter
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

const COMPANIES = [
  {
    id: 1, name: "Amazon Logistik GmbH", branche: "Logistik & Transport",
    ort: "Dortmund, NRW", groesse: "10.000+", offeneStellen: 234, repostRate: 61,
    quelle: "hr", recruiterName: null as string | null,
    beschreibung: "Eines der größten Logistikzentren Deutschlands. Sucht kontinuierlich Staplerfahrer, Lagerhelfer und Schichtleiter.",
    kontakt: { name: "Petra Hoffmann", rolle: "HR Business Partner", email: "p.hoffmann@amazon.de", phone: "+49 231 55512300" },
    stellen: ["Staplerfahrer (m/w/d)", "Lagerhelfer Nachtschicht", "Schichtleiter Logistik", "Kommissionierer"],
    qualifikationen: ["Staplerschein", "Schichtbereitschaft", "Körperliche Belastbarkeit"],
  },
  {
    id: 2, name: "Securitas Deutschland AG", branche: "Sicherheit",
    ort: "Berlin, BE", groesse: "5.000–10.000", offeneStellen: 128, repostRate: 82,
    quelle: "recruiter", recruiterName: "Sicherheits-Recruiter GmbH",
    beschreibung: "Führendes Sicherheitsunternehmen. Hohe Repost-Rate deutet auf Besetzungsprobleme hin — gute Chance für Personaldienstleister.",
    kontakt: { name: "Markus Berger", rolle: "Externer Recruiter", email: "m.berger@sicherheits-recruiter.de", phone: "+49 30 9988776" },
    stellen: ["Sicherheitsmitarbeiter §34a", "Objektschutz Nacht", "Veranstaltungssicherheit", "Pfortendienst"],
    qualifikationen: ["§34a Sachkundenachweis", "Führerschein B", "Nachtschichtbereitschaft"],
  },
  {
    id: 3, name: "Caritas Köln", branche: "Pflege & Gesundheit",
    ort: "Köln, NRW", groesse: "1.000–5.000", offeneStellen: 167, repostRate: 78,
    quelle: "pdl", recruiterName: "Pflegepersonal24 GmbH",
    beschreibung: "Gemeinnütziger Träger mit 12 Pflegeeinrichtungen in Köln. Dauerhaft hoher Bedarf an examinierten Pflegekräften.",
    kontakt: { name: "Claudia Meier", rolle: "Pflegedienstleitung", email: "c.meier@caritas-koeln.de", phone: "+49 221 2010" },
    stellen: ["Pflegefachkraft Altenpflege", "Pflegehilfskraft", "Wohnbereichsleitung", "Nachtpflegekraft"],
    qualifikationen: ["Examen Altenpflege/Krankenpflege", "Schichtbereitschaft", "Wochenendbereitschaft"],
  },
  {
    id: 4, name: "DB Schenker AG", branche: "Logistik & Transport",
    ort: "Hamburg, HH", groesse: "10.000+", offeneStellen: 143, repostRate: 39,
    quelle: "hr", recruiterName: null as string | null,
    beschreibung: "Internationaler Logistikkonzern. Sucht vor allem LKW-Fahrer Klasse C/CE für nationale und internationale Touren.",
    kontakt: { name: "HR-Team DB Schenker", rolle: "Recruiting", email: "jobs@dbschenker.com", phone: "+49 40 63620" },
    stellen: ["LKW-Fahrer CE", "Berufskraftfahrer national", "Disponent", "Lagerlogistiker"],
    qualifikationen: ["Führerschein C/CE", "Berufskraftfahrerqualifikation", "Erfahrung Fernverkehr"],
  },
  {
    id: 5, name: "Siemens Energy AG", branche: "Energie & Technik",
    ort: "Erlangen, BY", groesse: "10.000+", offeneStellen: 112, repostRate: 28,
    quelle: "hr", recruiterName: null as string | null,
    beschreibung: "Technologiekonzern im Bereich Energieversorgung. Sucht Elektriker und Techniker für Projekte weltweit.",
    kontakt: { name: "HR Siemens Energy", rolle: "Talent Acquisition", email: "jobs@siemens-energy.com", phone: "+49 9131 7-0" },
    stellen: ["Elektriker Energietechnik", "Servicetechniker", "Projektleiter Elektro", "Mechatroniker"],
    qualifikationen: ["Elektroausbildung", "Führerschein B", "Reisebereitschaft"],
  },
  {
    id: 6, name: "Helios Kliniken GmbH", branche: "Pflege & Gesundheit",
    ort: "Berlin, BE", groesse: "10.000+", offeneStellen: 94, repostRate: 71,
    quelle: "pdl", recruiterName: "MedPersonal GmbH",
    beschreibung: "Größter privater Krankenhausbetreiber Deutschlands. Chronischer Pflegekräftemangel — hohe Repost-Rate.",
    kontakt: { name: "MedPersonal GmbH", rolle: "PDL-Vermittlung", email: "kontakt@medpersonal.de", phone: "+49 30 88765432" },
    stellen: ["Gesundheits- und Krankenpfleger", "OP-Pflege", "Intensivpflege", "Stationsleitung"],
    qualifikationen: ["Examen Krankenpflege", "Fachweiterbildung (wünschenswert)", "Schichtbereitschaft"],
  },
  {
    id: 7, name: "Lidl Logistik GmbH", branche: "Handel & Logistik",
    ort: "Neckarsulm, BW", groesse: "5.000–10.000", offeneStellen: 98, repostRate: 35,
    quelle: "hr", recruiterName: null as string | null,
    beschreibung: "Zentrallager des Discounters Lidl. Sucht Staplerfahrer und Lagerhelfer für alle Schichten.",
    kontakt: { name: "Lidl Recruiting", rolle: "HR", email: "jobs@lidl.de", phone: "+49 7132 30-0" },
    stellen: ["Staplerfahrer Frühschicht", "Lagerhelfer Nacht", "Kommissionierer", "Teamleiter Lager"],
    qualifikationen: ["Staplerschein", "Schichtbereitschaft", "Zuverlässigkeit"],
  },
  {
    id: 8, name: "Rhenus Logistics GmbH", branche: "Logistik & Transport",
    ort: "Holzwickede, NRW", groesse: "1.000–5.000", offeneStellen: 76, repostRate: 44,
    quelle: "hr", recruiterName: null as string | null,
    beschreibung: "Mittelständischer Logistikdienstleister. Gutes Betriebsklima, faire Bezahlung, regelmäßige Suche.",
    kontakt: { name: "Sabine Koch", rolle: "Personalreferentin", email: "s.koch@rhenus.com", phone: "+49 2301 291-0" },
    stellen: ["Staplerfahrer", "Lagerlogistiker", "Speditionskaufmann", "Fahrer B"],
    qualifikationen: ["Staplerschein bevorzugt", "Führerschein B", "Teamfähigkeit"],
  },
];

type Company = typeof COMPANIES[0];

function quelleInfo(quelle: string, recruiterName: string | null) {
  if (quelle === "hr") return { label: "HR intern", color: s.green, bg: s.greenBg };
  if (quelle === "recruiter") return { label: `Recruiter: ${recruiterName}`, color: s.violet, bg: s.violetBg };
  return { label: `PDL: ${recruiterName}`, color: s.amber, bg: s.amberBg };
}

function repostInfo(rate: number) {
  if (rate >= 70) return { color: s.red, bg: s.redBg, label: "Kritisch" };
  if (rate >= 45) return { color: s.amber, bg: s.amberBg, label: "Erhöht" };
  return { color: s.green, bg: s.greenBg, label: "Normal" };
}

const BRANCHEN = ["Alle Branchen", "Logistik & Transport", "Pflege & Gesundheit", "Sicherheit", "Energie & Technik", "Handel & Logistik"];
const QUELLEN_OPT = ["Alle Quellen", "HR intern", "Recruiter", "PDL"];

export default function CompaniesPage() {
  const [query, setQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [filterBranche, setFilterBranche] = useState("Alle Branchen");
  const [filterQuelle, setFilterQuelle] = useState("Alle Quellen");
  const [filterHoheRepost, setFilterHoheRepost] = useState(false);
  const [showBrancheDrop, setShowBrancheDrop] = useState(false);
  const [showQuelleDrop, setShowQuelleDrop] = useState(false);

  const filtered = COMPANIES.filter((c) => {
    if (query && !c.name.toLowerCase().includes(query.toLowerCase()) && !c.ort.toLowerCase().includes(query.toLowerCase())) return false;
    if (filterBranche !== "Alle Branchen" && c.branche !== filterBranche) return false;
    if (filterQuelle === "HR intern" && c.quelle !== "hr") return false;
    if (filterQuelle === "Recruiter" && c.quelle !== "recruiter") return false;
    if (filterQuelle === "PDL" && c.quelle !== "pdl") return false;
    if (filterHoheRepost && c.repostRate < 70) return false;
    return true;
  });

  return (
    <AppLayout title="Unternehmen" subtitle="Firmendatenbank mit Profil-Versand & Quellenkennung">
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>

        {/* Search + filter bar */}
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${s.border}`, background: s.white, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <Search style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: s.muted }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Firmenname, Stadt..."
              style={{ width: "100%", padding: "8px 10px 8px 30px", borderRadius: 6, border: `1px solid ${s.border}`, fontSize: 13, color: s.text, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>

          <div style={{ position: "relative" }}>
            <button onClick={() => { setShowBrancheDrop(!showBrancheDrop); setShowQuelleDrop(false); }}
              style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${filterBranche !== "Alle Branchen" ? s.teal : s.border}`, background: filterBranche !== "Alle Branchen" ? s.tealBg : s.white, fontSize: 13, color: filterBranche !== "Alle Branchen" ? s.teal : s.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontWeight: filterBranche !== "Alle Branchen" ? 600 : 400 }}>
              <Briefcase style={{ width: 12, height: 12 }} />
              {filterBranche}
              <ChevronDown style={{ width: 11, height: 11 }} />
            </button>
            {showBrancheDrop && (
              <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, background: s.white, border: `1px solid ${s.border}`, borderRadius: 7, zIndex: 50, minWidth: 200, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                {BRANCHEN.map((b) => (
                  <button key={b} onClick={() => { setFilterBranche(b); setShowBrancheDrop(false); }}
                    style={{ display: "block", width: "100%", padding: "8px 12px", border: "none", background: b === filterBranche ? s.tealBg : "transparent", color: b === filterBranche ? s.teal : s.text, fontSize: 13, cursor: "pointer", textAlign: "left", fontWeight: b === filterBranche ? 600 : 400 }}>
                    {b}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: "relative" }}>
            <button onClick={() => { setShowQuelleDrop(!showQuelleDrop); setShowBrancheDrop(false); }}
              style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${filterQuelle !== "Alle Quellen" ? s.teal : s.border}`, background: filterQuelle !== "Alle Quellen" ? s.tealBg : s.white, fontSize: 13, color: filterQuelle !== "Alle Quellen" ? s.teal : s.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontWeight: filterQuelle !== "Alle Quellen" ? 600 : 400 }}>
              <Filter style={{ width: 12, height: 12 }} />
              {filterQuelle}
              <ChevronDown style={{ width: 11, height: 11 }} />
            </button>
            {showQuelleDrop && (
              <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, background: s.white, border: `1px solid ${s.border}`, borderRadius: 7, zIndex: 50, minWidth: 160, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                {QUELLEN_OPT.map((q) => (
                  <button key={q} onClick={() => { setFilterQuelle(q); setShowQuelleDrop(false); }}
                    style={{ display: "block", width: "100%", padding: "8px 12px", border: "none", background: q === filterQuelle ? s.tealBg : "transparent", color: q === filterQuelle ? s.teal : s.text, fontSize: 13, cursor: "pointer", textAlign: "left", fontWeight: q === filterQuelle ? 600 : 400 }}>
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => setFilterHoheRepost(!filterHoheRepost)}
            style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${filterHoheRepost ? s.red : s.border}`, background: filterHoheRepost ? s.redBg : s.white, fontSize: 13, color: filterHoheRepost ? s.red : s.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontWeight: filterHoheRepost ? 600 : 400 }}>
            <AlertTriangle style={{ width: 12, height: 12 }} />
            Hohe Repost-Rate
          </button>

          <div style={{ fontSize: 13, color: s.muted, marginLeft: "auto" }}>
            <strong style={{ color: s.text }}>{filtered.length}</strong> Firmen
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr", overflow: "hidden" }} className={selectedCompany ? "md:grid-cols-[1fr_420px]" : ""}>

          {/* Company list */}
          <div style={{ overflowY: "auto", padding: "12px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((company) => {
              const q = quelleInfo(company.quelle, company.recruiterName);
              const r = repostInfo(company.repostRate);
              const isSelected = selectedCompany?.id === company.id;
              return (
                <div key={company.id} onClick={() => setSelectedCompany(isSelected ? null : company)}
                  style={{ background: s.white, borderRadius: 8, border: `1px solid ${isSelected ? s.teal : s.border}`, borderLeft: `3px solid ${isSelected ? s.teal : "transparent"}`, padding: "13px 15px", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>

                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: s.text, marginBottom: 3 }}>{company.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: s.muted, flexWrap: "wrap" }}>
                        <MapPin style={{ width: 11, height: 11 }} /><span>{company.ort}</span>
                        <span>·</span>
                        <Users style={{ width: 11, height: 11 }} /><span>{company.groesse} MA</span>
                        <span>·</span>
                        <span style={{ color: s.teal, fontWeight: 600 }}>{company.branche}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 18, color: s.text }}>{company.offeneStellen}</div>
                      <div style={{ fontSize: 11, color: s.muted }}>offene Stellen</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: q.bg, color: q.color, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {q.label}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: r.bg, color: r.color, display: "flex", alignItems: "center", gap: 3 }}>
                      <RefreshCw style={{ width: 9, height: 9 }} />
                      Repost {company.repostRate}% — {r.label}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: s.muted, marginBottom: 9, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {company.beschreibung}
                  </div>

                  <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => toast.success(`Kandidaten-Profil wird an ${company.name} gesendet`)}
                      style={{ padding: "5px 10px", borderRadius: 5, border: "none", background: s.teal, color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      <Send style={{ width: 11, height: 11 }} /> Profil senden
                    </button>
                    <button onClick={() => toast.info("Zur Liste hinzugefügt")}
                      style={{ padding: "5px 10px", borderRadius: 5, border: `1px solid ${s.border}`, background: s.white, fontSize: 12, color: s.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      <BookmarkPlus style={{ width: 11, height: 11 }} /> Liste
                    </button>
                    <button onClick={() => toast.info("Anruf wird gestartet")}
                      style={{ padding: "5px 10px", borderRadius: 5, border: `1px solid ${s.border}`, background: s.white, fontSize: 12, color: s.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      <Phone style={{ width: 11, height: 11 }} /> Anrufen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          {selectedCompany && (
            <div style={{ borderLeft: `1px solid ${s.border}`, overflowY: "auto", background: s.white }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: s.text }}>Firmenprofil</div>
                <button onClick={() => setSelectedCompany(null)} style={{ background: "none", border: "none", cursor: "pointer", color: s.muted }}>
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
              <div style={{ padding: "16px" }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 17, color: s.text, marginBottom: 3 }}>{selectedCompany.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: s.muted, marginBottom: 10 }}>
                  <MapPin style={{ width: 11, height: 11 }} />{selectedCompany.ort}
                  <span>·</span>
                  <Users style={{ width: 11, height: 11 }} />{selectedCompany.groesse} MA
                </div>
                <div style={{ fontSize: 12.5, color: s.text, lineHeight: 1.65, marginBottom: 14 }}>{selectedCompany.beschreibung}</div>

                {/* Quelle & Repost info */}
                {(() => {
                  const q = quelleInfo(selectedCompany.quelle, selectedCompany.recruiterName);
                  const r = repostInfo(selectedCompany.repostRate);
                  return (
                    <div style={{ background: s.bg, borderRadius: 7, padding: "11px 13px", marginBottom: 14, border: `1px solid ${s.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: s.muted }}>QUELLE</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: q.bg, color: q.color }}>{q.label}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: s.muted }}>REPOST-RATE</span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: r.bg, color: r.color }}>{selectedCompany.repostRate}% — {r.label}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: s.muted }}>OFFENE STELLEN</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: s.teal }}>{selectedCompany.offeneStellen}</span>
                      </div>
                      {selectedCompany.repostRate >= 70 && (
                        <div style={{ marginTop: 8, padding: "6px 8px", borderRadius: 5, background: s.redBg, fontSize: 11, color: s.red, fontWeight: 600 }}>
                          ⚠ Kritische Repost-Rate — sehr schwer zu besetzen. Gute Chance für Personaldienstleister!
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Qualifikationen */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.muted, marginBottom: 7 }}>GESUCHTE QUALIFIKATIONEN</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {selectedCompany.qualifikationen.map((q) => (
                      <span key={q} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, background: s.tealBg, color: s.teal, border: `1px solid ${s.tealMid}`, fontWeight: 500 }}>{q}</span>
                    ))}
                  </div>
                </div>

                {/* Aktuelle Stellen */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.muted, marginBottom: 7 }}>AKTUELLE STELLEN</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {selectedCompany.stellen.map((stelle) => (
                      <div key={stelle} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 8px", borderRadius: 5, background: s.bg, fontSize: 12, color: s.text }}>
                        <Briefcase style={{ width: 11, height: 11, color: s.muted, flexShrink: 0 }} />
                        {stelle}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ansprechpartner */}
                <div style={{ background: s.tealBg, borderRadius: 7, padding: "11px 13px", marginBottom: 14, border: `1px solid ${s.tealMid}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.teal, marginBottom: 7 }}>ANSPRECHPARTNER</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: s.text }}>{selectedCompany.kontakt.name}</div>
                  <div style={{ fontSize: 11, color: s.muted, marginBottom: 5 }}>{selectedCompany.kontakt.rolle}</div>
                  <div style={{ fontSize: 12, color: s.muted, marginBottom: 2 }}>{selectedCompany.kontakt.email}</div>
                  <div style={{ fontSize: 12, color: s.muted }}>{selectedCompany.kontakt.phone}</div>
                </div>

                {/* Aktionen */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <button onClick={() => toast.success(`Kandidaten-Profil wird an ${selectedCompany.name} gesendet`)}
                    style={{ width: "100%", padding: "10px", borderRadius: 6, border: "none", background: s.teal, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <Send style={{ width: 14, height: 14 }} /> Kandidaten-Profil senden
                  </button>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                    <button onClick={() => toast.info("Anruf wird gestartet")}
                      style={{ padding: "8px", borderRadius: 6, border: `1px solid ${s.border}`, background: s.white, fontSize: 12, color: s.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      <Phone style={{ width: 12, height: 12 }} /> Anrufen
                    </button>
                    <button onClick={() => toast.info("E-Mail wird geöffnet")}
                      style={{ padding: "8px", borderRadius: 6, border: `1px solid ${s.border}`, background: s.white, fontSize: 12, color: s.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      <Mail style={{ width: 12, height: 12 }} /> E-Mail
                    </button>
                  </div>
                  <button onClick={() => toast.info("Zur Liste hinzugefügt")}
                    style={{ width: "100%", padding: "8px", borderRadius: 6, border: `1px solid ${s.border}`, background: s.white, fontSize: 12, color: s.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                    <BookmarkPlus style={{ width: 12, height: 12 }} /> Zur Liste hinzufügen
                  </button>
                  <button onClick={() => toast.info("Firmenprofil als PDF wird erstellt")}
                    style={{ width: "100%", padding: "8px", borderRadius: 6, border: `1px solid ${s.border}`, background: s.white, fontSize: 12, color: s.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                    <ExternalLink style={{ width: 12, height: 12 }} /> Profil als PDF exportieren
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
