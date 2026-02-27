/*
 * WorkforZA Login – "Focused Slate"
 * Links: Slate-Panel mit Brand-Info | Rechts: Login-Formular
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const s = {
  teal: "#0D9488",
  slate: "#1E2433",
  slateLight: "#2a3347",
  bg: "#F4F5F7",
  text: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
  white: "#ffffff",
};

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Bitte alle Felder ausfüllen."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
      toast.success("Willkommen bei WorkforZA!");
    }, 1000);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Left: Brand panel */}
      <div style={{ width: "45%", background: s.slate, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px", position: "relative", overflow: "hidden" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: s.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 16, color: "#f1f5f9" }}>WorkforZA</div>
            <div style={{ fontSize: 11, color: "#475569" }}>Die Plattform für Personaldienstleister</div>
          </div>
        </div>

        {/* Main text */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 36, color: "#f1f5f9", lineHeight: 1.2, margin: "0 0 16px" }}>
            Dein Werkzeug.<br />
            <span style={{ color: s.teal }}>Täglich besser.</span>
          </h1>
          <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 40px", maxWidth: 340 }}>
            Über 3,49 Millionen Stellenanzeigen, KI-Matching und Marktanalyse — optimiert für den täglichen Einsatz von Personaldienstleistern.
          </p>
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["3,49 Mio.", "Stellenanzeigen"],
              ["370.578", "Unternehmen"],
              ["5 Quellen", "Aggregiert"],
              ["< 2 Sek.", "Antwortzeit"],
            ].map(([v, l]) => (
              <div key={l} style={{ background: s.slateLight, borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 18, color: s.teal }}>{v}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative circle */}
        <div style={{ position: "absolute", bottom: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: s.teal, opacity: 0.04 }} />
      </div>

      {/* Right: Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: s.bg, padding: 48 }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 24, color: s.text, margin: "0 0 4px" }}>
            Anmelden
          </h2>
          <p style={{ fontSize: 14, color: s.muted, margin: "0 0 32px" }}>
            Zugang zu deinem Recruiting-Dashboard
          </p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: s.text, marginBottom: 6 }}>E-Mail</label>
              <input
                type="email"
                placeholder="name@unternehmen.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 6, fontSize: 14,
                  border: `1px solid ${s.border}`, background: s.white, color: s.text,
                  outline: "none", boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = s.teal)}
                onBlur={(e) => (e.target.style.borderColor = s.border)}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: s.text, marginBottom: 6 }}>Passwort</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 40px 10px 12px", borderRadius: 6, fontSize: 14,
                    border: `1px solid ${s.border}`, background: s.white, color: s.text,
                    outline: "none", boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = s.teal)}
                  onBlur={(e) => (e.target.style.borderColor = s.border)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: s.muted, padding: 4 }}
                >
                  {showPw ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="button" style={{ background: "none", border: "none", fontSize: 13, color: s.teal, cursor: "pointer", padding: 0 }}
                onClick={() => toast.info("Passwort-Reset-E-Mail wird gesendet")}>
                Passwort vergessen?
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "11px 16px", borderRadius: 6, fontSize: 14, fontWeight: 600,
                color: "white", background: loading ? "#94a3b8" : s.teal,
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.15s",
              }}
            >
              {loading ? (
                <div style={{ width: 16, height: 16, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              ) : "Anmelden →"}
            </button>
          </form>

          <p style={{ fontSize: 13, color: s.muted, textAlign: "center", marginTop: 24 }}>
            Noch kein Konto?{" "}
            <button style={{ background: "none", border: "none", color: s.teal, fontWeight: 600, cursor: "pointer", fontSize: 13, padding: 0 }}
              onClick={() => toast.info("Registrierung öffnet sich")}>
              Kostenlos testen
            </button>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
