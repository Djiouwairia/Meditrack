import { useEffect, useState } from "react";
import { patientAPI } from "../../../services/api.ts";
import { useAuth } from "../../../context/AuthContext";

export default function PatientProfil() {
    const { user } = useAuth();
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<any>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        patientAPI.getById(user.id)
            .then(({ data }) => { setPatient(data); setForm(data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await patientAPI.update(user!.id, {
                nom: form.nom, prenom: form.prenom, email: form.email,
                telephone: form.telephone, adresse: form.adresse,
                dateDeNaissance: form.dateDeNaissance, groupeSanguin: form.groupeSanguin,
                hopitalId: form.hopital?.id,
            });
            setPatient(data);
            setEditing(false);
        } catch { alert("Erreur."); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
    if (!patient) return <div className="empty-state"><i className="bi bi-person-x" /><p>Profil introuvable</p></div>;

    return (
        <div style={{ maxWidth: 680 }}>
            <h1 className="page-title">Mon profil</h1>
            <p className="page-subtitle">Gérez vos informations personnelles</p>

            <div className="dash-card mb-4" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: "linear-gradient(135deg,#1A7A52,#27A869)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.6rem", color: "#fff", fontWeight: 800, flexShrink: 0,
                }}>
                    {patient.prenom?.[0]}{patient.nom?.[0]}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>{patient.prenom} {patient.nom}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{patient.email}</div>
                    {patient.groupeSanguin && (
                        <span style={{ background: "#fdecea", color: "#c0392b", padding: "0.2em 0.55em", borderRadius: 6, fontSize: "0.78rem", fontWeight: 700, marginTop: 6, display: "inline-block" }}>
              {patient.groupeSanguin}
            </span>
                    )}
                </div>
                <button
                    onClick={() => setEditing(!editing)}
                    style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "0.35rem 0.8rem", fontSize: "0.82rem", cursor: "pointer", fontWeight: 600 }}
                >
                    <i className={`bi bi-${editing ? "x" : "pencil"} me-1`} />{editing ? "Annuler" : "Modifier"}
                </button>
            </div>

            <div className="dash-card">
                {!editing ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        {[
                            { label: "Prénom", value: patient.prenom, icon: "person" },
                            { label: "Nom", value: patient.nom, icon: "person" },
                            { label: "Email", value: patient.email, icon: "envelope" },
                            { label: "Téléphone", value: patient.telephone, icon: "telephone" },
                            { label: "Adresse", value: patient.adresse, icon: "geo-alt" },
                            { label: "Date de naissance", value: patient.dateDeNaissance ? new Date(patient.dateDeNaissance).toLocaleDateString("fr-FR") : null, icon: "calendar3" },
                            { label: "Groupe sanguin", value: patient.groupeSanguin, icon: "droplet" },
                            { label: "Hôpital", value: patient.hopital?.nom, icon: "building" },
                        ].map((item) => (
                            <div key={item.label} style={{ background: "#f4f7f5", borderRadius: 10, padding: "0.75rem 1rem" }}>
                                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                                    <i className={`bi bi-${item.icon} me-1`} />{item.label}
                                </div>
                                <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.9rem" }}>{item.value || "—"}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                            {[
                                { key: "prenom", label: "Prénom" },
                                { key: "nom", label: "Nom" },
                                { key: "email", label: "Email", type: "email" },
                                { key: "telephone", label: "Téléphone" },
                                { key: "adresse", label: "Adresse" },
                                { key: "groupeSanguin", label: "Groupe sanguin" },
                            ].map((f) => (
                                <div className="form-group" key={f.key} style={{ margin: 0 }}>
                                    <label>{f.label}</label>
                                    <input type={f.type || "text"} value={form[f.key] || ""}
                                           onChange={(e) => setForm((prev: any) => ({ ...prev, [f.key]: e.target.value }))} />
                                </div>
                            ))}
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Date de naissance</label>
                                <input type="date" value={form.dateDeNaissance || ""}
                                       onChange={(e) => setForm((prev: any) => ({ ...prev, dateDeNaissance: e.target.value }))} />
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
        </div>
    );
}