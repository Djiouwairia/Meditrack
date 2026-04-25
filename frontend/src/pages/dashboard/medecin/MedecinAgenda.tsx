import { useEffect, useState } from "react";
import { rendezVousAPI } from "../../../services/api.ts";
import { useAuth } from "../../../context/AuthContext";

interface RDV {
    id: string;
    patient: { nom: string; prenom: string };
    date: string;
    heure: string;
    motif: string;
    statut: string;
    diagnostic?: string;
}

export default function MedecinAgenda() {
    const { user } = useAuth();
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

    const [debut, setDebut] = useState(today);
    const [fin, setFin] = useState(nextWeek);
    const [rdvs, setRdvs] = useState<RDV[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAgenda = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const { data } = await rendezVousAPI.getAgendaMedecin(user.id, debut, fin);
            setRdvs(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAgenda(); }, [user]);

    const handleConfirmer = async (id: string) => {
        try {
            await rendezVousAPI.confirmer(id);
            setRdvs((prev) => prev.map((r) => r.id === id ? { ...r, statut: "CONFIRME" } : r));
        } catch { alert("Erreur."); }
    };

    const handleAnnuler = async (id: string) => {
        if (!confirm("Annuler ce rendez-vous ?")) return;
        try {
            await rendezVousAPI.annuler(id);
            setRdvs((prev) => prev.map((r) => r.id === id ? { ...r, statut: "ANNULE" } : r));
        } catch { alert("Erreur."); }
    };

    const handleTerminer = async (id: string) => {
        const diagnostic = prompt("Entrez le diagnostic :");
        if (!diagnostic) return;
        try {
            await rendezVousAPI.terminer(id, diagnostic);
            setRdvs((prev) => prev.map((r) => r.id === id ? { ...r, statut: "TERMINE", diagnostic } : r));
        } catch { alert("Erreur."); }
    };

    // Group by date
    const grouped = rdvs.reduce((acc: Record<string, RDV[]>, rdv) => {
        const d = rdv.date;
        if (!acc[d]) acc[d] = [];
        acc[d].push(rdv);
        return acc;
    }, {});

    const statutBadge = (s: string) => {
        const map: Record<string, string> = {
            PLANIFIE: "badge-status badge-planifie",
            CONFIRME: "badge-status badge-confirme",
            ANNULE: "badge-status badge-annule",
            TERMINE: "badge-status badge-termine",
        };
        return <span className={map[s] || "badge-status"}>{s}</span>;
    };

    return (
        <div>
            <h1 className="page-title">Agenda</h1>
            <p className="page-subtitle">Consultez et gérez vos rendez-vous</p>

            {/* Filtre dates */}
            <div className="dash-card mb-4">
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div className="form-group" style={{ margin: 0, flex: 1, minWidth: "160px" }}>
                        <label>Date début</label>
                        <input type="date" value={debut} onChange={(e) => setDebut(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ margin: 0, flex: 1, minWidth: "160px" }}>
                        <label>Date fin</label>
                        <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} />
                    </div>
                    <button className="btn-primary-green" onClick={fetchAgenda} disabled={loading}>
                        <i className="bi bi-search" /> Rechercher
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-spinner"><div className="spinner" /></div>
            ) : Object.keys(grouped).length === 0 ? (
                <div className="dash-card">
                    <div className="empty-state">
                        <i className="bi bi-calendar2-x" />
                        <p>Aucun rendez-vous sur cette période</p>
                    </div>
                </div>
            ) : (
                Object.entries(grouped)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, list]) => (
                        <div key={date} className="dash-card mb-3">
                            <div className="section-header">
                                <h3 className="section-title" style={{ fontSize: "1rem" }}>
                                    <i className="bi bi-calendar3 me-2" style={{ color: "#1A7A52" }} />
                                    {new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                                    <span style={{ marginLeft: "0.75rem", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>
                    {list.length} RDV
                  </span>
                                </h3>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table className="dash-table">
                                    <thead>
                                    <tr>
                                        <th>Heure</th>
                                        <th>Patient</th>
                                        <th>Motif</th>
                                        <th>Statut</th>
                                        <th>Diagnostic</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {list.sort((a, b) => a.heure.localeCompare(b.heure)).map((rdv) => (
                                        <tr key={rdv.id}>
                                            <td><strong>{rdv.heure}</strong></td>
                                            <td>{rdv.patient?.prenom} {rdv.patient?.nom}</td>
                                            <td style={{ color: "var(--muted)", fontSize: "0.83rem" }}>{rdv.motif || "—"}</td>
                                            <td>{statutBadge(rdv.statut)}</td>
                                            <td style={{ fontSize: "0.83rem", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {rdv.diagnostic || "—"}
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", gap: "0.4rem" }}>
                                                    {rdv.statut === "PLANIFIE" && (
                                                        <button className="btn-icon" title="Confirmer" onClick={() => handleConfirmer(rdv.id)}>
                                                            <i className="bi bi-check-lg" style={{ color: "#1A7A52" }} />
                                                        </button>
                                                    )}
                                                    {rdv.statut === "CONFIRME" && (
                                                        <button
                                                            className="btn-primary-green"
                                                            style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                                                            onClick={() => handleTerminer(rdv.id)}
                                                        >
                                                            <i className="bi bi-check2-all" /> Terminer
                                                        </button>
                                                    )}
                                                    {(rdv.statut === "PLANIFIE" || rdv.statut === "CONFIRME") && (
                                                        <button className="btn-danger-soft" title="Annuler" onClick={() => handleAnnuler(rdv.id)}>
                                                            <i className="bi bi-x-lg" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
            )}
        </div>
    );
}