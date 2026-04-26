import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/common/Statcard";
import { useAuth } from "../../context/AuthContext";
import { hopitalService, utilisateurService, type Hopital, type Utilisateur } from "../../services/Adminservice";
import { medecinService, patientService, secretaireService } from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",   label: "Tableau de bord",  path: "/dashboard/admin" },
    { icon: "bi-hospital",       label: "Hôpitaux",         path: "/dashboard/admin/hopitaux" },
    { icon: "bi-people",         label: "Utilisateurs",     path: "/dashboard/admin/utilisateurs" },
    { icon: "bi-person-badge",   label: "Médecins",         path: "/dashboard/admin/medecins" },
    { icon: "bi-person-gear",    label: "Mon profil",       path: "/dashboard/admin/profil" },
];

const inp = { width:"100%", borderRadius:8, border:"1px solid #E5E7EB", padding:"9px 12px", fontSize:14, boxSizing:"border-box" as const };

function Modal({ title, onClose, children }: any) {
    return (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ background:"#fff", borderRadius:20, padding:32, width:520, maxWidth:"90vw", maxHeight:"90vh", overflowY:"auto" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                    <h3 style={{ margin:0, fontSize:18, fontWeight:700 }}>{title}</h3>
                    <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#6B7280" }}>✕</button>
                </div>
                {children}
            </div>
        </div>
    );
}

const ROLE_COLOR: Record<string,{bg:string;color:string}> = {
    ADMIN:      { bg:"#FEE2E2", color:"#991B1B" },
    MEDECIN:    { bg:"#D1FAE5", color:"#065F46" },
    PATIENT:    { bg:"#E0F2FE", color:"#0369A1" },
    SECRETAIRE: { bg:"#EDE9FE", color:"#5B21B6" },
};

