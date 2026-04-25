import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import "../../components/dashboard/DashboardLayout.css";
import MedecinAccueil from "./medecin/MedecinAccueil";
import MedecinAgenda from "./medecin/MedecinAgenda";
import MedecinPatients from "./medecin/MedecinPatients";
import MedecinOrdonnances from "./medecin/MedecinOrdonnances";
import MedecinProfil from "./medecin/MedecinProfil";

const navItems = [
    { to: "/dashboard/medecin", icon: "house-heart", label: "Accueil" },
    { to: "/dashboard/medecin/agenda", icon: "calendar2-week", label: "Agenda" },
    { to: "/dashboard/medecin/patients", icon: "people", label: "Mes patients" },
    { to: "/dashboard/medecin/ordonnances", icon: "file-medical", label: "Ordonnances" },
    { to: "/dashboard/medecin/profil", icon: "person-circle", label: "Mon profil" },
];

export default function MedecinDashboard() {
    return (
        <DashboardLayout navItems={navItems} accentColor="#1A7A52" role="MÉDECIN">
            <Routes>
                <Route index element={<MedecinAccueil />} />
                <Route path="agenda" element={<MedecinAgenda />} />
                <Route path="patients" element={<MedecinPatients />} />
                <Route path="ordonnances" element={<MedecinOrdonnances />} />
                <Route path="profil" element={<MedecinProfil />} />
                <Route path="*" element={<Navigate to="/dashboard/medecin" replace />} />
            </Routes>
        </DashboardLayout>
    );
}