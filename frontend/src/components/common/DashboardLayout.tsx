import { useState, useEffect, type ReactNode } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/logo.png";

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

const layoutCSS = `
/* ── Dashboard Layout Responsive ── */

.dl-root {
    display: flex;
    height: 100vh;
    font-family: var(--font-family);
    background: var(--bg-color);
    overflow: hidden;
}

/* SIDEBAR */
.dl-sidebar {
    width: 220px;
    min-width: 220px;
    background: #fff;
    border-right: 0.5px solid #EBEBEB;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    z-index: 200;
    transition: transform 0.25s ease, width 0.25s ease;
    flex-shrink: 0;
}

.dl-sidebar-logo {
    padding: 18px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.dl-sidebar-logo img {
    width: 75%;
    height: auto;
    object-fit: contain;
    transition: width 0.3s ease;
}

.dl-sidebar-divider {
    height: 0.5px;
    background: #EBEBEB;
    margin: 0 12px 10px;
}

.dl-nav {
    flex: 1;
    padding: 0 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
}

.dl-nav a {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: 9px;
    text-decoration: none;
    font-size: 13.5px;
    transition: all 0.15s;
    white-space: nowrap;
}

.dl-user-footer {
    padding: 12px;
    border-top: 0.5px solid #EBEBEB;
    display: flex;
    align-items: center;
    gap: 10px;
}

.dl-user-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1A7A52, #27A869);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 600;
    font-size: 11px;
    flex-shrink: 0;
}

.dl-user-info {
    flex: 1;
    min-width: 0;
}

.dl-user-name {
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dl-user-role {
    font-size: 11px;
    color: #BDBDBD;
}

.dl-logout-btn {
    background: none;
    border: none;
    color: #BDBDBD;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
}

/* MAIN AREA */
.dl-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
}

/* HEADER */
.dl-header {
    position: sticky;
    top: 0;
    z-index: 50;
    padding: 12px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
}

.dl-header-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dl-header-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
}

.dl-date-badge {
    border-top: 2px solid #27A869;
}

/* HAMBURGER BUTTON — hidden on desktop */
.dl-hamburger {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 6px;
    border-radius: 8px;
    color: #374151;
    flex-shrink: 0;
}

.dl-hamburger:hover {
    background: rgba(39,168,105,0.08);
}

/* OVERLAY for mobile drawer */
.dl-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 150;
}

.dl-overlay.active {
    display: block;
}

/* PAGE CONTENT */
.dl-content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    overflow-x: hidden;
}

/* ── TABLET (< 1024px) ── */
@media (max-width: 1023px) {
    .dl-date-badge {
        display: none !important;
    }
    .dl-header {
        padding: 10px 16px;
    }
    .dl-content {
        padding: 16px;
    }
}

/* ── MOBILE (< 768px) ── */
@media (max-width: 767px) {
    .dl-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        transform: translateX(-100%);
        z-index: 300;
        box-shadow: 4px 0 20px rgba(0,0,0,0.12);
        width: 240px;
        min-width: 240px;
    }

    .dl-sidebar.open {
        transform: translateX(0);
    }

    .dl-hamburger {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .dl-header-title {
        font-size: 0.9rem;
    }

    .dl-header-right .btn span {
        display: none;
    }

    .dl-content {
        padding: 12px;
    }

    /* Tables: horizontal scroll wrapper */
    .dl-content .table-responsive {
        border-radius: 12px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }

    /* Stat cards: 2 colonnes sur mobile */
    .dl-content .row.g-4 > [class*="col-xl-3"],
    .dl-content .row.g-4 > [class*="col-md-3"],
    .dl-content .row.g-3 > [class*="col-xl-3"],
    .dl-content .row.g-3 > [class*="col-md-3"] {
        flex: 0 0 50%;
        max-width: 50%;
    }

    /* Charts: 1 colonne sur mobile */
    .dl-content .row.g-4 > [class*="col-md-8"],
    .dl-content .row.g-4 > [class*="col-md-4"],
    .dl-content .row.g-4 > [class*="col-lg-8"],
    .dl-content .row.g-4 > [class*="col-lg-4"],
    .dl-content .row.g-4 > [class*="col-md-6"],
    .dl-content .row.g-4 > [class*="col-lg-6"] {
        flex: 0 0 100%;
        max-width: 100%;
    }

    /* Modal adjustments */
    .modal-dialog {
        margin: 8px !important;
    }
    .modal-body {
        padding: 16px !important;
    }
}

/* ── VERY SMALL (< 480px) ── */
@media (max-width: 479px) {
    /* Stat cards: 1 colonne */
    .dl-content .row.g-4 > [class*="col-xl-3"],
    .dl-content .row.g-4 > [class*="col-md-3"],
    .dl-content .row.g-3 > [class*="col-xl-3"],
    .dl-content .row.g-3 > [class*="col-md-3"] {
        flex: 0 0 100%;
        max-width: 100%;
    }

    .dl-header {
        padding: 8px 12px;
    }

    .dl-content {
        padding: 10px;
    }
}
`;

