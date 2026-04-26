import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { medecinService, rendezVousService, dossierService, type Medecin, type Patient, type DossierMedical } from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",         label: "Tableau de bord",  path: "/dashboard/medecin" },
    { icon: "bi-calendar-check",       label: "Mon agenda",       path: "/dashboard/medecin/agenda" },
    { icon: "bi-people",               label: "Mes patients",     path: "/dashboard/medecin/patients" },
    { icon: "bi-file-earmark-medical", label: "Ordonnances",      path: "/dashboard/medecin/ordonnances" },
    { icon: "bi-person-gear",          label: "Mon profil",       path: "/dashboard/medecin/profil" },
];

export default function MedecinPatients() {
    const { user } = useAuth();
    // @ts-ignore
    const [medecin, setMedecin]     = useState<Medecin | null>(null);
    const [patients, setPatients]   = useState<Patient[]>([]);
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState("");
    const [selPatient, setSelPatient] = useState<Patient | null>(null);
    const [dossier, setDossier]     = useState<DossierMedical | null>(null);
    const [dossierLoading, setDossierLoading] = useState(false);

    const load = useCallback(async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            const pMed = await medecinService.getAll(0, 100);
            const med  = pMed.content.find(m => m.email === user.email);
            setMedecin(med ?? null);
            if (!med) return;
            // Récupérer tous les RDV pour extraire les patients uniques
            const rdvPage = await rendezVousService.getByMedecin(med.id, 0, 200);
            const seen = new Set<string>();
            const unique: Patient[] = [];
            rdvPage.content.forEach(r => {
                if (r.patient && !seen.has(r.patient.id)) {
                    seen.add(r.patient.id);
                    unique.push(r.patient);
                }
            });
            setPatients(unique);
        } finally { setLoading(false); }
    }, [user]);

    useEffect(() => { load(); }, [load]);

    const openDossier = async (pat: Patient) => {
        setSelPatient(pat);
        setDossierLoading(true);
        setDossier(null);
        try {
            const dos = await dossierService.getByPatient(pat.id);
            setDossier(dos);
        } catch { setDossier(null); }
        finally { setDossierLoading(false); }
    };

    const filtered = patients.filter(p =>
        `${p.nom} ${p.prenom} ${p.email}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout navItems={NAV} title="Mes patients" accentColor="#1A7A52">
            {/* Search */}
            <div style={{ background:"#fff", borderRadius:16, padding:"14px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:12, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", border:"1px solid #F0F2F7" }}>
                <i className="bi bi-search" style={{ color:"#9CA3AF", fontSize:16 }}></i>
                <input placeholder="Rechercher un patient..." value={search} onChange={e=>setSearch(e.target.value)}
                       style={{ border:"none", outline:"none", fontSize:15, flex:1, color:"#0D1F2D" }}/>
                <span style={{ fontSize:13, color:"#8A94A6" }}>{filtered.length} patient{filtered.length!==1?"s":""}</span>
            </div>

            {loading ? (
                <div className="d-flex justify-content-center" style={{ padding:60 }}>
                    <div className="spinner-border" style={{ color:"#1A7A52" }}></div>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign:"center", padding:"64px 0", background:"#fff", borderRadius:20, color:"#8A94A6" }}>
                    <i className="bi bi-people" style={{ fontSize:52 }}></i>
                    <div style={{ marginTop:16, fontSize:16 }}>Aucun patient trouvé</div>
                </div>
            ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:16 }}>
                    {filtered.map(p => (
                        <div key={p.id} onClick={() => openDossier(p)}
                             style={{ background:"#fff", borderRadius:18, padding:22, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", border:"1px solid #F0F2F7", cursor:"pointer", transition:"all 0.18s" }}
                             onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform="translateY(-3px)";el.style.borderColor="#1A7A52";el.style.boxShadow="0 8px 24px rgba(26,122,82,0.12)";}}
                             onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform="";el.style.borderColor="#F0F2F7";el.style.boxShadow="0 2px 12px rgba(0,0,0,0.05)";}}>
                            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
                                <div style={{ width:50, height:50, borderRadius:"50%", background:"linear-gradient(135deg,#1A7A52,#27A869)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:18, flexShrink:0 }}>
                                    {p.prenom?.[0]}{p.nom?.[0]}
                                </div>
                                <div>
                                    <div style={{ fontWeight:700, fontSize:16, color:"#0D1F2D" }}>{p.prenom} {p.nom}</div>
                                    {p.groupeSanguin && (
                                        <span style={{ background:"#FEE2E2", color:"#991B1B", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>{p.groupeSanguin}</span>
                                    )}
                                </div>
                            </div>
                            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                                {[
                                    { icon:"bi-envelope", value:p.email },
                                    { icon:"bi-telephone", value:p.telephone },
                                    { icon:"bi-geo-alt", value:p.adresse },
                                ].filter(x=>x.value).map(x=>(
                                    <div key={x.icon} style={{ display:"flex", gap:8, alignItems:"center", fontSize:13, color:"#6B7280" }}>
                                        <i className={`bi ${x.icon}`} style={{ color:"#1A7A52", width:16 }}></i>
                                        <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{x.value}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop:14, fontSize:12, color:"#1A7A52", fontWeight:600 }}>Voir le dossier →</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal dossier patient */}
            {selPatient && (
                <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ background:"#fff", borderRadius:22, padding:32, width:520, maxWidth:"90vw", maxHeight:"85vh", overflowY:"auto" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                            <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                                <div style={{ width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg,#1A7A52,#27A869)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:20 }}>
                                    {selPatient.prenom?.[0]}{selPatient.nom?.[0]}
                                </div>
                                <div>
                                    <div style={{ fontSize:20, fontWeight:800, color:"#0D1F2D" }}>{selPatient.prenom} {selPatient.nom}</div>
                                    <div style={{ fontSize:13, color:"#8A94A6" }}>{selPatient.email}</div>
                                </div>
                            </div>
                            <button onClick={()=>{setSelPatient(null);setDossier(null);}} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#6B7280" }}>✕</button>
                        </div>

                        {dossierLoading ? (
                            <div className="d-flex justify-content-center" style={{ padding:40 }}><div className="spinner-border" style={{ color:"#1A7A52" }}></div></div>
                        ) : (
                            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                                {[
                                    { icon:"bi-telephone-fill",       label:"Téléphone",     value:selPatient.telephone,   color:"#0EA5E9", bg:"#E0F2FE" },
                                    { icon:"bi-cake2-fill",            label:"Naissance",     value:selPatient.dateDeNaissance?new Date(selPatient.dateDeNaissance).toLocaleDateString("fr-FR"):null, color:"#F59E0B", bg:"#FEF3C7" },
                                    { icon:"bi-droplet-fill",          label:"Groupe sanguin",value:selPatient.groupeSanguin, color:"#EF4444", bg:"#FEE2E2" },
                                    { icon:"bi-geo-alt-fill",          label:"Adresse",       value:selPatient.adresse,      color:"#8B5CF6", bg:"#EDE9FE" },
                                    { icon:"bi-exclamation-triangle",  label:"Allergies",     value:dossier?.allergies||"Aucune allergie connue", color:"#F59E0B", bg:"#FEF3C7" },
                                    { icon:"bi-speedometer",           label:"Poids",         value:dossier?.poids?`${dossier.poids} kg`:null, color:"#1A7A52", bg:"#E8F5EE" },
                                    { icon:"bi-arrows-vertical",       label:"Taille",        value:dossier?.taille?`${dossier.taille} cm`:null, color:"#0EA5E9", bg:"#E0F2FE" },
                                ].map(item=>(
                                    <div key={item.label} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:12, background:"#F8FAFC" }}>
                                        <div style={{ width:38, height:38, borderRadius:10, background:item.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                                            <i className={`bi ${item.icon}`} style={{ color:item.color, fontSize:16 }}></i>
                                        </div>
                                        <div>
                                            <div style={{ fontSize:11, color:"#8A94A6", fontWeight:500 }}>{item.label}</div>
                                            <div style={{ fontSize:14, fontWeight:600, color:"#0D1F2D" }}>{item.value||"—"}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}