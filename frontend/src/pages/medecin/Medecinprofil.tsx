import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { medecinService, type Medecin } from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",         label: "Tableau de bord",  path: "/dashboard/medecin" },
    { icon: "bi-calendar-check",       label: "Mon agenda",       path: "/dashboard/medecin/agenda" },
    { icon: "bi-people",               label: "Mes patients",     path: "/dashboard/medecin/patients" },
    { icon: "bi-file-earmark-medical", label: "Ordonnances",      path: "/dashboard/medecin/ordonnances" },
    { icon: "bi-person-gear",          label: "Mon profil",       path: "/dashboard/medecin/profil" },
];

const SPECIALITES = ["Cardiologie","Dermatologie","Endocrinologie","Gastroentérologie","Gynécologie","Médecine générale","Neurologie","Oncologie","Ophtalmologie","ORL","Orthopédie","Pédiatrie","Pneumologie","Psychiatrie","Radiologie","Rhumatologie","Urologie"];

export default function MedecinProfil() {
    const { user, logout } = useAuth();
    const [medecin, setMedecin]   = useState<Medecin | null>(null);
    const [loading, setLoading]   = useState(true);
    const [editing, setEditing]   = useState(false);
    const [form, setForm]         = useState({ nom:"", prenom:"", telephone:"", specialite:"" });
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError]       = useState("");

    const load = useCallback(async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            const p = await medecinService.getAll(0, 100);
            const med = p.content.find(m => m.email === user.email) ?? null;
            setMedecin(med);
            if (med) setForm({ nom:med.nom||"", prenom:med.prenom||"", telephone:med.telephone||"", specialite:med.specialite||"" });
        } finally { setLoading(false); }
    }, [user]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async () => {
        if (!medecin) return;
        setSaveLoading(true); setError("");
        try {
            const updated = await medecinService.update(medecin.id, { ...form, hopitalId: medecin.hopital?.id });
            setMedecin(updated);
            setSaveSuccess(true); setEditing(false);
            setTimeout(() => setSaveSuccess(false), 2500);
        } catch (e: any) {
            setError(e?.response?.data?.message || "Erreur de sauvegarde");
        } finally { setSaveLoading(false); }
    };

    const toggleDispo = async () => {
        if (!medecin) return;
        const updated = await medecinService.toggleDisponibilite(medecin.id);
        setMedecin(updated);
    };

    const inp = { width:"100%", borderRadius:8, border:"1px solid #E5E7EB", padding:"10px 14px", fontSize:14, boxSizing:"border-box" as const };

    return (
        <DashboardLayout navItems={NAV} title="Mon profil" accentColor="#27A869">
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height:300 }}>
                    <div className="spinner-border" style={{ color:"#27A869" }}></div>
                </div>
            ) : (
                <div style={{ maxWidth:720, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 }}>

                    {/* Banner */}
                    <div style={{ background:"linear-gradient(135deg,#27A869,#27A869)", borderRadius:20, padding:"32px 36px", color:"#fff", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                            <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.25)", border:"3px solid rgba(255,255,255,0.5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, fontWeight:800 }}>
                                {medecin?.prenom?.[0]}{medecin?.nom?.[0]}
                            </div>
                            <div>
                                <div style={{ fontSize:24, fontWeight:800 }}>Dr. {medecin?.prenom} {medecin?.nom}</div>
                                <div style={{ opacity:0.85, marginTop:4 }}>{medecin?.specialite}</div>
                                <div style={{ opacity:0.75, fontSize:13, marginTop:4 }}><i className="bi bi-hospital me-2"></i>{medecin?.hopital?.nom}</div>
                            </div>
                        </div>
                        <div style={{ textAlign:"center" }}>
                            <div style={{ fontSize:12, opacity:0.8, marginBottom:8 }}>Disponibilité</div>
                            <button onClick={toggleDispo}
                                    style={{ background: medecin?.disponible?"rgba(255,255,255,0.25)":"rgba(220,50,50,0.35)", border:"2px solid rgba(255,255,255,0.5)", color:"#fff", borderRadius:14, padding:"10px 24px", fontWeight:700, cursor:"pointer", fontSize:14 }}>
                                {medecin?.disponible?"✓ Disponible":"✗ Indisponible"}
                            </button>
                        </div>
                    </div>

                    {/* Infos */}
                    <div style={{ background:"#fff", borderRadius:20, padding:28, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", border:"1px solid #F0F2F7" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                            <h2 style={{ margin:0, fontSize:17, fontWeight:700 }}>Informations professionnelles</h2>
                            {saveSuccess && <span style={{ background:"#D1FAE5", color:"#065F46", fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20 }}>✓ Sauvegardé</span>}
                            {!editing ? (
                                <button onClick={()=>setEditing(true)}
                                        style={{ background:"#E8F5EE", color:"#27A869", border:"none", borderRadius:10, padding:"8px 18px", cursor:"pointer", fontSize:13, fontWeight:600 }}>
                                    <i className="bi bi-pencil me-2"></i>Modifier
                                </button>
                            ) : (
                                <div style={{ display:"flex", gap:8 }}>
                                    <button onClick={()=>{setEditing(false);setError("");}} style={{ background:"#F3F4F6", border:"none", borderRadius:10, padding:"8px 16px", cursor:"pointer", fontSize:13 }}>Annuler</button>
                                    <button onClick={handleSave} disabled={saveLoading}
                                            style={{ background:"linear-gradient(135deg,#27A869,#27A869)", color:"#fff", border:"none", borderRadius:10, padding:"8px 20px", cursor:"pointer", fontSize:13, fontWeight:600 }}>
                                        {saveLoading?<span className="spinner-border spinner-border-sm"></span>:"Sauvegarder"}
                                    </button>
                                </div>
                            )}
                        </div>
                        {error && <div className="alert alert-danger py-2 small mb-4">{error}</div>}

                        {editing ? (
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                                {([{key:"nom",label:"Nom"},{key:"prenom",label:"Prénom"},{key:"telephone",label:"Téléphone"}] as const).map(f=>(
                                    <div key={f.key}>
                                        <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>{f.label}</label>
                                        <input value={form[f.key]} onChange={e=>setForm(x=>({...x,[f.key]:e.target.value}))} style={inp}/>
                                    </div>
                                ))}
                                <div>
                                    <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Spécialité</label>
                                    <select value={form.specialite} onChange={e=>setForm(x=>({...x,specialite:e.target.value}))} style={inp}>
                                        <option value="">Sélectionner</option>
                                        {SPECIALITES.map(s=><option key={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                                {[
                                    { icon:"bi-person-fill",    label:"Nom complet",   value:`Dr. ${medecin?.prenom} ${medecin?.nom}`, color:"#27A869", bg:"#E8F5EE" },
                                    { icon:"bi-envelope-fill",  label:"Email",         value:medecin?.email,                           color:"#0EA5E9", bg:"#E0F2FE" },
                                    { icon:"bi-telephone-fill", label:"Téléphone",     value:medecin?.telephone,                       color:"#8B5CF6", bg:"#EDE9FE" },
                                    { icon:"bi-award-fill",     label:"Spécialité",    value:medecin?.specialite,                      color:"#F59E0B", bg:"#FEF3C7" },
                                    { icon:"bi-hospital-fill",  label:"Hôpital",       value:medecin?.hopital?.nom,                    color:"#EF4444", bg:"#FEE2E2" },
                                ].map(item=>(
                                    <div key={item.label} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:14, background:"#F8FAFC", border:"1px solid #EEF1F6" }}>
                                        <div style={{ width:40, height:40, borderRadius:10, background:item.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                                            <i className={`bi ${item.icon}`} style={{ fontSize:18, color:item.color }}></i>
                                        </div>
                                        <div>
                                            <div style={{ fontSize:11, color:"#8A94A6", fontWeight:500 }}>{item.label}</div>
                                            <div style={{ fontSize:14, fontWeight:600, color:"#0D1F2D", marginTop:2 }}>{item.value||"—"}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Danger zone */}
                    <div style={{ background:"#fff", borderRadius:20, padding:24, border:"1px solid #FEE2E2" }}>
                        <h3 style={{ margin:"0 0 8px", fontSize:15, fontWeight:700, color:"#991B1B" }}>Zone de danger</h3>
                        <p style={{ margin:"0 0 16px", fontSize:13, color:"#6B7280" }}>Ces actions sont irréversibles.</p>
                        <button onClick={logout} style={{ background:"#FEE2E2", color:"#991B1B", border:"none", borderRadius:10, padding:"10px 20px", cursor:"pointer", fontSize:13, fontWeight:600 }}>
                            <i className="bi bi-box-arrow-right me-2"></i>Se déconnecter
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}