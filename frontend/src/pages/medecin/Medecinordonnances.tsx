import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { medecinService, rendezVousService, ordonnanceService, type Medecin, type RendezVous, type Ordonnance } from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",         label: "Tableau de bord",  path: "/dashboard/medecin" },
    { icon: "bi-calendar-check",       label: "Mon agenda",       path: "/dashboard/medecin/agenda" },
    { icon: "bi-people",               label: "Mes patients",     path: "/dashboard/medecin/patients" },
    { icon: "bi-file-earmark-medical", label: "Ordonnances",      path: "/dashboard/medecin/ordonnances" },
    { icon: "bi-person-gear",          label: "Mon profil",       path: "/dashboard/medecin/profil" },
];

export default function MedecinOrdonnances() {
    const { user } = useAuth();
    // @ts-ignore
    const [medecin, setMedecin]         = useState<Medecin | null>(null);
    const [rdvsTermines, setRdvsTermines] = useState<RendezVous[]>([]);
    const [loading, setLoading]         = useState(true);
    const [selected, setSelected]       = useState<Ordonnance | null>(null);

    /* modal création */
    const [modal, setModal]             = useState(false);
    const [selRdv, setSelRdv]           = useState<RendezVous | null>(null);
    const [meds, setMeds]               = useState<{nom:string;posologie:string}[]>([{nom:"",posologie:""}]);
    const [createLoading, setCreateLoading] = useState(false);
    const [createSuccess, setCreateSuccess] = useState(false);
    const [createError, setCreateError] = useState("");

    /* ordonnances list */
    const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([]);
    // @ts-ignore
    const [page, setPage]               = useState(0);
    // @ts-ignore
    const [totalPages, setTotalPages]   = useState(0);
    const [filterRdv, setFilterRdv]     = useState<string>("");

    const load = useCallback(async (pg: number) => {
        if (!user?.email) return;
        setLoading(true);
        try {
            const pMed = await medecinService.getAll(0, 100);
            const med  = pMed.content.find(m => m.email === user.email);
            setMedecin(med ?? null);
            if (!med) return;

            const rdvPage = await rendezVousService.getByMedecin(med.id, 0, 100);
            const termines = rdvPage.content.filter(r => r.statut === "TERMINE");
            setRdvsTermines(termines);

            if (filterRdv) {
                const data = await ordonnanceService.getByRendezVous(filterRdv, pg, 6);
                setOrdonnances(data.content);
                setTotalPages(data.totalPages);
            } else if (termines.length > 0) {
                // charger ordo du premier RDV terminé pour avoir quelque chose
                const all: Ordonnance[] = [];
                for (const rdv of termines.slice(0, 5)) {
                    const data = await ordonnanceService.getByRendezVous(rdv.id, 0, 50).catch(() => ({ content: [] }));
                    all.push(...data.content);
                }
                setOrdonnances(all);
                setTotalPages(1);
            }
            setPage(pg);
        } finally { setLoading(false); }
    }, [user, filterRdv]);

    useEffect(() => { load(0); }, [load]);

    const handleCreate = async () => {
        if (!selRdv) return;
        setCreateLoading(true); setCreateError("");
        try {
            const medicaments: Record<string,string> = {};
            meds.filter(m => m.nom.trim()).forEach(m => { medicaments[m.nom] = m.posologie; });
            await ordonnanceService.creer({ rendezVousId: selRdv.id, medicaments });
            setCreateSuccess(true);
            await load(0);
            setTimeout(() => { setModal(false); setCreateSuccess(false); setMeds([{nom:"",posologie:""}]); setSelRdv(null); }, 1500);
        } catch (e: any) {
            setCreateError(e?.response?.data?.message || "Erreur lors de la création");
        } finally { setCreateLoading(false); }
    };

    return (
        <DashboardLayout navItems={NAV} title="Ordonnances" accentColor="#1A7A52">
            {/* Toolbar */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, gap:12, flexWrap:"wrap" }}>
                <select value={filterRdv} onChange={e => setFilterRdv(e.target.value)}
                        style={{ borderRadius:10, border:"1px solid #E5E7EB", padding:"9px 14px", fontSize:13, background:"#fff", flex:1, maxWidth:400 }}>
                    <option value="">Toutes les ordonnances</option>
                    {rdvsTermines.map(r => (
                        <option key={r.id} value={r.id}>
                            {r.patient?.prenom} {r.patient?.nom} — {r.date} à {r.heure?.slice(0,5)}
                        </option>
                    ))}
                </select>
                <button onClick={() => setModal(true)}
                        style={{ background:"linear-gradient(135deg,#1A7A52,#27A869)", color:"#fff", border:"none", borderRadius:12, padding:"10px 22px", fontWeight:700, cursor:"pointer", fontSize:14, flexShrink:0 }}>
                    <i className="bi bi-file-earmark-plus me-2"></i>Nouvelle ordonnance
                </button>
            </div>

            {loading ? (
                <div className="d-flex justify-content-center" style={{ padding:60 }}>
                    <div className="spinner-border" style={{ color:"#1A7A52" }}></div>
                </div>
            ) : ordonnances.length === 0 ? (
                <div style={{ textAlign:"center", padding:"80px 0", background:"#fff", borderRadius:20, color:"#8A94A6" }}>
                    <i className="bi bi-file-earmark-x" style={{ fontSize:56 }}></i>
                    <div style={{ marginTop:16, fontSize:17 }}>Aucune ordonnance</div>
                    <div style={{ fontSize:13, marginTop:8, color:"#9CA3AF" }}>Créez des ordonnances après chaque consultation terminée</div>
                </div>
            ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px,1fr))", gap:16 }}>
                    {ordonnances.map(o => (
                        <div key={o.id} onClick={() => setSelected(o)}
                             style={{ background:"#fff", borderRadius:18, padding:22, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #F0F2F7", cursor:"pointer", transition:"all 0.18s" }}
                             onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.transform="translateY(-3px)"; el.style.borderColor="#1A7A52"; }}
                             onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.transform=""; el.style.borderColor="#F0F2F7"; }}>

                            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                                <div style={{ width:44, height:44, borderRadius:12, background:"#E8F5EE", display:"flex", alignItems:"center", justifyContent:"center", color:"#1A7A52", fontWeight:700, fontSize:15, flexShrink:0 }}>
                                    {o.rendezVous?.patient?.prenom?.[0]}{o.rendezVous?.patient?.nom?.[0]}
                                </div>
                                <div style={{ flex:1 }}>
                                    <div style={{ fontWeight:700, fontSize:14 }}>{o.rendezVous?.patient?.prenom} {o.rendezVous?.patient?.nom}</div>
                                    <div style={{ fontSize:12, color:"#8A94A6" }}>{o.dateCreation ? new Date(o.dateCreation).toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"}) : "—"}</div>
                                </div>
                                <span style={{ background:"#E8F5EE", color:"#1A7A52", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>
                  {Object.keys(o.medicaments||{}).length} méd.
                </span>
                            </div>

                            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                                {Object.entries(o.medicaments||{}).slice(0,3).map(([med,pos]) => (
                                    <div key={med} style={{ display:"flex", gap:8, padding:"7px 10px", borderRadius:8, background:"#F0FDF4" }}>
                                        <i className="bi bi-capsule" style={{ color:"#1A7A52", fontSize:13, marginTop:1 }}></i>
                                        <span style={{ fontSize:13, fontWeight:600, color:"#065F46" }}>{med}</span>
                                        <span style={{ fontSize:12, color:"#6B7280", marginLeft:"auto" }}>{pos}</span>
                                    </div>
                                ))}
                                {Object.keys(o.medicaments||{}).length > 3 && (
                                    <div style={{ fontSize:12, color:"#8A94A6", textAlign:"center" }}>+{Object.keys(o.medicaments).length-3} de plus</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal nouvelle ordonnance */}
            {modal && (
                <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ background:"#fff", borderRadius:22, padding:32, width:520, maxWidth:"90vw", maxHeight:"90vh", overflowY:"auto" }}>
                        {createSuccess ? (
                            <div style={{ textAlign:"center", padding:"40px 0" }}>
                                <div style={{ fontSize:52 }}>✅</div>
                                <div style={{ fontSize:18, fontWeight:700, color:"#1A7A52", marginTop:12 }}>Ordonnance créée !</div>
                            </div>
                        ) : (
                            <>
                                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                                    <h3 style={{ margin:0, fontSize:18, fontWeight:700 }}>Nouvelle ordonnance</h3>
                                    <button onClick={()=>setModal(false)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#6B7280" }}>✕</button>
                                </div>
                                {createError && <div className="alert alert-danger py-2 small mb-3">{createError}</div>}

                                <div style={{ marginBottom:16 }}>
                                    <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Rendez-vous terminé</label>
                                    <select value={selRdv?.id||""} onChange={e => setSelRdv(rdvsTermines.find(r=>r.id===e.target.value)||null)}
                                            style={{ width:"100%", borderRadius:8, border:"1px solid #E5E7EB", padding:"9px 12px", fontSize:14 }}>
                                        <option value="">Sélectionner un rendez-vous</option>
                                        {rdvsTermines.map(r => (
                                            <option key={r.id} value={r.id}>{r.patient?.prenom} {r.patient?.nom} — {r.date} {r.heure?.slice(0,5)}</option>
                                        ))}
                                    </select>
                                </div>

                                <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:8 }}>Médicaments</label>
                                {meds.map((m,i) => (
                                    <div key={i} style={{ display:"flex", gap:10, marginBottom:10 }}>
                                        <input placeholder="Médicament" value={m.nom} onChange={e=>{const c=[...meds];c[i].nom=e.target.value;setMeds(c);}}
                                               style={{ flex:1, borderRadius:8, border:"1px solid #E5E7EB", padding:"9px 12px", fontSize:13 }}/>
                                        <input placeholder="Posologie" value={m.posologie} onChange={e=>{const c=[...meds];c[i].posologie=e.target.value;setMeds(c);}}
                                               style={{ flex:1, borderRadius:8, border:"1px solid #E5E7EB", padding:"9px 12px", fontSize:13 }}/>
                                        {meds.length>1 && (
                                            <button onClick={()=>setMeds(meds.filter((_,j)=>j!==i))}
                                                    style={{ background:"#FEE2E2", border:"none", borderRadius:8, padding:"0 12px", color:"#991B1B", cursor:"pointer" }}>✕</button>
                                        )}
                                    </div>
                                ))}
                                <button onClick={()=>setMeds([...meds,{nom:"",posologie:""}])}
                                        style={{ background:"none", border:"1px dashed #1A7A52", color:"#1A7A52", borderRadius:8, padding:"7px 16px", fontSize:13, cursor:"pointer", marginBottom:20, width:"100%" }}>
                                    + Ajouter un médicament
                                </button>

                                <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
                                    <button onClick={()=>setModal(false)} style={{ background:"#F3F4F6", border:"none", borderRadius:10, padding:"10px 20px", cursor:"pointer" }}>Annuler</button>
                                    <button onClick={handleCreate} disabled={createLoading||!selRdv||meds.every(m=>!m.nom.trim())}
                                            style={{ background:"linear-gradient(135deg,#1A7A52,#27A869)", color:"#fff", border:"none", borderRadius:10, padding:"10px 24px", cursor:"pointer", fontWeight:600, fontSize:14 }}>
                                        {createLoading?<span className="spinner-border spinner-border-sm"></span>:"Créer"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Modal détail */}
            {selected && (
                <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ background:"#fff", borderRadius:22, padding:32, width:460, maxWidth:"90vw" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                            <h3 style={{ margin:0, fontSize:17, fontWeight:700 }}>Détail ordonnance</h3>
                            <button onClick={()=>setSelected(null)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#6B7280" }}>✕</button>
                        </div>
                        <div style={{ fontSize:13, color:"#6B7280", marginBottom:16 }}>
                            Patient : {selected.rendezVous?.patient?.prenom} {selected.rendezVous?.patient?.nom}<br/>
                            Date : {selected.dateCreation ? new Date(selected.dateCreation).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}) : "—"}
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                            {Object.entries(selected.medicaments||{}).map(([med,pos]) => (
                                <div key={med} style={{ padding:"14px 16px", borderRadius:12, background:"#F0FDF4", border:"1px solid #BBF7D0" }}>
                                    <div style={{ fontWeight:700, color:"#065F46" }}>{med}</div>
                                    <div style={{ fontSize:13, color:"#047857", marginTop:4 }}>{pos}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}