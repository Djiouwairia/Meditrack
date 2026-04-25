import { useEffect, useState } from "react";
import { patientAPI, medecinAPI, rendezVousAPI, secretaireAPI } from "../../../services/api.ts";
import { useAuth } from "../../../context/AuthContext";

export default function SecretaireAccueil() {
    const { user } = useAuth();
    const [secretaire, setSecretaire] = useState<any>(null);
    const [stats, setStats] = useState({ patients: 0, medecins: 0, rdvAujourdhui: 0, rdvAttente: 0 });
    const [rdvsRecents, setRdvsRecents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        // @ts-ignore
        const today = new Date().toISOString().split("T")[0];
        Promise.all([
            secretaireAPI.getById(user.id),
            patientAPI.getAll(0, 1),
            medecinAPI.getAll(0, 1),
        ])
            .then(async ([secRes, patRes, medRes]) => {
                setSecretaire(secRes.data);
                const totalPat = patRes.data.totalElements || 0;
                const totalMed = medRes.data.totalElements || 0;

                // Get all medecins to fetch today's agenda
                const { data: allMeds } = await medecinAPI.getAll(0, 100);
                const medList = allMeds.content || [];
                const allRdvPromises = medList.map((m: any) =>
                    rendezVousAPI.getAgendaAujourdhui(m.id).catch(() => [])
                );
                const allRdvs = (await Promise.all(allRdvPromises)).flat();

                setStats({
                    patients: totalPat,
                    medecins: totalMed,
                    rdvAujourdhui: allRdvs.length,
                    rdvAttente: allRdvs.filter((r: any) => r.statut === "PLANIFIE").length,
                });
                setRdvsRecents(allRdvs.slice(0, 5));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const badge: Record<string, string> = {
        PLANIFIE: "badge-status badge-planifie",
        CONFIRME: "badge-status badge-confirme",
        ANNULE: "badge-status badge-annule",
        TERMINE: "badge-status badge-termine",
    };

    if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

    return (
        <div>
            <h1 className="page-title">
                Bonjour, {secretaire?.prenom} {secretaire?.nom} 👋
            </h1>
            <p className="page-subtitle">
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>

            <div className="row g-3 mb-4">
                {[
                    { label: "Patients enregistrés", value: stats.patients, icon: "people", color: "#e8f8f0", iconColor: "#1A7A52" },
                    { label: "Médecins", value: stats.medecins, icon: "hospital", color: "#e8f4fd", iconColor: "#2980b9" },
                    { label: "RDV aujourd'hui", value: stats.rdvAujourdhui, icon: "calendar2-check", color: "#fff8e1", iconColor: "#f39c12" },
                    { label: "En attente", value: stats.rdvAttente, icon: "hourglass-split", color: "#fdecea", iconColor: "#e74c3c" },
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

            <div className="dash-card">
                <div className="section-header">
                    <h2 className="section-title">RDV du jour</h2>
                </div>
                {rdvsRecents.length === 0 ? (
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
                                <th>Médecin</th>
                                <th>Statut</th>
                            </tr>
                            </thead>
                            <tbody>
                            {rdvsRecents.map((rdv) => (
                                <tr key={rdv.id}>
                                    <td><strong>{rdv.heure}</strong></td>
                                    <td>{rdv.patient?.prenom} {rdv.patient?.nom}</td>
                                    <td>Dr. {rdv.medecin?.prenom} {rdv.medecin?.nom}</td>
                                    <td><span className={badge[rdv.statut] || "badge-status"}>{rdv.statut}</span></td>
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