/*
 * WorkforZA Einstellungen – "Focused Slate"
 * Profil, Team, Benachrichtigungen, Abonnement, Sicherheit
 */
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { User, Users, Bell, CreditCard, Shield, ChevronRight, Check, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const s = { teal: "#0D9488", tealBg: "#f0fdfa", text: "#1e293b", muted: "#64748b", border: "#e2e8f0", white: "#ffffff", bg: "#F4F5F7" };

const TEAM_MEMBERS = [
  { id: 1, name: "Birol Demirev", email: "birol.demirev@dempersonalservice.de", role: "Admin", avatar: "BD" },
  { id: 2, name: "Anna Schmidt", email: "a.schmidt@dempersonalservice.de", role: "Nutzer", avatar: "AS" },
  { id: 3, name: "Thomas Müller", email: "t.mueller@dempersonalservice.de", role: "Nutzer", avatar: "TM" },
];

const SETTINGS_NAV = [
  { id: "profile", label: "Profil", icon: User },
  { id: "team", label: "Team", icon: Users },
  { id: "notifications", label: "Benachrichtigungen", icon: Bell },
  { id: "billing", label: "Abonnement", icon: CreditCard },
  { id: "security", label: "Sicherheit", icon: Shield },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [members, setMembers] = useState(TEAM_MEMBERS);
  const [notifications, setNotifications] = useState({ email: true, jobAlerts: true, weeklyReport: false, newFeatures: true });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AppLayout title="Einstellungen" subtitle="Profil, Team und Konto verwalten">
      <div style={{ display: "grid", gridTemplateColumns: "1fr", height: "calc(100vh - 64px)" }} className="md:grid-cols-[200px_1fr]">
        {/* Settings nav */}
        <div style={{ borderRight: `1px solid ${s.border}`, padding: "20px 12px", background: s.white }}>
          {SETTINGS_NAV.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button key={item.id} onClick={() => setActiveSection(item.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 7, border: "none", cursor: "pointer", background: active ? s.tealBg : "transparent", color: active ? s.teal : s.muted, fontSize: 13, fontWeight: active ? 600 : 500, marginBottom: 2, textAlign: "left" }}>
                <Icon style={{ width: 15, height: 15, flexShrink: 0 }} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ padding: 28, overflowY: "auto" }}>

          {/* Profile */}
          {activeSection === "profile" && (
            <div style={{ maxWidth: 520 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, color: s.text, marginBottom: 20 }}>Profil bearbeiten</div>
              <div style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "20px 22px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: s.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "white" }}>BD</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: s.text }}>Profilbild ändern</div>
                    <div style={{ fontSize: 12, color: s.muted }}>JPG, PNG bis 2 MB</div>
                  </div>
                  <button onClick={() => toast.info("Datei-Upload öffnet sich")}
                    style={{ marginLeft: "auto", padding: "7px 14px", borderRadius: 6, border: `1px solid ${s.border}`, background: s.white, fontSize: 12, color: s.muted, cursor: "pointer" }}>
                    Hochladen
                  </button>
                </div>
                {[["Name", "Birol Demirev"], ["E-Mail", "birol.demirev@dempersonalservice.de"], ["Unternehmen", "DEM Personalservice GmbH"], ["Position", "Geschäftsführer"]].map(([label, val]) => (
                  <div key={label} style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: s.muted, marginBottom: 5 }}>{label}</label>
                    <input defaultValue={val}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: `1px solid ${s.border}`, fontSize: 13, color: s.text, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
              <button onClick={() => toast.success("Profil gespeichert")}
                style={{ padding: "9px 20px", borderRadius: 6, border: "none", background: s.teal, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Änderungen speichern
              </button>
            </div>
          )}

          {/* Team */}
          {activeSection === "team" && (
            <div style={{ maxWidth: 600 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, color: s.text }}>Team verwalten</div>
                <button onClick={() => toast.info("Einladung wird gesendet")}
                  style={{ padding: "7px 14px", borderRadius: 6, border: "none", background: s.teal, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <Plus style={{ width: 13, height: 13 }} /> Einladen
                </button>
              </div>
              <div style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, overflow: "hidden" }}>
                {members.map((member, i) => (
                  <div key={member.id} style={{ padding: "14px 18px", borderBottom: i < members.length - 1 ? `1px solid ${s.border}` : "none", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: s.tealBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: s.teal, flexShrink: 0 }}>
                      {member.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: s.text }}>{member.name}</div>
                      <div style={{ fontSize: 12, color: s.muted }}>{member.email}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: member.role === "Admin" ? "#fef3c7" : s.bg, color: member.role === "Admin" ? "#d97706" : s.muted }}>
                      {member.role}
                    </span>
                    {member.role !== "Admin" && (
                      <button onClick={() => { setMembers((prev) => prev.filter((m) => m.id !== member.id)); toast.success("Mitglied entfernt"); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 4 }}>
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: s.muted }}>{members.length} von 5 Plätzen belegt (Pro-Plan)</div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <div style={{ maxWidth: 520 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, color: s.text, marginBottom: 20 }}>Benachrichtigungen</div>
              <div style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, overflow: "hidden" }}>
                {([
                  { key: "email" as const, label: "E-Mail-Benachrichtigungen", desc: "Allgemeine Updates per E-Mail erhalten" },
                  { key: "jobAlerts" as const, label: "Job-Alerts", desc: "Neue Stellen für gespeicherte Suchen" },
                  { key: "weeklyReport" as const, label: "Wöchentlicher Report", desc: "Zusammenfassung der Marktentwicklung" },
                  { key: "newFeatures" as const, label: "Neue Features", desc: "Informationen über neue WorkforZA-Funktionen" },
                ] as const).map((item, i, arr) => (
                  <div key={item.key} style={{ padding: "14px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${s.border}` : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: s.text }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: s.muted }}>{item.desc}</div>
                    </div>
                    <button onClick={() => toggleNotification(item.key)}
                      style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: notifications[item.key] ? s.teal : s.border, position: "relative", transition: "background 0.2s" }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: notifications[item.key] ? 23 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => toast.success("Einstellungen gespeichert")}
                style={{ marginTop: 16, padding: "9px 20px", borderRadius: 6, border: "none", background: s.teal, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Speichern
              </button>
            </div>
          )}

          {/* Billing */}
          {activeSection === "billing" && (
            <div style={{ maxWidth: 560 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, color: s.text, marginBottom: 20 }}>Abonnement</div>
              <div style={{ background: s.tealBg, borderRadius: 8, border: `1px solid ${s.teal}`, padding: "18px 20px", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, color: s.text }}>Pro Plan</div>
                    <div style={{ fontSize: 12, color: s.muted }}>Aktiv bis 27. März 2026</div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.teal, fontFamily: "'DM Sans', sans-serif" }}>
                    189 €<span style={{ fontSize: 13, fontWeight: 500, color: s.muted }}>/Monat</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["5.000 Suchen/Monat", "5 Nutzer", "KI-Matching", "CSV-Export", "Job-Alerts", "API-Zugang"].map((f) => (
                    <span key={f} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: s.teal }}>
                      <Check style={{ width: 11, height: 11 }} /> {f}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { name: "Starter", price: "89", features: ["500 Suchen", "1 Nutzer", "CSV-Export"] },
                  { name: "Enterprise", price: "449", features: ["Unbegrenzt", "Unbegrenzte Nutzer", "Dedizierter Support"] },
                ].map((plan) => (
                  <div key={plan.name} style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "16px 18px" }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: s.text, marginBottom: 4 }}>{plan.name}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.text, marginBottom: 10 }}>
                      {plan.price} €<span style={{ fontSize: 12, fontWeight: 500, color: s.muted }}>/Monat</span>
                    </div>
                    {plan.features.map((f) => (
                      <div key={f} style={{ fontSize: 12, color: s.muted, marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}>
                        <ChevronRight style={{ width: 11, height: 11, color: s.teal }} /> {f}
                      </div>
                    ))}
                    <button onClick={() => toast.info(`Wechsel zu ${plan.name} wird vorbereitet`)}
                      style={{ marginTop: 12, width: "100%", padding: "8px", borderRadius: 6, border: `1px solid ${s.border}`, background: s.white, fontSize: 12, color: s.muted, cursor: "pointer" }}>
                      Wechseln
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {activeSection === "security" && (
            <div style={{ maxWidth: 520 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, color: s.text, marginBottom: 20 }}>Sicherheit</div>
              <div style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "20px 22px", marginBottom: 16 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: s.text, marginBottom: 14 }}>Passwort ändern</div>
                {["Aktuelles Passwort", "Neues Passwort", "Passwort bestätigen"].map((label) => (
                  <div key={label} style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: s.muted, marginBottom: 5 }}>{label}</label>
                    <input type="password" placeholder="••••••••"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: `1px solid ${s.border}`, fontSize: 13, color: s.text, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                  </div>
                ))}
                <button onClick={() => toast.success("Passwort geändert")}
                  style={{ padding: "9px 20px", borderRadius: 6, border: "none", background: s.teal, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Passwort ändern
                </button>
              </div>
              <div style={{ background: s.white, borderRadius: 8, border: `1px solid ${s.border}`, padding: "16px 20px" }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: s.text, marginBottom: 4 }}>Zwei-Faktor-Authentifizierung</div>
                <div style={{ fontSize: 12, color: s.muted, marginBottom: 12 }}>Erhöhe die Sicherheit deines Kontos mit 2FA</div>
                <button onClick={() => toast.info("2FA-Einrichtung wird gestartet")}
                  style={{ padding: "8px 16px", borderRadius: 6, border: `1px solid ${s.border}`, background: s.white, fontSize: 13, color: s.text, cursor: "pointer" }}>
                  2FA aktivieren
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  );
}
