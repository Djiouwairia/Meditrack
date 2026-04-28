import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { patientService, type Patient } from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",         label: "Tableau de bord",  path: "/dashboard/patient" },
    { icon: "bi-calendar-check",       label: "Mes rendez-vous",  path: "/dashboard/patient/rendez-vous" },
    { icon: "bi-folder2-open",         label: "Mon dossier",      path: "/dashboard/patient/dossier" },
    { icon: "bi-file-earmark-medical", label: "Ordonnances",      path: "/dashboard/patient/ordonnances" },
    { icon: "bi-person-gear",          label: "Mon profil",       path: "/dashboard/patient/profil" },
];

export default function PatientProfil() {
    const { user, logout } = useAuth();
    const [patient, setPatient]     = useState<Patient | null>(null);
    const [loading, setLoading]     = useState(true);
    const [editing, setEditing]     = useState(false);
    const [form, setForm]           = useState({ nom: "", prenom: "", telephone: "", adresse: "", dateDeNaissance: "", groupeSanguin: "" });
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError]         = useState("");

    const load = useCallback(async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            const p = await patientService.getAll(0, 200);
            const pat = p.content.find(x => x.email === user.email) ?? null;
            setPatient(pat);
            if (pat) setForm({ nom: pat.nom || "", prenom: pat.prenom || "", telephone: pat.telephone || "", adresse: pat.adresse || "", dateDeNaissance: pat.dateDeNaissance || "", groupeSanguin: pat.groupeSanguin || "" });
        } finally { setLoading(false); }
    }, [user]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async () => {
        if (!patient) return;
        setSaveLoading(true); setError("");
        try {
            const updated = await patientService.update(patient.id, { ...form, hopitalId: patient.hopital?.id });
            setPatient(updated);
            setSaveSuccess(true);
            setEditing(false);
            setTimeout(() => setSaveSuccess(false), 2500);
        } catch (e: any) {
            setError(e?.response?.data?.message || "Erreur lors de la sauvegarde");
        } finally { setSaveLoading(false); }
    };

    const inp = { width: "100%", borderRadius: 8, border: "1px solid #E5E7EB", padding: "10px 14px", fontSize: 14, boxSizing: "border-box" as const, background: "#fff" };

    return (
        <DashboardLayout navItems={NAV} title="Mon profil" >
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                    <div className="spinner-border" style={{ color: "#0EA5E9" }}></div>
                </div>
            ) : (
                <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* Avatar card */}
                    <div style={{ background: "linear-gradient(135deg,#0369A1,#0EA5E9)", borderRadius: 20, padding: "32px 36px", color: "#fff", display: "flex", alignItems: "center", gap: 24 }}>
                        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.25)", border: "3px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, flexShrink: 0 }}>
                            {patient?.prenom?.[0]}{patient?.nom?.[0]}
                        </div>
                        <div>
                            <div style={{ fontSize: 24, fontWeight: 800 }}>{patient?.prenom} {patient?.nom}</div>
                            <div style={{ opacity: 0.85, marginTop: 4 }}>{patient?.email}</div>
                            <div style={{ opacity: 0.75, fontSize: 13, marginTop: 4 }}>
                                <i className="bi bi-hospital me-2"></i>{patient?.hopital?.nom || "—"}
                            </div>
                        </div>
                        {saveSuccess && (
                            <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.25)", borderRadius: 12, padding: "8px 16px", fontWeight: 600, fontSize: 14 }}>
                                ✓ Profil mis à jour
                            </div>
                        )}
                    </div>

                    {/* Infos */}
                    <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #F0F2F7" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0D1F2D" }}>Informations personnelles</h2>
                            {!editing ? (
                                <button onClick={() => setEditing(true)}
                                        style={{ background: "#E0F2FE", color: "#0369A1", border: "none", borderRadius: 10, padding: "8px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                                    <i className="bi bi-pencil me-2"></i>Modifier
                                </button>
                            ) : (
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button onClick={() => { setEditing(false); setError(""); }}
                                            style={{ background: "#F3F4F6", border: "none", borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>Annuler</button>
                                    <button onClick={handleSave} disabled={saveLoading}
                                            style={{ background: "linear-gradient(135deg,#0369A1,#0EA5E9)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                                        {saveLoading ? <span className="spinner-border spinner-border-sm"></span> : "Sauvegarder"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {error && <div className="alert alert-danger py-2 small mb-4">{error}</div>}

                        {editing ? (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                {[
                                    { key: "nom",             label: "Nom",             type: "text" },
                                    { key: "prenom",          label: "Prénom",          type: "text" },
                                    { key: "telephone",       label: "Téléphone",       type: "tel" },
                                    { key: "dateDeNaissance", label: "Date de naissance", type: "date" },
                                    { key: "adresse",         label: "Adresse",         type: "text", span: true },
                                ].map(f => (
                                    <div key={f.key} style={{ gridColumn: f.span ? "1 / -1" : undefined }}>
                                        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{f.label}</label>
                                        <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))} style={inp} />
                                    </div>
                                ))}
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Groupe sanguin</label>
                                    <select value={form.groupeSanguin} onChange={e => setForm(x => ({ ...x, groupeSanguin: e.target.value }))} style={inp}>
                                        <option value="">Sélectionner</option>
                                        {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => <option key={g}>{g}</option>)}
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                {[
                                    { icon: "bi-person-fill",    label: "Nom",              value: `${patient?.prenom} ${patient?.nom}`,   color: "#0EA5E9", bg: "#E0F2FE" },
                                    { icon: "bi-envelope-fill",  label: "Email",            value: patient?.email,                          color: "#8B5CF6", bg: "#EDE9FE" },
                                    { icon: "bi-telephone-fill", label: "Téléphone",        value: patient?.telephone,                      color: "#1A7A52", bg: "#E8F5EE" },
                                    { icon: "bi-droplet-fill",   label: "Groupe sanguin",   value: patient?.groupeSanguin,                  color: "#EF4444", bg: "#FEE2E2" },
                                    { icon: "bi-cake2-fill",     label: "Date naissance",   value: patient?.dateDeNaissance ? new Date(patient.dateDeNaissance).toLocaleDateString("fr-FR") : "—", color: "#F59E0B", bg: "#FEF3C7" },
                                    { icon: "bi-geo-alt-fill",   label: "Adresse",          value: patient?.adresse,                        color: "#6366F1", bg: "#EEF2FF" },
                                ].map(item => (
                                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, background: "#F8FAFC", border: "1px solid #EEF1F6" }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <i className={`bi ${item.icon}`} style={{ fontSize: 18, color: item.color }}></i>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, color: "#8A94A6", fontWeight: 500 }}>{item.label}</div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: "#0D1F2D", marginTop: 2 }}>{item.value || "—"}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Danger zone */}
                    <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #FEE2E2" }}>
                        <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#991B1B" }}>Zone de danger</h3>
                        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6B7280" }}>Ces actions sont irréversibles.</p>
                        <button onClick={logout}
                                style={{ background: "#FEE2E2", color: "#991B1B", border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                            <i className="bi bi-box-arrow-right me-2"></i>Se déconnecter
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}