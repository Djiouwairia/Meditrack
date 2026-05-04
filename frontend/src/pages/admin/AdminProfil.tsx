import { useEffect, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { authService, type AuthUser } from "../../services/Authservice";

const NAV = [
    { icon: "bi-speedometer2",  label: "Tableau de bord", path: "/dashboard/admin" },
    { icon: "bi-hospital",      label: "Hôpitaux",        path: "/dashboard/admin/hopitaux" },
    { icon: "bi-people",        label: "Utilisateurs",    path: "/dashboard/admin/utilisateurs" },
    { icon: "bi-person-badge",  label: "Médecins",        path: "/dashboard/admin/medecins" },
    { icon: "bi-person-gear",   label: "Mon profil",      path: "/dashboard/admin/profil" },
];

export default function AdminProfil() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<AuthUser | null>(null);

    useEffect(() => {
        if (user) {
            setProfile(user);
        } else {
            setProfile(authService.getCurrentUser());
        }
    }, [user]);

    if (!profile) return null;

    return (
        <DashboardLayout navItems={NAV} title="Mon Profil Admin">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    {/* Main Profile Card */}
                    <div className="bg-white rounded-4 shadow-sm border overflow-hidden">
                        
                        {/* Banner Top */}
                        <div 
                            style={{ 
                                height: 140, 
                                background: "var(--gradient-primary)",
                                position: "relative"
                            }}
                        />

                        {/* Profile Info Container */}
                        <div className="px-5 pb-5" style={{ position: "relative" }}>
                            
                            {/* Overlapping Avatar */}
                            <div className="d-flex justify-content-between align-items-end mb-4" style={{ marginTop: "-50px" }}>
                                <div
                                    className="d-flex align-items-center justify-content-center bg-white shadow"
                                    style={{ 
                                        width: 100, 
                                        height: 100, 
                                        borderRadius: "50%", 
                                        fontSize: 36, 
                                        fontWeight: 800,
                                        border: "4px solid #fff",
                                        color: "#27A869",
                                        zIndex: 10
                                    }}
                                >
                                    {profile.prenom?.[0] || "?"}{profile.nom?.[0] || "?"}
                                </div>
                                <span className="badge px-3 py-2 shadow-sm" style={{ background: "#dcfce7", color: "#27A869", fontSize: 13 }}>
                                    <i className="bi bi-shield-check me-2"></i>
                                    {profile.role}
                                </span>
                            </div>

                            {/* Name & Title */}
                            <div className="mb-5 border-bottom pb-4">
                                <h2 className="fw-bold mb-1 text-dark">
                                    {profile.prenom || "Admin"} {profile.nom || ""}
                                </h2>
                                <p className="text-muted mb-0">
                                    Administrateur Système
                                </p>
                            </div>

                            {/* Details Grid */}
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="p-3 rounded-4 border-0 d-flex align-items-center gap-3 transition-all hover-scale" style={{ background: "#f8f9fa", transition: "0.2s" }}>
                                        <div className="bg-white p-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, color: "#27A869" }}>
                                            <i className="bi bi-person"></i>
                                        </div>
                                        <div>
                                            <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Prénom</div>
                                            <div className="fw-medium text-dark">{profile.prenom || "Non défini"}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="col-md-6">
                                    <div className="p-3 rounded-4 border-0 d-flex align-items-center gap-3 transition-all hover-scale" style={{ background: "#f8f9fa", transition: "0.2s" }}>
                                        <div className="bg-white p-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, color: "#27A869" }}>
                                            <i className="bi bi-person-badge"></i>
                                        </div>
                                        <div>
                                            <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Nom</div>
                                            <div className="fw-medium text-dark">{profile.nom || "Non défini"}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <div className="p-3 rounded-4 border-0 d-flex align-items-center gap-3 transition-all hover-scale" style={{ background: "#f8f9fa", transition: "0.2s" }}>
                                        <div className="bg-white p-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, color: "#27A869" }}>
                                            <i className="bi bi-envelope"></i>
                                        </div>
                                        <div>
                                            <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Adresse Email</div>
                                            <div className="fw-medium text-dark">{profile.email}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 text-center p-3 rounded-3" style={{ background: "#f8f9fa" }}>
                                <i className="bi bi-info-circle me-2" style={{ color: "#27A869" }}></i>
                                <span className="text-muted small">
                                    Les modifications de profil administrateur doivent être effectuées via la base de données.
                                </span>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