export default function DashboardLayout({
    navItems,
    children,
    title,
    accentColor = "#27A869"
}: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const { user, logout } = useAuth();
    const location = useLocation();
    // @ts-ignore
    const navigate = useNavigate();

    // Detect mobile resize
    useEffect(() => {
        const onResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(false);
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        if (isMobile) setSidebarOpen(false);
    }, [location.pathname, isMobile]);

    const initials =
        `${user?.prenom?.[0] ?? "?"}${user?.nom?.[0] ?? "?"}`.toUpperCase();

    return (
        <>
            <style>{layoutCSS}</style>

            {/* Overlay mobile */}
            {isMobile && (
                <div
                    className={`dl-overlay ${sidebarOpen ? "active" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="dl-root">
                {/* SIDEBAR */}
                <aside className={`dl-sidebar ${sidebarOpen && isMobile ? "open" : ""}`}>

                    <div className="dl-sidebar-logo">
                        <img src={Logo} alt="Meditrack" />
                    </div>

                    <div className="dl-sidebar-divider" />

                    {/* NAV */}
                    <nav className="dl-nav">
                        {navItems.map((item) => {
                            const active = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    style={{
                                        background: active ? "var(--primary-light)" : "transparent",
                                        borderLeft: active ? `3px solid var(--primary)` : "3px solid transparent",
                                        color: active ? "var(--primary-dark)" : "var(--text-muted)",
                                        fontWeight: active ? 500 : 400,
                                    }}
                                >
                                    <i
                                        className={`bi ${item.icon}`}
                                        style={{
                                            fontSize: 16,
                                            minWidth: 16,
                                            color: active ? "var(--primary)" : "#BDBDBD"
                                        }}
                                    />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* USER FOOTER */}
                    <div className="dl-user-footer">
                        <div className="dl-user-avatar">{initials}</div>
                        <div className="dl-user-info">
                            <div className="dl-user-name">{user?.prenom} {user?.nom}</div>
                            <div className="dl-user-role">{user?.role}</div>
                        </div>
                        <button className="dl-logout-btn" onClick={logout} title="Déconnexion">
                            <i className="bi bi-box-arrow-right" />
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <div className="dl-main">
                    <header className="dl-header navbar glass-panel">

                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                            {/* Hamburger — visible only on mobile */}
                            <button
                                className="dl-hamburger"
                                onClick={() => setSidebarOpen((o) => !o)}
                                aria-label="Menu"
                            >
                                <i className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`} style={{ fontSize: 20 }} />
                            </button>

                            <h1 className="dl-header-title">{title}</h1>
                        </div>

                        <div className="dl-header-right">

                            {/* DATE */}
                            <div
                                className="dl-date-badge text-muted small bg-light px-3 py-1 rounded d-flex align-items-center gap-2"
                            >
                                <i className="bi bi-calendar-event text-success"></i>
                                {new Date().toLocaleDateString("fr-FR", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                })}
                            </div>

                            {/* NOTIFICATIONS */}
                            <div className="dropdown">
                                <button
                                    className="btn btn-light position-relative dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    style={{ padding: "6px 10px" }}
                                >
                                    <i className="bi bi-bell"></i>
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">3</span>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end shadow-sm" style={{ width: "280px" }}>
                                    <li className="dropdown-header fw-semibold">Notifications</li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item small">Nouveau rendez-vous confirmé</button></li>
                                    <li><button className="dropdown-item small">Rappel : consultation demain 10h</button></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item text-center text-primary small">Voir toutes les notifications</button></li>
                                </ul>
                            </div>

                            {/* AVATAR */}
                            <div className="dropdown">
                                <button
                                    className="btn btn-light dropdown-toggle d-flex align-items-center gap-2"
                                    data-bs-toggle="dropdown"
                                >
                                    <div
                                        className="rounded-circle text-white d-flex align-items-center justify-content-center"
                                        style={{
                                            width: 32, height: 32,
                                            background: "linear-gradient(135deg,#1A7A52,#27A869)",
                                            fontSize: 12, fontWeight: 600, flexShrink: 0
                                        }}
                                    >
                                        {initials}
                                    </div>
                                    <span className="small d-none d-md-inline">{user?.prenom} {user?.nom}</span>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                                    <li><button className="dropdown-item small"><i className="bi bi-person me-2"></i>Mon profil</button></li>
                                    <li><button className="dropdown-item small"><i className="bi bi-gear me-2"></i>Paramètres</button></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button className="dropdown-item text-danger small" onClick={logout}>
                                            <i className="bi bi-box-arrow-right me-2"></i>Déconnexion
                                        </button>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </header>

                    <main className="dl-content">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
