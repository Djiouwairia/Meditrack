import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { authService } from "./services/Authservice";

import NavBar from "./components/layout/NavBar";
import ChatbotButton from "./components/layout/ChatbotButton";
import Footer from "./components/layout/Footer";

import Accueil from "./components/sections/Accueil";
import Fonctionnalites from "./components/sections/Fonctionnalites";
import Specialites from "./components/sections/Specialites";
import Apropos from "./components/sections/Apropos";
import Contact from "./components/sections/Contact";
import RDV from "./components/sections/RDV";

import Login from "./pages/Login";
import Inscription from "./pages/Inscription";

import AdminDashboard from "./pages/admin/Admindashboard";
import MedecinDashboard from "./pages/medecin/Medecindashboard";
import MedecinAgenda from "./pages/medecin/Medecinagenda";
import PatientDashboard from "./pages/patient/Patientdashboard";
import PatientRendezVous from "./pages/patient/Patientrendezvous";
import PatientDossier from "./pages/patient/Patientdossier";
import PatientOrdonnances from "./pages/patient/Patientordonnances";
import PatientProfil from "./pages/patient/Patientprofil";

import SecretaireDashboard from "./pages/secretaire/SecretaireDashboard";

/* 🟩 MÉDECIN PAGES */
import MedecinPatients from "./pages/medecin/Medecinpatients";
import MedecinDossier from "./pages/medecin/Medecindossier";
import MedecinOrdonnances from "./pages/medecin/Medecinordonnances";
import MedecinProfil from "./pages/medecin/Medecinprofil";

/* 🟦 SECRÉTAIRE PAGES */
import SecretairePatients from "./pages/secretaire/Secretairepatients";
import SecretaireRendezVous from "./pages/secretaire/Secretairerendezvous";
import SecretaireProfil from "./pages/secretaire/Secretaireprofil";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import imagePath from "./assets/logo.png";
import AdminUtilisateurs from "./pages/admin/AdminUtilisateurs";
import AdminHopitaux from "./pages/admin/AdminHopital";
import AdminMedecins from "./pages/admin/AdminMedecins";
import AdminProfil from "./pages/admin/AdminProfil";
import AdminParametres from "./pages/admin/AdminParametres";
import AdminNotifications from "./pages/admin/AdminNotifications";

import MedecinParametres from "./pages/medecin/MedecinParametres";
import MedecinNotifications from "./pages/medecin/MedecinNotifications";

import PatientParametres from "./pages/patient/PatientParametres";
import PatientNotifications from "./pages/patient/PatientNotifications";

import SecretaireParametres from "./pages/secretaire/SecretaireParametres";
import SecretaireNotifications from "./pages/secretaire/SecretaireNotifications";

/* ───────────── REDIRECTION SELON RÔLE ───────────── */
function RoleRedirect() {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return <Navigate to={authService.getDashboardPath(user!.role)} replace />;
}

/* ───────────── PROTECTION ROUTES ───────────── */
function Protected({
    children,
    roles,
}: {
    children: React.ReactNode;
    roles?: string[];
}) {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (roles && user && !roles.includes(user.role.toUpperCase())) {
        return <Navigate to={authService.getDashboardPath(user.role)} replace />;
    }

    return <>{children}</>;
}

