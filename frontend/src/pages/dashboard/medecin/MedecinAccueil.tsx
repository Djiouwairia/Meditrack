import { useEffect, useState } from "react";
import { rendezVousAPI, medecinAPI } from "../../../services/api.ts";
import { useAuth } from "../../../context/AuthContext";

interface RDV {
    id: string;
    patient: { nom: string; prenom: string };
    date: string;
    heure: string;
    motif: string;
    statut: string;
}

export default function MedecinAccueil() {
    const { user } = useAuth();
    const [rdvAujourdhui, setRdvAujourdhui] = useState<RDV[]>([]);
    const [stats, setStats] = useState({ total: 0, confirmes: 0, en_attente: 0 });
    const [loading, setLoading] = useState(true);
    const [medecin, setMedecin] = useState<any>(null);

    useEffect(() => {
        if (!user?.id) return;
        Promise.all([
            rendezVousAPI.getAgendaAujourdhui(user.id),
            medecinAPI.getById(user.id),
        ])
            .then(([rdvRes, medRes]) => {
                const rdvs: RDV[] = rdvRes.data;
                setRdvAujourdhui(rdvs);
                setMedecin(medRes.data);
                setStats({
                    total: rdvs.length,
                    confirmes: rdvs.filter((r) => r.statut === "CONFIRME").length,
                    en_attente: rdvs.filter((r) => r.statut === "PLANIFIE").length,
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const handleTerminer = async (id: string) => {
        const diagnostic = prompt("Entrez le diagnostic :");
        if (!diagnostic) return;
        try {
            await rendezVousAPI.terminer(id, diagnostic);
            setRdvAujourdhui((prev) =>
                prev.map((r) => (r.id === id ? { ...r, statut: "TERMINE" } : r))
            );
        } catch (e) {
            alert("Erreur lors de la mise à jour.");
        }
    };

    const handleAnnuler = async (id: string) => {
        if (!confirm("Annuler ce rendez-vous ?")) return;
        try {
            await rendezVousAPI.annuler(id);
            setRdvAujourdhui((prev) =>
                prev.map((r) => (r.id === id ? { ...r, statut: "ANNULE" } : r))
            );
        } catch (e) {
            alert("Erreur.");
        }
    };

    const statutBadge = (s: string) => {
        const map: Record<string, string> = {
            PLANIFIE: "badge-status badge-planifie",
            CONFIRME: "badge-status badge-confirme",
            ANNULE: "badge-status badge-annule",
            TERMINE: "badge-status badge-termine",
        };
        return <span className={map[s] || "badge-status"}>{s}</span>;
    };

    if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

    return (
        <div>
            <h1 className="page-title">
                Bonjour, Dr. {medecin?.prenom} {medecin?.nom} 👋
            </h1>
            <p className="page-subtitle">
                {medecin?.specialite} — {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>

            {/* Stats */}
            <div className="row g-3 mb-4">
                {[
                    { label: "RDV aujourd'hui", value: stats.total, icon: "calendar2-check", color: "#e8f8f0", iconColor: "#1A7A52" },
                    { label: "Confirmés", value: stats.confirmes, icon: "check-circle", color: "#e8f8f0", iconColor: "#27A869" },
                    { label: "En attente", value: stats.en_attente, icon: "clock", color: "#fff8e1", iconColor: "#f39c12" },
                    { label: "Disponibilité", value: medecin?.disponible ? "Actif" : "Inactif", icon: "toggle-on", color: medecin?.disponible ? "#e8f8f0" : "#fdecea", iconColor: medecin?.disponible ? "#1A7A52" : "#e74c3c" },
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

            {/* Agenda du jour */}
            <div className="dash-card">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Agenda du jour</h2>
                        <p className="section-sub">{stats.total} rendez-vous planifiés</p>
                    </div>
                </div>

                {rdvAujourdhui.length === 0 ? (
                    <div className="empty-state">
                        <i className="bi bi-calendar-x" />
                        <p>Aucun rendez-vous aujourd'hui</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className="dash-table">
                            <thead>
                            <tr>
                                <th>Heure</th>
                                <th>Patient</th>
                                <th>Motif</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {rdvAujourdhui.map((rdv) => (
                                <tr key={rdv.id}>
                                    <td><strong>{rdv.heure}</strong></td>
                                    <td>{rdv.patient?.prenom} {rdv.patient?.nom}</td>
                                    <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{rdv.motif || "—"}</td>
                                    <td>{statutBadge(rdv.statut)}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: "0.4rem" }}>
                                            {rdv.statut === "CONFIRME" && (
                                                <button
                                                    className="btn-primary-green"
                                                    style={{ fontSize: "0.78rem", padding: "0.3rem 0.7rem" }}
                                                    onClick={() => handleTerminer(rdv.id)}
                                                >
                                                    <i className="bi bi-check2-circle" /> Terminer
                                                </button>
                                            )}
                                            {(rdv.statut === "PLANIFIE" || rdv.statut === "CONFIRME") && (
                                                <button className="btn-danger-soft" onClick={() => handleAnnuler(rdv.id)}>
                                                    <i className="bi bi-x" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}