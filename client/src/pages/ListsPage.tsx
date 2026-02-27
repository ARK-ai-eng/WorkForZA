/*
 * WorkforZA Listen – "Focused Slate"
 * Gespeicherte Suchen und Job-Listen verwalten
 */
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Plus, Trash2, Search, Bookmark, Download, Edit2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const s = { teal: "#0D9488", tealBg: "#f0fdfa", text: "#1e293b", muted: "#64748b", border: "#e2e8f0", white: "#ffffff", bg: "#F4F5F7" };

const SAVED_SEARCHES = [
  { id: 1, name: "Java Developer München", query: "Java Developer", location: "München", filters: "Vollzeit, Remote", count: 234, lastRun: "vor 2h", alert: true },
  { id: 2, name: "Pflegekräfte NRW", query: "Pflegefachkraft", location: "NRW", filters: "Vollzeit, Teilzeit", count: 1890, lastRun: "vor 5h", alert: true },
  { id: 3, name: "IT-Projektleiter DACH", query: "IT-Projektleiter", location: "DACH", filters: "Vollzeit, Senior", count: 456, lastRun: "vor 1d", alert: false },
  { id: 4, name: "React Developer Remote", query: "React Developer", location: "Deutschland", filters: "Remote, Vollzeit", count: 312, lastRun: "vor 2d", alert: false },
];

const JOB_LISTS = [
  { id: 1, name: "Top IT-Kandidaten Feb 2026", jobs: 12, created: "20.02.2026", color: s.teal },
  { id: 2, name: "Pflegestellen Köln", jobs: 8, created: "18.02.2026", color: "#7c3aed" },
  { id: 3, name: "Vertrieb Stuttgart", jobs: 5, created: "15.02.2026", color: "#d97706" },
  { id: 4, name: "Backup-Kandidaten", jobs: 23, created: "10.02.2026", color: "#059669" },
];

const LIST_JOBS = [
  { id: 1, title: "Senior Java Developer", company: "SAP SE", location: "Walldorf, BW", added: "vor 2d" },
  { id: 2, title: "IT-Projektleiter", company: "Siemens AG", location: "München, BY", added: "vor 3d" },
  { id: 3, title: "DevOps Engineer", company: "Deutsche Telekom", location: "Bonn, NRW", added: "vor 4d" },
];

