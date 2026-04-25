import { ReactNode, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Authcontext.tsx";
import LogoImg from "../../assets/logo.png";
import "./DashboardLayout.css";

interface NavItem {
    to: string;
    icon: string;
    label: string;
}

interface DashboardLayoutProps {
    children: ReactNode;
    navItems: NavItem[];
    accentColor?: string;
    role: string;
}

export default function DashboardLayout({
                                            children,
                                            navItems,
                                            accentColor = "#1A7A52",
                                            role,
                                        }: DashboardLayoutProps) {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const initials = `${user?.prenom?.[0] ?? ""}${user?.nom?.[0] ?? ""}`.toUpperCase() || "?";

    return (
        <div className="dash-wrapper">
            {/* ── Sidebar overlay (mobile) ── */}
            {sidebarOpen && (
                <div className="dash-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── Sidebar ── */}
            <aside className={`dash-sidebar ${sidebarOpen ? "open" : ""}`} style={{ "--accent": accentColor } as any}>
                <div className="dash-logo">
                    <img src={LogoImg} alt="Meditrack" />
                </div>

                <div className="dash-role-badge">
                    <i className={`bi bi-${role === "MEDECIN" ? "hospital" : role === "PATIENT" ? "person-heart" : "person-badge"}`} />
                    <span>{role}</span>
                </div>

                <nav className="dash-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `dash-nav-item ${isActive ? "active" : ""}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <i className={`bi bi-${item.icon}`} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <button className="dash-logout" onClick={logout}>
                    <i className="bi bi-box-arrow-left" />
                    <span>Déconnexion</span>
                </button>
            </aside>

            {/* ── Main ── */}
            <div className="dash-main">
                {/* Topbar */}
                <header className="dash-topbar">
                    <button className="dash-burger" onClick={() => setSidebarOpen(true)}>
                        <i className="bi bi-list" />
                    </button>
                    <div className="dash-topbar-title">
                        Meditrack <span style={{ color: accentColor }}>— Espace {role.charAt(0) + role.slice(1).toLowerCase()}</span>
                    </div>
                    <div className="dash-avatar" style={{ background: accentColor }}>
                        {initials}
                    </div>
                </header>

                {/* Content */}
                <main className="dash-content">
                    {children}
                </main>
            </div>
        </div>
    );
}