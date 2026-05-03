import { useEffect, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { notificationService, type Notification } from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",         label: "Tableau de bord",  path: "/dashboard/medecin" },
    { icon: "bi-calendar-check",       label: "Mon agenda",       path: "/dashboard/medecin/agenda" },
    { icon: "bi-people",               label: "Mes patients",     path: "/dashboard/medecin/patients" },
    { icon: "bi-file-earmark-medical", label: "Ordonnances",      path: "/dashboard/medecin/ordonnances" },
    { icon: "bi-person-gear",          label: "Mon profil",       path: "/dashboard/medecin/profil" },
];

export default function MedecinNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationService.getAll(0, 50);
            setNotifications(data.content);
        } catch (error) {
            console.error("Erreur lors du chargement des notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, lue: true } : n));
        } catch (error) {
            console.error("Erreur", error);
        }
    };

    return (
        <DashboardLayout navItems={NAV} title="Notifications">
            <div className="bg-white p-4 rounded-4 shadow-sm border">
                <h4 className="fw-bold mb-4"><i className="bi bi-bell-fill text-primary me-2"></i>Vos Notifications</h4>
                
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center text-muted py-5">
                        <i className="bi bi-bell-slash" style={{ fontSize: 48 }}></i>
                        <p className="mt-3">Vous n'avez aucune notification.</p>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {notifications.map(n => (
                            <div key={n.id} className={`p-3 rounded-3 border ${n.lue ? 'bg-light' : 'bg-white shadow-sm border-primary'}`} style={{ transition: "all 0.2s" }}>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h6 className={`mb-0 ${!n.lue ? 'fw-bold text-primary' : 'fw-semibold text-dark'}`}>
                                        {!n.lue && <span className="p-1 bg-danger rounded-circle d-inline-block me-2" style={{ width: 8, height: 8 }}></span>}
                                        {n.titre}
                                    </h6>
                                    <small className="text-muted">{new Date(n.dateCreation).toLocaleString("fr-FR")}</small>
                                </div>
                                <p className="mb-0 text-secondary" style={{ fontSize: 14 }}>{n.message}</p>
                                {!n.lue && (
                                    <div className="mt-2 text-end">
                                        <button onClick={() => handleMarkAsRead(n.id)} className="btn btn-sm btn-outline-primary" style={{ fontSize: 12 }}>
                                            <i className="bi bi-check2-all me-1"></i>Marquer comme lu
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