export default function ListsPage() {
  const [activeTab, setActiveTab] = useState<"searches" | "lists">("searches");
  const [selectedList, setSelectedList] = useState<typeof JOB_LISTS[0] | null>(null);
  const [searches, setSearches] = useState(SAVED_SEARCHES);
  const [lists, setLists] = useState(JOB_LISTS);
  const [newListName, setNewListName] = useState("");

  const deleteSearch = (id: number) => {
    setSearches((prev) => prev.filter((item) => item.id !== id));
    toast.success("Suche gelöscht");
  };

  const deleteList = (id: number) => {
    setLists((prev) => prev.filter((item) => item.id !== id));
    if (selectedList?.id === id) setSelectedList(null);
    toast.success("Liste gelöscht");
  };

  const createList = () => {
    if (!newListName.trim()) return;
    const newList = { id: Date.now(), name: newListName, jobs: 0, created: new Date().toLocaleDateString("de-DE"), color: s.teal };
    setLists((prev) => [...prev, newList]);
    setNewListName("");
    toast.success(`Liste "${newListName}" erstellt`);
  };

  return (
    <AppLayout title="Listen & Suchen" subtitle="Gespeicherte Suchen und Job-Listen verwalten">
      <div style={{ padding: 24 }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 20, background: s.bg, borderRadius: 8, padding: 4, width: "fit-content", border: `1px solid ${s.border}` }}>
          {(["searches", "lists"] as const).map((tab) => {
            const label = tab === "searches" ? "Gespeicherte Suchen" : "Job-Listen";
            const count = tab === "searches" ? searches.length : lists.length;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: "7px 16px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", background: activeTab === tab ? s.white : "transparent", color: activeTab === tab ? s.text : s.muted, boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.08)" : "none", display: "flex", alignItems: "center", gap: 6 }}>
                {label}
                <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 10, background: activeTab === tab ? s.tealBg : "transparent", color: activeTab === tab ? s.teal : s.muted, fontWeight: 700 }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Saved Searches */}
        {activeTab === "searches" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {searches.map((search) => (
              <div key={search.id} style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: s.tealBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Search style={{ width: 15, height: 15, color: s.teal }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: s.text, marginBottom: 3 }}>{search.name}</div>
                  <div style={{ fontSize: 12, color: s.muted }}>"{search.query}" · {search.location} · {search.filters}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s.teal }}>{search.count.toLocaleString("de-DE")}</div>
                    <div style={{ fontSize: 11, color: s.muted }}>Ergebnisse</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: s.muted }}>{search.lastRun}</div>
                    <div style={{ fontSize: 11, color: search.alert ? s.teal : s.muted, fontWeight: search.alert ? 600 : 400 }}>
                      {search.alert ? "Alert aktiv" : "Kein Alert"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => toast.info("Suche wird ausgeführt")}
                      style={{ padding: "6px 12px", borderRadius: 5, border: "none", background: s.teal, color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      Ausführen
                    </button>
                    <button onClick={() => toast.info("Suche wird bearbeitet")}
                      style={{ padding: "6px 8px", borderRadius: 5, border: `1px solid ${s.border}`, background: s.white, color: s.muted, cursor: "pointer" }}>
                      <Edit2 style={{ width: 12, height: 12 }} />
                    </button>
                    <button onClick={() => deleteSearch(search.id)}
                      style={{ padding: "6px 8px", borderRadius: 5, border: `1px solid ${s.border}`, background: s.white, color: "#dc2626", cursor: "pointer" }}>
                      <Trash2 style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {searches.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 24px", color: s.muted, fontSize: 14 }}>
                Keine gespeicherten Suchen. Führe eine Suche aus und speichere sie.
              </div>
            )}
          </div>
        )}

        {/* Job Lists */}
        {activeTab === "lists" && (
          <div>
            {/* Create new list */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                placeholder="Neue Liste erstellen..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createList()}
                style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: `1px solid ${s.border}`, fontSize: 13, color: s.text, outline: "none", fontFamily: "inherit" }}
              />
              <button onClick={createList}
                style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: s.teal, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Plus style={{ width: 13, height: 13 }} /> Erstellen
              </button>
            </div>

            {!selectedList ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                {lists.map((list) => (
                  <div key={list.id}
                    style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "16px 18px", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${list.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Bookmark style={{ width: 15, height: 15, color: list.color }} />
                      </div>
                      <button onClick={() => deleteList(list.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: s.muted, padding: 2 }}>
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: s.text, marginBottom: 4 }}>{list.name}</div>
                    <div style={{ fontSize: 12, color: s.muted, marginBottom: 12 }}>{list.jobs} Stellen · Erstellt {list.created}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => toast.info("Export wird vorbereitet")}
                        style={{ flex: 1, padding: "6px", borderRadius: 5, border: `1px solid ${s.border}`, background: s.white, fontSize: 12, color: s.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                        <Download style={{ width: 11, height: 11 }} /> Export
                      </button>
                      <button onClick={() => setSelectedList(list)}
                        style={{ flex: 1, padding: "6px", borderRadius: 5, border: "none", background: list.color, color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                        Öffnen <ChevronRight style={{ width: 11, height: 11 }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, alignItems: "start" }} className="md:grid-cols-[260px_1fr]">
                {/* Sidebar */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {lists.map((list) => (
                    <div key={list.id} onClick={() => setSelectedList(list)}
                      style={{ padding: "10px 12px", borderRadius: 7, cursor: "pointer", background: selectedList.id === list.id ? s.tealBg : s.white, border: `1px solid ${selectedList.id === list.id ? s.teal : s.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: list.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: s.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{list.name}</div>
                        <div style={{ fontSize: 11, color: s.muted }}>{list.jobs} Stellen</div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setSelectedList(null)}
                    style={{ padding: "8px", borderRadius: 6, border: `1px solid ${s.border}`, background: s.white, fontSize: 12, color: s.muted, cursor: "pointer", marginTop: 4 }}>
                    ← Alle Listen
                  </button>
                </div>

                {/* Detail */}
                <div style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ padding: "14px 18px", borderBottom: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, color: s.text }}>{selectedList.name}</div>
                      <div style={{ fontSize: 12, color: s.muted }}>{selectedList.jobs} Stellen · Erstellt {selectedList.created}</div>
                    </div>
                    <button onClick={() => {
                        const header = "Titel;Unternehmen;Ort;Hinzugefügt";
                        const rows = LIST_JOBS.map((j) => `${j.title};${j.company};${j.location};${j.added}`);
                        const csv = [header, ...rows].join("\n");
                        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `workforza_liste_${selectedList!.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0,10)}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success(`${LIST_JOBS.length} Einträge aus "${selectedList!.name}" exportiert`);
                      }}
                      style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${s.teal}`, background: s.tealBg, fontSize: 13, color: s.teal, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
                      <Download style={{ width: 13, height: 13 }} /> CSV Export
                    </button>
                  </div>
                  {LIST_JOBS.map((job) => (
                    <div key={job.id} style={{ padding: "12px 18px", borderBottom: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: s.text }}>{job.title}</div>
                        <div style={{ fontSize: 12, color: s.muted }}>{job.company} · {job.location}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 11, color: s.muted }}>{job.added}</span>
                        <button onClick={() => toast.info("Stelle wird geöffnet")}
                          style={{ padding: "5px 10px", borderRadius: 5, border: `1px solid ${s.border}`, background: s.white, fontSize: 12, color: s.muted, cursor: "pointer" }}>
                          Details
                        </button>
                        <button onClick={() => toast.success("Aus Liste entfernt")}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 2 }}>
                          <Trash2 style={{ width: 13, height: 13 }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
