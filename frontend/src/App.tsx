import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { authService } from "./services/Authservice";

// Layouts & sections (vitrine)
import NavBar from "./components/layout/NavBar";
import ChatbotButton from "./components/layout/ChatbotButton";
import Footer from "./components/layout/Footer";
import Accueil from "./components/sections/Accueil";
import Fonctionnalites from "./components/sections/Fonctionnalites";
import Specialites from "./components/sections/Specialites";
import Apropos from "./components/sections/Apropos";
import Contact from "./components/sections/Contact";
import RDV from "./components/sections/RDV";

// Auth pages
import Login from "./pages/Login";
import Inscription from "./pages/Inscription";

// Dashboards
import AdminDashboard from "./pages/admin/AdminDashboard";
import MedecinDashboard from "./pages/medecin/Medecindashboard";
import MedecinAgenda from "./pages/medecin/Medecinagenda";
import PatientDashboard from "./pages/patient/Patientdashboard";
import SecretaireDashboard from "./pages/secretaire/SecretaireDashboard";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import imagePath from "./assets/logo.png";

// ── Redirect après login selon le rôle ──────────────────────────────────────
function RoleRedirect() {
    const { user, isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <Navigate to={authService.getDashboardPath(user!.role)} replace />;
}

// ── Wrapper route protégée ────────────────────────────────────────────────────
function Protected({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
    const { user, isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (roles && user && !roles.includes(user.role.toUpperCase())) {
        return <Navigate to={authService.getDashboardPath(user.role)} replace />;
    }
    return <>{children}</>;
}

function AppRoutes() {
    return (
        <Routes>
            {/* ── Vitrine ── */}
            <Route
                path="/"
                element={
                    <div style={{ paddingTop: "80px" }}>
                        <NavBar brandName="Meditrack" imageSrcPath={imagePath} />
                        <section id="accueil"><Accueil /></section>
                        <section id="fonctionnalites"><Fonctionnalites /></section>
                        <section id="specialites"><Specialites /></section>
                        <section id="apropos"><Apropos /></section>
                        <section id="contact"><Contact /></section>
                        <section id="rdv"><RDV /></section>
                        <Footer />
                        <ChatbotButton />
                    </div>
                }
            />

            {/* ── Auth ── */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Inscription />} />
            <Route path="/dashboard" element={<RoleRedirect />} />

            {/* ── Dashboard Admin ── */}
            <Route
                path="/dashboard/admin"
                element={
                    <Protected roles={["ADMIN"]}>
                        <AdminDashboard />
                    </Protected>
                }
            />

            {/* ── Dashboard Médecin ── */}
            <Route
                path="/dashboard/medecin"
                element={
                    <Protected roles={["MEDECIN"]}>
                        <MedecinDashboard />
                    </Protected>
                }
            />
            <Route
                path="/dashboard/medecin/agenda"
                element={
                    <Protected roles={["MEDECIN"]}>
                        <MedecinAgenda />
                    </Protected>
                }
            />

            {/* ── Dashboard Patient ── */}
            <Route
                path="/dashboard/patient"
                element={
                    <Protected roles={["PATIENT"]}>
                        <PatientDashboard />
                    </Protected>
                }
            />

            {/* ── Dashboard Secrétaire ── */}
            <Route
                path="/dashboard/secretaire"
                element={
                    <Protected roles={["SECRETAIRE"]}>
                        <SecretaireDashboard />
                    </Protected>
                }
            />

            {/* ── Fallback ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}