import { useEffect, useState } from "react";
import { rendezVousAPI, patientAPI } from "../../../services/api.ts";
import { useAuth } from "../../../context/AuthContext";

export default function PatientAccueil() {
    const { user } = useAuth();
    const [rdvs, setRdvs] = useState<any[]>([]);
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        Promise.all([
            rendezVousAPI.getByPatient(user.id, 0, 50),
            patientAPI.getById(user.id),
        ])
            .then(([rdvRes, patRes]) => {
                setRdvs(rdvRes.data.content || []);
                setPatient(patRes.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const prochainRdv = rdvs
        .filter((r) => r.statut !== "ANNULE" && r.statut !== "TERMINE")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    const stats = {
        total: rdvs.length,
        confirmes: rdvs.filter((r) => r.statut === "CONFIRME").length,
        en_attente: rdvs.filter((r) => r.statut === "PLANIFIE").length,
        termines: rdvs.filter((r) => r.statut === "TERMINE").length,
    };

    if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

    return (
        <div>
            <h1 className="page-title">
                Bonjour, {patient?.prenom} {patient?.nom} 👋
            </h1>
            <p className="page-subtitle">
                Bienvenue sur votre espace patient Meditrack
            </p>

            {/* Stats */}
            <div className="row g-3 mb-4">
                {[
                    { label: "Total RDV", value: stats.total, icon: "calendar2", color: "#e8f8f0", iconColor: "#1A7A52" },
                    { label: "Confirmés", value: stats.confirmes, icon: "check-circle", color: "#e8f8f0", iconColor: "#27A869" },
                    { label: "En attente", value: stats.en_attente, icon: "clock", color: "#fff8e1", iconColor: "#f39c12" },
                    { label: "Consultations", value: stats.termines, icon: "patch-check", color: "#e8f4fd", iconColor: "#2980b9" },
                ].map((s, i) => (
                    <div key={i} className="col-6 col-lg-3">
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: s.color }}>
                                <i className={`bi bi-${s.icon}`} style={{ color: s.iconColor }} />
                            </div>
                            <div>
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Prochain RDV */}
            {prochainRdv && (
                <div className="dash-card mb-4" style={{
                    background: "linear-gradient(135deg, #1A7A52 0%, #27A869 100%)",
                    color: "#fff", border: "none",
                }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.8, marginBottom: "0.5rem" }}>
                        Prochain rendez-vous
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                        <div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>
                                {new Date(prochainRdv.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                            </div>
                            <div style={{ fontSize: "1rem", fontWeight: 600, opacity: 0.9 }}>{prochainRdv.heure}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                                Dr. {prochainRdv.medecin?.prenom} {prochainRdv.medecin?.nom}
                            </div>
                            <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>{prochainRdv.medecin?.specialite}</div>
                            {prochainRdv.motif && (
                                <div style={{ fontSize: "0.82rem", opacity: 0.75, marginTop: 4 }}>
                                    <i className="bi bi-chat-text me-1" />{prochainRdv.motif}
                                </div>
                            )}
                        </div>
                        <span style={{
                            background: "rgba(255,255,255,0.2)", borderRadius: 20,
                            padding: "0.25em 0.75em", fontSize: "0.75rem", fontWeight: 700,
                        }}>
              {prochainRdv.statut}
            </span>
                    </div>
                </div>
            )}

            {/* Derniers RDV */}
            <div className="dash-card">
                <div className="section-header">
                    <h2 className="section-title">Historique des rendez-vous</h2>
                </div>
                {rdvs.length === 0 ? (
                    <div className="empty-state">
                        <i className="bi bi-calendar-x" />
                        <p>Aucun rendez-vous pour le moment</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className="dash-table">
                            <thead>
                            <tr>
                                <th>Date</th>
                                <th>Médecin</th>
                                <th>Spécialité</th>
                                <th>Motif</th>
                                <th>Statut</th>
                            </tr>
                            </thead>
                            <tbody>
                            {rdvs.slice(0, 5).map((rdv) => {
                                const badge: Record<string, string> = {
                                    PLANIFIE: "badge-status badge-planifie",
                                    CONFIRME: "badge-status badge-confirme",
                                    ANNULE: "badge-status badge-annule",
                                    TERMINE: "badge-status badge-termine",
                                };
                                return (
                                    <tr key={rdv.id}>
                                        <td>
                                            {new Date(rdv.date).toLocaleDateString("fr-FR")} <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{rdv.heure}</span>
                                        </td>
                                        <td>Dr. {rdv.medecin?.prenom} {rdv.medecin?.nom}</td>
                                        <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{rdv.medecin?.specialite}</td>
                                        <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{rdv.motif || "—"}</td>
                                        <td><span className={badge[rdv.statut] || "badge-status"}>{rdv.statut}</span></td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}