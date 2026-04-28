import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { secretaireService, patientService, medecinService, rendezVousService, type Secretaire, type Patient, type Medecin, type RendezVous } from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",   label: "Tableau de bord",  path: "/dashboard/secretaire" },
    { icon: "bi-people",         label: "Patients",         path: "/dashboard/secretaire/patients" },
    { icon: "bi-calendar-check", label: "Rendez-vous",      path: "/dashboard/secretaire/rendez-vous" },
    { icon: "bi-person-gear",    label: "Mon profil",       path: "/dashboard/secretaire/profil" },
];

const inp = { width:"100%", borderRadius:8, border:"1px solid #E5E7EB", padding:"9px 12px", fontSize:14, boxSizing:"border-box" as const };

export default function SecretaireRendezVous() {
    const { user } = useAuth();
    const [secretaire, setSecretaire] = useState<Secretaire | null>(null);
    const [patients, setPatients]     = useState<Patient[]>([]);
    const [medecins, setMedecins]     = useState<Medecin[]>([]);
    const [rdvs, setRdvs]             = useState<RendezVous[]>([]);
    const [loading, setLoading]       = useState(true);
    const [filterStatut, setFilterStatut] = useState("TOUS");
    const [search, setSearch]         = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    /* modal nouveau RDV */
    const [modal, setModal]     = useState(false);
    const [form, setForm]       = useState({ patientId:"", medecinId:"", date:"", heure:"", motif:"" });
    const [formLoading, setFormLoading] = useState(false);
    const [formSuccess, setFormSuccess] = useState(false);
    const [formError, setFormError]     = useState("");

    /* modal terminer (diagnostic) */
    const [terminerRdv, setTerminerRdv] = useState<RendezVous | null>(null);
    const [diag, setDiag]               = useState("");
    const [diagLoading, setDiagLoading] = useState(false);

    const loadAll = useCallback(async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            const [secPage, patPage, medPage] = await Promise.all([
                secretaireService.getAll(0, 100),
                patientService.getAll(0, 200),
                medecinService.getAll(0, 100),
            ]);
            const sec = secPage.content.find(s => s.email === user.email) ?? null;
            setSecretaire(sec);
            setPatients(patPage.content);
            setMedecins(medPage.content);

            // Charger les RDV de tous les patients
            const allRdvs: RendezVous[] = [];
            for (const p of patPage.content.slice(0, 30)) {
                const data = await rendezVousService.getByPatient(p.id, 0, 50).catch(() => ({ content: [] }));
                allRdvs.push(...data.content);
            }
            // Déduplique par ID
            const seen = new Set<string>();
            const unique = allRdvs.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; });
            setRdvs(unique.sort((a, b) => b.date.localeCompare(a.date) || b.heure.localeCompare(a.heure)));
        } finally { setLoading(false); }
    }, [user]);

    useEffect(() => { loadAll(); }, [loadAll]);

    const handleConfirmer = async (rdv: RendezVous) => {
        if (!secretaire) return;
        setActionLoading(rdv.id + "_conf");
        try { await secretaireService.confirmerRdv(secretaire.id, rdv.id); await loadAll(); }
        finally { setActionLoading(null); }
    };

    const handleAnnuler = async (rdv: RendezVous) => {
        if (!secretaire) return;
        setActionLoading(rdv.id + "_ann");
        try { await secretaireService.annulerRdv(secretaire.id, rdv.id); await loadAll(); }
        finally { setActionLoading(null); }
    };

    const handleTerminer = async () => {
        if (!terminerRdv) return;
        setDiagLoading(true);
        try { await rendezVousService.terminer(terminerRdv.id, diag); setTerminerRdv(null); setDiag(""); await loadAll(); }
        finally { setDiagLoading(false); }
    };

    const handleCreate = async () => {
        if (!secretaire) return;
        setFormLoading(true); setFormError("");
        try {
            await secretaireService.prendreRendezVous(secretaire.id, form);
            setFormSuccess(true);
            await loadAll();
            setTimeout(() => { setModal(false); setFormSuccess(false); setForm({ patientId:"", medecinId:"", date:"", heure:"", motif:"" }); }, 1500);
        } catch (e: any) { setFormError(e?.response?.data?.message || "Erreur création RDV"); }
        finally { setFormLoading(false); }
    };

    const filtered = rdvs
        .filter(r => filterStatut === "TOUS" || r.statut === filterStatut)
        .filter(r => {
            const s = search.toLowerCase();
            return !s || `${r.patient?.nom} ${r.patient?.prenom} ${r.medecin?.nom} ${r.motif}`.toLowerCase().includes(s);
        });

    return (
        <DashboardLayout navItems={NAV} title="Gestion des rendez-vous" >
            {/* Toolbar */}
            <div style={{ background:"#fff", borderRadius:16, padding:"16px 20px", marginBottom:20, display:"flex", gap:14, alignItems:"center", flexWrap:"wrap", boxShadow:"0 2px 12px rgba(0,0,0,0.05)", border:"1px solid #F0F2F7" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:180 }}>
                    <i className="bi bi-search" style={{ color:"#9CA3AF" }}></i>
                    <input placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)}
                           style={{ border:"none", outline:"none", fontSize:14, flex:1 }}/>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {["TOUS","EN_ATTENTE","CONFIRME","TERMINE","ANNULE"].map(s=>(
                        <button key={s} onClick={()=>setFilterStatut(s)}
                                style={{ background:filterStatut===s?"#27A869":"#F3F4F6", color:filterStatut===s?"#fff":"#374151", border:"none", borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
                            {s==="TOUS"?"Tous":s.replace("_"," ")}
                        </button>
                    ))}
                </div>
                <button onClick={()=>setModal(true)}
                        style={{ background:"linear-gradient(135deg,#27A869,#27A869)", color:"#fff", border:"none", borderRadius:12, padding:"10px 20px", fontWeight:700, cursor:"pointer", fontSize:13, flexShrink:0 }}>
                    <i className="bi bi-calendar-plus me-2"></i>Nouveau RDV
                </button>
            </div>

            {/* Stats rapides */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
                {[
                    { label:"Total", value:rdvs.length, color:"#27A869", bg:"#EDE9FE" },
                    { label:"En attente", value:rdvs.filter(r=>r.statut==="EN_ATTENTE").length, color:"#F59E0B", bg:"#FEF3C7" },
                    { label:"Confirmés", value:rdvs.filter(r=>r.statut==="CONFIRME").length, color:"#1A7A52", bg:"#E8F5EE" },
                    { label:"Terminés", value:rdvs.filter(r=>r.statut==="TERMINE").length, color:"#0EA5E9", bg:"#E0F2FE" },
                ].map(s=>(
                    <div key={s.label} style={{ background:"#fff", borderRadius:14, padding:"16px 20px", boxShadow:"0 2px 8px rgba(0,0,0,0.05)", border:"1px solid #F0F2F7", display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ width:44, height:44, borderRadius:12, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:800, color:s.color, flexShrink:0 }}>{s.value}</div>
                        <div style={{ fontSize:13, fontWeight:600, color:"#6B7280" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Liste */}
            <div style={{ background:"#fff", borderRadius:20, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", border:"1px solid #F0F2F7" }}>
                {loading ? (
                    <div className="d-flex justify-content-center" style={{ padding:60 }}><div className="spinner-border" style={{ color:"#27A869" }}></div></div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"60px 0", color:"#8A94A6" }}>
                        <i className="bi bi-calendar-x" style={{ fontSize:52 }}></i>
                        <div style={{ marginTop:16, fontSize:16 }}>Aucun rendez-vous trouvé</div>
                    </div>
                ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                        {filtered.map(rdv=>(
                            <div key={rdv.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", borderRadius:14, background:"#F8FAFC", border:"1px solid #EEF1F6", flexWrap:"wrap" }}>
                                {/* Date */}
                                <div style={{ minWidth:60, textAlign:"center", background:"#EDE9FE", borderRadius:10, padding:"8px 6px" }}>
                                    <div style={{ fontSize:20, fontWeight:800, color:"#27A869", lineHeight:1 }}>{rdv.date?.slice(8,10)}</div>
                                    <div style={{ fontSize:10, color:"#27A869", textTransform:"uppercase", fontWeight:600 }}>
                                        {rdv.date?new Date(rdv.date+"T00:00:00").toLocaleDateString("fr-FR",{month:"short"}):""}
                                    </div>
                                    <div style={{ fontSize:12, color:"#27A869", fontWeight:600, marginTop:2 }}>{rdv.heure?.slice(0,5)}</div>
                                </div>

                                {/* Patient */}
                                <div style={{ display:"flex", alignItems:"center", gap:10, flex:"1 1 200px" }}>
                                    <div style={{ width:38, height:38, borderRadius:"50%", background:"#EDE9FE", display:"flex", alignItems:"center", justifyContent:"center", color:"#27A869", fontWeight:700, fontSize:13, flexShrink:0 }}>
                                        {rdv.patient?.prenom?.[0]}{rdv.patient?.nom?.[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight:700, fontSize:14 }}>{rdv.patient?.prenom} {rdv.patient?.nom}</div>
                                        <div style={{ fontSize:12, color:"#8A94A6" }}>{rdv.motif}</div>
                                    </div>
                                </div>

                                {/* Médecin */}
                                <div style={{ flex:"1 1 160px" }}>
                                    <div style={{ fontWeight:600, fontSize:13, color:"#374151" }}>Dr. {rdv.medecin?.prenom} {rdv.medecin?.nom}</div>
                                    <div style={{ fontSize:12, color:"#9CA3AF" }}>{rdv.medecin?.specialite}</div>
                                </div>

                                <StatusBadge status={rdv.statut}/>

                                {/* Actions */}
                                <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                                    {rdv.statut === "EN_ATTENTE" && (
                                        <button onClick={()=>handleConfirmer(rdv)} disabled={!!actionLoading}
                                                style={{ background:"#D1FAE5", color:"#065F46", border:"none", borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                                            {actionLoading===rdv.id+"_conf"?<span className="spinner-border spinner-border-sm"></span>:"✓ Confirmer"}
                                        </button>
                                    )}
                                    {(rdv.statut==="EN_ATTENTE"||rdv.statut==="CONFIRME") && (
                                        <>
                                            <button onClick={()=>{setTerminerRdv(rdv);setDiag("");}}
                                                    style={{ background:"#E0E7FF", color:"#3730A3", border:"none", borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                                                Terminer
                                            </button>
                                            <button onClick={()=>handleAnnuler(rdv)} disabled={!!actionLoading}
                                                    style={{ background:"#FEE2E2", color:"#991B1B", border:"none", borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                                                {actionLoading===rdv.id+"_ann"?<span className="spinner-border spinner-border-sm"></span>:"Annuler"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal nouveau RDV */}
            {modal && (
                <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ background:"#fff", borderRadius:20, padding:32, width:500, maxWidth:"90vw" }}>
                        {formSuccess?(
                            <div style={{ textAlign:"center", padding:"32px 0" }}><div style={{ fontSize:52 }}>✅</div><div style={{ fontSize:18, fontWeight:700, color:"#1A7A52", marginTop:12 }}>RDV créé !</div></div>
                        ):(
                            <>
                                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                                    <h3 style={{ margin:0, fontSize:18, fontWeight:700 }}>Nouveau rendez-vous</h3>
                                    <button onClick={()=>setModal(false)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#6B7280" }}>✕</button>
                                </div>
                                {formError && <div className="alert alert-danger py-2 small mb-3">{formError}</div>}
                                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                                    <div>
                                        <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Patient</label>
                                        <select value={form.patientId} onChange={e=>setForm(f=>({...f,patientId:e.target.value}))} style={inp}>
                                            <option value="">Sélectionner un patient</option>
                                            {patients.map(p=><option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Médecin disponible</label>
                                        <select value={form.medecinId} onChange={e=>setForm(f=>({...f,medecinId:e.target.value}))} style={inp}>
                                            <option value="">Sélectionner un médecin</option>
                                            {medecins.filter(m=>m.disponible).map(m=><option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom} — {m.specialite}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                                        <div>
                                            <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Date</label>
                                            <input type="date" value={form.date} min={new Date().toISOString().slice(0,10)} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={inp}/>
                                        </div>
                                        <div>
                                            <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Heure</label>
                                            <input type="time" value={form.heure} onChange={e=>setForm(f=>({...f,heure:e.target.value}))} style={inp}/>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Motif</label>
                                        <textarea value={form.motif} onChange={e=>setForm(f=>({...f,motif:e.target.value}))} rows={3} placeholder="Motif de la consultation..." style={{...inp,resize:"vertical"}}/>
                                    </div>
                                </div>
                                <div style={{ display:"flex", gap:12, justifyContent:"flex-end", marginTop:20 }}>
                                    <button onClick={()=>setModal(false)} style={{ background:"#F3F4F6", border:"none", borderRadius:10, padding:"10px 20px", cursor:"pointer" }}>Annuler</button>
                                    <button onClick={handleCreate} disabled={formLoading||!form.patientId||!form.medecinId||!form.date||!form.heure}
                                            style={{ background:"linear-gradient(135deg,#27A869,#27A869)", color:"#fff", border:"none", borderRadius:10, padding:"10px 24px", cursor:"pointer", fontWeight:600, fontSize:14 }}>
                                        {formLoading?<span className="spinner-border spinner-border-sm"></span>:"Créer"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Modal terminer */}
            {terminerRdv && (
                <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ background:"#fff", borderRadius:20, padding:32, width:460, maxWidth:"90vw" }}>
                        <h3 style={{ margin:"0 0 8px", fontSize:18, fontWeight:700 }}>Terminer le rendez-vous</h3>
                        <p style={{ color:"#8A94A6", fontSize:14, marginBottom:20 }}>
                            {terminerRdv.patient?.prenom} {terminerRdv.patient?.nom} · Dr. {terminerRdv.medecin?.prenom} {terminerRdv.medecin?.nom}
                        </p>
                        <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Diagnostic</label>
                        <textarea value={diag} onChange={e=>setDiag(e.target.value)} rows={4} placeholder="Entrez le diagnostic..." style={{...inp,resize:"vertical"}}/>
                        <div style={{ display:"flex", gap:12, justifyContent:"flex-end", marginTop:20 }}>
                            <button onClick={()=>setTerminerRdv(null)} style={{ background:"#F3F4F6", border:"none", borderRadius:10, padding:"10px 20px", cursor:"pointer" }}>Annuler</button>
                            <button onClick={handleTerminer} disabled={diagLoading||!diag.trim()}
                                    style={{ background:"linear-gradient(135deg,#27A869,#27A869)", color:"#fff", border:"none", borderRadius:10, padding:"10px 24px", cursor:"pointer", fontWeight:600, fontSize:14 }}>
                                {diagLoading?<span className="spinner-border spinner-border-sm"></span>:"Confirmer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}