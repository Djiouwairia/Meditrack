import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { secretaireService, type Secretaire } from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",   label: "Tableau de bord",  path: "/dashboard/secretaire" },
    { icon: "bi-people",         label: "Patients",         path: "/dashboard/secretaire/patients" },
    { icon: "bi-calendar-check", label: "Rendez-vous",      path: "/dashboard/secretaire/rendez-vous" },
    { icon: "bi-person-gear",    label: "Mon profil",       path: "/dashboard/secretaire/profil" },
];

export default function SecretaireProfil() {
    const { user, logout } = useAuth();
    const [secretaire, setSecretaire] = useState<Secretaire | null>(null);
    const [loading, setLoading]       = useState(true);
    const [editing, setEditing]       = useState(false);
    const [form, setForm]             = useState({ nom:"", prenom:"", telephone:"" });
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError]           = useState("");

    const load = useCallback(async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            const p = await secretaireService.getAll(0, 100);
            const sec = p.content.find(s => s.email === user.email) ?? null;
            setSecretaire(sec);
            if (sec) setForm({ nom: sec.nom||"", prenom: sec.prenom||"", telephone: sec.telephone||"" });
        } finally { setLoading(false); }
    }, [user]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async () => {
        if (!secretaire) return;
        setSaveLoading(true); setError("");
        try {
            const updated = await secretaireService.update(secretaire.id, { ...form, hopitalId: secretaire.hopital?.id });
            setSecretaire(updated);
            setSaveSuccess(true); setEditing(false);
            setTimeout(() => setSaveSuccess(false), 2500);
        } catch (e: any) { setError(e?.response?.data?.message || "Erreur de sauvegarde"); }
        finally { setSaveLoading(false); }
    };

    const inp = { width:"100%", borderRadius:8, border:"1px solid #E5E7EB", padding:"10px 14px", fontSize:14, boxSizing:"border-box" as const };

    return (
        <DashboardLayout navItems={NAV} title="Mon profil" >
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height:300 }}>
                    <div className="spinner-border" style={{ color:"#7C3AED" }}></div>
                </div>
            ) : (
                <div style={{ maxWidth:680, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 }}>

                    {/* Banner */}
                    <div style={{ background:"linear-gradient(135deg,#5B21B6,#7C3AED)", borderRadius:20, padding:"32px 36px", color:"#fff", display:"flex", alignItems:"center", gap:24 }}>
                        <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.25)", border:"3px solid rgba(255,255,255,0.5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, fontWeight:800, flexShrink:0 }}>
                            {secretaire?.prenom?.[0]}{secretaire?.nom?.[0]}
                        </div>
                        <div>
                            <div style={{ fontSize:24, fontWeight:800 }}>{secretaire?.prenom} {secretaire?.nom}</div>
                            <div style={{ opacity:0.85, marginTop:4 }}>{secretaire?.email}</div>
                            <div style={{ opacity:0.75, fontSize:13, marginTop:4 }}><i className="bi bi-hospital me-2"></i>Secrétaire médicale · {secretaire?.hopital?.nom}</div>
                        </div>
                        {saveSuccess && (
                            <div style={{ marginLeft:"auto", background:"rgba(255,255,255,0.2)", borderRadius:12, padding:"8px 16px", fontWeight:600, fontSize:14 }}>✓ Mis à jour</div>
                        )}
                    </div>

                    {/* Infos */}
                    <div style={{ background:"#fff", borderRadius:20, padding:28, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", border:"1px solid #F0F2F7" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                            <h2 style={{ margin:0, fontSize:17, fontWeight:700 }}>Informations personnelles</h2>
                            {!editing ? (
                                <button onClick={()=>setEditing(true)} style={{ background:"#EDE9FE", color:"#7C3AED", border:"none", borderRadius:10, padding:"8px 18px", cursor:"pointer", fontSize:13, fontWeight:600 }}>
                                    <i className="bi bi-pencil me-2"></i>Modifier
                                </button>
                            ) : (
                                <div style={{ display:"flex", gap:8 }}>
                                    <button onClick={()=>{setEditing(false);setError("");}} style={{ background:"#F3F4F6", border:"none", borderRadius:10, padding:"8px 16px", cursor:"pointer", fontSize:13 }}>Annuler</button>
                                    <button onClick={handleSave} disabled={saveLoading}
                                            style={{ background:"linear-gradient(135deg,#5B21B6,#7C3AED)", color:"#fff", border:"none", borderRadius:10, padding:"8px 20px", cursor:"pointer", fontSize:13, fontWeight:600 }}>
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
                            </div>
                        ) : (
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                                {[
                                    { icon:"bi-person-fill",    label:"Nom complet",   value:`${secretaire?.prenom} ${secretaire?.nom}`, color:"#7C3AED", bg:"#EDE9FE" },
                                    { icon:"bi-envelope-fill",  label:"Email",         value:secretaire?.email,                          color:"#0EA5E9", bg:"#E0F2FE" },
                                    { icon:"bi-telephone-fill", label:"Téléphone",     value:secretaire?.telephone,                      color:"#1A7A52", bg:"#E8F5EE" },
                                    { icon:"bi-hospital-fill",  label:"Hôpital",       value:secretaire?.hopital?.nom,                   color:"#F59E0B", bg:"#FEF3C7" },
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