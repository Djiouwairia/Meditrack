import { useState, type ReactNode } from "react";
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

export default function DashboardLayout({
    navItems,
    children,
    title,
    accentColor = "#27A869"
}: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const initials =
        user?.email?.slice(0, 2).toUpperCase() || "??";

    return (
        <div
            style={{
                display: "flex",
                height: "100vh",
                fontFamily: "'DM Sans', sans-serif",
                background: "#FAFAFA"
            }}
        >
            {/* SIDEBAR */}
            <aside
                style={{
                    width: sidebarOpen ? 220 : 64,
                    minWidth: sidebarOpen ? 220 : 64,
                    background: "#fff",
                    borderRight: "0.5px solid #EBEBEB",
                    transition: "all 0.25s ease",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    position: "relative",
                    zIndex: 100
                }}
            >

                {/* LOGO SECTION ✔ FIX CENTRÉ */}
                <div
                    style={{
                        padding: "18px 12px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10
                    }}
                >
                    <img
                        src={Logo}
                        alt="Meditrack"
                        style={{
                            width: sidebarOpen ? "75%" : "38px",
                            height: "auto",
                            objectFit: "contain",
                            transition: "all 0.3s ease"
                        }}
                    />

                    {/* TOGGLE */}
                    {/* <button
                        onClick={() => setSidebarOpen((o) => !o)}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#BDBDBD",
                            cursor: "pointer",
                            fontSize: 16,
                            display: "flex",
                            alignItems: "center",
                            padding: 0
                        }}
                    >
                        <i
                            className={`bi ${
                                sidebarOpen
                                    ? "bi-layout-sidebar"
                                    : "bi-layout-sidebar-reverse"
                            }`}
                        />
                    </button> */}
                </div>

                {/* ROLE BADGE */}
                {/* {sidebarOpen && (
                    <div style={{ padding: "0 12px 12px" }}>
                        <span
                            style={{
                                background: `${accentColor}14`,
                                color: accentColor,
                                fontSize: 10,
                                fontWeight: 600,
                                borderRadius: 20,
                                padding: "3px 10px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px"
                            }}
                        >
                            {user?.role}
                        </span>
                    </div>
                )} */}

                <div style={{ height: "0.5px", background: "#EBEBEB", margin: "0 12px 10px" }} />

                {/* NAV */}
                <nav
                    style={{
                        flex: 1,
                        padding: "0 8px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2
                    }}
                >
                    {navItems.map((item) => {
                        const active = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "9px 10px",
                                    borderRadius: 9,
                                    textDecoration: "none",
                                    background: active ? "#F0F0F0" : "transparent",
                                    borderLeft: active ? `3px solid ${accentColor}` : "3px solid transparent",
                                    color: active ? "#0F0F0F" : "#6B6B6B",
                                    fontWeight: active ? 500 : 400,
                                    fontSize: 13.5,
                                    transition: "all 0.15s"
                                }}
                            >
                                <i
                                    className={`bi ${item.icon}`}
                                    style={{
                                        fontSize: 16,
                                        minWidth: 16,
                                        color: active ? accentColor : "#BDBDBD"
                                    }}
                                />
                                {sidebarOpen && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* USER FOOTER */}
                <div
                    style={{
                        padding: 12,
                        borderTop: "0.5px solid #EBEBEB",
                        display: "flex",
                        alignItems: "center",
                        gap: 10
                    }}
                >
                    <div
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius : "50%",
                            background: "linear-gradient(135deg,#1A7A52,#27A869)",
                            display: "flex",
                            padding : 6,
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: 11
                        }}
                    >
                        {initials}
                    </div>

                    {sidebarOpen && (
                        <>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 500 }}>
                                    {user?.email}
                                </div>
                                <div style={{ fontSize: 11, color: "#BDBDBD" }}>
                                    {user?.role}
                                </div>
                            </div>

                            <button
                                onClick={logout}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#BDBDBD",
                                    cursor: "pointer"
                                }}
                            >
                                <i className="bi bi-box-arrow-right" />
                            </button>
                        </>
                    )}
                </div>
            </aside>

            {/* MAIN */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <header className="navbar bg-white border-bottom px-4 d-flex justify-content-between align-items-center">

    {/* TITLE */}
    <h1 className="h6 m-0 fw-semibold">
        {title}
    </h1>

    {/* RIGHT SIDE */}
    <div className="d-flex align-items-center gap-3">

        {/* DATE */}
       <div
    className="text-muted small bg-light px-3 py-1 rounded d-flex align-items-center gap-2"
    style={{
        borderTop: "2px solid #27A869"
    }}
>
    <i className="bi bi-calendar-event text-success"></i>

    {new Date().toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    })}
</div>

        {/* 🔔 NOTIFICATIONS DROPDOWN */}
        <div className="dropdown">

            <button
                className="btn btn-light position-relative dropdown-toggle"
                data-bs-toggle="dropdown"
            >
                <i className="bi bi-bell"></i>

                {/* BADGE */}
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    3
                </span>
            </button>

            {/* NOTIFICATION MENU */}
            <ul className="dropdown-menu dropdown-menu-end shadow-sm" style={{ width: "280px" }}>

                <li className="dropdown-header fw-semibold">
                    Notifications
                </li>

                <li><hr className="dropdown-divider" /></li>

                <li>
                    <button className="dropdown-item small">
                         Nouveau rendez-vous confirmé
                    </button>
                </li>


                <li>
                    <button className="dropdown-item small">
                         Rappel : consultation demain 10h
                    </button>
                </li>

                <li><hr className="dropdown-divider" /></li>

                <li>
                    <button className="dropdown-item text-center text-primary small">
                        Voir toutes les notifications
                    </button>
                </li>

            </ul>
        </div>

        {/* 👤 AVATAR DROPDOWN */}
        <div className="dropdown">

            <button
                className="btn btn-light dropdown-toggle d-flex align-items-center gap-2"
                data-bs-toggle="dropdown"
            >
                <div
                    className="rounded-circle text-white d-flex align-items-center justify-content-center"
                    style={{
                        width: 32,
                        height: 32,
                        background: "linear-gradient(135deg,#1A7A52,#27A869)",
                        fontSize: 12,
                        fontWeight: 600
                    }}
                >
                    {initials}
                </div>

                <span className="small">{user?.role}</span>
            </button>

            <ul className="dropdown-menu dropdown-menu-end shadow-sm">

                <li>
                    <button className="dropdown-item small">
                        <i className="bi bi-person me-2"></i>
                        Mon profil
                    </button>
                </li>

                <li>
                    <button className="dropdown-item small">
                        <i className="bi bi-gear me-2"></i>
                        Paramètres
                    </button>
                </li>

                <li><hr className="dropdown-divider" /></li>

                <li>
                    <button
                        className="dropdown-item text-danger small"
                        onClick={logout}
                    >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Déconnexion
                    </button>
                </li>

            </ul>
        </div>

    </div>
</header>

                <main style={{ flex: 1, padding: 24, overflow: "auto" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}