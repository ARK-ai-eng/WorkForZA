/**
 * WorkforZA – Kandidaten-Pipeline
 * "Focused Slate" Design
 *
 * Workflow für Personaldisponenten:
 * - Kandidaten verwalten mit Status (Neu, In Vermittlung, Im Gespräch, Platziert, Pausiert)
 * - Verfügbarkeitsdatum sichtbar — Warnung wenn < 7 Tage
 * - Direkt zum KI-Matching weiterleiten
 * - Notizen, Qualifikationen, Wunschgehalt
 * - Schnellfilter nach Status, Verfügbarkeit, Qualifikation
 */
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import {
  User, Sparkles, Phone, Mail, MapPin, Clock,
  AlertTriangle, CheckCircle, Pause, Search,
  ChevronDown, Plus, X, Edit2, Send
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const s = {
  teal: "#0D9488", tealBg: "#f0fdfa",
  text: "#1e293b", muted: "#64748b", border: "#e2e8f0",
  white: "#ffffff", bg: "#F4F5F7",
  amber: "#d97706", amberBg: "#fffbeb",
  red: "#dc2626", redBg: "#fef2f2",
  green: "#059669", greenBg: "#ecfdf5",
  violet: "#7c3aed", violetBg: "#f5f3ff",
  blue: "#0ea5e9", blueBg: "#f0f9ff",
};

type Status = "neu" | "vermittlung" | "gespraech" | "platziert" | "pausiert";

interface Kandidat {
  id: number;
  name: string;
  alter: number;
  beruf: string;
  erfahrung: string;
  qualifikationen: string[];
  wunschgehalt: string;
  wunschort: string;
  verfuegbar: string; // ISO date or "sofort"
  verfuegbarDays: number; // -1 = sofort, 0+ = days until available
  schicht: string[];
  status: Status;
  notizen: string;
  email: string;
  phone: string;
  matchScore?: number;
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  neu:         { label: "Neu",          color: s.blue,   bg: s.blueBg,   icon: User },
  vermittlung: { label: "In Vermittlung", color: s.amber, bg: s.amberBg, icon: Clock },
  gespraech:   { label: "Im Gespräch",  color: s.violet, bg: s.violetBg, icon: Send },
  platziert:   { label: "Platziert",    color: s.green,  bg: s.greenBg,  icon: CheckCircle },
  pausiert:    { label: "Pausiert",     color: s.muted,  bg: "#f1f5f9",  icon: Pause },
};

const KANDIDATEN: Kandidat[] = [
  {
    id: 1, name: "Thomas K.", alter: 34, beruf: "Staplerfahrer / Lagerlogistiker",
    erfahrung: "8 Jahre", qualifikationen: ["Staplerschein", "Führerschein B", "Schichtbereitschaft"],
    wunschgehalt: "14–16 €/h", wunschort: "Dortmund, Köln, Duisburg",
    verfuegbar: "sofort", verfuegbarDays: -1, schicht: ["Früh", "Spät", "Nacht"],
    status: "vermittlung", notizen: "Sucht Festanstellung. Bevorzugt Logistik.",
    email: "thomas.k@mail.de", phone: "+49 231 44556677", matchScore: 92,
  },
  {
    id: 2, name: "Maria S.", alter: 42, beruf: "Pflegefachkraft (examiniert)",
    erfahrung: "15 Jahre", qualifikationen: ["Examen Altenpflege", "Wundmanagement", "Schichtbereitschaft"],
    wunschgehalt: "2.900–3.400 €", wunschort: "Köln, Bonn",
    verfuegbar: "01.04.2026", verfuegbarDays: 33, schicht: ["Früh", "Spät"],
    status: "gespraech", notizen: "Keine Nachtschicht. Teilzeit möglich (30h).",
    email: "maria.s@mail.de", phone: "+49 221 99887766", matchScore: 87,
  },
  {
    id: 3, name: "Kevin B.", alter: 28, beruf: "LKW-Fahrer CE",
    erfahrung: "5 Jahre", qualifikationen: ["Führerschein CE", "ADR-Schein", "Fahrerqualifikation"],
    wunschgehalt: "16–18 €/h", wunschort: "Hamburg, Bremen, Hannover",
    verfuegbar: "10.03.2026", verfuegbarDays: 11, schicht: ["Früh", "Spät"],
    status: "neu", notizen: "Fernverkehr bevorzugt. Keine Wochenendarbeit.",
    email: "kevin.b@mail.de", phone: "+49 40 11223344",
  },
  {
    id: 4, name: "Sandra W.", alter: 38, beruf: "Sicherheitsmitarbeiterin §34a",
    erfahrung: "10 Jahre", qualifikationen: ["§34a Sachkundenachweis", "Führerschein B", "Erste Hilfe"],
    wunschgehalt: "13–15 €/h", wunschort: "Berlin, Potsdam",
    verfuegbar: "05.03.2026", verfuegbarDays: 6, schicht: ["Früh", "Spät", "Nacht"],
    status: "vermittlung", notizen: "Sucht Objektschutz oder Veranstaltungssicherheit.",
    email: "sandra.w@mail.de", phone: "+49 30 55443322", matchScore: 78,
  },
  {
    id: 5, name: "Ali D.", alter: 31, beruf: "Elektriker / Elektroinstallateur",
    erfahrung: "7 Jahre", qualifikationen: ["Gesellenbrief Elektro", "Führerschein B", "SPS-Kenntnisse"],
    wunschgehalt: "18–22 €/h", wunschort: "München, Augsburg",
    verfuegbar: "sofort", verfuegbarDays: -1, schicht: ["Früh"],
    status: "platziert", notizen: "Platziert bei Siemens AG ab 01.03.2026.",
    email: "ali.d@mail.de", phone: "+49 89 66778899",
  },
  {
    id: 6, name: "Petra H.", alter: 55, beruf: "Altenpflegerin",
    erfahrung: "20 Jahre", qualifikationen: ["Examen Altenpflege", "Palliativpflege", "Demenzbetreuung"],
    wunschgehalt: "2.600–3.000 €", wunschort: "Frankfurt, Wiesbaden",
    verfuegbar: "15.03.2026", verfuegbarDays: 16, schicht: ["Früh", "Spät"],
    status: "neu", notizen: "Sucht Teilzeit (25h). Keine Nachtschicht.",
    email: "petra.h@mail.de", phone: "+49 69 22334455",
  },
  {
    id: 7, name: "Marco F.", alter: 26, beruf: "Lagerhelfer / Kommissionierer",
    erfahrung: "3 Jahre", qualifikationen: ["Körperliche Belastbarkeit", "Staplerschein in Ausbildung"],
    wunschgehalt: "12–14 €/h", wunschort: "Stuttgart, Ulm",
    verfuegbar: "sofort", verfuegbarDays: -1, schicht: ["Früh", "Spät", "Nacht"],
    status: "pausiert", notizen: "Vorübergehend nicht verfügbar — Familienangelegenheit.",
    email: "marco.f@mail.de", phone: "+49 711 33445566",
  },
];

const STATUS_ORDER: Status[] = ["neu", "vermittlung", "gespraech", "platziert", "pausiert"];

function verfuegbarLabel(days: number): { text: string; color: string; bg: string; warn: boolean } {
  if (days === -1) return { text: "Sofort verfügbar", color: s.green, bg: s.greenBg, warn: false };
  if (days <= 7) return { text: `Verfügbar in ${days} Tagen`, color: s.red, bg: s.redBg, warn: true };
  if (days <= 14) return { text: `Verfügbar in ${days} Tagen`, color: s.amber, bg: s.amberBg, warn: false };
  return { text: `Ab ${days} Tagen`, color: s.muted, bg: "#f1f5f9", warn: false };
}

export default function PipelinePage() {
  const [kandidaten, setKandidaten] = useState(KANDIDATEN);
  const [selected, setSelected] = useState<Kandidat | null>(null);
  const [filterStatus, setFilterStatus] = useState<Status | "alle">("alle");
  const [filterVerfuegbar, setFilterVerfuegbar] = useState<"alle" | "sofort" | "bald">("alle");
  const [search, setSearch] = useState("");
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [, navigate] = useLocation();

  const filtered = kandidaten.filter((k) => {
    const matchSearch = !search || k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.beruf.toLowerCase().includes(search.toLowerCase()) ||
      k.qualifikationen.some((q) => q.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === "alle" || k.status === filterStatus;
    const matchVerfuegbar = filterVerfuegbar === "alle" ||
      (filterVerfuegbar === "sofort" && k.verfuegbarDays === -1) ||
      (filterVerfuegbar === "bald" && k.verfuegbarDays >= 0 && k.verfuegbarDays <= 14);
    return matchSearch && matchStatus && matchVerfuegbar;
  });

  const changeStatus = (id: number, newStatus: Status) => {
    setKandidaten((prev) => prev.map((k) => k.id === id ? { ...k, status: newStatus } : k));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status: newStatus } : null);
    toast.success(`Status auf "${STATUS_CONFIG[newStatus].label}" gesetzt`);
  };

  const statusCounts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = kandidaten.filter((k) => k.status === s).length;
    return acc;
  }, {} as Record<Status, number>);

  return (
    <AppLayout title="Kandidaten-Pipeline" subtitle={`${kandidaten.length} Kandidaten · ${kandidaten.filter(k => k.verfuegbarDays === -1 || k.verfuegbarDays <= 7).length} sofort/bald verfügbar`}>
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", overflow: "hidden" }}>

        {/* Status-Übersicht */}
        <div style={{ padding: "12px 18px 0", background: s.white, borderBottom: `1px solid ${s.border}` }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12 }}>
            <button onClick={() => setFilterStatus("alle")}
              style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${filterStatus === "alle" ? s.teal : s.border}`, background: filterStatus === "alle" ? s.tealBg : s.white, color: filterStatus === "alle" ? s.teal : s.text, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
              Alle ({kandidaten.length})
            </button>
            {STATUS_ORDER.map((st) => {
              const cfg = STATUS_CONFIG[st];
              const Icon = cfg.icon;
              const active = filterStatus === st;
              return (
                <button key={st} onClick={() => setFilterStatus(st)}
                  style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${active ? cfg.color : s.border}`, background: active ? cfg.bg : s.white, color: active ? cfg.color : s.text, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
                  <Icon style={{ width: 12, height: 12 }} />
                  {cfg.label} ({statusCounts[st]})
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter-Leiste */}
        <div style={{ padding: "10px 18px", background: s.white, borderBottom: `1px solid ${s.border}`, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: s.muted }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, Beruf oder Qualifikation suchen…"
              style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 7, border: `1px solid ${s.border}`, fontSize: 13, color: s.text, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { key: "alle", label: "Alle Verfügbarkeiten" },
              { key: "sofort", label: "Sofort verfügbar" },
              { key: "bald", label: "In ≤14 Tagen" },
            ].map((opt) => (
              <button key={opt.key} onClick={() => setFilterVerfuegbar(opt.key as typeof filterVerfuegbar)}
                style={{ padding: "7px 12px", borderRadius: 6, border: `1px solid ${filterVerfuegbar === opt.key ? s.teal : s.border}`, background: filterVerfuegbar === opt.key ? s.tealBg : s.white, color: filterVerfuegbar === opt.key ? s.teal : s.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={() => toast.info("Feature: Neuen Kandidaten anlegen")}
            style={{ marginLeft: "auto", padding: "7px 14px", borderRadius: 7, background: s.teal, color: s.white, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus style={{ width: 14, height: 14 }} /> Kandidat anlegen
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr", overflow: "hidden" }} className={selected ? "md:grid-cols-[1fr_420px]" : ""}>

          {/* Kandidaten-Liste */}
          <div style={{ overflowY: "auto", padding: "12px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: s.muted }}>
                <User style={{ width: 40, height: 40, margin: "0 auto 12px", opacity: 0.3 }} />
                <div style={{ fontSize: 15, fontWeight: 600 }}>Keine Kandidaten gefunden</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Filter anpassen oder neuen Kandidaten anlegen</div>
              </div>
            )}
            {filtered.map((k) => {
              const cfg = STATUS_CONFIG[k.status];
              const StatusIcon = cfg.icon;
              const verf = verfuegbarLabel(k.verfuegbarDays);
              const isSelected = selected?.id === k.id;
              return (
                <div key={k.id} onClick={() => setSelected(isSelected ? null : k)}
                  style={{ background: s.white, borderRadius: 9, border: `1.5px solid ${isSelected ? s.teal : s.border}`, padding: "13px 15px", cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s", boxShadow: isSelected ? `0 0 0 2px ${s.teal}22` : "none" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    {/* Avatar */}
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: cfg.bg, border: `2px solid ${cfg.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: cfg.color }}>{k.name.split(" ").map(n => n[0]).join("")}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: s.text }}>{k.name}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: cfg.bg, color: cfg.color, display: "flex", alignItems: "center", gap: 4 }}>
                          <StatusIcon style={{ width: 10, height: 10 }} />{cfg.label}
                        </span>
                        {k.matchScore && (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: s.tealBg, color: s.teal }}>
                            ⚡ {k.matchScore}% Match
                          </span>
                        )}
                        {verf.warn && (
                          <span style={{ fontSize: 11, fontWeight: 600, color: s.red, display: "flex", alignItems: "center", gap: 3 }}>
                            <AlertTriangle style={{ width: 11, height: 11 }} /> Bald verfügbar!
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: s.muted, marginTop: 2 }}>{k.beruf} · {k.erfahrung} Erfahrung</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: verf.bg, color: verf.color, fontWeight: 600 }}>
                          <Clock style={{ width: 10, height: 10, display: "inline", marginRight: 3 }} />{verf.text}
                        </span>
                        <span style={{ fontSize: 11, color: s.muted, display: "flex", alignItems: "center", gap: 3 }}>
                          <MapPin style={{ width: 10, height: 10 }} />{k.wunschort.split(",")[0]}
                        </span>
                        <span style={{ fontSize: 11, color: s.muted }}>{k.wunschgehalt}</span>
                      </div>
                      <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
                        {k.qualifikationen.slice(0, 3).map((q) => (
                          <span key={q} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: "#f1f5f9", color: s.muted, fontWeight: 500 }}>{q}</span>
                        ))}
                        {k.qualifikationen.length > 3 && (
                          <span style={{ fontSize: 10, color: s.muted }}>+{k.qualifikationen.length - 3}</span>
                        )}
                      </div>
                    </div>
                    {/* Quick actions */}
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={(e) => { e.stopPropagation(); navigate("/matching"); toast.success(`KI-Matching für ${k.name} gestartet`); }}
                        style={{ width: 32, height: 32, borderRadius: 7, background: s.tealBg, border: `1px solid ${s.teal}33`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                        title="KI-Matching starten">
                        <Sparkles style={{ width: 14, height: 14, color: s.teal }} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); toast.success(`E-Mail an ${k.name} geöffnet`); }}
                        style={{ width: 32, height: 32, borderRadius: 7, background: "#f1f5f9", border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                        title="E-Mail senden">
                        <Mail style={{ width: 14, height: 14, color: s.muted }} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail-Panel */}
          {selected && (
            <div style={{ borderLeft: `1px solid ${s.border}`, background: s.white, overflowY: "auto", display: "flex", flexDirection: "column" }}>
              {/* Header */}
              <div style={{ padding: "16px 18px", borderBottom: `1px solid ${s.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: STATUS_CONFIG[selected.status].bg, border: `2px solid ${STATUS_CONFIG[selected.status].color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: STATUS_CONFIG[selected.status].color }}>{selected.name.split(" ").map(n => n[0]).join("")}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: s.text }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: s.muted }}>{selected.beruf} · {selected.alter} Jahre</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${s.border}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <X style={{ width: 14, height: 14, color: s.muted }} />
                </button>
              </div>

              <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Status ändern */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.muted, textTransform: "uppercase", marginBottom: 8 }}>Status</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {STATUS_ORDER.map((st) => {
                      const cfg = STATUS_CONFIG[st];
                      const Icon = cfg.icon;
                      const active = selected.status === st;
                      return (
                        <button key={st} onClick={() => changeStatus(selected.id, st)}
                          style={{ padding: "5px 10px", borderRadius: 20, border: `1.5px solid ${active ? cfg.color : s.border}`, background: active ? cfg.bg : "transparent", color: active ? cfg.color : s.muted, fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                          <Icon style={{ width: 10, height: 10 }} />{cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Verfügbarkeit */}
                {(() => {
                  const verf = verfuegbarLabel(selected.verfuegbarDays);
                  return (
                    <div style={{ padding: "10px 13px", borderRadius: 8, background: verf.bg, border: `1px solid ${verf.color}33` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {verf.warn && <AlertTriangle style={{ width: 14, height: 14, color: verf.color }} />}
                        <Clock style={{ width: 14, height: 14, color: verf.color }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: verf.color }}>{verf.text}</span>
                      </div>
                      {verf.warn && <div style={{ fontSize: 11, color: verf.color, marginTop: 4 }}>Jetzt handeln — Verfügbarkeit läuft bald ab!</div>}
                    </div>
                  );
                })()}

                {/* Kontakt */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.muted, textTransform: "uppercase", marginBottom: 8 }}>Kontakt</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: s.text }}>
                      <Mail style={{ width: 13, height: 13, color: s.muted }} />{selected.email}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: s.text }}>
                      <Phone style={{ width: 13, height: 13, color: s.muted }} />{selected.phone}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: s.text }}>
                      <MapPin style={{ width: 13, height: 13, color: s.muted }} />{selected.wunschort}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.muted, textTransform: "uppercase", marginBottom: 8 }}>Details</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { label: "Erfahrung", value: selected.erfahrung },
                      { label: "Wunschgehalt", value: selected.wunschgehalt },
                      { label: "Schicht", value: selected.schicht.join(", ") },
                      { label: "Alter", value: `${selected.alter} Jahre` },
                    ].map((item) => (
                      <div key={item.label} style={{ padding: "8px 10px", borderRadius: 7, background: s.bg }}>
                        <div style={{ fontSize: 10, color: s.muted, fontWeight: 600, textTransform: "uppercase" }}>{item.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: s.text, marginTop: 2 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Qualifikationen */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.muted, textTransform: "uppercase", marginBottom: 8 }}>Qualifikationen</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {selected.qualifikationen.map((q) => (
                      <span key={q} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, background: s.tealBg, color: s.teal, fontWeight: 600 }}>{q}</span>
                    ))}
                  </div>
                </div>

                {/* Notizen */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.muted, textTransform: "uppercase", marginBottom: 8 }}>Notizen</div>
                  <div style={{ padding: "10px 12px", borderRadius: 7, background: s.bg, fontSize: 13, color: s.text, lineHeight: 1.5 }}>{selected.notizen}</div>
                </div>

                {/* Aktionen */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button onClick={() => { navigate("/matching"); toast.success(`KI-Matching für ${selected.name} gestartet`); }}
                    style={{ padding: "10px", borderRadius: 8, background: s.teal, color: s.white, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                    <Sparkles style={{ width: 15, height: 15 }} /> KI-Matching starten
                  </button>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button onClick={() => toast.success(`E-Mail an ${selected.name}`)}
                      style={{ padding: "9px", borderRadius: 8, background: s.bg, color: s.text, border: `1px solid ${s.border}`, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Mail style={{ width: 13, height: 13 }} /> E-Mail
                    </button>
                    <button onClick={() => toast.success(`Profil von ${selected.name} wird gesendet`)}
                      style={{ padding: "9px", borderRadius: 8, background: s.bg, color: s.text, border: `1px solid ${s.border}`, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Send style={{ width: 13, height: 13 }} /> Profil senden
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
