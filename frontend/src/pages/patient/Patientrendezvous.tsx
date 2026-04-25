import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import {
    patientService, rendezVousService, medecinService,
    type Patient, type RendezVous, type Medecin,
} from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",        label: "Tableau de bord",   path: "/dashboard/patient" },
    { icon: "bi-calendar-check",      label: "Mes rendez-vous",   path: "/dashboard/patient/rendez-vous" },
    { icon: "bi-folder2-open",        label: "Mon dossier",       path: "/dashboard/patient/dossier" },
    { icon: "bi-file-earmark-medical",label: "Ordonnances",       path: "/dashboard/patient/ordonnances" },
    { icon: "bi-person-gear",         label: "Mon profil",        path: "/dashboard/patient/profil" },
];

export default function PatientRendezVous() {
    const { user } = useAuth();
    const [patient, setPatient]         = useState<Patient | null>(null);
    const [rdvs, setRdvs]               = useState<RendezVous[]>([]);
    const [loading, setLoading]         = useState(true);
    const [page, setPage]               = useState(0);
    const [totalPages, setTotalPages]   = useState(0);
    const [filterStatut, setFilterStatut] = useState("TOUS");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    /* modal prise de RDV */
    const [rdvModal, setRdvModal]   = useState(false);
    const [medecins, setMedecins]   = useState<Medecin[]>([]);
    const [form, setForm]           = useState({ medecinId:"", date:"", heure:"", motif:"" });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError]     = useState("");
    const [formSuccess, setFormSuccess] = useState(false);

    const resolvePatient = useCallback(async () => {
        if (!user?.email) return null;
        const p = await patientService.getAll(0, 200);
        const pat = p.content.find(x => x.email === user.email) ?? null;
        setPatient(pat);
        return pat;
    }, [user]);

    const loadRdvs = useCallback(async (pat: Patient | null, pg: number) => {
        if (!pat) return;
        setLoading(true);
        try {
            const data = await rendezVousService.getByPatient(pat.id, pg, 8);
            setRdvs(data.content);
            setTotalPages(data.totalPages);
            setPage(pg);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        resolvePatient().then(pat => loadRdvs(pat, 0));
    }, []);

    const handleAnnuler = async (id: string) => {
        setActionLoading(id);
        try { await rendezVousService.annuler(id); await loadRdvs(patient, page); }
        finally { setActionLoading(null); }
    };

    const openModal = async () => {
        setRdvModal(true);
        const data = await medecinService.getDisponibles();
        setMedecins(data);
    };

    const handlePrendreRdv = async () => {
        if (!patient) return;
        setFormLoading(true); setFormError("");
        try {
            await rendezVousService.prendre({ patientId: patient.id, ...form });
            setFormSuccess(true);
            await loadRdvs(patient, 0);
            setTimeout(() => { setRdvModal(false); setFormSuccess(false); setForm({ medecinId:"", date:"", heure:"", motif:"" }); }, 1500);
        } catch (e: any) {
            setFormError(e?.response?.data?.message || "Erreur lors de la prise de rendez-vous");
        } finally { setFormLoading(false); }
    };

    const filtered = filterStatut === "TOUS" ? rdvs : rdvs.filter(r => r.statut === filterStatut);

    const inp = { borderRadius:8, border:"1px solid #E5E7EB", padding:"8px 12px", fontSize:14, width:"100%", boxSizing:"border-box" as const };

    return (
        <DashboardLayout navItems={NAV} title="Mes rendez-vous" accentColor="#0EA5E9">
            {/* Toolbar */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {["TOUS","EN_ATTENTE","CONFIRME","TERMINE","ANNULE"].map(s => (
                        <button key={s} onClick={() => setFilterStatut(s)}
                                style={{ background: filterStatut===s?"#0EA5E9":"#F3F4F6", color: filterStatut===s?"#fff":"#374151", border:"none", borderRadius:20, padding:"6px 16px", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
                            {s === "TOUS" ? "Tous" : s.replace("_"," ")}
                        </button>
                    ))}
                </div>
                <button onClick={openModal}
                        style={{ background:"linear-gradient(135deg,#0369A1,#0EA5E9)", color:"#fff", border:"none", borderRadius:12, padding:"10px 22px", fontWeight:700, cursor:"pointer", fontSize:14 }}>
                    <i className="bi bi-calendar-plus me-2"></i>Nouveau RDV
                </button>
            </div>

            {/* Liste */}
            <div style={{ background:"#fff", borderRadius:20, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", border:"1px solid #F0F2F7" }}>
                {loading ? (
                    <div className="d-flex justify-content-center" style={{ padding:60 }}>
                        <div className="spinner-border" style={{ color:"#0EA5E9" }}></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"64px 0", color:"#8A94A6" }}>
                        <i className="bi bi-calendar-x" style={{ fontSize:48 }}></i>
                        <div style={{ marginTop:16, fontSize:16 }}>Aucun rendez-vous trouvé</div>
                    </div>
                ) : (
                    <>
                        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                            {filtered.map(rdv => (
                                <div key={rdv.id} style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 20px", borderRadius:14, background:"#F8FAFC", border:"1px solid #EEF1F6", transition:"box-shadow 0.15s" }}
                                     onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow="0 4px 16px rgba(0,0,0,0.07)"}
                                     onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow="none"}>

                                    {/* Date block */}
                                    <div style={{ textAlign:"center", minWidth:56, background:"#E0F2FE", borderRadius:12, padding:"10px 6px" }}>
                                        <div style={{ fontSize:22, fontWeight:800, color:"#0EA5E9", lineHeight:1 }}>{rdv.date?.slice(8,10)}</div>
                                        <div style={{ fontSize:11, color:"#0369A1", textTransform:"uppercase", fontWeight:600, marginTop:2 }}>
                                            {rdv.date ? new Date(rdv.date+"T00:00:00").toLocaleDateString("fr-FR",{month:"short"}) : ""}
                                        </div>
                                        <div style={{ fontSize:12, color:"#0369A1", marginTop:4, fontWeight:600 }}>{rdv.heure?.slice(0,5)}</div>
                                    </div>

                                    {/* Médecin avatar */}
                                    <div style={{ width:44, height:44, borderRadius:"50%", background:"#0EA5E922", display:"flex", alignItems:"center", justifyContent:"center", color:"#0EA5E9", fontWeight:700, fontSize:15, flexShrink:0 }}>
                                        {rdv.medecin?.prenom?.[0]}{rdv.medecin?.nom?.[0]}
                                    </div>

                                    <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ fontWeight:700, fontSize:15, color:"#0D1F2D" }}>Dr. {rdv.medecin?.prenom} {rdv.medecin?.nom}</div>
                                        <div style={{ fontSize:13, color:"#6B7280", marginTop:2 }}>{rdv.medecin?.specialite}</div>
                                        <div style={{ fontSize:12, color:"#9CA3AF", marginTop:4, display:"flex", alignItems:"center", gap:4 }}>
                                            <i className="bi bi-chat-text"></i> {rdv.motif}
                                        </div>
                                        {rdv.diagnostic && (
                                            <div style={{ fontSize:12, color:"#6366F1", marginTop:4, display:"flex", alignItems:"center", gap:4 }}>
                                                <i className="bi bi-clipboard2-pulse"></i> {rdv.diagnostic}
                                            </div>
                                        )}
                                    </div>

                                    <StatusBadge status={rdv.statut} />

                                    {(rdv.statut === "EN_ATTENTE" || rdv.statut === "CONFIRME") && (
                                        <button onClick={() => handleAnnuler(rdv.id)} disabled={!!actionLoading}
                                                style={{ background:"#FEE2E2", color:"#991B1B", border:"none", borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer", flexShrink:0 }}>
                                            {actionLoading === rdv.id ? <span className="spinner-border spinner-border-sm"></span> : "Annuler"}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:20 }}>
                                <button onClick={() => loadRdvs(patient,page-1)} disabled={page===0}
                                        style={{ background:"#F3F4F6", border:"none", borderRadius:8, padding:"7px 14px", cursor:"pointer", color:"#374151" }}>‹</button>
                                {Array.from({length:totalPages},(_,i)=>(
                                    <button key={i} onClick={() => loadRdvs(patient,i)}
                                            style={{ width:34, height:34, borderRadius:8, border:"none", background:page===i?"#0EA5E9":"#F3F4F6", color:page===i?"#fff":"#374151", cursor:"pointer", fontWeight:600 }}>{i+1}</button>
                                ))}
                                <button onClick={() => loadRdvs(patient,page+1)} disabled={page===totalPages-1}
                                        style={{ background:"#F3F4F6", border:"none", borderRadius:8, padding:"7px 14px", cursor:"pointer", color:"#374151" }}>›</button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal prise RDV */}
            {rdvModal && (
                <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ background:"#fff", borderRadius:20, padding:32, width:480, maxWidth:"90vw" }}>
                        {formSuccess ? (
                            <div style={{ textAlign:"center", padding:"32px 0" }}>
                                <div style={{ fontSize:52 }}>✅</div>
                                <div style={{ fontSize:18, fontWeight:700, color:"#1A7A52", marginTop:12 }}>Rendez-vous pris !</div>
                            </div>
                        ) : (
                            <>
                                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                                    <h3 style={{ margin:0, fontSize:18, fontWeight:700 }}>Nouveau rendez-vous</h3>
                                    <button onClick={() => setRdvModal(false)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#6B7280" }}>✕</button>
                                </div>
                                {formError && <div className="alert alert-danger py-2 small mb-3">{formError}</div>}
                                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                                    <div>
                                        <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Médecin disponible</label>
                                        <select value={form.medecinId} onChange={e => setForm(f=>({...f,medecinId:e.target.value}))} style={inp}>
                                            <option value="">Sélectionner un médecin</option>
                                            {medecins.map(m=>(
                                                <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom} — {m.specialite}</option>
                                            ))}
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
                                        <textarea value={form.motif} onChange={e=>setForm(f=>({...f,motif:e.target.value}))} rows={3} placeholder="Décrivez le motif..." style={{...inp,resize:"vertical"}}/>
                                    </div>
                                </div>
                                <div style={{ display:"flex", gap:12, marginTop:20, justifyContent:"flex-end" }}>
                                    <button onClick={()=>setRdvModal(false)} style={{ background:"#F3F4F6", border:"none", borderRadius:10, padding:"10px 20px", cursor:"pointer" }}>Annuler</button>
                                    <button onClick={handlePrendreRdv} disabled={formLoading||!form.medecinId||!form.date||!form.heure||!form.motif}
                                            style={{ background:"linear-gradient(135deg,#0369A1,#0EA5E9)", color:"#fff", border:"none", borderRadius:10, padding:"10px 24px", cursor:"pointer", fontWeight:600, fontSize:14 }}>
                                        {formLoading?<span className="spinner-border spinner-border-sm"></span>:"Confirmer"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}