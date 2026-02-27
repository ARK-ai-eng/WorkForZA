/*
 * WorkforZA – Stellensuche für Personaldisponenten
 * "Focused Slate" Design
 *
 * Kernfunktionen:
 * - Filter: FSK/§34a, Staplerschein, Führerschein, Schicht, Quelle (HR intern / Recruiter / PDL)
 * - Repost-Tracking: Wie oft & wann wurde die Stelle neu veröffentlicht?
 * - Quellenkennung: HR selbst, externer Recruiter/Berater, Personaldienstleister
 * - Disponenten-Aktionen: Kontakt, Profil senden, zur Liste, Originalanzeige
 * KEIN "Bewerben"-Button — das ist ein Disponenten-Werkzeug, kein Bewerberportal!
 */
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import {
  Search, RefreshCw, Building2, MapPin, Clock,
  AlertTriangle, ChevronDown, ChevronUp, Send, BookmarkPlus,
  Phone, ExternalLink, X, Filter, Download
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

const JOBS = [
  {
    id: 1,
    title: "Staplerfahrer (m/w/d)",
    company: "Amazon Logistik GmbH",
    location: "Dortmund, NRW",
    posted: "vor 3h",
    repostCount: 4,
    repostHistory: ["27.02.2026", "13.02.2026", "30.01.2026", "15.01.2026"],
    source: "hr",
    recruiterName: null as string | null,
    salary: "14,50–16,00 €/h",
    type: "Vollzeit",
    shift: ["Früh", "Spät", "Nacht"],
    fsk: false,
    staplerschein: true,
    fuehrerschein: ["Flurförderzeug"],
    urgent: true,
    description: "Gesucht werden zuverlässige Staplerfahrer für unser Logistikzentrum. Gültiger Staplerschein Pflicht.",
    contact: { name: "Petra Hoffmann", email: "p.hoffmann@amazon.de", phone: "+49 231 55512300" },
  },
  {
    id: 2,
    title: "Sicherheitsmitarbeiter (m/w/d) – Nachtschicht",
    company: "SecurePro GmbH",
    location: "Köln, NRW",
    posted: "vor 1d",
    repostCount: 7,
    repostHistory: ["26.02.2026", "12.02.2026", "29.01.2026", "15.01.2026", "01.01.2026", "18.12.2025", "04.12.2025"],
    source: "recruiter",
    recruiterName: "Markus Berger – Berger Personalberatung",
    salary: "13,00–15,00 €/h",
    type: "Vollzeit",
    shift: ["Nacht"],
    fsk: true,
    staplerschein: false,
    fuehrerschein: ["B"],
    urgent: false,
    description: "Für unseren Kunden suchen wir erfahrene Sicherheitsmitarbeiter mit gültigem §34a-Sachkundenachweis.",
    contact: { name: "Markus Berger", email: "m.berger@berger-personal.de", phone: "+49 221 9987654" },
  },
  {
    id: 3,
    title: "LKW-Fahrer Klasse C/CE (m/w/d)",
    company: "DB Schenker AG",
    location: "Hamburg, HH",
    posted: "vor 6h",
    repostCount: 1,
    repostHistory: ["27.02.2026"],
    source: "hr",
    recruiterName: null as string | null,
    salary: "2.800–3.400 €/Monat",
    type: "Vollzeit",
    shift: ["Früh", "Spät"],
    fsk: false,
    staplerschein: false,
    fuehrerschein: ["C", "CE"],
    urgent: false,
    description: "Wir suchen erfahrene LKW-Fahrer für nationale und internationale Touren. Klasse CE erforderlich.",
    contact: { name: "HR-Team DB Schenker", email: "jobs@dbschenker.com", phone: "+49 40 63620" },
  },
  {
    id: 4,
    title: "Pflegefachkraft (m/w/d) – Altenpflege",
    company: "Caritas Köln",
    location: "Köln, NRW",
    posted: "vor 2d",
    repostCount: 12,
    repostHistory: ["25.02.2026", "11.02.2026", "28.01.2026", "14.01.2026", "31.12.2025", "17.12.2025"],
    source: "pdl",
    recruiterName: "Pflegepersonal24 GmbH",
    salary: "2.900–3.600 €/Monat",
    type: "Vollzeit / Teilzeit",
    shift: ["Früh", "Spät", "Nacht", "Wochenende"],
    fsk: false,
    staplerschein: false,
    fuehrerschein: [] as string[],
    urgent: true,
    description: "Wir suchen examinierten Pflegefachkräfte für unser Seniorenzentrum. Examen Pflicht.",
    contact: { name: "Claudia Meier", email: "c.meier@caritas-koeln.de", phone: "+49 221 2010" },
  },
  {
    id: 5,
    title: "Elektriker / Elektroinstallateur (m/w/d)",
    company: "Siemens Energy AG",
    location: "Erlangen, BY",
    posted: "vor 4h",
    repostCount: 2,
    repostHistory: ["27.02.2026", "10.02.2026"],
    source: "hr",
    recruiterName: null as string | null,
    salary: "3.200–4.100 €/Monat",
    type: "Vollzeit",
    shift: ["Früh"],
    fsk: false,
    staplerschein: false,
    fuehrerschein: ["B"],
    urgent: false,
    description: "Für unsere Projekte im Bereich Energieversorgung suchen wir qualifizierte Elektriker.",
    contact: { name: "HR Siemens Energy", email: "jobs@siemens-energy.com", phone: "+49 9131 7-0" },
  },
  {
    id: 6,
    title: "Veranstaltungssicherheit (m/w/d) §34a",
    company: "EventSec Berlin",
    location: "Berlin, BE",
    posted: "vor 12h",
    repostCount: 3,
    repostHistory: ["27.02.2026", "20.02.2026", "13.02.2026"],
    source: "recruiter",
    recruiterName: "Sicherheits-Recruiter GmbH",
    salary: "14,00–17,00 €/h",
    type: "Minijob / Teilzeit",
    shift: ["Nacht", "Wochenende"],
    fsk: true,
    staplerschein: false,
    fuehrerschein: [] as string[],
    urgent: false,
    description: "Für Großveranstaltungen in Berlin suchen wir zuverlässige Sicherheitskräfte mit §34a-Nachweis.",
    contact: { name: "Team EventSec", email: "jobs@eventsec-berlin.de", phone: "+49 30 9988776" },
  },
];

type Job = typeof JOBS[0];

function sourceInfo(source: string, recruiterName: string | null) {
  if (source === "hr") return { label: "HR intern", color: s.green, bg: s.greenBg, tooltip: "Direkt vom Unternehmen veröffentlicht" };
  if (source === "recruiter") return { label: `Recruiter: ${recruiterName}`, color: s.violet, bg: s.violetBg, tooltip: "Externer Recruiter/Berater" };
  return { label: `PDL: ${recruiterName}`, color: s.amber, bg: s.amberBg, tooltip: "Personaldienstleister" };
}

function repostColor(count: number) {
  if (count >= 8) return { color: s.red, bg: s.redBg };
  if (count >= 4) return { color: s.amber, bg: s.amberBg };
  return { color: s.muted, bg: s.bg };
}

function RepostBadge({ count, history }: { count: number; history: string[] }) {
  const [open, setOpen] = useState(false);
  const { color, bg } = repostColor(count);
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 20, background: bg, border: `1px solid ${color}40`, fontSize: 11, fontWeight: 700, color, cursor: "pointer" }}>
        <RefreshCw style={{ width: 10, height: 10 }} />
        {count}× repostet
        {count >= 4 && <AlertTriangle style={{ width: 10, height: 10 }} />}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, background: s.white, border: `1px solid ${s.border}`, borderRadius: 7, padding: "10px 12px", zIndex: 50, minWidth: 190, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: s.muted, marginBottom: 6 }}>Veröffentlichungshistorie</div>
          {history.map((d, i) => (
            <div key={d} style={{ fontSize: 12, color: i === 0 ? s.text : s.muted, padding: "2px 0", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: i === 0 ? s.teal : s.border, flexShrink: 0 }} />
              {d} {i === 0 && <span style={{ fontSize: 10, color: s.teal, fontWeight: 600 }}>aktuell</span>}
            </div>
          ))}
          {count >= 4 && (
            <div style={{ marginTop: 8, padding: "6px 8px", borderRadius: 5, background: s.amberBg, fontSize: 11, color: s.amber, fontWeight: 600 }}>
              ⚠ Hohe Repost-Rate — schwer zu besetzen
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SourceBadge({ source, recruiterName }: { source: string; recruiterName: string | null }) {
  const info = sourceInfo(source, recruiterName);
  return (
    <span title={info.tooltip}
      style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 20, background: info.bg, fontSize: 11, fontWeight: 600, color: info.color, cursor: "help", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      {info.label}
    </span>
  );
}

export default function JobSearchPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [filterSource, setFilterSource] = useState<string[]>([]);
  const [filterShift, setFilterShift] = useState<string[]>([]);
  const [filterStaplerschein, setFilterStaplerschein] = useState(false);
  const [filterFsk, setFilterFsk] = useState(false);
  const [filterFuehrerschein, setFilterFuehrerschein] = useState<string[]>([]);
  const [filterUrgent, setFilterUrgent] = useState(false);
  const [filterErstveroeffentlichung, setFilterErstveroeffentlichung] = useState(false);

  const toggleArr = (arr: string[], val: string, setter: (v: string[]) => void) =>
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const filtered = JOBS.filter((job) => {
    if (query && !job.title.toLowerCase().includes(query.toLowerCase()) && !job.company.toLowerCase().includes(query.toLowerCase())) return false;
    if (location && !job.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (filterSource.length && !filterSource.includes(job.source)) return false;
    if (filterShift.length && !filterShift.some((sh) => job.shift.includes(sh))) return false;
    if (filterStaplerschein && !job.staplerschein) return false;
    if (filterFsk && !job.fsk) return false;
    if (filterFuehrerschein.length && !filterFuehrerschein.some((f) => job.fuehrerschein.includes(f))) return false;
    if (filterUrgent && !job.urgent) return false;
    if (filterErstveroeffentlichung && job.repostCount > 1) return false;
    return true;
  });

  const activeFilterCount = [
    filterSource.length, filterShift.length,
    filterStaplerschein ? 1 : 0, filterFsk ? 1 : 0,
    filterFuehrerschein.length, filterUrgent ? 1 : 0,
    filterErstveroeffentlichung ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const resetFilters = () => {
    setFilterSource([]); setFilterShift([]); setFilterStaplerschein(false);
    setFilterFsk(false); setFilterFuehrerschein([]); setFilterUrgent(false);
    setFilterErstveroeffentlichung(false);
  };

  return (
    <AppLayout title="Stellensuche" subtitle="Disponenten-Werkzeug — Repost-Tracking & Quellenkennung">
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>

        {/* Search bar */}
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${s.border}`, background: s.white, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: 180, position: "relative" }}>
            <Search style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: s.muted }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Berufsbezeichnung, Unternehmen..."
              style={{ width: "100%", padding: "8px 10px 8px 30px", borderRadius: 6, border: `1px solid ${s.border}`, fontSize: 13, color: s.text, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: 1, minWidth: 140, position: "relative" }}>
            <MapPin style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: s.muted }} />
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Stadt, PLZ..."
              style={{ width: "100%", padding: "8px 10px 8px 30px", borderRadius: 6, border: `1px solid ${s.border}`, fontSize: 13, color: s.text, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            style={{ padding: "8px 13px", borderRadius: 6, border: `1px solid ${activeFilterCount > 0 ? s.teal : s.border}`, background: activeFilterCount > 0 ? s.tealBg : s.white, fontSize: 13, color: activeFilterCount > 0 ? s.teal : s.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontWeight: activeFilterCount > 0 ? 600 : 400, whiteSpace: "nowrap" }}>
            <Filter style={{ width: 13, height: 13 }} />
            Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
            {showFilters ? <ChevronUp style={{ width: 11, height: 11 }} /> : <ChevronDown style={{ width: 11, height: 11 }} />}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={resetFilters} style={{ padding: "8px 10px", borderRadius: 6, border: `1px solid ${s.border}`, background: s.white, fontSize: 12, color: s.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <X style={{ width: 12, height: 12 }} /> Reset
            </button>
          )}
          <div style={{ fontSize: 13, color: s.muted, whiteSpace: "nowrap", marginLeft: "auto" }}>
            <strong style={{ color: s.text }}>{filtered.length}</strong> Stellen
          </div>
          <button onClick={() => {
            const header = "Titel;Unternehmen;Ort;Quelle;Recruiter;Reposts;Letzte Veröffentlichung;Schicht;Skills";
            const rows = filtered.map((j) =>
              `${j.title};${j.company};${j.location};${j.source};${j.recruiterName ?? "–"};${j.repostCount};${j.repostHistory[0] ?? "–"};${j.shift.join("/")};${[j.staplerschein ? "Staplerschein" : "", j.fsk ? "§34a" : "", ...j.fuehrerschein.map((f) => `FS-${f}`)].filter(Boolean).join(", ")}`
            );
            const csv = [header, ...rows].join("\n");
            const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `workforza_stellen_${new Date().toISOString().slice(0,10)}.csv`;
            a.click(); URL.revokeObjectURL(url);
            toast.success(`${filtered.length} Stellen als CSV exportiert`);
          }}
            style={{ padding: "7px 12px", borderRadius: 6, border: `1px solid ${s.teal}`, background: s.tealBg, color: s.teal, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
            <Download style={{ width: 12, height: 12 }} /> CSV Export
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div style={{ padding: "10px 18px", borderBottom: `1px solid ${s.border}`, background: "#fafafa", display: "flex", flexWrap: "wrap", gap: 18, alignItems: "flex-start" }}>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: s.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Quelle</div>
              <div style={{ display: "flex", gap: 4 }}>
                {([["hr", "HR intern", s.green], ["recruiter", "Recruiter", s.violet], ["pdl", "PDL", s.amber]] as const).map(([val, label, color]) => (
                  <button key={val} onClick={() => toggleArr(filterSource, val, setFilterSource)}
                    style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${filterSource.includes(val) ? color : s.border}`, background: filterSource.includes(val) ? `${color}18` : s.white, fontSize: 12, fontWeight: 600, color: filterSource.includes(val) ? color : s.muted, cursor: "pointer" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: s.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Schicht</div>
              <div style={{ display: "flex", gap: 4 }}>
                {["Früh", "Spät", "Nacht", "Wochenende"].map((shift) => (
                  <button key={shift} onClick={() => toggleArr(filterShift, shift, setFilterShift)}
                    style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${filterShift.includes(shift) ? s.teal : s.border}`, background: filterShift.includes(shift) ? s.tealBg : s.white, fontSize: 12, fontWeight: filterShift.includes(shift) ? 600 : 400, color: filterShift.includes(shift) ? s.teal : s.muted, cursor: "pointer" }}>
                    {shift}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: s.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Qualifikation</div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setFilterStaplerschein(!filterStaplerschein)}
                  style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${filterStaplerschein ? s.teal : s.border}`, background: filterStaplerschein ? s.tealBg : s.white, fontSize: 12, fontWeight: filterStaplerschein ? 600 : 400, color: filterStaplerschein ? s.teal : s.muted, cursor: "pointer" }}>
                  🔑 Staplerschein
                </button>
                <button onClick={() => setFilterFsk(!filterFsk)}
                  style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${filterFsk ? s.violet : s.border}`, background: filterFsk ? s.violetBg : s.white, fontSize: 12, fontWeight: filterFsk ? 600 : 400, color: filterFsk ? s.violet : s.muted, cursor: "pointer" }}>
                  🛡 §34a / FSK
                </button>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: s.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Führerschein</div>
              <div style={{ display: "flex", gap: 4 }}>
                {["B", "C", "CE", "Flurförderzeug"].map((fs) => (
                  <button key={fs} onClick={() => toggleArr(filterFuehrerschein, fs, setFilterFuehrerschein)}
                    style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${filterFuehrerschein.includes(fs) ? s.teal : s.border}`, background: filterFuehrerschein.includes(fs) ? s.tealBg : s.white, fontSize: 12, fontWeight: filterFuehrerschein.includes(fs) ? 600 : 400, color: filterFuehrerschein.includes(fs) ? s.teal : s.muted, cursor: "pointer" }}>
                    {fs}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: s.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Sonstiges</div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setFilterUrgent(!filterUrgent)}
                  style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${filterUrgent ? s.red : s.border}`, background: filterUrgent ? s.redBg : s.white, fontSize: 12, fontWeight: filterUrgent ? 600 : 400, color: filterUrgent ? s.red : s.muted, cursor: "pointer" }}>
                  🔥 Dringend
                </button>
                <button onClick={() => setFilterErstveroeffentlichung(!filterErstveroeffentlichung)}
                  style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${filterErstveroeffentlichung ? s.teal : s.border}`, background: filterErstveroeffentlichung ? s.tealBg : s.white, fontSize: 12, fontWeight: filterErstveroeffentlichung ? 600 : 400, color: filterErstveroeffentlichung ? s.teal : s.muted, cursor: "pointer" }}>
                  ✨ Erstveröffentlichung
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Content area */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr", overflow: "hidden" }} className={selectedJob ? "md:grid-cols-[1fr_420px]" : ""}>

          {/* Job list */}
          <div style={{ overflowY: "auto", padding: "12px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 24px", color: s.muted, fontSize: 14 }}>
                Keine Stellen gefunden. Filter anpassen.
              </div>
            )}
            {filtered.map((job) => (
              <div key={job.id} onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                style={{ background: s.white, borderRadius: 8, border: `1px solid ${selectedJob?.id === job.id ? s.teal : s.border}`, borderLeft: `3px solid ${selectedJob?.id === job.id ? s.teal : "transparent"}`, padding: "13px 15px", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "border-color 0.1s" }}>

                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 7 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                      {job.urgent && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 20, background: s.redBg, color: s.red, flexShrink: 0 }}>DRINGEND</span>
                      )}
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: s.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.title}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: s.muted, flexWrap: "wrap" }}>
                      <Building2 style={{ width: 11, height: 11 }} /><span>{job.company}</span>
                      <span>·</span>
                      <MapPin style={{ width: 11, height: 11 }} /><span>{job.location}</span>
                      <span>·</span>
                      <Clock style={{ width: 11, height: 11 }} /><span>{job.posted}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: s.text }}>{job.salary}</div>
                    <div style={{ fontSize: 11, color: s.muted }}>{job.type}</div>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center", marginBottom: 9 }}>
                  <SourceBadge source={job.source} recruiterName={job.recruiterName} />
                  <RepostBadge count={job.repostCount} history={job.repostHistory} />
                  {job.shift.map((sh) => (
                    <span key={sh} style={{ fontSize: 11, padding: "2px 7px", borderRadius: 20, background: s.bg, color: s.muted, border: `1px solid ${s.border}` }}>{sh}</span>
                  ))}
                  {job.staplerschein && <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 20, background: "#fef3c7", color: "#92400e", fontWeight: 600 }}>🔑 Staplerschein</span>}
                  {job.fsk && <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 20, background: s.violetBg, color: s.violet, fontWeight: 600 }}>🛡 §34a</span>}
                  {job.fuehrerschein.map((fs) => (
                    <span key={fs} style={{ fontSize: 11, padding: "2px 7px", borderRadius: 20, background: s.bg, color: s.muted, border: `1px solid ${s.border}` }}>FS {fs}</span>
                  ))}
                </div>

                {/* Quick actions — kein "Bewerben"! */}
                <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => toast.success("Kandidaten-Profil wird an Firma gesendet")}
                    style={{ padding: "5px 10px", borderRadius: 5, border: "none", background: s.teal, color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <Send style={{ width: 11, height: 11 }} /> Profil senden
                  </button>
                  <button onClick={() => toast.info("Zur Liste hinzugefügt")}
                    style={{ padding: "5px 10px", borderRadius: 5, border: `1px solid ${s.border}`, background: s.white, fontSize: 12, color: s.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <BookmarkPlus style={{ width: 11, height: 11 }} /> Liste
                  </button>
                  <button onClick={() => toast.info("Originalanzeige wird geöffnet")}
                    style={{ padding: "5px 10px", borderRadius: 5, border: `1px solid ${s.border}`, background: s.white, fontSize: 12, color: s.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <ExternalLink style={{ width: 11, height: 11 }} /> Original
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {selectedJob && (
            <div style={{ borderLeft: `1px solid ${s.border}`, overflowY: "auto", background: s.white }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: s.text }}>Stellendetails</div>
                <button onClick={() => setSelectedJob(null)} style={{ background: "none", border: "none", cursor: "pointer", color: s.muted }}>
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
              <div style={{ padding: "16px" }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 16, color: s.text, marginBottom: 3 }}>{selectedJob.title}</div>
                <div style={{ fontSize: 13, color: s.muted, marginBottom: 14 }}>{selectedJob.company} · {selectedJob.location}</div>

                {/* Source & Repost info box */}
                <div style={{ background: s.bg, borderRadius: 7, padding: "11px 13px", marginBottom: 14, border: `1px solid ${s.border}`, display: "flex", flexDirection: "column", gap: 7 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: s.muted }}>QUELLE</span>
                    <SourceBadge source={selectedJob.source} recruiterName={selectedJob.recruiterName} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: s.muted }}>REPOST-HISTORY</span>
                    <RepostBadge count={selectedJob.repostCount} history={selectedJob.repostHistory} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: s.muted }}>VERÖFFENTLICHT</span>
                    <span style={{ fontSize: 12, color: s.text }}>{selectedJob.posted}</span>
                  </div>
                  {selectedJob.repostCount >= 4 && (
                    <div style={{ padding: "6px 8px", borderRadius: 5, background: s.amberBg, fontSize: 11, color: s.amber, fontWeight: 600 }}>
                      ⚠ Diese Stelle wird seit Wochen repostet — hoher Besetzungsdruck
                    </div>
                  )}
                </div>

                {/* Details grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 14 }}>
                  {[
                    ["Gehalt", selectedJob.salary],
                    ["Beschäftigung", selectedJob.type],
                    ["Schicht", selectedJob.shift.join(", ")],
                    ["Staplerschein", selectedJob.staplerschein ? "✅ Erforderlich" : "Nicht nötig"],
                    ["§34a / FSK", selectedJob.fsk ? "✅ Erforderlich" : "Nicht nötig"],
                    ["Führerschein", selectedJob.fuehrerschein.length ? selectedJob.fuehrerschein.join(", ") : "Nicht nötig"],
                  ].map(([label, val]) => (
                    <div key={label} style={{ background: s.bg, borderRadius: 6, padding: "8px 10px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: s.muted, marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: s.text }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.muted, marginBottom: 5 }}>BESCHREIBUNG</div>
                  <div style={{ fontSize: 13, color: s.text, lineHeight: 1.65 }}>{selectedJob.description}</div>
                </div>

                {/* Contact */}
                <div style={{ background: s.tealBg, borderRadius: 7, padding: "11px 13px", marginBottom: 14, border: `1px solid ${s.tealMid}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.teal, marginBottom: 7 }}>ANSPRECHPARTNER</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: s.text, marginBottom: 3 }}>{selectedJob.contact.name}</div>
                  <div style={{ fontSize: 12, color: s.muted, marginBottom: 2 }}>{selectedJob.contact.email}</div>
                  <div style={{ fontSize: 12, color: s.muted }}>{selectedJob.contact.phone}</div>
                </div>

                {/* Disponenten-Aktionen — kein "Bewerben"! */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <button onClick={() => toast.success("Kandidaten-Profil wird an Firma gesendet")}
                    style={{ width: "100%", padding: "10px", borderRadius: 6, border: "none", background: s.teal, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <Send style={{ width: 14, height: 14 }} /> Kandidaten-Profil senden
                  </button>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                    <button onClick={() => toast.info("Anruf wird gestartet")}
                      style={{ padding: "8px", borderRadius: 6, border: `1px solid ${s.border}`, background: s.white, fontSize: 12, color: s.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      <Phone style={{ width: 12, height: 12 }} /> Anrufen
                    </button>
                    <button onClick={() => toast.info("Zur Liste hinzugefügt")}
                      style={{ padding: "8px", borderRadius: 6, border: `1px solid ${s.border}`, background: s.white, fontSize: 12, color: s.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      <BookmarkPlus style={{ width: 12, height: 12 }} /> Zur Liste
                    </button>
                  </div>
                  <button onClick={() => toast.info("Originalanzeige wird geöffnet")}
                    style={{ width: "100%", padding: "8px", borderRadius: 6, border: `1px solid ${s.border}`, background: s.white, fontSize: 12, color: s.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                    <ExternalLink style={{ width: 12, height: 12 }} /> Originalanzeige öffnen
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
