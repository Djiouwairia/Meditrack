import { useEffect, useState } from "react";
import { ordonnanceAPI, rendezVousAPI } from "../../../services/api.ts";
import { useAuth } from "../../../context/AuthContext";

interface Ordonnance {
    id: string;
    medicaments: Record<string, string>;
    dateCreation: string;
    rendezVous?: { id: string; patient: { nom: string; prenom: string }; date: string };
}

export default function MedecinOrdonnances() {
    const { user } = useAuth();
    const [rdvs, setRdvs] = useState<any[]>([]);
    const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ rendezVousId: "", medicaments: [{ nom: "", posologie: "" }] });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        rendezVousAPI.getByMedecin(user.id, 0, 50)
            .then(({ data }) => {
                const rdvList = data.content || [];
                setRdvs(rdvList.filter((r: any) => r.statut === "TERMINE"));
                // Fetch ordonnances for each terminated RDV
                return Promise.all(
                    rdvList
                        .filter((r: any) => r.statut === "TERMINE")
                        .map((r: any) =>
                            ordonnanceAPI.getByRendezVous(r.id).then(({ data: d }) =>
                                (d.content || []).map((o: any) => ({ ...o, rendezVous: r }))
                            ).catch(() => [])
                        )
                );
            })
            .then((nested) => {
                setOrdonnances(nested.flat());
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const addMedicament = () =>
        setForm((f) => ({ ...f, medicaments: [...f.medicaments, { nom: "", posologie: "" }] }));

    const removeMedicament = (i: number) =>
        setForm((f) => ({ ...f, medicaments: f.medicaments.filter((_, idx) => idx !== i) }));

    const handleSubmit = async () => {
        if (!form.rendezVousId) { alert("Sélectionnez un rendez-vous."); return; }
        setSaving(true);
        try {
            const medicaments: Record<string, string> = {};
            form.medicaments.forEach((m) => { if (m.nom) medicaments[m.nom] = m.posologie; });
            await ordonnanceAPI.creer({ rendezVousId: form.rendezVousId, medicaments });
            setShowModal(false);
            setForm({ rendezVousId: "", medicaments: [{ nom: "", posologie: "" }] });
            // Refresh
            window.location.reload();
        } catch { alert("Erreur lors de la création."); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cette ordonnance ?")) return;
        try {
            await ordonnanceAPI.delete(id);
            setOrdonnances((prev) => prev.filter((o) => o.id !== id));
        } catch { alert("Erreur."); }
    };

    if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

    return (
        <div>
            <h1 className="page-title">Ordonnances</h1>
            <p className="page-subtitle">{ordonnances.length} ordonnance(s) émise(s)</p>

            <div className="dash-card">
                <div className="section-header">
                    <div />
                    <button className="btn-primary-green" onClick={() => setShowModal(true)}>
                        <i className="bi bi-plus-lg" /> Nouvelle ordonnance
                    </button>
                </div>

                {ordonnances.length === 0 ? (
                    <div className="empty-state">
                        <i className="bi bi-file-medical" />
                        <p>Aucune ordonnance émise</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className="dash-table">
                            <thead>
                            <tr>
                                <th>Date</th>
                                <th>Patient</th>
                                <th>Médicaments</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {ordonnances.map((o) => (
                                <tr key={o.id}>
                                    <td style={{ fontSize: "0.85rem" }}>
                                        {o.dateCreation ? new Date(o.dateCreation).toLocaleDateString("fr-FR") : "—"}
                                    </td>
                                    <td>
                                        {o.rendezVous?.patient
                                            ? `${o.rendezVous.patient.prenom} ${o.rendezVous.patient.nom}`
                                            : "—"}
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                            {Object.entries(o.medicaments || {}).map(([med, pos]) => (
                                                <span key={med} style={{
                                                    background: "#e8f8f0", color: "#1A7A52",
                                                    padding: "0.2em 0.55em", borderRadius: "6px",
                                                    fontSize: "0.75rem", fontWeight: 600,
                                                }} title={pos}>{med}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <button className="btn-danger-soft" onClick={() => handleDelete(o.id)}>
                                            <i className="bi bi-trash3" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal nouvelle ordonnance */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-title">
                            <i className="bi bi-file-medical" style={{ color: "#1A7A52" }} />
                            Nouvelle ordonnance
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <i className="bi bi-x-lg" />
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Rendez-vous (terminés)</label>
                            <select value={form.rendezVousId} onChange={(e) => setForm((f) => ({ ...f, rendezVousId: e.target.value }))}>
                                <option value="">— Sélectionner —</option>
                                {rdvs.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {new Date(r.date).toLocaleDateString("fr-FR")} — {r.patient?.prenom} {r.patient?.nom}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: "0.75rem" }}>
                            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Médicaments
                            </label>
                        </div>

                        {form.medicaments.map((m, i) => (
                            <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                <input
                                    placeholder="Médicament"
                                    value={m.nom}
                                    onChange={(e) => {
                                        const updated = [...form.medicaments];
                                        updated[i] = { ...updated[i], nom: e.target.value };
                                        setForm((f) => ({ ...f, medicaments: updated }));
                                    }}
                                    style={{ flex: 1, padding: "0.45rem 0.7rem", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.85rem" }}
                                />
                                <input
                                    placeholder="Posologie"
                                    value={m.posologie}
                                    onChange={(e) => {
                                        const updated = [...form.medicaments];
                                        updated[i] = { ...updated[i], posologie: e.target.value };
                                        setForm((f) => ({ ...f, medicaments: updated }));
                                    }}
                                    style={{ flex: 1, padding: "0.45rem 0.7rem", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.85rem" }}
                                />
                                {form.medicaments.length > 1 && (
                                    <button className="btn-danger-soft" onClick={() => removeMedicament(i)}>
                                        <i className="bi bi-x" />
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            onClick={addMedicament}
                            style={{ background: "none", border: "1px dashed var(--border)", borderRadius: 8, padding: "0.4rem 0.9rem", fontSize: "0.82rem", color: "var(--muted)", cursor: "pointer", marginBottom: "1.25rem", width: "100%" }}
                        >
                            <i className="bi bi-plus-circle me-1" /> Ajouter un médicament
                        </button>

                        <button className="btn-primary-green" style={{ width: "100%", justifyContent: "center" }} onClick={handleSubmit} disabled={saving}>
                            {saving ? "Enregistrement…" : <><i className="bi bi-check2" /> Créer l'ordonnance</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}