import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import "../../components/dashboard/DashboardLayout.css";
import PatientAccueil from "./patient/PatientAccueil";
import PatientRendezVous from "./patient/PatientRendezVous";
import PatientDossier from "./patient/PatientDossier";
import PatientOrdonnances from "./patient/PatientOrdonnances";
import PatientProfil from "./patient/PatientProfil";

const navItems = [
    { to: "/dashboard/patient", icon: "house-heart", label: "Accueil" },
    { to: "/dashboard/patient/rendez-vous", icon: "calendar2-plus", label: "Mes rendez-vous" },
    { to: "/dashboard/patient/dossier", icon: "folder2-open", label: "Mon dossier" },
    { to: "/dashboard/patient/ordonnances", icon: "file-medical", label: "Ordonnances" },
    { to: "/dashboard/patient/profil", icon: "person-circle", label: "Mon profil" },
];

export default function PatientDashboard() {
    return (
        <DashboardLayout navItems={navItems} accentColor="#1A7A52" role="PATIENT">
            <Routes>
                <Route index element={<PatientAccueil />} />
                <Route path="rendez-vous" element={<PatientRendezVous />} />
                <Route path="dossier" element={<PatientDossier />} />
                <Route path="ordonnances" element={<PatientOrdonnances />} />
                <Route path="profil" element={<PatientProfil />} />
                <Route path="*" element={<Navigate to="/dashboard/patient" replace />} />
            </Routes>
        </DashboardLayout>
    );
}