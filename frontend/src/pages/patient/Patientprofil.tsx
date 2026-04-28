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

const ACCENT = "#0EA5E9";

export default function PatientProfil() {
    const { logout } = useAuth();
    const [patient, setPatient]         = useState<Patient | null>(null);
    const [loading, setLoading]         = useState(true);
    const [editing, setEditing]         = useState(false);
    const [form, setForm]               = useState({ nom: "", prenom: "", telephone: "", adresse: "", dateDeNaissance: "", groupeSanguin: "" });
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError]             = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            // ✅ /patients/me au lieu de getAll().find()
            const pat = await patientService.getMe();
            setPatient(pat);
            setForm({
                nom:             pat.nom || "",
                prenom:          pat.prenom || "",
                telephone:       pat.telephone || "",
                adresse:         pat.adresse || "",
                dateDeNaissance: pat.dateDeNaissance || "",
                groupeSanguin:   pat.groupeSanguin || "",
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

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
        } finally {
            setSaveLoading(false);
        }
    };

    const inp: React.CSSProperties = { width: "100%", borderRadius: 8, border: "0.5px solid #EBEBEB", padding: "10px 14px", fontSize: 14, boxSizing: "border-box", background: "#FAFAFA", outline: "none" };

    return (

        <DashboardLayout navItems={NAV} title="Mon profil" accentColor={ACCENT}>
 Stashed changes
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
                    <div className="spinner-border" style={{ color: ACCENT }}></div>
                </div>
            ) : (
                <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>

                    {/* Banner */}
                    <div style={{ background: "linear-gradient(135deg,#0369A1,#0EA5E9)", borderRadius: 18, padding: "28px 32px", color: "#fff", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.25)", border: "3px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, flexShrink: 0 }}>
                            {patient?.prenom?.[0]}{patient?.nom?.[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 22, fontWeight: 800 }}>{patient?.prenom} {patient?.nom}</div>
                            <div style={{ opacity: 0.85, marginTop: 4, fontSize: 14 }}>{patient?.email}</div>
                            {patient?.hopital?.nom && (
                                <div style={{ opacity: 0.75, fontSize: 13, marginTop: 4 }}>
                                    <i className="bi bi-hospital me-2"></i>{patient.hopital.nom}
                                </div>
                            )}
                        </div>
                        {saveSuccess && (
                            <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 10, padding: "8px 16px", fontWeight: 600, fontSize: 13 }}>
                                ✓ Profil mis à jour
                            </div>
                        )}
                    </div>

                    {/* Infos */}
                    <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "0.5px solid #EBEBEB" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Informations personnelles</h2>
                            {!editing ? (
                                <button onClick={() => setEditing(true)}
                                        style={{ background: "#E0F2FE", color: "#0369A1", border: "none", borderRadius: 9, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                                    <i className="bi bi-pencil me-2"></i>Modifier
                                </button>
                            ) : (
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button onClick={() => { setEditing(false); setError(""); }}
                                            style={{ background: "#F5F5F5", border: "none", borderRadius: 9, padding: "7px 14px", cursor: "pointer", fontSize: 13 }}>Annuler</button>
                                    <button onClick={handleSave} disabled={saveLoading}
                                            style={{ background: `linear-gradient(135deg,#0369A1,${ACCENT})`, color: "#fff", border: "none", borderRadius: 9, padding: "7px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                                        {saveLoading ? <span className="spinner-border spinner-border-sm"></span> : "Sauvegarder"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {error && <div className="alert alert-danger py-2 small mb-4">{error}</div>}

                        {editing ? (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                {([
                                    { key: "nom",    label: "Nom",    type: "text" },
                                    { key: "prenom", label: "Prénom", type: "text" },
                                    { key: "telephone",       label: "Téléphone",         type: "tel" },
                                    { key: "dateDeNaissance", label: "Date de naissance", type: "date" },
                                ] as const).map(f => (
                                    <div key={f.key}>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: "#9E9E9E", display: "block", marginBottom: 5 }}>{f.label}</label>
                                        <input type={f.type} value={form[f.key]} onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))} style={inp} />
                                    </div>
                                ))}
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "#9E9E9E", display: "block", marginBottom: 5 }}>Adresse</label>
                                    <input type="text" value={form.adresse} onChange={e => setForm(x => ({ ...x, adresse: e.target.value }))} style={inp} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "#9E9E9E", display: "block", marginBottom: 5 }}>Groupe sanguin</label>
                                    <select value={form.groupeSanguin} onChange={e => setForm(x => ({ ...x, groupeSanguin: e.target.value }))} style={inp}>
                                        <option value="">Sélectionner</option>
                                        {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => <option key={g}>{g}</option>)}
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                {[
                                    { icon: "bi-person-fill",    label: "Nom complet",      value: `${patient?.prenom} ${patient?.nom}`,  color: ACCENT,    bg: "#E0F2FE" },
                                    { icon: "bi-envelope-fill",  label: "Email",            value: patient?.email,                         color: "#8B5CF6", bg: "#EDE9FE" },
                                    { icon: "bi-telephone-fill", label: "Téléphone",        value: patient?.telephone,                     color: "#1A7A52", bg: "#E8F5EE" },
                                    { icon: "bi-droplet-fill",   label: "Groupe sanguin",   value: patient?.groupeSanguin,                 color: "#EF4444", bg: "#FEE2E2" },
                                    { icon: "bi-cake2-fill",     label: "Date de naissance",value: patient?.dateDeNaissance ? new Date(patient.dateDeNaissance).toLocaleDateString("fr-FR") : "—", color: "#F59E0B", bg: "#FEF3C7" },
                                    { icon: "bi-geo-alt-fill",   label: "Adresse",          value: patient?.adresse,                       color: "#6366F1", bg: "#EEF2FF" },
                                ].map(item => (
                                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderRadius: 12, background: "#FAFAFA", border: "0.5px solid #EBEBEB" }}>
                                        <div style={{ width: 38, height: 38, borderRadius: 9, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <i className={`bi ${item.icon}`} style={{ fontSize: 17, color: item.color }}></i>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, color: "#9E9E9E", fontWeight: 500 }}>{item.label}</div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: "#0F0F0F", marginTop: 2 }}>{item.value || "—"}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Danger zone */}
                    <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "0.5px solid #FECACA" }}>
                        <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#991B1B" }}>Zone de danger</h3>
                        <p style={{ margin: "0 0 14px", fontSize: 13, color: "#9E9E9E" }}>Cette action est irréversible.</p>
                        <button onClick={logout}
                                style={{ background: "#FEE2E2", color: "#991B1B", border: "none", borderRadius: 9, padding: "9px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                            <i className="bi bi-box-arrow-right me-2"></i>Se déconnecter
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}