import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import {
    patientService, dossierService, rendezVousService,
    type Patient, type DossierMedical, type Ordonnance, type RendezVous
} from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",         label: "Tableau de bord", path: "/dashboard/medecin" },
    { icon: "bi-calendar-check",       label: "Mon agenda",       path: "/dashboard/medecin/agenda" },
    { icon: "bi-people",               label: "Mes patients",     path: "/dashboard/medecin/patients" },
    { icon: "bi-file-earmark-medical", label: "Ordonnances",      path: "/dashboard/medecin/ordonnances" },
    { icon: "bi-person-gear",          label: "Mon profil",       path: "/dashboard/medecin/profil" },
];

const ACCENT = "#1A7A52";

export default function MedecinDossier() {
    const { patientId } = useParams();
    const navigate = useNavigate();

    const [patient, setPatient]           = useState<Patient | null>(null);
    const [dossier, setDossier]           = useState<DossierMedical | null>(null);
    const [historiqueRdv, setHistoriqueRdv] = useState<RendezVous[]>([]);
    const [selOrdo, setSelOrdo]           = useState<Ordonnance | null>(null);
    
    const [loading, setLoading]           = useState(true);
    const [dossierLoading, setDossierLoading] = useState(false);

    // Édition dossier
    const [editMode, setEditMode]         = useState(false);
    const [editForm, setEditForm]         = useState({ 
        allergies: "", poids: "", taille: "", tension: "", temperature: "", antecedents: "", terrain: "",
        suiviPrenatal: "", suiviInfantile: "", preventionPaludisme: "",
        analysesBiologiques: "", imagerie: "", rapportsSpecialistes: "" 
    });
    const [editLoading, setEditLoading]   = useState(false);
    const [editSuccess, setEditSuccess]   = useState(false);
    const [editError, setEditError]       = useState("");

    const loadData = useCallback(async () => {
        if (!patientId) return;
        setLoading(true);
        try {
            const pat = await patientService.getById(patientId);
            setPatient(pat);
            await loadDossierAndHistory(patientId);
        } catch (e) {
            console.error("Erreur chargement patient:", e);
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    const loadDossierAndHistory = async (id: string) => {
        setDossierLoading(true);
        try {
            const rdvs = await rendezVousService.getByPatient(id, 0, 50);
            setHistoriqueRdv(rdvs.content.filter(r => r.statut === "TERMINE"));

            const dos = await dossierService.getByPatient(id);
            if (dos && dos.id) {
                setDossier(dos);
                setEditForm({ 
                    allergies: dos.allergies || "", poids: dos.poids || "", taille: dos.taille || "",
                    tension: dos.tension || "", temperature: dos.temperature || "", antecedents: dos.antecedents || "", terrain: dos.terrain || "",
                    suiviPrenatal: dos.suiviPrenatal || "", suiviInfantile: dos.suiviInfantile || "", preventionPaludisme: dos.preventionPaludisme || "",
                    analysesBiologiques: dos.analysesBiologiques || "", imagerie: dos.imagerie || "", rapportsSpecialistes: dos.rapportsSpecialistes || ""
                });
            } else {
                setDossier(null);
            }
        } catch (e: any) {
            console.warn("Erreur récupération dossier:", e);
            setDossier(null);
        } finally {
            setDossierLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [loadData]);

    const handleCreateDossier = async () => {
        if (!patientId) return;
        setDossierLoading(true);
        setEditError("");
        try {
            const newDos = await dossierService.create(patientId);
            setDossier(newDos);
            setEditForm({ 
                allergies: "", poids: "", taille: "", tension: "", temperature: "", antecedents: "", terrain: "",
                suiviPrenatal: "", suiviInfantile: "", preventionPaludisme: "",
                analysesBiologiques: "", imagerie: "", rapportsSpecialistes: "" 
            });
            setEditMode(true);
        } catch (e: any) {
            console.error("Erreur création dossier:", e);
            setEditError("Impossible de créer le dossier médical. Avez-vous redémarré le serveur ?");
        } finally {
            setDossierLoading(false);
        }
    };

    const handleSaveDossier = async () => {
        if (!dossier) return;
        setEditLoading(true);
        setEditError("");
        try {
            const updated = await dossierService.update(dossier.id, editForm);
            setDossier(updated);
            setEditSuccess(true);
            setEditMode(false);
            setTimeout(() => setEditSuccess(false), 3000);
        } catch (e: any) {
            setEditError(e?.response?.data?.message || "Erreur lors de la sauvegarde");
        } finally {
            setEditLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout navItems={NAV} title="Dossier Médical" accentColor={ACCENT}>
                <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
                    <div className="spinner-border" style={{ color: ACCENT }}></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!patient) {
        return (
            <DashboardLayout navItems={NAV} title="Dossier Médical" accentColor={ACCENT}>
                <div style={{ textAlign: "center", padding: "60px 0" }}>Patient introuvable.</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={NAV} title="Dossier Médical" accentColor={ACCENT}>
            
            <button onClick={() => navigate("/dashboard/medecin/patients")} 
                    style={{ background: "#fff", border: "0.5px solid #EBEBEB", borderRadius: 10, padding: "8px 16px", marginBottom: 20, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#6B6B6B", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <i className="bi bi-arrow-left"></i> Retour aux patients
            </button>

            <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "0.5px solid #EBEBEB", display: "flex", flexDirection: "column" }}>
                {/* ── En-tête Patient ── */}
                <div style={{ background: `linear-gradient(135deg, ${ACCENT}, #27A869)`, padding: "24px 30px", display: "flex", alignItems: "center", gap: 20, color: "#fff" }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                        {patient.prenom?.[0]}{patient.nom?.[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.5px" }}>{patient.prenom} {patient.nom}</div>
                        <div style={{ opacity: 0.9, fontSize: 14, display: "flex", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
                            <span><i className="bi bi-envelope-fill me-2 opacity-75"></i>{patient.email || "—"}</span>
                            <span><i className="bi bi-telephone-fill me-2 opacity-75"></i>{patient.telephone || "—"}</span>
                        </div>
                        {(patient.nineaOuCin || patient.personneDeConfiance) && (
                            <div style={{ fontSize: 13, marginTop: 8, opacity: 0.9, display: "flex", gap: 14, flexWrap: "wrap", background: "rgba(0,0,0,0.15)", padding: "6px 12px", borderRadius: 8, width: "fit-content" }}>
                                {patient.nineaOuCin && <span><i className="bi bi-card-text me-2"></i>CIN: {patient.nineaOuCin}</span>}
                                {patient.personneDeConfiance && <span><i className="bi bi-person-heart me-2"></i>Urgence: {patient.personneDeConfiance}</span>}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ padding: 30 }}>
                    {dossierLoading ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
                            <div className="spinner-border" style={{ color: ACCENT }}></div>
                        </div>
                    ) : !dossier ? (
                        <div style={{ textAlign: "center", padding: "60px 0" }}>
                            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#BDBDBD" }}>
                                <i className="bi bi-folder-x" style={{ fontSize: 36 }}></i>
                            </div>
                            <div style={{ color: "#0F0F0F", fontWeight: 600, fontSize: 16 }}>Dossier médical introuvable</div>
                            <div style={{ color: "#9E9E9E", fontSize: 14, marginTop: 6, marginBottom: 24 }}>Ce patient n'a pas encore de dossier médical.</div>
                            <button onClick={handleCreateDossier}
                                    style={{ background: ACCENT, color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
                                Initialiser le dossier médical
                            </button>
                            {editError && <div className="alert alert-danger py-2 small mt-3 mx-auto" style={{ maxWidth: 400 }}>{editError}</div>}
                        </div>
                    ) : selOrdo ? (
                        <>
                            <button onClick={() => setSelOrdo(null)} style={{ background: "#F5F5F5", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13.5, cursor: "pointer", marginBottom: 20, fontWeight: 600, color: "#6B6B6B" }}>
                                <i className="bi bi-arrow-left me-2"></i>Retour au dossier
                            </button>
                            <div style={{ background: "#F0FDF4", borderRadius: 12, padding: 20, border: "0.5px solid #BBF7D0", marginBottom: 16 }}>
                                <div style={{ fontSize: 12.5, color: "#9E9E9E", marginBottom: 4 }}>Date de prescription</div>
                                <div style={{ fontWeight: 600, fontSize: 15, color: "#065F46" }}>{selOrdo.date ? new Date(selOrdo.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {Object.entries(selOrdo.medicaments || {}).map(([med, pos]) => (
                                    <div key={med} style={{ padding: "16px 20px", borderRadius: 12, background: "#FAFAFA", border: "0.5px solid #EBEBEB" }}>
                                        <div style={{ fontWeight: 700, color: ACCENT, fontSize: 15 }}><i className="bi bi-capsule me-2"></i>{med}</div>
                                        <div style={{ fontSize: 14, color: "#6B6B6B", marginTop: 4 }}>{pos}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : editMode ? (
                        <div style={{ maxWidth: 900, margin: "0 auto" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: "0.5px solid #EBEBEB" }}>
                                <button onClick={() => { setEditMode(false); setEditError(""); }}
                                        style={{ background: "#F5F5F5", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontWeight: 600, color: "#6B6B6B" }}>
                                    Annuler
                                </button>
                                <span style={{ fontWeight: 700, fontSize: 16, color: "#0F0F0F" }}>Modifier le dossier médical</span>
                            </div>

                            {editError && <div className="alert alert-danger py-2 small mb-4">{editError}</div>}

                            {/* CONSTANTES */}
                            <div style={{ fontSize: 14, fontWeight: 700, color: ACCENT, marginTop: 10, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: `${ACCENT}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><i className="bi bi-activity"></i></div>
                                Constantes et Mensurations
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 30 }}>
                                {[
                                    { key: "poids", label: "Poids (kg)", placeholder: "Ex: 72" },
                                    { key: "taille", label: "Taille (cm)", placeholder: "Ex: 175" },
                                    { key: "tension", label: "Tension Artérielle", placeholder: "Ex: 12/8" },
                                    { key: "temperature", label: "Température (°C)", placeholder: "Ex: 37.5" }
                                ].map(field => (
                                    <div key={field.key}>
                                        <label style={{ fontSize: 13, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 6 }}>{field.label}</label>
                                        <input value={editForm[field.key as keyof typeof editForm]} onChange={e => setEditForm(f => ({ ...f, [field.key]: e.target.value }))} placeholder={field.placeholder} style={{ width: "100%", borderRadius: 10, border: "1px solid #EBEBEB", padding: "10px 14px", fontSize: 14, outline: "none", background: "#FAFAFA", boxSizing: "border-box" }} />
                                    </div>
                                ))}
                            </div>

                            {/* VOLET MEDICAL ET CLINIQUE */}
                            <div style={{ fontSize: 14, fontWeight: 700, color: ACCENT, marginTop: 10, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: `${ACCENT}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><i className="bi bi-file-medical"></i></div>
                                Volet Médical et Clinique
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 30 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 6 }}>Allergies</label>
                                    <input value={editForm.allergies} onChange={e => setEditForm(f => ({ ...f, allergies: e.target.value }))} placeholder="Ex: Pénicilline..." style={{ width: "100%", borderRadius: 10, border: "1px solid #EBEBEB", padding: "10px 14px", fontSize: 14, outline: "none", background: "#FAFAFA", boxSizing: "border-box" }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 6 }}>Antécédents (HTA, Diabète, Chirurgie...)</label>
                                    <textarea rows={3} value={editForm.antecedents} onChange={e => setEditForm(f => ({ ...f, antecedents: e.target.value }))} placeholder="Saisir les antécédents médicaux traités..." style={{ width: "100%", borderRadius: 10, border: "1px solid #EBEBEB", padding: "10px 14px", fontSize: 14, outline: "none", background: "#FAFAFA", boxSizing: "border-box", resize: "vertical" }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 6 }}>Terrain (Maladies passées ou non traitées/guéries)</label>
                                    <textarea rows={3} value={editForm.terrain} onChange={e => setEditForm(f => ({ ...f, terrain: e.target.value }))} placeholder="Ex: Asthme infantile, hépatite B non traitée..." style={{ width: "100%", borderRadius: 10, border: "1px solid #EBEBEB", padding: "10px 14px", fontSize: 14, outline: "none", background: "#FAFAFA", boxSizing: "border-box", resize: "vertical" }} />
                                </div>
                            </div>

                            {/* CARNET DE SANTE */}
                            <div style={{ fontSize: 14, fontWeight: 700, color: ACCENT, marginTop: 10, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: `${ACCENT}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><i className="bi bi-journal-medical"></i></div>
                                Carnet de Santé (Détails)
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 30 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 6 }}>Suivi Prénatal (CPN, Vaccins, etc.)</label>
                                    <textarea rows={2} value={editForm.suiviPrenatal} onChange={e => setEditForm(f => ({ ...f, suiviPrenatal: e.target.value }))} placeholder="Détails du suivi prénatal si applicable..." style={{ width: "100%", borderRadius: 10, border: "1px solid #EBEBEB", padding: "10px 14px", fontSize: 14, outline: "none", background: "#FAFAFA", boxSizing: "border-box", resize: "vertical" }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 6 }}>Suivi Infantile (Croissance, PEV, Vit A...)</label>
                                    <textarea rows={2} value={editForm.suiviInfantile} onChange={e => setEditForm(f => ({ ...f, suiviInfantile: e.target.value }))} placeholder="Détails du suivi infantile si applicable..." style={{ width: "100%", borderRadius: 10, border: "1px solid #EBEBEB", padding: "10px 14px", fontSize: 14, outline: "none", background: "#FAFAFA", boxSizing: "border-box", resize: "vertical" }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 6 }}>Prévention Paludisme (MILDA, etc.)</label>
                                    <input value={editForm.preventionPaludisme} onChange={e => setEditForm(f => ({ ...f, preventionPaludisme: e.target.value }))} placeholder="Ex: Dort sous MILDA, TPI..." style={{ width: "100%", borderRadius: 10, border: "1px solid #EBEBEB", padding: "10px 14px", fontSize: 14, outline: "none", background: "#FAFAFA", boxSizing: "border-box" }} />
                                </div>
                            </div>

                            {/* RESULTATS PARACLINIQUES */}
                            <div style={{ fontSize: 14, fontWeight: 700, color: ACCENT, marginTop: 10, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: `${ACCENT}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><i className="bi bi-clipboard2-data"></i></div>
                                Résultats Paracliniques
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 6 }}>Analyses Biologiques</label>
                                    <textarea rows={2} value={editForm.analysesBiologiques} onChange={e => setEditForm(f => ({ ...f, analysesBiologiques: e.target.value }))} placeholder="NFS, Glycémie, etc..." style={{ width: "100%", borderRadius: 10, border: "1px solid #EBEBEB", padding: "10px 14px", fontSize: 14, outline: "none", background: "#FAFAFA", boxSizing: "border-box", resize: "vertical" }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 6 }}>Imagerie</label>
                                    <textarea rows={2} value={editForm.imagerie} onChange={e => setEditForm(f => ({ ...f, imagerie: e.target.value }))} placeholder="Radios, échographies..." style={{ width: "100%", borderRadius: 10, border: "1px solid #EBEBEB", padding: "10px 14px", fontSize: 14, outline: "none", background: "#FAFAFA", boxSizing: "border-box", resize: "vertical" }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 6 }}>Rapports de Spécialistes</label>
                                    <textarea rows={2} value={editForm.rapportsSpecialistes} onChange={e => setEditForm(f => ({ ...f, rapportsSpecialistes: e.target.value }))} placeholder="Avis cardio, ophtalmo, etc..." style={{ width: "100%", borderRadius: 10, border: "1px solid #EBEBEB", padding: "10px 14px", fontSize: 14, outline: "none", background: "#FAFAFA", boxSizing: "border-box", resize: "vertical" }} />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 40, borderTop: "0.5px solid #EBEBEB", paddingTop: 20 }}>
                                <button onClick={() => { setEditMode(false); setEditError(""); }}
                                        style={{ background: "#F5F5F5", border: "none", borderRadius: 10, padding: "12px 24px", cursor: "pointer", fontSize: 14, color: "#6B6B6B", fontWeight: 600 }}>
                                    Annuler
                                </button>
                                <button onClick={handleSaveDossier} disabled={editLoading}
                                        style={{ background: ACCENT, color: "#fff", border: "none", borderRadius: 10, padding: "12px 30px", cursor: "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                                    {editLoading ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-save"></i> Enregistrer les modifications</>}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", gap: 30, alignItems: "flex-start", flexWrap: "wrap" }}>
                            {/* Colonne Principale */}
                            <div style={{ flex: 1, minWidth: 400 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0F0F0F" }}>Dossier Médical</h2>
                                    <button onClick={() => { setEditMode(true); setEditError(""); setEditSuccess(false); }}
                                            style={{ background: `${ACCENT}15`, border: `0.5px solid ${ACCENT}40`, color: ACCENT, borderRadius: 10, padding: "8px 18px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                                        <i className="bi bi-pencil-square"></i>Modifier
                                    </button>
                                </div>

                                {editSuccess && <div className="alert alert-success py-2 mb-4 d-flex align-items-center"><i className="bi bi-check-circle-fill me-2"></i> Dossier mis à jour avec succès !</div>}

                                {/* CONSTANTES (VIEW) */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 30 }}>
                                    {[
                                        { icon: "bi-lungs", label: "Allergies", value: dossier.allergies, color: "#EF4444", bg: "#FEE2E2" },
                                        { icon: "bi-activity", label: "Poids", value: dossier.poids ? `${dossier.poids} kg` : undefined, color: "#0EA5E9", bg: "#E0F2FE" },
                                        { icon: "bi-arrows-vertical", label: "Taille", value: dossier.taille ? `${dossier.taille} cm` : undefined, color: "#8B5CF6", bg: "#EDE9FE" },
                                        { icon: "bi-heart-pulse", label: "Tension", value: dossier.tension, color: "#EAB308", bg: "#FEF9C3" },
                                        { icon: "bi-thermometer-half", label: "Temp.", value: dossier.temperature ? `${dossier.temperature} °C` : undefined, color: "#F97316", bg: "#FFEDD5" },
                                    ].map(item => (
                                        <div key={item.label} style={{ background: item.bg, borderRadius: 12, padding: "16px", textAlign: "center" }}>
                                            <i className={`bi ${item.icon}`} style={{ color: item.color, fontSize: 24 }}></i>
                                            <div style={{ fontSize: 12, color: "#6B6B6B", marginTop: 8, fontWeight: 600 }}>{item.label}</div>
                                            <div style={{ fontWeight: 800, fontSize: 15, color: "#0F0F0F", marginTop: 4 }}>{item.value || "—"}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* VOLET MEDICAL ET CLINIQUE (VIEW) */}
                                {(dossier.antecedents || dossier.terrain) && (
                                    <div style={{ marginBottom: 24 }}>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: ACCENT, textTransform: "uppercase", marginBottom: 12, borderBottom: "2px solid #EBEBEB", paddingBottom: 6 }}>Volet Clinique</div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                            {dossier.antecedents && (
                                                <div style={{ background: "#FAFAFA", padding: 16, borderRadius: 12, border: "0.5px solid #EBEBEB" }}>
                                                    <div style={{ fontSize: 12, color: "#9E9E9E", fontWeight: 700, marginBottom: 4 }}>ANTÉCÉDENTS</div>
                                                    <div style={{ fontSize: 14, color: "#0F0F0F", whiteSpace: "pre-wrap" }}>{dossier.antecedents}</div>
                                                </div>
                                            )}
                                            {dossier.terrain && (
                                                <div style={{ background: "#FAFAFA", padding: 16, borderRadius: 12, border: "0.5px solid #EBEBEB" }}>
                                                    <div style={{ fontSize: 12, color: "#9E9E9E", fontWeight: 700, marginBottom: 4 }}>TERRAIN (Maladies non traitées)</div>
                                                    <div style={{ fontSize: 14, color: "#0F0F0F", whiteSpace: "pre-wrap" }}>{dossier.terrain}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* CARNET DE SANTE (VIEW) */}
                                {(dossier.suiviPrenatal || dossier.suiviInfantile || dossier.preventionPaludisme) && (
                                    <div style={{ marginBottom: 24 }}>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: ACCENT, textTransform: "uppercase", marginBottom: 12, borderBottom: "2px solid #EBEBEB", paddingBottom: 6 }}>Carnet de Santé</div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                            {dossier.suiviPrenatal && <div style={{ fontSize: 14, background: "#FAFAFA", padding: 14, borderRadius: 10, border: "0.5px solid #EBEBEB" }}><strong>Suivi Prénatal:</strong> <br/><span style={{color: "#4B5563"}}>{dossier.suiviPrenatal}</span></div>}
                                            {dossier.suiviInfantile && <div style={{ fontSize: 14, background: "#FAFAFA", padding: 14, borderRadius: 10, border: "0.5px solid #EBEBEB" }}><strong>Suivi Infantile:</strong> <br/><span style={{color: "#4B5563"}}>{dossier.suiviInfantile}</span></div>}
                                            {dossier.preventionPaludisme && <div style={{ fontSize: 14, background: "#FAFAFA", padding: 14, borderRadius: 10, border: "0.5px solid #EBEBEB" }}><strong>Paludisme:</strong> <span style={{color: "#4B5563"}}>{dossier.preventionPaludisme}</span></div>}
                                        </div>
                                    </div>
                                )}

                                {/* RESULTATS PARACLINIQUES (VIEW) */}
                                {(dossier.analysesBiologiques || dossier.imagerie || dossier.rapportsSpecialistes) && (
                                    <div style={{ marginBottom: 30 }}>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: ACCENT, textTransform: "uppercase", marginBottom: 12, borderBottom: "2px solid #EBEBEB", paddingBottom: 6 }}>Résultats Paracliniques</div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                            {dossier.analysesBiologiques && <div style={{ fontSize: 14, background: "#FAFAFA", padding: 14, borderRadius: 10, border: "0.5px solid #EBEBEB" }}><strong>Biologie:</strong> <br/><span style={{color: "#4B5563"}}>{dossier.analysesBiologiques}</span></div>}
                                            {dossier.imagerie && <div style={{ fontSize: 14, background: "#FAFAFA", padding: 14, borderRadius: 10, border: "0.5px solid #EBEBEB" }}><strong>Imagerie:</strong> <br/><span style={{color: "#4B5563"}}>{dossier.imagerie}</span></div>}
                                            {dossier.rapportsSpecialistes && <div style={{ fontSize: 14, background: "#FAFAFA", padding: 14, borderRadius: 10, border: "0.5px solid #EBEBEB" }}><strong>Spécialistes:</strong> <br/><span style={{color: "#4B5563"}}>{dossier.rapportsSpecialistes}</span></div>}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Colonne Latérale : Historique & Ordonnances */}
                            <div style={{ flex: "0 0 340px" }}>
                                
                                <div style={{ background: "#FAFAFA", borderRadius: 16, padding: 20, border: "0.5px solid #EBEBEB", marginBottom: 20 }}>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0F0F0F", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 8 }}>
                                        <i className="bi bi-clock-history" style={{ color: ACCENT, fontSize: 16 }}></i> Historique des RDV
                                    </div>
                                    {historiqueRdv.length === 0 ? (
                                        <div style={{ textAlign: "center", padding: "20px 0", color: "#BDBDBD", fontSize: 13 }}>Aucune consultation passée.</div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 400, overflowY: "auto", paddingRight: 4 }}>
                                            {historiqueRdv.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(r => (
                                                <div key={r.id} style={{ background: "#fff", padding: 14, borderRadius: 10, border: "0.5px solid #EBEBEB", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                                        <span style={{ fontSize: 12.5, fontWeight: 700, color: ACCENT, textTransform: "capitalize" }}>{new Date(r.date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                        <span style={{ fontSize: 11.5, color: "#9E9E9E", fontFamily: "monospace", fontWeight: 600 }}>{r.heure?.slice(0,5)}</span>
                                                    </div>
                                                    <div style={{ fontSize: 13, color: "#6B6B6B", marginBottom: r.diagnostic ? 8 : 0 }}><strong>Motif :</strong> {r.motif}</div>
                                                    {r.diagnostic && (
                                                        <div style={{ fontSize: 13, color: "#0F0F0F", background: "#F5F5F5", padding: 10, borderRadius: 8 }}>
                                                            <strong>Diag :</strong> {r.diagnostic}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ background: "#FAFAFA", borderRadius: 16, padding: 20, border: "0.5px solid #EBEBEB" }}>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0F0F0F", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 8 }}>
                                        <i className="bi bi-file-medical" style={{ color: ACCENT, fontSize: 16 }}></i> Ordonnances ({dossier.ordonnances?.length ?? 0})
                                    </div>
                                    {!dossier.ordonnances?.length ? (
                                        <div style={{ textAlign: "center", padding: "20px 0", color: "#BDBDBD", fontSize: 13 }}>Aucune ordonnance.</div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                            {dossier.ordonnances.map(o => (
                                                <div key={o.id} onClick={() => setSelOrdo(o)}
                                                     style={{ padding: "12px 14px", borderRadius: 10, background: "#fff", border: "0.5px solid #EBEBEB", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s" }}
                                                     onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = ACCENT; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"; }}
                                                     onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#EBEBEB"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                                                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${ACCENT}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <i className="bi bi-file-earmark-medical" style={{ color: ACCENT, fontSize: 18 }}></i>
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 700, fontSize: 13, color: "#0F0F0F" }}>{Object.keys(o.medicaments || {}).length} médicament(s)</div>
                                                        <div style={{ fontSize: 12, color: "#9E9E9E", marginTop: 2 }}>{o.date ? new Date(o.date).toLocaleDateString("fr-FR") : "—"}</div>
                                                    </div>
                                                    <i className="bi bi-chevron-right" style={{ color: "#BDBDBD", fontSize: 14 }}></i>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
