import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import "../../components/dashboard/DashboardLayout.css";
import SecretaireAccueil from "./secretaire/SecretaireAccueil";
import SecretairePatients from "./secretaire/SecretairePatients";
import SecretaireRendezVous from "./secretaire/SecretaireRendezVous";
import SecretaireMedecins from "./secretaire/SecretaireMedecins";
import SecretaireProfil from "./secretaire/SecretaireProfil";

const navItems = [
    { to: "/dashboard/secretaire", icon: "house-heart", label: "Accueil" },
    { to: "/dashboard/secretaire/patients", icon: "people", label: "Patients" },
    { to: "/dashboard/secretaire/rendez-vous", icon: "calendar2-check", label: "Rendez-vous" },
    { to: "/dashboard/secretaire/medecins", icon: "hospital", label: "Médecins" },
    { to: "/dashboard/secretaire/profil", icon: "person-circle", label: "Mon profil" },
];

export default function SecretaireDashboard() {
    return (
        <DashboardLayout navItems={navItems} accentColor="#1A7A52" role="SECRÉTAIRE">
            <Routes>
                <Route index element={<SecretaireAccueil />} />
                <Route path="patients" element={<SecretairePatients />} />
                <Route path="rendez-vous" element={<SecretaireRendezVous />} />
                <Route path="medecins" element={<SecretaireMedecins />} />
                <Route path="profil" element={<SecretaireProfil />} />
                <Route path="*" element={<Navigate to="/dashboard/secretaire" replace />} />
            </Routes>
        </DashboardLayout>
    );
}