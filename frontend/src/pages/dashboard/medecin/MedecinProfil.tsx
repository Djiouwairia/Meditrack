import { useEffect, useState } from "react";
import { medecinAPI } from "../../../services/api.ts";
import { useAuth } from "../../../context/AuthContext";

export default function MedecinProfil() {
    // @ts-ignore
    const { user, logout } = useAuth();
    const [medecin, setMedecin] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<any>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        medecinAPI.getById(user.id)
            .then(({ data }) => { setMedecin(data); setForm(data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const handleToggle = async () => {
        try {
            const { data } = await medecinAPI.toggleDisponibilite(user!.id);
            setMedecin(data);
        } catch { alert("Erreur."); }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await medecinAPI.update(user!.id, {
                nom: form.nom, prenom: form.prenom, email: form.email,
                telephone: form.telephone, specialite: form.specialite,
                disponible: form.disponible, hopitalId: form.hopital?.id,
            });
            setMedecin(data);
            setEditing(false);
        } catch { alert("Erreur lors de la mise à jour."); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
    if (!medecin) return <div className="empty-state"><i className="bi bi-person-x" /><p>Profil introuvable</p></div>;

    return (
        <div style={{ maxWidth: 680 }}>
            <h1 className="page-title">Mon profil</h1>
            <p className="page-subtitle">Gérez vos informations personnelles</p>

            {/* Avatar card */}
            <div className="dash-card mb-4" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: "linear-gradient(135deg,#1A7A52,#27A869)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.6rem", color: "#fff", fontWeight: 800, flexShrink: 0,
                }}>
                    {medecin.prenom?.[0]}{medecin.nom?.[0]}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text)" }}>
                        Dr. {medecin.prenom} {medecin.nom}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{medecin.specialite}</div>
                    <div style={{ marginTop: "0.4rem" }}>
            <span className={medecin.disponible ? "disponible-badge" : "indisponible-badge"} style={{ fontSize: "0.8rem" }}>
              <i className={`bi bi-circle-fill me-1`} style={{ fontSize: "0.5rem" }} />
                {medecin.disponible ? "Disponible" : "Indisponible"}
            </span>
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <button className="btn-primary-green" onClick={handleToggle} style={{ fontSize: "0.8rem" }}>
                        <i className="bi bi-toggle-on" />
                        {medecin.disponible ? "Marquer indisponible" : "Marquer disponible"}
                    </button>
                    <button
                        onClick={() => setEditing(!editing)}
                        style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "0.35rem 0.8rem", fontSize: "0.8rem", cursor: "pointer", color: "var(--text)", fontWeight: 600 }}
                    >
                        <i className="bi bi-pencil me-1" />{editing ? "Annuler" : "Modifier"}
                    </button>
                </div>
            </div>

            {/* Infos */}
            <div className="dash-card">
                {!editing ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        {[
                            { label: "Prénom", value: medecin.prenom, icon: "person" },
                            { label: "Nom", value: medecin.nom, icon: "person" },
                            { label: "Email", value: medecin.email, icon: "envelope" },
                            { label: "Téléphone", value: medecin.telephone, icon: "telephone" },
                            { label: "Spécialité", value: medecin.specialite, icon: "hospital" },
                            { label: "Hôpital", value: medecin.hopital?.nom, icon: "building" },
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
                                { key: "email", label: "Email" },
                                { key: "telephone", label: "Téléphone" },
                                { key: "specialite", label: "Spécialité" },
                            ].map((f) => (
                                <div className="form-group" key={f.key} style={{ margin: 0 }}>
                                    <label>{f.label}</label>
                                    <input
                                        value={form[f.key] || ""}
                                        onChange={(e) => setForm((prev: any) => ({ ...prev, [f.key]: e.target.value }))}
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            className="btn-primary-green"
                            style={{ marginTop: "1.25rem", width: "100%", justifyContent: "center" }}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? "Enregistrement…" : <><i className="bi bi-check2" /> Sauvegarder</>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}