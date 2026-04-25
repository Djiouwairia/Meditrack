import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './context/Authcontext';

// Landing
import NavBar from "./components/layout/NavBar";
import ChatbotButton from "./components/layout/ChatbotButton";
import Footer from "./components/layout/Footer";
import Accueil from "./components/sections/Accueil";
import Fonctionnalites from "./components/sections/Fonctionnalites";
import Specialites from "./components/sections/Specialites";
import Apropos from "./components/sections/Apropos";
import Contact from "./components/sections/Contact";
import RDV from "./components/sections/RDV";
import imagePath from "./assets/logo.png";

// Auth
import Login from "./pages/Login";
import Inscription from "./pages/Inscription";

// Dashboards
import MedecinDashboard from "./pages/dashboard/MedecinDashboard";
import PatientDashboard from "./pages/dashboard/PatientDashboard";
import SecretaireDashboard from "./pages/dashboard/SecretaireDashboard";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import type {JSX} from "react";

function ProtectedRoute({ children, roles }: { children: JSX.Element; roles?: string[] }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" style={{ color: "#1A7A52" }} />
    </div>;
    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;
    return children;
}

function DashboardRedirect() {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === "MEDECIN") return <Navigate to="/dashboard/medecin" replace />;
    if (user.role === "PATIENT") return <Navigate to="/dashboard/patient" replace />;
    if (user.role === "SECRETAIRE") return <Navigate to="/dashboard/secretaire" replace />;
    return <Navigate to="/login" replace />;
}

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* ── Landing page ── */}
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
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Inscription />} />

                {/* ── Dashboard redirect ── */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

                {/* ── Dashboards ── */}
                <Route
                    path="/dashboard/medecin/*"
                    element={<ProtectedRoute roles={["MEDECIN"]}><MedecinDashboard /></ProtectedRoute>}
                />
                <Route
                    path="/dashboard/patient/*"
                    element={<ProtectedRoute roles={["PATIENT"]}><PatientDashboard /></ProtectedRoute>}
                />
                <Route
                    path="/dashboard/secretaire/*"
                    element={<ProtectedRoute roles={["SECRETAIRE"]}><SecretaireDashboard /></ProtectedRoute>}
                />
            </Routes>
        </AuthProvider>
    );
}

export default App;