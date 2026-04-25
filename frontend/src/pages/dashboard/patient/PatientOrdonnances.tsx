import { useEffect, useState } from "react";
import { ordonnanceAPI, dossierAPI } from "../../../services/api.ts";
import { useAuth } from "../../../context/AuthContext";

export default function PatientOrdonnances() {
    const { user } = useAuth();
    const [ordonnances, setOrdonnances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        dossierAPI.getByPatient(user.id)
            .then(({ data }) => ordonnanceAPI.getByDossier(data.id, 0, 50))
            .then(({ data }) => setOrdonnances(data.content || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

    return (
        <div>
            <h1 className="page-title">Mes ordonnances</h1>
            <p className="page-subtitle">{ordonnances.length} ordonnance(s)</p>

            {ordonnances.length === 0 ? (
                <div className="dash-card">
                    <div className="empty-state">
                        <i className="bi bi-file-medical" />
                        <p>Aucune ordonnance pour le moment</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {ordonnances.map((o) => (
                        <div key={o.id} className="dash-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                                <div>
                                    <div style={{ fontWeight: 700, color: "var(--text)" }}>
                                        <i className="bi bi-file-medical me-2" style={{ color: "#1A7A52" }} />
                                        Ordonnance du {o.dateCreation ? new Date(o.dateCreation).toLocaleDateString("fr-FR") : "—"}
                                    </div>
                                    {o.rendezVous?.medecin && (
                                        <div style={{ fontSize: "0.83rem", color: "var(--muted)", marginTop: 4 }}>
                                            Dr. {o.rendezVous.medecin.prenom} {o.rendezVous.medecin.nom} — {o.rendezVous.medecin.specialite}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {Object.entries(o.medicaments || {}).map(([med, pos]: [string, any]) => (
                                    <div key={med} style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        background: "#f4f7f5", borderRadius: 8, padding: "0.6rem 1rem",
                                    }}>
                    <span style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.9rem" }}>
                      <i className="bi bi-capsule me-2" style={{ color: "#1A7A52" }} />{med}
                    </span>
                                        <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{pos}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}