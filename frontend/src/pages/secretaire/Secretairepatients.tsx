import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { secretaireService, patientService, type Secretaire, type Patient } from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",   label: "Tableau de bord",  path: "/dashboard/secretaire" },
    { icon: "bi-people",         label: "Patients",         path: "/dashboard/secretaire/patients" },
    { icon: "bi-calendar-check", label: "Rendez-vous",      path: "/dashboard/secretaire/rendez-vous" },
    { icon: "bi-person-gear",    label: "Mon profil",       path: "/dashboard/secretaire/profil" },
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

function Field({ label, children }: any) {
    return (
        <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>{label}</label>
            {children}
        </div>
    );
}

export default function SecretairePatients() {
    const { user } = useAuth();
    const [secretaire, setSecretaire] = useState<Secretaire | null>(null);
    const [patients, setPatients]     = useState<Patient[]>([]);
    const [loading, setLoading]       = useState(true);
    const [page, setPage]             = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch]         = useState("");

    /* modal créer */
    const [createModal, setCreateModal] = useState(false);
    const [createForm, setCreateForm]   = useState({ nom:"", prenom:"", email:"", telephone:"", motDePasse:"", adresse:"", dateDeNaissance:"", groupeSanguin:"" });
    const [createLoading, setCreateLoading] = useState(false);
    const [createSuccess, setCreateSuccess] = useState(false);
    const [createError, setCreateError]     = useState("");

    /* modal éditer */
    const [editModal, setEditModal] = useState(false);
    const [editPat, setEditPat]     = useState<Patient | null>(null);
    const [editForm, setEditForm]   = useState({ nom:"", prenom:"", telephone:"", adresse:"", groupeSanguin:"" });
    const [editLoading, setEditLoading] = useState(false);
    const [editSuccess, setEditSuccess] = useState(false);
    const [editError, setEditError]     = useState("");

    /* modal supprimer */
    const [deleteId, setDeleteId]   = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const resolveSecretaire = useCallback(async () => {
        if (!user?.email) return null;
        const s = await secretaireService.getAll(0, 100);
        const sec = s.content.find(x => x.email === user.email) ?? null;
        setSecretaire(sec);
        return sec;
    }, [user]);

    const loadPatients = useCallback(async (pg: number) => {
        setLoading(true);
        try {
            const data = await patientService.getAll(pg, 8, "nom");
            setPatients(data.content);
            setTotalPages(data.totalPages);
            setPage(pg);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        resolveSecretaire();
        loadPatients(0);
    }, []);

    const handleCreate = async () => {
        if (!secretaire) return;
        setCreateLoading(true); setCreateError("");
        try {
            await secretaireService.creerPatient(secretaire.id, { ...createForm, hopitalId: secretaire.hopital?.id });
            setCreateSuccess(true);
            await loadPatients(0);
            setTimeout(() => { setCreateModal(false); setCreateSuccess(false); setCreateForm({ nom:"", prenom:"", email:"", telephone:"", motDePasse:"", adresse:"", dateDeNaissance:"", groupeSanguin:"" }); }, 1500);
        } catch (e: any) { setCreateError(e?.response?.data?.message || "Erreur création"); }
        finally { setCreateLoading(false); }
    };

    const openEdit = (p: Patient) => {
        setEditPat(p);
        setEditForm({ nom:p.nom||"", prenom:p.prenom||"", telephone:p.telephone||"", adresse:p.adresse||"", groupeSanguin:p.groupeSanguin||"" });
        setEditModal(true);
    };

    const handleEdit = async () => {
        if (!editPat) return;
        setEditLoading(true); setEditError("");
        try {
            await patientService.update(editPat.id, { ...editForm, hopitalId: editPat.hopital?.id });
            setEditSuccess(true);
            await loadPatients(page);
            setTimeout(() => { setEditModal(false); setEditSuccess(false); }, 1500);
        } catch (e: any) { setEditError(e?.response?.data?.message || "Erreur modification"); }
        finally { setEditLoading(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try { await patientService.delete(deleteId); await loadPatients(page); }
        finally { setDeleteId(null); setDeleteLoading(false); }
    };

    const filtered = patients.filter(p => `${p.nom} ${p.prenom} ${p.email}`.toLowerCase().includes(search.toLowerCase()));

    return (
        <DashboardLayout navItems={NAV} title="Gestion des patients" accentColor="#7C3AED">
            {/* Toolbar */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, gap:12, flexWrap:"wrap" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, background:"#fff", borderRadius:12, padding:"10px 16px", flex:1, maxWidth:360, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", border:"1px solid #F0F2F7" }}>
                    <i className="bi bi-search" style={{ color:"#9CA3AF" }}></i>
                    <input placeholder="Rechercher un patient..." value={search} onChange={e=>setSearch(e.target.value)}
                           style={{ border:"none", outline:"none", fontSize:14, flex:1 }}/>
                </div>
                <button onClick={()=>setCreateModal(true)}
                        style={{ background:"linear-gradient(135deg,#5B21B6,#7C3AED)", color:"#fff", border:"none", borderRadius:12, padding:"11px 24px", fontWeight:700, cursor:"pointer", fontSize:14 }}>
                    <i className="bi bi-person-plus me-2"></i>Nouveau patient
                </button>
            </div>

            {/* Table */}
            <div style={{ background:"#fff", borderRadius:20, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", border:"1px solid #F0F2F7", overflowX:"auto" }}>
                {loading ? (
                    <div className="d-flex justify-content-center" style={{ padding:60 }}>
                        <div className="spinner-border" style={{ color:"#7C3AED" }}></div>
                    </div>
                ) : (
                    <>
                        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:600 }}>
                            <thead>
                            <tr style={{ borderBottom:"2px solid #F0F2F7" }}>
                                {["Patient","Email","Téléphone","Groupe","Adresse","Actions"].map(h=>(
                                    <th key={h} style={{ textAlign:"left", padding:"10px 14px", fontSize:11, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:0.5 }}>{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.map(p=>(
                                <tr key={p.id} style={{ borderBottom:"1px solid #F0F2F7", transition:"background 0.12s" }}
                                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="#FAFAFA"}
                                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="transparent"}>
                                    <td style={{ padding:"13px 14px" }}>
                                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                            <div style={{ width:36, height:36, borderRadius:"50%", background:"#EDE9FE", display:"flex", alignItems:"center", justifyContent:"center", color:"#7C3AED", fontWeight:700, fontSize:13, flexShrink:0 }}>
                                                {p.prenom?.[0]}{p.nom?.[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight:600, fontSize:14 }}>{p.prenom} {p.nom}</div>
                                                {p.dateDeNaissance && <div style={{ fontSize:11, color:"#9CA3AF" }}>{new Date(p.dateDeNaissance).toLocaleDateString("fr-FR")}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding:"13px 14px", fontSize:13, color:"#374151" }}>{p.email}</td>
                                    <td style={{ padding:"13px 14px", fontSize:13, color:"#374151" }}>{p.telephone}</td>
                                    <td style={{ padding:"13px 14px" }}>
                                        {p.groupeSanguin
                                            ? <span style={{ background:"#FEE2E2", color:"#991B1B", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>{p.groupeSanguin}</span>
                                            : <span style={{ color:"#D1D5DB" }}>—</span>}
                                    </td>
                                    <td style={{ padding:"13px 14px", fontSize:13, color:"#6B7280", maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.adresse||"—"}</td>
                                    <td style={{ padding:"13px 14px" }}>
                                        <div style={{ display:"flex", gap:8 }}>
                                            <button onClick={()=>openEdit(p)}
                                                    style={{ background:"#EDE9FE", color:"#7C3AED", border:"none", borderRadius:8, padding:"5px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button onClick={()=>setDeleteId(p.id)}
                                                    style={{ background:"#FEE2E2", color:"#991B1B", border:"none", borderRadius:8, padding:"5px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:20 }}>
                                <button onClick={()=>loadPatients(page-1)} disabled={page===0}
                                        style={{ background:"#F3F4F6", border:"none", borderRadius:8, padding:"7px 14px", cursor:"pointer" }}>‹</button>
                                {Array.from({length:totalPages},(_,i)=>(
                                    <button key={i} onClick={()=>loadPatients(i)}
                                            style={{ width:34, height:34, borderRadius:8, border:"none", background:page===i?"#7C3AED":"#F3F4F6", color:page===i?"#fff":"#374151", cursor:"pointer", fontWeight:600 }}>{i+1}</button>
                                ))}
                                <button onClick={()=>loadPatients(page+1)} disabled={page>=totalPages-1}
                                        style={{ background:"#F3F4F6", border:"none", borderRadius:8, padding:"7px 14px", cursor:"pointer" }}>›</button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal créer patient */}
            {createModal && (
                <Modal title="Nouveau patient" onClose={()=>setCreateModal(false)}>
                    {createSuccess ? (
                        <div style={{ textAlign:"center", padding:"32px 0" }}>
                            <div style={{ fontSize:52 }}>✅</div>
                            <div style={{ fontSize:18, fontWeight:700, color:"#1A7A52", marginTop:12 }}>Patient créé !</div>
                        </div>
                    ) : (
                        <>
                            {createError && <div className="alert alert-danger py-2 small mb-3">{createError}</div>}
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
                                <Field label="Nom"><input value={createForm.nom} onChange={e=>setCreateForm(f=>({...f,nom:e.target.value}))} style={inp}/></Field>
                                <Field label="Prénom"><input value={createForm.prenom} onChange={e=>setCreateForm(f=>({...f,prenom:e.target.value}))} style={inp}/></Field>
                                <Field label="Email"><input type="email" value={createForm.email} onChange={e=>setCreateForm(f=>({...f,email:e.target.value}))} style={inp}/></Field>
                                <Field label="Téléphone"><input value={createForm.telephone} onChange={e=>setCreateForm(f=>({...f,telephone:e.target.value}))} style={inp}/></Field>
                                <Field label="Mot de passe"><input type="password" value={createForm.motDePasse} onChange={e=>setCreateForm(f=>({...f,motDePasse:e.target.value}))} style={inp}/></Field>
                                <Field label="Groupe sanguin">
                                    <select value={createForm.groupeSanguin} onChange={e=>setCreateForm(f=>({...f,groupeSanguin:e.target.value}))} style={inp}>
                                        <option value="">Sélectionner</option>
                                        {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g=><option key={g}>{g}</option>)}
                                    </select>
                                </Field>
                                <Field label="Date de naissance"><input type="date" value={createForm.dateDeNaissance} onChange={e=>setCreateForm(f=>({...f,dateDeNaissance:e.target.value}))} style={inp}/></Field>
                                <Field label="Adresse"><input value={createForm.adresse} onChange={e=>setCreateForm(f=>({...f,adresse:e.target.value}))} style={inp}/></Field>
                            </div>
                            <div style={{ display:"flex", gap:12, justifyContent:"flex-end", marginTop:8 }}>
                                <button onClick={()=>setCreateModal(false)} style={{ background:"#F3F4F6", border:"none", borderRadius:10, padding:"10px 20px", cursor:"pointer" }}>Annuler</button>
                                <button onClick={handleCreate} disabled={createLoading||!createForm.nom||!createForm.email||!createForm.motDePasse}
                                        style={{ background:"linear-gradient(135deg,#5B21B6,#7C3AED)", color:"#fff", border:"none", borderRadius:10, padding:"10px 24px", cursor:"pointer", fontWeight:600 }}>
                                    {createLoading?<span className="spinner-border spinner-border-sm"></span>:"Créer"}
                                </button>
                            </div>
                        </>
                    )}
                </Modal>
            )}

            {/* Modal éditer */}
            {editModal && editPat && (
                <Modal title={`Modifier — ${editPat.prenom} ${editPat.nom}`} onClose={()=>setEditModal(false)}>
                    {editSuccess ? (
                        <div style={{ textAlign:"center", padding:"32px 0" }}>
                            <div style={{ fontSize:52 }}>✅</div>
                            <div style={{ fontSize:18, fontWeight:700, color:"#1A7A52", marginTop:12 }}>Mis à jour !</div>
                        </div>
                    ) : (
                        <>
                            {editError && <div className="alert alert-danger py-2 small mb-3">{editError}</div>}
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
                                <Field label="Nom"><input value={editForm.nom} onChange={e=>setEditForm(f=>({...f,nom:e.target.value}))} style={inp}/></Field>
                                <Field label="Prénom"><input value={editForm.prenom} onChange={e=>setEditForm(f=>({...f,prenom:e.target.value}))} style={inp}/></Field>
                                <Field label="Téléphone"><input value={editForm.telephone} onChange={e=>setEditForm(f=>({...f,telephone:e.target.value}))} style={inp}/></Field>
                                <Field label="Groupe sanguin">
                                    <select value={editForm.groupeSanguin} onChange={e=>setEditForm(f=>({...f,groupeSanguin:e.target.value}))} style={inp}>
                                        <option value="">Sélectionner</option>
                                        {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g=><option key={g}>{g}</option>)}
                                    </select>
                                </Field>
                                <Field label="Adresse" ><input value={editForm.adresse} onChange={e=>setEditForm(f=>({...f,adresse:e.target.value}))} style={{...inp, gridColumn:"1/-1"}}/></Field>
                            </div>
                            <div style={{ display:"flex", gap:12, justifyContent:"flex-end", marginTop:8 }}>
                                <button onClick={()=>setEditModal(false)} style={{ background:"#F3F4F6", border:"none", borderRadius:10, padding:"10px 20px", cursor:"pointer" }}>Annuler</button>
                                <button onClick={handleEdit} disabled={editLoading}
                                        style={{ background:"linear-gradient(135deg,#5B21B6,#7C3AED)", color:"#fff", border:"none", borderRadius:10, padding:"10px 24px", cursor:"pointer", fontWeight:600 }}>
                                    {editLoading?<span className="spinner-border spinner-border-sm"></span>:"Sauvegarder"}
                                </button>
                            </div>
                        </>
                    )}
                </Modal>
            )}

            {/* Confirm suppression */}
            {deleteId && (
                <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ background:"#fff", borderRadius:20, padding:32, width:380, maxWidth:"90vw", textAlign:"center" }}>
                        <i className="bi bi-exclamation-triangle-fill" style={{ fontSize:44, color:"#EF4444" }}></i>
                        <h3 style={{ margin:"16px 0 8px", fontSize:18, fontWeight:700 }}>Supprimer ce patient ?</h3>
                        <p style={{ color:"#6B7280", fontSize:14, margin:"0 0 24px" }}>Cette action est irréversible.</p>
                        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
                            <button onClick={()=>setDeleteId(null)} style={{ background:"#F3F4F6", border:"none", borderRadius:10, padding:"10px 24px", cursor:"pointer", fontSize:14 }}>Annuler</button>
                            <button onClick={handleDelete} disabled={deleteLoading}
                                    style={{ background:"#EF4444", color:"#fff", border:"none", borderRadius:10, padding:"10px 24px", cursor:"pointer", fontSize:14, fontWeight:600 }}>
                                {deleteLoading?<span className="spinner-border spinner-border-sm"></span>:"Supprimer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}