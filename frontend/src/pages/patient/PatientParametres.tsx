import { useState, useEffect } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2", label: "Tableau de bord", path: "/dashboard/patient" },
    { icon: "bi-calendar-check", label: "Mes rendez-vous", path: "/dashboard/patient/rendez-vous" },
    { icon: "bi-folder2-open", label: "Mon dossier", path: "/dashboard/patient/dossier" },
    { icon: "bi-file-earmark-medical", label: "Ordonnances", path: "/dashboard/patient/ordonnances" },
    { icon: "bi-person-gear", label: "Mon profil", path: "/dashboard/patient/profil" },
];

export default function PatientParametres() {
    const { user } = useAuth();
    const [email, setEmail] = useState(true);
    const [sms, setSms] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const [theme, setTheme] = useState("light");
    const [langue, setLangue] = useState("fr");

    useEffect(() => {
        if (user) {
            // @ts-ignore
            setEmail(user.notificationsEmail ?? true);
            // @ts-ignore
            setSms(user.notificationsSms ?? false);
        }
        
        // Mock load local preferences
        const savedTheme = localStorage.getItem("meditrack_theme") || "light";
        const savedLangue = localStorage.getItem("meditrack_langue") || "fr";
        setTheme(savedTheme);
        setLangue(savedLangue);
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        setSuccess(false);
        try {
            await userService.updatePreferences({ email, sms });
            localStorage.setItem("meditrack_theme", theme);
            localStorage.setItem("meditrack_langue", langue);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Erreur de sauvegarde", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout navItems={NAV} title="Paramètres">
            <style>
                {`
                    .custom-switch .form-check-input:checked {
                        background-color: #27A869;
                        border-color: #27A869;
                    }
                    .custom-switch .form-check-input:focus {
                        border-color: #27A869;
                        box-shadow: 0 0 0 0.25rem rgba(39, 168, 105, 0.25);
                    }
                `}
            </style>
            <div className="bg-white p-4 rounded-4 shadow-sm border" style={{ maxWidth: 600 }}>
                <h4 className="fw-bold mb-4" style={{ color: "#27A869" }}><i className="bi bi-gear-fill me-2"></i>Vos Paramètres</h4>
                
                {success && (
                    <div className="alert py-2 d-flex align-items-center mb-4" style={{ backgroundColor: "#DCFCE7", color: "#27A869", border: "1px solid #27A869" }}>
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Paramètres mis à jour avec succès.
                    </div>
                )}

                <div className="mb-4">
                    <h6 className="fw-bold text-secondary mb-3 text-uppercase" style={{ fontSize: 13, letterSpacing: 0.5 }}>
                        Préférences de Notification
                    </h6>
                    
                    <div className="d-flex align-items-center justify-content-between p-3 border rounded-3 mb-3" style={{ background: "#FAFAFA" }}>
                        <div>
                            <div className="fw-semibold text-dark">Notifications par Email</div>
                            <div className="text-muted small">Recevez des mises à jour sur vos rendez-vous par email.</div>
                        </div>
                        <div className="form-check form-switch custom-switch">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                role="switch" 
                                checked={email}
                                onChange={(e) => setEmail(e.target.checked)}
                                style={{ width: 40, height: 20, cursor: "pointer" }}
                            />
                        </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between p-3 border rounded-3" style={{ background: "#FAFAFA" }}>
                        <div>
                            <div className="fw-semibold text-dark">Notifications par SMS</div>
                            <div className="text-muted small">Recevez des rappels urgents directement sur votre téléphone.</div>
                        </div>
                        <div className="form-check form-switch custom-switch">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                role="switch" 
                                checked={sms}
                                onChange={(e) => setSms(e.target.checked)}
                                style={{ width: 40, height: 20, cursor: "pointer" }}
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <h6 className="fw-bold text-secondary mb-3 text-uppercase" style={{ fontSize: 13, letterSpacing: 0.5 }}>
                        Apparence & Langue
                    </h6>
                    
                    <div className="d-flex align-items-center justify-content-between p-3 border rounded-3 mb-3" style={{ background: "#FAFAFA" }}>
                        <div>
                            <div className="fw-semibold text-dark d-flex align-items-center">
                                <i className={`bi ${theme === "dark" ? "bi-moon-stars-fill" : "bi-sun-fill"} me-2`} style={{ color: theme === "dark" ? "#6366f1" : "#f59e0b" }}></i>
                                Mode Sombre
                            </div>
                            <div className="text-muted small">Basculez vers un thème sombre pour soulager vos yeux.</div>
                        </div>
                        <div className="form-check form-switch custom-switch">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                role="switch" 
                                checked={theme === "dark"}
                                onChange={(e) => {
                                    const newTheme = e.target.checked ? "dark" : "light";
                                    setTheme(newTheme);
                                    document.documentElement.setAttribute("data-theme", newTheme);
                                }}
                                style={{ width: 40, height: 20, cursor: "pointer" }}
                            />
                        </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between p-3 border rounded-3" style={{ background: "#FAFAFA" }}>
                        <div>
                            <div className="fw-semibold text-dark d-flex align-items-center">
                                <i className="bi bi-translate me-2" style={{ color: "#27A869" }}></i>
                                Langue
                            </div>
                            <div className="text-muted small">Choisissez la langue de l'interface.</div>
                        </div>
                        <div>
                            <select 
                                className="form-select form-select-sm" 
                                value={langue} 
                                onChange={(e) => setLangue(e.target.value)}
                                style={{ width: 120, cursor: "pointer", borderColor: "#E5E7EB" }}
                            >
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end mt-4">
                    <button onClick={handleSave} disabled={saving} className="btn text-white px-4 fw-semibold rounded-3" style={{ background: "#27A869", border: "none" }}>
                        {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-save me-2"></i>}
                        Enregistrer
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
