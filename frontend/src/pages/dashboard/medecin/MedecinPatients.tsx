import { useEffect, useState } from "react";
import { rendezVousAPI, dossierAPI } from "../../../services/api.ts";
import { useAuth } from "../../../context/AuthContext";

interface Patient {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    groupeSanguin?: string;
    dateDeNaissance?: string;
}

interface DossierModal {
    patient: Patient;
    dossier: any;
}

export default function MedecinPatients() {
    const { user } = useAuth();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [dossierModal, setDossierModal] = useState<DossierModal | null>(null);
    const [dossierLoading, setDossierLoading] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        // Get all RDV, extract unique patients
        rendezVousAPI.getByMedecin(user.id, 0, 100)
            .then(({ data }) => {
                const seen = new Set<string>();
                const unique: Patient[] = [];
                (data.content || []).forEach((rdv: any) => {
                    if (rdv.patient && !seen.has(rdv.patient.id)) {
                        seen.add(rdv.patient.id);
                        unique.push(rdv.patient);
                    }
                });
                setPatients(unique);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const openDossier = async (patient: Patient) => {
        setDossierLoading(true);
        setDossierModal({ patient, dossier: null });
        try {
            const { data } = await dossierAPI.getByPatient(patient.id);
            setDossierModal({ patient, dossier: data });
        } catch {
            setDossierModal({ patient, dossier: null });
        } finally {
            setDossierLoading(false);
        }
    };

    const filtered = patients.filter(
        (p) =>
            `${p.nom} ${p.prenom} ${p.email}`.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

    return (
        <div>
            <h1 className="page-title">Mes patients</h1>
            <p className="page-subtitle">{patients.length} patient(s) suivi(s)</p>

            <div className="dash-card">
                <div className="section-header">
                    <input
                        type="search"
                        placeholder="Rechercher un patient…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            padding: "0.45rem 0.9rem",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            fontSize: "0.875rem",
                            outline: "none",
                            width: "260px",
                        }}
                    />
                </div>

                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <i className="bi bi-person-x" />
                        <p>Aucun patient trouvé</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className="dash-table">
                            <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th>Groupe sanguin</th>
                                <th>Date de naissance</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: "50%",
                                                background: "linear-gradient(135deg,#1A7A52,#27A869)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                color: "#fff", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0,
                                            }}>
                                                {p.prenom?.[0]}{p.nom?.[0]}
                                            </div>
                                            <span><strong>{p.prenom}</strong> {p.nom}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{p.email}</td>
                                    <td style={{ fontSize: "0.85rem" }}>{p.telephone || "—"}</td>
                                    <td>
                                        {p.groupeSanguin ? (
                                            <span style={{
                                                background: "#fdecea", color: "#c0392b",
                                                padding: "0.2em 0.5em", borderRadius: "6px",
                                                fontSize: "0.78rem", fontWeight: 700,
                                            }}>{p.groupeSanguin}</span>
                                        ) : "—"}
                                    </td>
                                    <td style={{ fontSize: "0.85rem" }}>
                                        {p.dateDeNaissance ? new Date(p.dateDeNaissance).toLocaleDateString("fr-FR") : "—"}
                                    </td>
                                    <td>
                                        <button className="btn-primary-green" style={{ fontSize: "0.78rem", padding: "0.3rem 0.7rem" }} onClick={() => openDossier(p)}>
                                            <i className="bi bi-folder2-open" /> Dossier
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Dossier Modal */}
            {dossierModal && (
                <div className="modal-overlay" onClick={() => setDossierModal(null)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-title">
                            <i className="bi bi-folder2-open" style={{ color: "#1A7A52" }} />
                            Dossier de {dossierModal.patient.prenom} {dossierModal.patient.nom}
                            <button className="modal-close" onClick={() => setDossierModal(null)}>
                                <i className="bi bi-x-lg" />
                            </button>
                        </div>
                        {dossierLoading ? (
                            <div className="loading-spinner"><div className="spinner" /></div>
                        ) : dossierModal.dossier ? (
                            <div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    {[
                                        { label: "Allergies", value: dossierModal.dossier.allergies, icon: "exclamation-triangle" },
                                        { label: "Poids", value: dossierModal.dossier.poids, icon: "graph-up" },
                                        { label: "Taille", value: dossierModal.dossier.taille, icon: "rulers" },
                                        { label: "Groupe sanguin", value: dossierModal.patient.groupeSanguin, icon: "droplet" },
                                    ].map((item) => (
                                        <div key={item.label} style={{
                                            background: "#f4f7f5", borderRadius: 10, padding: "0.75rem 1rem",
                                        }}>
                                            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                                                <i className={`bi bi-${item.icon} me-1`} />{item.label}
                                            </div>
                                            <div style={{ fontWeight: 700, color: "var(--text)" }}>{item.value || "Non renseigné"}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <i className="bi bi-folder-x" />
                                <p>Dossier médical introuvable</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}