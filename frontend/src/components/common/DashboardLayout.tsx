import { useState, type ReactNode } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface NavItem {
    icon: string;
    label: string;
    path: string;
}

interface Props {
    navItems: NavItem[];
    children: ReactNode;
    title: string;
    accentColor?: string;
}

export default function DashboardLayout({ navItems, children, title, accentColor = "#1A7A52" }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const location = useLocation();
    // @ts-ignore
    const navigate = useNavigate();

    const initials = user?.email?.slice(0, 2).toUpperCase() || "??";

    return (
        <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#F4F6FB" }}>
            {/* Sidebar */}
            <aside
                style={{
                    width: sidebarOpen ? 240 : 64,
                    minWidth: sidebarOpen ? 240 : 64,
                    background: "#0D1F2D",
                    transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    boxShadow: "4px 0 20px rgba(0,0,0,0.12)",
                    zIndex: 100,
                }}
            >
                {/* Logo */}
                <div style={{ padding: "20px 16px 12px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: accentColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <i className="bi bi-heart-pulse-fill" style={{ color: "#fff", fontSize: 16 }}></i>
                    </div>
                    {sidebarOpen && (
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, whiteSpace: "nowrap", letterSpacing: "-0.3px" }}>
              Meditrack
            </span>
                    )}
                    <button
                        onClick={() => setSidebarOpen(o => !o)}
                        style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 4, borderRadius: 6 }}
                    >
                        <i className={`bi ${sidebarOpen ? "bi-layout-sidebar" : "bi-layout-sidebar-reverse"}`} style={{ fontSize: 16 }}></i>
                    </button>
                </div>

                {/* Role badge */}
                {sidebarOpen && (
                    <div style={{ padding: "10px 16px" }}>
            <span style={{ background: `${accentColor}22`, color: accentColor, fontSize: 11, fontWeight: 600, borderRadius: 20, padding: "3px 10px", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {user?.role}
            </span>
                    </div>
                )}

                {/* Nav items */}
                <nav style={{ flex: 1, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
                    {navItems.map(item => {
                        const active = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: "10px 12px",
                                    borderRadius: 10,
                                    textDecoration: "none",
                                    background: active ? `${accentColor}22` : "transparent",
                                    color: active ? accentColor : "rgba(255,255,255,0.6)",
                                    fontWeight: active ? 600 : 400,
                                    fontSize: 14,
                                    transition: "all 0.15s",
                                    whiteSpace: "nowrap",
                                    borderLeft: active ? `3px solid ${accentColor}` : "3px solid transparent",
                                }}
                                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
                                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                            >
                                <i className={`bi ${item.icon}`} style={{ fontSize: 18, flexShrink: 0 }}></i>
                                {sidebarOpen && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User footer */}
                <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: accentColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                        {initials}
                    </div>
                    {sidebarOpen && (
                        <>
                            <div style={{ flex: 1, overflow: "hidden" }}>
                                <div style={{ color: "#fff", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</div>
                                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{user?.role}</div>
                            </div>
                            <button onClick={logout} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 4 }} title="Déconnexion">
                                <i className="bi bi-box-arrow-right" style={{ fontSize: 16 }}></i>
                            </button>
                        </>
                    )}
                </div>
            </aside>

            {/* Main content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Top bar */}
                <header style={{ background: "#fff", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E8ECF1", flexShrink: 0 }}>
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0D1F2D", letterSpacing: "-0.3px" }}>{title}</h1>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ color: "#8A94A6", fontSize: 13 }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
                    </div>
                </header>

                {/* Page content */}
                <main style={{ flex: 1, overflow: "auto", padding: 24 }}>
                    {children}
                </main>
            </div>

            {/* Google Font */}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
        </div>
    );
}