/* ───────────── ROUTES APP ───────────── */
function AppRoutes() {
    return (
        <Routes>

            {/* ───────── VITRINE ───────── */}
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

            {/* ───────── AUTH ───────── */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Inscription />} />

            {/* ───────── REDIRECT DASHBOARD ───────── */}
            <Route path="/dashboard" element={<RoleRedirect />} />

            {/* ───────── ADMIN ───────── */}
            <Route
                path="/dashboard/admin"
                element={
                    <Protected roles={["ADMIN", "ADMIN_HOPITAL"]}>
                        <AdminDashboard />
                    </Protected>
                }
            />

             <Route
                path="/dashboard/admin/utilisateurs"
                element={
                    <Protected roles={["ADMIN", "ADMIN_HOPITAL"]}>
                        <AdminUtilisateurs />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/admin/hopitaux"
                element={
                    <Protected roles={["ADMIN"]}>
                        <AdminHopitaux />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/admin/medecins"
                element={
                    <Protected roles={["ADMIN", "ADMIN_HOPITAL"]}>
                        <AdminMedecins />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/admin/profil"
                element={
                    <Protected roles={["ADMIN", "ADMIN_HOPITAL"]}>
                        <AdminProfil />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/admin/parametres"
                element={
                    <Protected roles={["ADMIN", "ADMIN_HOPITAL"]}>
                        <AdminParametres />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/admin/notifications"
                element={
                    <Protected roles={["ADMIN", "ADMIN_HOPITAL"]}>
                        <AdminNotifications />
                    </Protected>
                }
            />

            {/* ───────── MÉDECIN ───────── */}
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

            <Route
                path="/dashboard/medecin/patients"
                element={
                    <Protected roles={["MEDECIN"]}>
                        <MedecinPatients />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/medecin/patients/:patientId"
                element={
                    <Protected roles={["MEDECIN"]}>
                        <MedecinDossier />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/medecin/ordonnances"
                element={
                    <Protected roles={["MEDECIN"]}>
                        <MedecinOrdonnances />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/medecin/profil"
                element={
                    <Protected roles={["MEDECIN"]}>
                        <MedecinProfil />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/medecin/parametres"
                element={
                    <Protected roles={["MEDECIN"]}>
                        <MedecinParametres />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/medecin/notifications"
                element={
                    <Protected roles={["MEDECIN"]}>
                        <MedecinNotifications />
                    </Protected>
                }
            />

            {/* ───────── PATIENT ───────── */}
            <Route
                path="/dashboard/patient"
                element={
                    <Protected roles={["PATIENT"]}>
                        <PatientDashboard />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/patient/rendez-vous"
                element={
                    <Protected roles={["PATIENT"]}>
                        <PatientRendezVous />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/patient/dossier"
                element={
                    <Protected roles={["PATIENT"]}>
                        <PatientDossier />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/patient/ordonnances"
                element={
                    <Protected roles={["PATIENT"]}>
                        <PatientOrdonnances />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/patient/profil"
                element={
                    <Protected roles={["PATIENT"]}>
                        <PatientProfil />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/patient/parametres"
                element={
                    <Protected roles={["PATIENT"]}>
                        <PatientParametres />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/patient/notifications"
                element={
                    <Protected roles={["PATIENT"]}>
                        <PatientNotifications />
                    </Protected>
                }
            />
            

            {/* ───────── SECRÉTAIRE ───────── */}
            <Route
                path="/dashboard/secretaire"
                element={
                    <Protected roles={["SECRETAIRE"]}>
                        <SecretaireDashboard />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/secretaire/patients"
                element={
                    <Protected roles={["SECRETAIRE"]}>
                        <SecretairePatients />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/secretaire/rendez-vous"
                element={
                    <Protected roles={["SECRETAIRE"]}>
                        <SecretaireRendezVous />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/secretaire/profil"
                element={
                    <Protected roles={["SECRETAIRE"]}>
                        <SecretaireProfil />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/secretaire/parametres"
                element={
                    <Protected roles={["SECRETAIRE"]}>
                        <SecretaireParametres />
                    </Protected>
                }
            />

            <Route
                path="/dashboard/secretaire/notifications"
                element={
                    <Protected roles={["SECRETAIRE"]}>
                        <SecretaireNotifications />
                    </Protected>
                }
            />

            {/* ───────── FALLBACK ───────── */}
            <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
    );
}

/* ───────────── APP ROOT ───────────── */
export default function App() {
    // Initialisation du thème global
    useEffect(() => {
        const savedTheme = localStorage.getItem("meditrack_theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);
    }, []);

    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}