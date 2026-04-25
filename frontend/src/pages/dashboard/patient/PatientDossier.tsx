import { useEffect, useState } from "react";
import { dossierAPI } from "../../../services/api.ts";
import { useAuth } from "../../../context/AuthContext";

export default function PatientDossier() {
    const { user } = useAuth();
    const [dossier, setDossier] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ allergies: "", poids: "", taille: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        dossierAPI.getByPatient(user.id)
            .then(({ data }) => { setDossier(data); setForm({ allergies: data.allergies || "", poids: data.poids || "", taille: data.taille || "" }); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const handleSave = async () => {
        if (!dossier) return;
        setSaving(true);
        try {
            const { data } = await dossierAPI.update(dossier.id, { patientId: user!.id, ...form });
            setDossier(data);
            setEditing(false);
        } catch { alert("Erreur."); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

    return (
        <div style={{ maxWidth: 680 }}>
            <h1 className="page-title">Mon dossier médical</h1>
            <p className="page-subtitle">Informations médicales personnelles</p>

            {!dossier ? (
                <div className="dash-card">
                    <div className="empty-state">
                        <i className="bi bi-folder-x" />
                        <p>Dossier médical non trouvé</p>
                    </div>
                </div>
            ) : (
                <div className="dash-card">
                    <div className="section-header">
                        <h2 className="section-title">Informations médicales</h2>
                        <button
                            onClick={() => setEditing(!editing)}
                            style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "0.35rem 0.8rem", fontSize: "0.82rem", cursor: "pointer", color: "var(--text)", fontWeight: 600 }}
                        >
                            <i className={`bi bi-${editing ? "x" : "pencil"} me-1`} />
                            {editing ? "Annuler" : "Modifier"}
                        </button>
                    </div>

                    {!editing ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            {[
                                { label: "Allergies", value: form.allergies, icon: "exclamation-triangle", color: "#fff8e1", textColor: "#e67e22" },
                                { label: "Poids", value: form.poids ? `${form.poids} kg` : null, icon: "graph-up", color: "#e8f8f0", textColor: "#1A7A52" },
                                { label: "Taille", value: form.taille ? `${form.taille} cm` : null, icon: "rulers", color: "#e8f4fd", textColor: "#2980b9" },
                            ].map((item) => (
                                <div key={item.label} style={{ background: item.color, borderRadius: 12, padding: "1rem 1.25rem" }}>
                                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: item.textColor, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.8, marginBottom: 6 }}>
                                        <i className={`bi bi-${item.icon} me-1`} />{item.label}
                                    </div>
                                    <div style={{ fontWeight: 800, color: item.textColor, fontSize: "1rem" }}>{item.value || "Non renseigné"}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <div className="form-group">
                                <label>Allergies</label>
                                <textarea rows={2} value={form.allergies}
                                          onChange={(e) => setForm((f) => ({ ...f, allergies: e.target.value }))}
                                          placeholder="Pénicilline, aspirine, noix…" />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Poids (kg)</label>
                                    <input type="number" value={form.poids}
                                           onChange={(e) => setForm((f) => ({ ...f, poids: e.target.value }))} />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Taille (cm)</label>
                                    <input type="number" value={form.taille}
                                           onChange={(e) => setForm((f) => ({ ...f, taille: e.target.value }))} />
                                </div>
                            </div>
                            <button
                                className="btn-primary-green"
                                style={{ marginTop: "1.25rem", width: "100%", justifyContent: "center" }}
                                onClick={handleSave} disabled={saving}
                            >
                                {saving ? "Enregistrement…" : <><i className="bi bi-check2" /> Sauvegarder</>}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}