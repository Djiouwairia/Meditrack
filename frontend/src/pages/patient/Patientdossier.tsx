import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { patientService, dossierService, ordonnanceService, type Patient, type DossierMedical, type Ordonnance } from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",        label: "Tableau de bord",   path: "/dashboard/patient" },
    { icon: "bi-calendar-check",      label: "Mes rendez-vous",   path: "/dashboard/patient/rendez-vous" },
    { icon: "bi-folder2-open",        label: "Mon dossier",       path: "/dashboard/patient/dossier" },
    { icon: "bi-file-earmark-medical",label: "Ordonnances",       path: "/dashboard/patient/ordonnances" },
    { icon: "bi-person-gear",         label: "Mon profil",        path: "/dashboard/patient/profil" },
];

export default function PatientDossier() {
    const { user } = useAuth();
    const [patient, setPatient]   = useState<Patient | null>(null);
    const [dossier, setDossier]   = useState<DossierMedical | null>(null);
    const [loading, setLoading]   = useState(true);
    const [editing, setEditing]   = useState(false);
    const [form, setForm]         = useState({ allergies:"", poids:"", taille:"" });
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([]);
    const [selOrdo, setSelOrdo]   = useState<Ordonnance | null>(null);

    const load = useCallback(async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            const pPage = await patientService.getAll(0, 200);
            const pat   = pPage.content.find(p => p.email === user.email) ?? null;
            setPatient(pat);
            if (pat) {
                const dos = await dossierService.getByPatient(pat.id).catch(() => null);
                setDossier(dos);
                if (dos) {
                    setForm({ allergies: dos.allergies||"", poids: dos.poids||"", taille: dos.taille||"" });
                    const ordPage = await ordonnanceService.getByDossier(dos.id, 0, 20);
                    setOrdonnances(ordPage.content);
                }
            }
        } finally { setLoading(false); }
    }, [user]);

    useEffect(() => { void load(); }, [load]);

    const handleSave = async () => {
        if (!dossier) return;
        setSaveLoading(true);
        try {
            const updated = await dossierService.update(dossier.id, form);
            setDossier(updated);
            setSaveSuccess(true);
            setEditing(false);
            setTimeout(() => setSaveSuccess(false), 2000);
        } finally { setSaveLoading(false); }
    };

    const InfoRow = ({ icon, label, value, color, bg }: any) => (
        <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", borderRadius:14, background:"#F8FAFC", border:"1px solid #EEF1F6" }}>
            <div style={{ width:44, height:44, borderRadius:12, background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <i className={`bi ${icon}`} style={{ fontSize:20, color }}></i>
            </div>
            <div>
                <div style={{ fontSize:12, color:"#8A94A6", fontWeight:500 }}>{label}</div>
                <div style={{ fontSize:16, fontWeight:700, color:"#0D1F2D", marginTop:2 }}>{value || "—"}</div>
            </div>
        </div>
    );

    return (
        <DashboardLayout navItems={NAV} title="Mon dossier médical" accentColor="#27A869">
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height:300 }}>
                    <div className="spinner-border" style={{ color:"#27A869" }}></div>
                </div>
            ) : !dossier ? (
                <div style={{ textAlign:"center", padding:"64px 0", color:"#8A94A6", background:"#fff", borderRadius:20 }}>
                    <i className="bi bi-folder2" style={{ fontSize:52 }}></i>
                    <div style={{ marginTop:16, fontSize:16 }}>Dossier médical non disponible</div>
                </div>
            ) : (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:20, alignItems:"start" }}>

                    {/* Colonne principale */}
                    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

                        {/* Infos patient */}
                        <div style={{ background:"#fff", borderRadius:20, padding:28, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", border:"1px solid #F0F2F7" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24 }}>
                                <div style={{ width:60, height:60, borderRadius:"50%", background:"linear-gradient(135deg,#1A7A52,#27A869)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:22 }}>
                                    {patient?.prenom?.[0]}{patient?.nom?.[0]}
                                </div>
                                <div>
                                    <div style={{ fontSize:20, fontWeight:800, color:"#0D1F2D" }}>{patient?.prenom} {patient?.nom}</div>
                                    <div style={{ color:"#8A94A6", fontSize:14, marginTop:2 }}>{patient?.email}</div>
                                </div>
                            </div>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                                <InfoRow icon="bi-telephone-fill" label="Téléphone"      value={patient?.telephone}     color="#27A869" bg="#E8F5EE"/>
                                <InfoRow icon="bi-geo-alt-fill"   label="Adresse"        value={patient?.adresse}       color="#8B5CF6" bg="#EDE9FE"/>
                                <InfoRow icon="bi-cake2-fill"     label="Date naissance" value={patient?.dateDeNaissance ? new Date(patient.dateDeNaissance).toLocaleDateString("fr-FR") : null} color="#F59E0B" bg="#FEF3C7"/>
                                <InfoRow icon="bi-droplet-fill"   label="Groupe sanguin" value={patient?.groupeSanguin} color="#EF4444" bg="#FEE2E2"/>
                            </div>
                        </div>

                        {/* Données médicales */}
                        <div style={{ background:"#fff", borderRadius:20, padding:28, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", border:"1px solid #F0F2F7" }}>
                            {dossier.codeAccess && (
                                <div style={{ background: "#E8F5EE", padding: "16px", borderRadius: 12, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #C8E8D4" }}>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1A7A52", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                            <i className="bi bi-shield-lock-fill me-2"></i>Code d'accès sécurisé
                                        </div>
                                        <div style={{ fontSize: 13, color: "#3A6B4F", marginTop: 4 }}>
                                            Communiquez ce code à votre médecin pour l'autoriser à consulter votre dossier.
                                        </div>
                                    </div>
                                    <div style={{ background: "#fff", border: "2px dashed #27A869", color: "#1A7A52", padding: "8px 20px", borderRadius: 8, fontSize: 22, fontWeight: 800, letterSpacing: "2px" }}>
                                        {dossier.codeAccess}
                                    </div>
                                </div>
                            )}

                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                                <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:"#0D1F2D" }}>
                                    <i className="bi bi-activity me-2" style={{ color:"#27A869" }}></i>Données médicales
                                </h2>
                                {saveSuccess && (
                                    <span style={{ background:"#D1FAE5", color:"#065F46", fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20 }}>✓ Sauvegardé</span>
                                )}
                                {!editing ? (
                                    <button onClick={() => setEditing(true)}
                                            style={{ background:"#E8F5EE", color:"#1A7A52", border:"none", borderRadius:10, padding:"8px 16px", cursor:"pointer", fontSize:13, fontWeight:600 }}>
                                        <i className="bi bi-pencil me-2"></i>Modifier
                                    </button>
                                ) : (
                                    <div style={{ display:"flex", gap:8 }}>
                                        <button onClick={() => setEditing(false)}
                                                style={{ background:"#F3F4F6", border:"none", borderRadius:10, padding:"8px 16px", cursor:"pointer", fontSize:13 }}>Annuler</button>
                                        <button onClick={handleSave} disabled={saveLoading}
                                                style={{ background:"linear-gradient(135deg,#1A7A52,#27A869)", color:"#fff", border:"none", borderRadius:10, padding:"8px 16px", cursor:"pointer", fontSize:13, fontWeight:600 }}>
                                            {saveLoading ? <span className="spinner-border spinner-border-sm"></span> : "Sauvegarder"}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {editing ? (
                                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                                    {[
                                        { key:"allergies", label:"Allergies", span:true },
                                        { key:"poids",     label:"Poids (kg)" },
                                        { key:"taille",    label:"Taille (cm)" },
                                    ].map(f => (
                                        <div key={f.key} style={{ gridColumn: f.span ? "1 / -1" : undefined }}>
                                            <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>{f.label}</label>
                                            <input value={(form as any)[f.key]} onChange={e => setForm(x=>({...x,[f.key]:e.target.value}))}
                                                   style={{ width:"100%", borderRadius:8, border:"1px solid #E5E7EB", padding:"10px 14px", fontSize:14, boxSizing:"border-box" as const }}/>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                                    <div style={{ gridColumn:"1 / -1" }}>
                                        <InfoRow icon="bi-exclamation-triangle-fill" label="Allergies" value={dossier.allergies || "Aucune allergie connue"} color="#F59E0B" bg="#FEF3C7"/>
                                    </div>
                                    <InfoRow icon="bi-speedometer" label="Poids" value={dossier.poids ? `${dossier.poids} kg` : null} color="#1A7A52" bg="#E8F5EE"/>
                                    <InfoRow icon="bi-arrows-vertical" label="Taille" value={dossier.taille ? `${dossier.taille} cm` : null} color="#27A869" bg="#E8F5EE"/>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Colonne ordonnances récentes */}
                    <div style={{ background:"#fff", borderRadius:20, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", border:"1px solid #F0F2F7" }}>
                        <h2 style={{ margin:"0 0 16px", fontSize:17, fontWeight:700, color:"#0D1F2D" }}>
                            <i className="bi bi-file-earmark-medical me-2" style={{ color:"#27A869" }}></i>Ordonnances récentes
                        </h2>
                        {ordonnances.length === 0 ? (
                            <div style={{ textAlign:"center", color:"#8A94A6", padding:"32px 0" }}>
                                <i className="bi bi-file-earmark-x" style={{ fontSize:36 }}></i>
                                <div style={{ marginTop:10, fontSize:14 }}>Aucune ordonnance</div>
                            </div>
                        ) : (
                            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                                {ordonnances.map(o => (
                                    <div key={o.id} onClick={() => setSelOrdo(o)}
                                         style={{ padding:"12px 14px", borderRadius:12, background:"#F8FAFC", border:"1px solid #EEF1F6", cursor:"pointer", transition:"all 0.15s" }}
                                         onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="#E8F5EE"}
                                         onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="#F8FAFC"}>
                                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                            <div style={{ fontWeight:600, fontSize:13 }}>
                                                Dr. {o.medecin?.prenom} {o.medecin?.nom}
                                            </div>
                                            <span style={{ fontSize:11, color:"#8A94A6" }}>
                        {o.dateCreation ? new Date(o.dateCreation).toLocaleDateString("fr-FR") : ""}
                      </span>
                                        </div>
                                        <div style={{ fontSize:12, color:"#6B7280", marginTop:4 }}>
                                            {Object.keys(o.medicaments || {}).slice(0,2).join(", ")}
                                            {Object.keys(o.medicaments||{}).length > 2 ? " ..." : ""}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal détail ordonnance */}
            {selOrdo && (
                <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ background:"#fff", borderRadius:20, padding:32, width:440, maxWidth:"90vw" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                            <h3 style={{ margin:0, fontSize:18, fontWeight:700 }}>Ordonnance</h3>
                            <button onClick={()=>setSelOrdo(null)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#6B7280" }}>✕</button>
                        </div>
                        <div style={{ fontSize:13, color:"#6B7280", marginBottom:16 }}>
                            Dr. {selOrdo.medecin?.prenom} {selOrdo.medecin?.nom} · {selOrdo.dateCreation ? new Date(selOrdo.dateCreation).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}) : ""}
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                            {Object.entries(selOrdo.medicaments || {}).map(([med, posologie]) => (
                                <div key={med} style={{ padding:"12px 16px", borderRadius:12, background:"#F0FDF4", border:"1px solid #BBF7D0" }}>
                                    <div style={{ fontWeight:700, fontSize:14, color:"#065F46" }}>{med}</div>
                                    <div style={{ fontSize:13, color:"#047857", marginTop:4 }}>{posologie}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}