export default function AdminDashboard() {
    useAuth();
    const [tab, setTab]                   = useState<"hopitaux"|"utilisateurs">("hopitaux");
    const [hopitaux, setHopitaux]         = useState<Hopital[]>([]);
    const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
    const [stats, setStats]               = useState({ hopitaux:0, medecins:0, patients:0, secretaires:0 });
    const [loading, setLoading]           = useState(true);
    const [search, setSearch]             = useState("");
    const [actionLoading, setActionLoading] = useState<string|null>(null);

    /* Hôpital modals */
    const [hopModal, setHopModal]     = useState(false);
    const [editHop, setEditHop]       = useState<Hopital|null>(null);
    const [hopForm, setHopForm]       = useState({ nom:"", adresse:"", telephone:"", email:"" });
    const [hopLoading, setHopLoading] = useState(false);
    const [hopSuccess, setHopSuccess] = useState(false);
    const [hopError, setHopError]     = useState("");
    const [deleteHopId, setDeleteHopId] = useState<string|null>(null);

    /* Utilisateur modals */
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [hops, users, meds, pats, secs] = await Promise.all([
                hopitalService.getAll(0, 100),
                utilisateurService.getAll(0, 200),
                medecinService.getAll(0, 1),
                patientService.getAll(0, 1),
                secretaireService.getAll(0, 1),
            ]);
            setHopitaux(hops.content);
            setUtilisateurs(users.content);
            setStats({ hopitaux: hops.totalElements, medecins: meds.totalElements, patients: pats.totalElements, secretaires: secs.totalElements });
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    /* ── Hôpital CRUD ── */
    const openCreateHop = () => { setEditHop(null); setHopForm({ nom:"", adresse:"", telephone:"", email:"" }); setHopModal(true); };
    const openEditHop   = (h: Hopital) => { setEditHop(h); setHopForm({ nom:h.nom||"", adresse:h.adresse||"", telephone:h.telephone||"", email:h.email||"" }); setHopModal(true); };

    const handleSaveHop = async () => {
        setHopLoading(true); setHopError("");
        try {
            if (editHop) await hopitalService.update(editHop.id, hopForm);
            else await hopitalService.create(hopForm);
            setHopSuccess(true);
            await load();
            setTimeout(() => { setHopModal(false); setHopSuccess(false); }, 1500);
        } catch (e: any) { setHopError(e?.response?.data?.message || "Erreur"); }
        finally { setHopLoading(false); }
    };

    const handleDeleteHop = async () => {
        if (!deleteHopId) return;
        setActionLoading("del_hop_" + deleteHopId);
        try { await hopitalService.delete(deleteHopId); await load(); }
        finally { setDeleteHopId(null); setActionLoading(null); }
    };

    /* ── Utilisateur actions ── */
    const handleToggleActif = async (u: Utilisateur) => {
        setActionLoading("actif_" + u.id);
        try {
            if (u.actif) await utilisateurService.desactiver(u.id);
            else await utilisateurService.activer(u.id);
            await load();
        } finally { setActionLoading(null); }
    };

    const handleToggleArchive = async (u: Utilisateur) => {
        setActionLoading("arch_" + u.id);
        try {
            if (u.archive) await utilisateurService.desarchiver(u.id);
            else await utilisateurService.archiver(u.id);
            await load();
        } finally { setActionLoading(null); }
    };

    const handleDeleteUser = async (id: string) => {
        setActionLoading("del_user_" + id);
        try { await utilisateurService.delete(id); await load(); }
        finally { setActionLoading(null); }
    };

    const filteredHop  = hopitaux.filter(h  => h.nom?.toLowerCase().includes(search.toLowerCase()));
    const filteredUser = utilisateurs.filter(u => `${u.nom} ${u.prenom} ${u.email} ${u.role}`.toLowerCase().includes(search.toLowerCase()));

    return (
        <DashboardLayout navItems={NAV} title="Administration" accentColor="#DC2626">
            {/* Banner */}
            <div style={{ background:"linear-gradient(135deg,#991B1B,#DC2626)", borderRadius:20, padding:"24px 32px", color:"#fff", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                    <div style={{ fontSize:13, opacity:0.85, marginBottom:4 }}>Panneau d'administration</div>
                    <div style={{ fontSize:22, fontWeight:700 }}>Vue globale du système</div>
                </div>
                <div style={{ display:"flex", gap:24 }}>
                    {[{label:"Hôpitaux",value:stats.hopitaux},{label:"Médecins",value:stats.medecins},{label:"Patients",value:stats.patients},{label:"Secrétaires",value:stats.secretaires}].map(s=>(
                        <div key={s.label} style={{ textAlign:"center" }}>
                            <div style={{ fontSize:28, fontWeight:800 }}>{s.value}</div>
                            <div style={{ fontSize:12, opacity:0.8 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px,1fr))", gap:16, marginBottom:24 }}>
                <StatCard icon="bi-hospital"       label="Hôpitaux"    value={stats.hopitaux}    color="#DC2626" bg="#FEE2E2"/>
                <StatCard icon="bi-person-badge"   label="Médecins"    value={stats.medecins}    color="#1A7A52" bg="#E8F5EE"/>
                <StatCard icon="bi-people"         label="Patients"    value={stats.patients}    color="#0EA5E9" bg="#E0F2FE"/>
                <StatCard icon="bi-person-lines-fill" label="Secrétaires" value={stats.secretaires} color="#7C3AED" bg="#EDE9FE"/>
            </div>

            {/* Tabs */}
            <div style={{ display:"flex", gap:0, marginBottom:20, background:"#fff", borderRadius:14, padding:6, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", border:"1px solid #F0F2F7", width:"fit-content" }}>
                {(["hopitaux","utilisateurs"] as const).map(t=>(
                    <button key={t} onClick={()=>{ setTab(t); setSearch(""); }}
                            style={{ background:tab===t?"#DC2626":"transparent", color:tab===t?"#fff":"#374151", border:"none", borderRadius:10, padding:"8px 24px", fontWeight:700, cursor:"pointer", fontSize:14, transition:"all 0.15s" }}>
                        {t==="hopitaux"?"🏥 Hôpitaux":"👥 Utilisateurs"}
                    </button>
                ))}
            </div>

            {/* Search + action */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, gap:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", borderRadius:12, padding:"10px 16px", flex:1, maxWidth:360, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", border:"1px solid #F0F2F7" }}>
                    <i className="bi bi-search" style={{ color:"#9CA3AF" }}></i>
                    <input placeholder={`Rechercher ${tab==="hopitaux"?"un hôpital":"un utilisateur"}...`} value={search} onChange={e=>setSearch(e.target.value)}
                           style={{ border:"none", outline:"none", fontSize:14, flex:1 }}/>
                </div>
                {tab==="hopitaux" && (
                    <button onClick={openCreateHop} style={{ background:"linear-gradient(135deg,#991B1B,#DC2626)", color:"#fff", border:"none", borderRadius:12, padding:"10px 22px", fontWeight:700, cursor:"pointer", fontSize:14 }}>
                        <i className="bi bi-plus-circle me-2"></i>Nouvel hôpital
                    </button>
                )}
            </div>

            {loading ? (
                <div className="d-flex justify-content-center" style={{ padding:60 }}>
                    <div className="spinner-border" style={{ color:"#DC2626" }}></div>
                </div>
            ) : tab === "hopitaux" ? (
                /* ── Hôpitaux grid ── */
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:16 }}>
                    {filteredHop.map(h=>(
                        <div key={h.id} style={{ background:"#fff", borderRadius:18, padding:22, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", border:"1px solid #F0F2F7", transition:"all 0.18s" }}
                             onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor="#DC2626";el.style.boxShadow="0 8px 24px rgba(220,38,38,0.12)";}}
                             onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor="#F0F2F7";el.style.boxShadow="0 2px 12px rgba(0,0,0,0.05)";}}>
                            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
                                <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                                    <div style={{ width:44, height:44, borderRadius:12, background:"#FEE2E2", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                        <i className="bi bi-hospital-fill" style={{ color:"#DC2626", fontSize:20 }}></i>
                                    </div>
                                    <div style={{ fontWeight:700, fontSize:16, color:"#0D1F2D" }}>{h.nom}</div>
                                </div>
                                <div style={{ display:"flex", gap:6 }}>
                                    <button onClick={()=>openEditHop(h)} style={{ background:"#FEE2E2", color:"#991B1B", border:"none", borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:12 }}>✏️</button>
                                    <button onClick={()=>setDeleteHopId(h.id)} style={{ background:"#FEE2E2", color:"#991B1B", border:"none", borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:12 }}>🗑</button>
                                </div>
                            </div>
                            {[
                                { icon:"bi-geo-alt", value:h.adresse },
                                { icon:"bi-telephone", value:h.telephone },
                                { icon:"bi-envelope", value:h.email },
                            ].filter(x=>x.value).map(x=>(
                                <div key={x.icon} style={{ display:"flex", gap:8, alignItems:"center", fontSize:13, color:"#6B7280", marginBottom:6 }}>
                                    <i className={`bi ${x.icon}`} style={{ color:"#DC2626", width:16, flexShrink:0 }}></i>
                                    <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{x.value}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                /* ── Utilisateurs table ── */
                <div style={{ background:"#fff", borderRadius:20, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", border:"1px solid #F0F2F7", overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
                        <thead>
                        <tr style={{ borderBottom:"2px solid #F0F2F7" }}>
                            {["Utilisateur","Email","Rôle","Hôpital","Statut","Actions"].map(h=>(
                                <th key={h} style={{ textAlign:"left", padding:"10px 14px", fontSize:11, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:0.5 }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {filteredUser.map(u=>{
                            const rc = ROLE_COLOR[u.role||""] || { bg:"#F3F4F6", color:"#374151" };
                            return (
                                <tr key={u.id} style={{ borderBottom:"1px solid #F0F2F7" }}
                                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="#FAFAFA"}
                                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="transparent"}>
                                    <td style={{ padding:"13px 14px" }}>
                                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                            <div style={{ width:36, height:36, borderRadius:"50%", background:rc.bg, display:"flex", alignItems:"center", justifyContent:"center", color:rc.color, fontWeight:700, fontSize:13, flexShrink:0 }}>
                                                {u.prenom?.[0]}{u.nom?.[0]}
                                            </div>
                                            <div style={{ fontWeight:600, fontSize:14 }}>{u.prenom} {u.nom}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding:"13px 14px", fontSize:13, color:"#374151" }}>{u.email}</td>
                                    <td style={{ padding:"13px 14px" }}>
                                        <span style={{ background:rc.bg, color:rc.color, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>{u.role}</span>
                                    </td>
                                    <td style={{ padding:"13px 14px", fontSize:13, color:"#6B7280" }}>{u.hopital?.nom||"—"}</td>
                                    <td style={{ padding:"13px 14px" }}>
                                        <div style={{ display:"flex", gap:6 }}>
                        <span style={{ background:u.actif?"#D1FAE5":"#FEE2E2", color:u.actif?"#065F46":"#991B1B", fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:20 }}>
                          {u.actif?"Actif":"Inactif"}
                        </span>
                                            {u.archive && <span style={{ background:"#FEF3C7", color:"#B45309", fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:20 }}>Archivé</span>}
                                        </div>
                                    </td>
                                    <td style={{ padding:"13px 14px" }}>
                                        <div style={{ display:"flex", gap:6 }}>
                                            <button onClick={()=>handleToggleActif(u)} disabled={!!actionLoading}
                                                    style={{ background:u.actif?"#FEF3C7":"#D1FAE5", color:u.actif?"#B45309":"#065F46", border:"none", borderRadius:8, padding:"5px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                                                {actionLoading==="actif_"+u.id?<span className="spinner-border spinner-border-sm"></span>:(u.actif?"Désact.":"Activer")}
                                            </button>
                                            <button onClick={()=>handleToggleArchive(u)} disabled={!!actionLoading}
                                                    style={{ background:"#F3F4F6", color:"#374151", border:"none", borderRadius:8, padding:"5px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                                                {actionLoading==="arch_"+u.id?<span className="spinner-border spinner-border-sm"></span>:(u.archive?"Désarch.":"Archiver")}
                                            </button>
                                            <button onClick={()=>handleDeleteUser(u.id)} disabled={!!actionLoading}
                                                    style={{ background:"#FEE2E2", color:"#991B1B", border:"none", borderRadius:8, padding:"5px 10px", fontSize:11, cursor:"pointer" }}>
                                                {actionLoading==="del_user_"+u.id?<span className="spinner-border spinner-border-sm"></span>:"🗑"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal hôpital */}
            {hopModal && (
                <Modal title={editHop?"Modifier l'hôpital":"Nouvel hôpital"} onClose={()=>setHopModal(false)}>
                    {hopSuccess ? (
                        <div style={{ textAlign:"center", padding:"32px 0" }}><div style={{ fontSize:52 }}>✅</div><div style={{ fontSize:18, fontWeight:700, color:"#1A7A52", marginTop:12 }}>{editHop?"Mis à jour !":"Créé !"}</div></div>
                    ) : (
                        <>
                            {hopError && <div className="alert alert-danger py-2 small mb-3">{hopError}</div>}
                            {[{key:"nom",label:"Nom de l'hôpital"},{key:"adresse",label:"Adresse"},{key:"telephone",label:"Téléphone"},{key:"email",label:"Email"}].map(f=>(
                                <div key={f.key} style={{ marginBottom:14 }}>
                                    <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>{f.label}</label>
                                    <input value={(hopForm as any)[f.key]} onChange={e=>setHopForm(x=>({...x,[f.key]:e.target.value}))} style={inp}/>
                                </div>
                            ))}
                            <div style={{ display:"flex", gap:12, justifyContent:"flex-end", marginTop:8 }}>
                                <button onClick={()=>setHopModal(false)} style={{ background:"#F3F4F6", border:"none", borderRadius:10, padding:"10px 20px", cursor:"pointer" }}>Annuler</button>
                                <button onClick={handleSaveHop} disabled={hopLoading||!hopForm.nom}
                                        style={{ background:"linear-gradient(135deg,#991B1B,#DC2626)", color:"#fff", border:"none", borderRadius:10, padding:"10px 24px", cursor:"pointer", fontWeight:600 }}>
                                    {hopLoading?<span className="spinner-border spinner-border-sm"></span>:(editHop?"Sauvegarder":"Créer")}
                                </button>
                            </div>
                        </>
                    )}
                </Modal>
            )}

            {/* Confirm suppression hôpital */}
            {deleteHopId && (
                <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ background:"#fff", borderRadius:20, padding:32, width:360, textAlign:"center" }}>
                        <i className="bi bi-exclamation-triangle-fill" style={{ fontSize:44, color:"#EF4444" }}></i>
                        <h3 style={{ margin:"16px 0 8px", fontSize:18, fontWeight:700 }}>Supprimer cet hôpital ?</h3>
                        <p style={{ color:"#6B7280", fontSize:14, margin:"0 0 24px" }}>Cette action est irréversible.</p>
                        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
                            <button onClick={()=>setDeleteHopId(null)} style={{ background:"#F3F4F6", border:"none", borderRadius:10, padding:"10px 24px", cursor:"pointer" }}>Annuler</button>
                            <button onClick={handleDeleteHop} disabled={!!actionLoading}
                                    style={{ background:"#EF4444", color:"#fff", border:"none", borderRadius:10, padding:"10px 24px", cursor:"pointer", fontWeight:600 }}>
                                {actionLoading?<span className="spinner-border spinner-border-sm"></span>:"Supprimer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}