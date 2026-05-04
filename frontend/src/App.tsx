import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { hasCustomServerUrl, setServerBaseUrl, getServerBaseUrl, clearServerBaseUrl } from "./services/serverConfig";

import Login from "./pages/Login";
import Inscription from "./pages/Inscription";

import PatientDashboard from "./pages/patient/Patientdashboard";
import PatientRendezVous from "./pages/patient/Patientrendezvous";
import PatientDossier from "./pages/patient/Patientdossier";
import PatientOrdonnances from "./pages/patient/Patientordonnances";
import PatientProfil from "./pages/patient/Patientprofil";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import LogoImg from "./assets/logo.png";

/* ─── Exports utiles pour Login.tsx et DashboardLayout.tsx ─── */
export { hasCustomServerUrl, setServerBaseUrl, getServerBaseUrl, clearServerBaseUrl };

/* ─────────────────────────────────────────────────────────────
   ÉCRAN DE CONFIGURATION SERVEUR
───────────────────────────────────────────────────────────── */
function ServerSetupScreen({ onDone }: { onDone: () => void }) {
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async () => {
        const val = input.trim();
        if (!val) { setError("Entrez une adresse."); return; }
        setBusy(true);
        setError("");
        try {
            setServerBaseUrl(val);
            onDone();
        } catch {
            setError("Adresse invalide.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center p-3"
            style={{ background: "linear-gradient(160deg,#0f2c1e 0%,#1A7A52 60%,#27A869 100%)" }}>
            <div className="bg-white rounded-4 p-4 w-100" style={{ maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
                <div className="text-center mb-4">
                    <img src={LogoImg} alt="Meditrack" style={{ width: "65%", maxWidth: 160 }} />
                    <h5 className="fw-bold mt-3 mb-1">Connexion au serveur</h5>
                    <p className="text-muted small mb-0">Entrez l'adresse IP et le port du backend</p>
                </div>

                <div className="input-group mb-2">
                    <span className="input-group-text bg-light">
                        <i className="bi bi-hdd-network text-success"></i>
                    </span>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="192.168.1.X:8080"
                        value={input}
                        onChange={e => { setInput(e.target.value); setError(""); }}
                        onKeyDown={e => e.key === "Enter" && submit()}
                        autoCapitalize="none"
                        autoCorrect="off"
                        style={{ fontFamily: "monospace" }}
                    />
                </div>

                {error && (
                    <div className="text-danger small mb-2">
                        <i className="bi bi-exclamation-triangle-fill me-1"></i>{error}
                    </div>
                )}

                <button
                    className="btn w-100 text-white fw-semibold mt-1"
                    style={{ background: "linear-gradient(135deg,#1A7A52,#27A869)", borderRadius: 10, padding: "12px" }}
                    onClick={submit}
                    disabled={busy}
                >
                    {busy
                        ? <span className="spinner-border spinner-border-sm me-2"></span>
                        : <i className="bi bi-plug-fill me-2"></i>
                    }
                    Se connecter
                </button>

                <p className="text-muted text-center mt-3 mb-0" style={{ fontSize: 11 }}>
                    <i className="bi bi-info-circle me-1"></i>
                    Le serveur doit être sur le même réseau Wi-Fi
                </p>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   PROTECTION ROUTES PATIENT
───────────────────────────────────────────────────────────── */
function PatientRoute({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user && user.role.toUpperCase() !== "PATIENT") return <Navigate to="/login" replace />;
    return <>{children}</>;
}

function LoginRedirect() {
    const { isAuthenticated, user } = useAuth();
    if (isAuthenticated && user?.role.toUpperCase() === "PATIENT")
        return <Navigate to="/dashboard/patient" replace />;
    return <Navigate to="/login" replace />;
}

/* ─────────────────────────────────────────────────────────────
   ROUTES PATIENT
───────────────────────────────────────────────────────────── */
function PatientApp() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<LoginRedirect />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Inscription />} />

                <Route path="/dashboard/patient" element={
                    <PatientRoute><PatientDashboard /></PatientRoute>
                } />
                <Route path="/dashboard/patient/rendez-vous" element={
                    <PatientRoute><PatientRendezVous /></PatientRoute>
                } />
                <Route path="/dashboard/patient/dossier" element={
                    <PatientRoute><PatientDossier /></PatientRoute>
                } />
                <Route path="/dashboard/patient/ordonnances" element={
                    <PatientRoute><PatientOrdonnances /></PatientRoute>
                } />
                <Route path="/dashboard/patient/profil" element={
                    <PatientRoute><PatientProfil /></PatientRoute>
                } />

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </AuthProvider>
    );
}

/* ─────────────────────────────────────────────────────────────
   APP ROOT
───────────────────────────────────────────────────────────── */
export default function App() {
    const [serverReady, setServerReady] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // Délai pour laisser le localStorage se monter dans la WebView Android
        const t = setTimeout(() => {
            setServerReady(hasCustomServerUrl());
            setChecking(false);
        }, 100);
        return () => clearTimeout(t);
    }, []);

    // Splash pendant vérification
    if (checking) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center"
                style={{ background: "linear-gradient(160deg,#0f2c1e 0%,#1A7A52 60%,#27A869 100%)" }}>
                <img src={LogoImg} alt="Meditrack" style={{ width: 140 }} />
            </div>
        );
    }

    if (!serverReady) {
        return <ServerSetupScreen onDone={() => setServerReady(true)} />;
    }

    return <PatientApp />;
}