/*
 * WorkforZA AppLayout – "Focused Slate" – Mobile-First Responsive
 * Mobile: Hamburger → Overlay-Drawer
 * Tablet (768px+): Sidebar kollabiert auf Icons
 * Desktop (1024px+): Volle Sidebar
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Search, Building2, BarChart3,
  Zap, ListChecks, Settings, ChevronLeft, ChevronRight,
  Bell, HelpCircle, LogOut, Database, Menu, X, Users,
} from "lucide-react";
import { toast } from "sonner";

const NAV_SECTIONS = [
  {
    label: "Hauptmenü",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/jobs", icon: Search, label: "Stellensuche" },
      { href: "/companies", icon: Building2, label: "Unternehmen" },
    ],
  },
  {
    label: "Analyse & KI",
    items: [
      { href: "/analytics", icon: BarChart3, label: "Marktanalyse" },
      { href: "/matching", icon: Zap, label: "KI-Matching" },
    ],
  },
  {
    label: "Kandidaten",
    items: [
      { href: "/pipeline", icon: Users, label: "Pipeline" },
      { href: "/lists", icon: ListChecks, label: "Meine Listen" },
    ],
  },
  {
    label: "Verwaltung",
    items: [
      { href: "/settings", icon: Settings, label: "Einstellungen" },
    ],
  },
];

const C = {
  slate: "#1E2433",
  slateDark: "#161d2b",
  slateLight: "#2a3347",
  teal: "#0D9488",
  bg: "#F4F5F7",
  text: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
  white: "#ffffff",
  navText: "#94a3b8",
  navActive: "#f1f5f9",
};

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

function SidebarContent({
  collapsed,
  location,
  onNavClick,
}: {
  collapsed: boolean;
  location: string;
  onNavClick?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 12px",
          borderBottom: `1px solid ${C.slateLight}`,
          height: 56,
          minHeight: 56,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: C.teal,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Database style={{ width: 16, height: 16, color: "white" }} />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: C.navActive, lineHeight: 1.2 }}>
              WorkforZA
            </div>
            <div style={{ fontSize: 11, color: "#475569" }}>Die Plattform für Personaldienstleister</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} style={{ marginBottom: 16 }}>
            {!collapsed && (
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#475569", padding: "0 8px", marginBottom: 4 }}>
                {section.label}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {section.items.map(({ href, icon: Icon, label }) => {
                const isActive = location === href || (href !== "/" && location.startsWith(href));
                return (
                  <Link key={href} href={href}>
                    <div
                      onClick={onNavClick}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: collapsed ? "9px 0" : "9px 10px",
                        justifyContent: collapsed ? "center" : "flex-start",
                        borderRadius: 6,
                        fontSize: 13.5,
                        fontWeight: 500,
                        color: isActive ? C.navActive : C.navText,
                        background: isActive ? C.slateLight : "transparent",
                        textDecoration: "none",
                        position: "relative",
                        cursor: "pointer",
                        transition: "background 0.12s, color 0.12s",
                      }}
                      title={collapsed ? label : undefined}
                    >
                      {isActive && (
                        <span style={{
                          position: "absolute", left: 0, top: 6, bottom: 6,
                          width: 3, background: C.teal, borderRadius: "0 3px 3px 0",
                        }} />
                      )}
                      <Icon style={{ width: 16, height: 16, color: isActive ? C.teal : C.navText, flexShrink: 0 }} />
                      {!collapsed && <span>{label}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ flexShrink: 0, padding: "8px", borderTop: `1px solid ${C.slateLight}` }}>
        <button
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 10px", borderRadius: 6, fontSize: 13.5,
            fontWeight: 500, color: C.navText, background: "transparent",
            border: "none", width: "100%", cursor: "pointer",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
          onClick={() => toast.info("Hilfe & Dokumentation öffnet sich")}
          title={collapsed ? "Hilfe" : undefined}
        >
          <HelpCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
          {!collapsed && "Hilfe"}
        </button>
        <Link href="/login">
          <div
            onClick={onNavClick}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px", borderRadius: 6, fontSize: 13.5,
              fontWeight: 500, color: C.navText, textDecoration: "none",
              justifyContent: collapsed ? "center" : "flex-start",
              cursor: "pointer",
            }}
            title={collapsed ? "Abmelden" : undefined}
          >
            <LogOut style={{ width: 16, height: 16, flexShrink: 0 }} />
            {!collapsed && "Abmelden"}
          </div>
        </Link>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginTop: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0 }}>
              BD
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Birol Demirev</div>
              <div style={{ fontSize: 11, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>DEM Personal Service</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function AppLayout({ children, title, subtitle, actions }: AppLayoutProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <div style={{ display: "flex", height: "100dvh", overflow: "hidden", background: C.bg, position: "relative" }}>

      {/* ── Mobile Overlay ── */}
      {isMobile && mobileOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar (Desktop) / Drawer (Mobile) ── */}
      <aside
        style={{
          width: isMobile ? 260 : (collapsed ? 56 : 240),
          background: C.slate,
          borderRight: `1px solid ${C.slateLight}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          overflow: "hidden",
          transition: "width 0.2s, transform 0.25s",
          // Mobile: fixed drawer
          ...(isMobile ? {
            position: "fixed",
            top: 0,
            left: 0,
            height: "100dvh",
            zIndex: 50,
            transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          } : {}),
        }}
      >
        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              position: "absolute", top: 12, right: 12,
              background: "none", border: "none", cursor: "pointer",
              color: C.navText, padding: 4, zIndex: 1,
            }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        )}

        <SidebarContent
          collapsed={!isMobile && collapsed}
          location={location}
          onNavClick={isMobile ? () => setMobileOpen(false) : undefined}
        />

        {/* Desktop collapse toggle */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: 32, width: "100%", background: C.slateDark,
              color: "#475569", border: "none", borderTop: `1px solid ${C.slateLight}`,
              cursor: "pointer", transition: "color 0.15s", flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#94a3b8")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
            title={collapsed ? "Erweitern" : "Einklappen"}
          >
            {collapsed
              ? <ChevronRight style={{ width: 14, height: 14 }} />
              : <ChevronLeft style={{ width: 14, height: 14 }} />
            }
          </button>
        )}
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Top bar */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            height: 56,
            minHeight: 56,
            background: C.white,
            borderBottom: `1px solid ${C.border}`,
            flexShrink: 0,
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {/* Hamburger (Mobile only) */}
            {isMobile && (
              <button
                onClick={() => setMobileOpen(true)}
                style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4, flexShrink: 0 }}
              >
                <Menu style={{ width: 20, height: 20 }} />
              </button>
            )}
            <div style={{ minWidth: 0 }}>
              {title && (
                <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: isMobile ? 14 : 16, color: C.text, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {title}
                </h1>
              )}
              {subtitle && !isMobile && (
                <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{subtitle}</p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {actions}
            <button
              style={{ padding: 6, borderRadius: 6, background: "transparent", border: "none", cursor: "pointer", color: C.muted }}
              onClick={() => toast.info("Keine neuen Benachrichtigungen")}
            >
              <Bell style={{ width: 16, height: 16 }} />
            </button>
            <div
              style={{ width: 32, height: 32, borderRadius: "50%", background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", cursor: "pointer", flexShrink: 0 }}
              onClick={() => toast.info("Profil öffnet sich")}
            >
              BD
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
