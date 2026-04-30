import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { secretaireService, patientService, type Secretaire, type Patient } from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",   label: "Tableau de bord", path: "/dashboard/secretaire" },
    { icon: "bi-people",         label: "Patients",        path: "/dashboard/secretaire/patients" },
    { icon: "bi-calendar-check", label: "Rendez-vous",     path: "/dashboard/secretaire/rendez-vous" },
    { icon: "bi-person-gear",    label: "Mon profil",      path: "/dashboard/secretaire/profil" },
];

const inp = { width: "100%", borderRadius: 8, border: "1px solid #E5E7EB", padding: "9px 12px", fontSize: 14, boxSizing: "border-box" as const };

// ── Toast ────────────────────────────────────────────────────────────────────
type ToastType = "success" | "danger" | "warning";
interface ToastMsg { id: number; message: string; type: ToastType; }

function ToastContainer({ toasts, onRemove }: { toasts: ToastMsg[]; onRemove: (id: number) => void }) {
    return (
        <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, minWidth: 300 }}>
            {toasts.map(t => (
                <div key={t.id} className={`toast show align-items-center text-white bg-${t.type} border-0 shadow`} role="alert" style={{ borderRadius: 12 }}>
                    <div className="d-flex">
                        <div className="toast-body fw-semibold d-flex align-items-center gap-2">
                            {t.type === "success" && <i className="bi bi-check-circle-fill fs-5"></i>}
                            {t.type === "danger"  && <i className="bi bi-x-circle-fill fs-5"></i>}
                            {t.type === "warning" && <i className="bi bi-exclamation-circle-fill fs-5"></i>}
                            {t.message}
                        </div>
                        <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => onRemove(t.id)} />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Modal Bootstrap ──────────────────────────────────────────────────────────
function Modal({ title, icon, onClose, children }: {
    title: string; icon?: string; onClose: () => void; children: React.ReactNode;
}) {
    return (
        <div className="modal fade show d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ width: "30rem", maxWidth: "90vw" }}>
                <div className="modal-content rounded-4 border-0 shadow">
                    <div className="modal-header border-0 text-white" style={{ background: "#27A869" }}>
                        <h5 className="modal-title fw-bold">
                            {icon && <i className={`bi ${icon} me-2`}></i>}
                            {title}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} />
                    </div>
                    <div className="modal-body">{children}</div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
            {children}
        </div>
    );
}

export default function SecretairePatients() {
    // ✅ FIX : secretaire résolu via getMe() — fiable, pas de recherche par email
    const [secretaire, setSecretaire] = useState<Secretaire | null>(null);
    const [patients, setPatients]     = useState<Patient[]>([]);
    const [loading, setLoading]       = useState(true);
    const [page, setPage]             = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch]         = useState("");
    const [initError, setInitError]   = useState("");

    // Modal créer
    const [createModal, setCreateModal]     = useState(false);
    const [createForm, setCreateForm]       = useState({ nom: "", prenom: "", email: "", telephone: "", motDePasse: "", adresse: "", dateDeNaissance: "", groupeSanguin: "" });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError]     = useState("");

    // Modal éditer
    const [editModal, setEditModal]     = useState(false);
    const [editPat, setEditPat]         = useState<Patient | null>(null);
    const [editForm, setEditForm]       = useState({ nom: "", prenom: "", telephone: "", adresse: "", groupeSanguin: "" });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError]     = useState("");

    // Suppression
    const [deleteId, setDeleteId]         = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Toasts
    const [toasts, setToasts] = useState<ToastMsg[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);

    const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

    const loadPatients = useCallback(async (pg: number) => {
        setLoading(true);
        try {
            const data = await patientService.getAll(pg, 8, "nom");
            setPatients(data.content);
            setTotalPages(data.totalPages);
            setPage(pg);
        } catch (e) {
            console.error("Erreur chargement patients:", e);
        } finally { setLoading(false); }
    }, []);

    // ✅ FIX : getMe() au lieu de getAll(0,100).find(email)
    useEffect(() => {
        (async () => {
            try {
                const sec = await secretaireService.getMe();
                setSecretaire(sec);
            } catch (e: any) {
                console.error("Erreur résolution secrétaire:", e);
                setInitError("Impossible de charger le profil secrétaire.");
            }
            await loadPatients(0);
        })();
    }, [loadPatients]);

    // ── Créer patient ─────────────────────────────────────────────────────────
    const handleCreate = async () => {
        // ✅ FIX : si secretaire toujours null, alerte visible au lieu de silence
        if (!secretaire) {
            setCreateError("Profil secrétaire non chargé. Rechargez la page.");
            return;
        }
        setCreateLoading(true); setCreateError("");
        try {
            await secretaireService.creerPatient(secretaire.id, {
                ...createForm,
                hopitalId: secretaire.hopital?.id,
            });
            await loadPatients(0);
            setCreateModal(false);
            setCreateForm({ nom: "", prenom: "", email: "", telephone: "", motDePasse: "", adresse: "", dateDeNaissance: "", groupeSanguin: "" });
            showToast("Patient créé avec succès !");
        } catch (e: any) {
            setCreateError(e?.response?.data?.message || "Erreur lors de la création");
        } finally { setCreateLoading(false); }
    };

    const openEdit = (p: Patient) => {
        setEditPat(p);
        setEditForm({ nom: p.nom || "", prenom: p.prenom || "", telephone: p.telephone || "", adresse: p.adresse || "", groupeSanguin: p.groupeSanguin || "" });
        setEditModal(true);
    };

    const handleEdit = async () => {
        if (!editPat) return;
        setEditLoading(true); setEditError("");
        try {
            await patientService.update(editPat.id, { ...editForm, hopitalId: editPat.hopital?.id });
            await loadPatients(page);
            setEditModal(false);
            showToast("Patient mis à jour avec succès !");
        } catch (e: any) {
            setEditError(e?.response?.data?.message || "Erreur lors de la modification");
        } finally { setEditLoading(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await patientService.delete(deleteId);
            await loadPatients(page);
            showToast("Patient supprimé", "warning");
        } finally { setDeleteId(null); setDeleteLoading(false); }
    };

    const filtered = patients.filter(p =>
        `${p.nom} ${p.prenom} ${p.email}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout navItems={NAV} title="Gestion des patients">

            {/* ── Toasts ── */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {initError && (
                <div className="alert alert-warning mb-3" style={{ borderRadius: 12 }}>
                    <i className="bi bi-exclamation-triangle me-2"></i>{initError}
                </div>
            )}

            {/* Toolbar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 12, padding: "10px 16px", flex: 1, maxWidth: 360, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #F0F2F7" }}>
                    <i className="bi bi-search" style={{ color: "#9CA3AF" }}></i>
                    <input placeholder="Rechercher un patient..." value={search} onChange={e => setSearch(e.target.value)}
                           style={{ border: "none", outline: "none", fontSize: 14, flex: 1 }} />
                </div>
                <button onClick={() => { setCreateError(""); setCreateModal(true); }}
                        style={{ background: "#27A869", color: "#fff", border: "none", borderRadius: 12, padding: "11px 24px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                    <i className="bi bi-person-plus me-2"></i>Nouveau patient
                </button>
            </div>

            {/* Table */}
            <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #F0F2F7", overflowX: "auto" }}>
                {loading ? (
                    <div className="d-flex justify-content-center" style={{ padding: 60 }}>
                        <div className="spinner-border" style={{ color: "#27A869" }}></div>
                    </div>
                ) : (
                    <>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                            <thead>
                            <tr style={{ borderBottom: "2px solid #F0F2F7" }}>
                                {["Patient", "Email", "Téléphone", "Groupe", "Adresse", "Actions"].map(h => (
                                    <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "48px 0", color: "#BDBDBD" }}>
                                        <i className="bi bi-people" style={{ fontSize: 40 }}></i>
                                        <div style={{ marginTop: 12 }}>Aucun patient trouvé</div>
                                    </td>
                                </tr>
                            ) : filtered.map(p => (
                                <tr key={p.id} style={{ borderBottom: "1px solid #F0F2F7", transition: "background 0.12s" }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FAFAFA"}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                                    <td style={{ padding: "13px 14px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", color: "#27A869", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                                                {p.prenom?.[0]}{p.nom?.[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.prenom} {p.nom}</div>
                                                {p.dateDeNaissance && <div style={{ fontSize: 11, color: "#9CA3AF" }}>{new Date(p.dateDeNaissance).toLocaleDateString("fr-FR")}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "13px 14px", fontSize: 13, color: "#374151" }}>{p.email}</td>
                                    <td style={{ padding: "13px 14px", fontSize: 13, color: "#374151" }}>{p.telephone}</td>
                                    <td style={{ padding: "13px 14px" }}>
                                        {p.groupeSanguin
                                            ? <span style={{ background: "#FEE2E2", color: "#991B1B", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{p.groupeSanguin}</span>
                                            : <span style={{ color: "#D1D5DB" }}>—</span>}
                                    </td>
                                    <td style={{ padding: "13px 14px", fontSize: 13, color: "#6B7280", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.adresse || "—"}</td>
                                    <td style={{ padding: "13px 14px" }}>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button onClick={() => openEdit(p)} className="btn text-primary btn-sm" title="Modifier">
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button onClick={() => setDeleteId(p.id)} className="btn text-danger btn-sm" title="Supprimer">
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
                                <button onClick={() => loadPatients(page - 1)} disabled={page === 0}
                                        style={{ background: "#F3F4F6", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>‹</button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button key={i} onClick={() => loadPatients(i)}
                                            style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: page === i ? "#27A869" : "#F3F4F6", color: page === i ? "#fff" : "#374151", cursor: "pointer", fontWeight: 600 }}>{i + 1}</button>
                                ))}
                                <button onClick={() => loadPatients(page + 1)} disabled={page >= totalPages - 1}
                                        style={{ background: "#F3F4F6", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>›</button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── Modal Créer ── */}
            {createModal && (
                <Modal title="Nouveau patient" icon="bi-person-plus" onClose={() => { setCreateModal(false); setCreateError(""); }}>
                    {createError && <div className="alert alert-danger py-2 small mb-3">{createError}</div>}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                        <Field label="Nom"><input value={createForm.nom} onChange={e => setCreateForm(f => ({ ...f, nom: e.target.value }))} style={inp} /></Field>
                        <Field label="Prénom"><input value={createForm.prenom} onChange={e => setCreateForm(f => ({ ...f, prenom: e.target.value }))} style={inp} /></Field>
                        <Field label="Email"><input type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} style={inp} /></Field>
                        <Field label="Téléphone"><input value={createForm.telephone} onChange={e => setCreateForm(f => ({ ...f, telephone: e.target.value }))} style={inp} /></Field>
                        <Field label="Mot de passe"><input type="password" value={createForm.motDePasse} onChange={e => setCreateForm(f => ({ ...f, motDePasse: e.target.value }))} style={inp} /></Field>
                        <Field label="Groupe sanguin">
                            <select value={createForm.groupeSanguin} onChange={e => setCreateForm(f => ({ ...f, groupeSanguin: e.target.value }))} style={inp}>
                                <option value="">Sélectionner</option>
                                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <option key={g}>{g}</option>)}
                            </select>
                        </Field>
                        <Field label="Date de naissance"><input type="date" value={createForm.dateDeNaissance} onChange={e => setCreateForm(f => ({ ...f, dateDeNaissance: e.target.value }))} style={inp} /></Field>
                        <Field label="Adresse"><input value={createForm.adresse} onChange={e => setCreateForm(f => ({ ...f, adresse: e.target.value }))} style={inp} /></Field>
                    </div>
                    <div className="modal-footer border-0 px-0 pb-0 mt-2">
                        <button onClick={() => { setCreateModal(false); setCreateError(""); }} className="btn btn-danger rounded-3 px-4">Annuler</button>
                        <button onClick={handleCreate} disabled={createLoading || !createForm.nom || !createForm.email || !createForm.motDePasse}
                                className="btn text-white rounded-3 px-4 fw-semibold" style={{ background: "#27A869" }}>
                            {createLoading ? <span className="spinner-border spinner-border-sm"></span> : "Créer"}
                        </button>
                    </div>
                </Modal>
            )}

            {/* ── Modal Éditer ── */}
            {editModal && editPat && (
                <Modal title={`Modifier — ${editPat.prenom} ${editPat.nom}`} icon="bi-pencil" onClose={() => { setEditModal(false); setEditError(""); }}>
                    {editError && <div className="alert alert-danger py-2 small mb-3">{editError}</div>}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                        <Field label="Nom"><input value={editForm.nom} onChange={e => setEditForm(f => ({ ...f, nom: e.target.value }))} style={inp} /></Field>
                        <Field label="Prénom"><input value={editForm.prenom} onChange={e => setEditForm(f => ({ ...f, prenom: e.target.value }))} style={inp} /></Field>
                        <Field label="Téléphone"><input value={editForm.telephone} onChange={e => setEditForm(f => ({ ...f, telephone: e.target.value }))} style={inp} /></Field>
                        <Field label="Groupe sanguin">
                            <select value={editForm.groupeSanguin} onChange={e => setEditForm(f => ({ ...f, groupeSanguin: e.target.value }))} style={inp}>
                                <option value="">Sélectionner</option>
                                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <option key={g}>{g}</option>)}
                            </select>
                        </Field>
                        <div style={{ gridColumn: "1 / -1" }}>
                            <Field label="Adresse"><input value={editForm.adresse} onChange={e => setEditForm(f => ({ ...f, adresse: e.target.value }))} style={inp} /></Field>
                        </div>
                    </div>
                    <div className="modal-footer border-0 px-0 pb-0 mt-2">
                        <button onClick={() => { setEditModal(false); setEditError(""); }} className="btn btn-danger rounded-3 px-4">Annuler</button>
                        <button onClick={handleEdit} disabled={editLoading}
                                className="btn text-white rounded-3 px-4 fw-semibold" style={{ background: "#27A869" }}>
                            {editLoading ? <span className="spinner-border spinner-border-sm"></span> : "Sauvegarder"}
                        </button>
                    </div>
                </Modal>
            )}

            {/* ── Confirm Suppression ── */}
            {deleteId && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 380 }}>
                        <div className="modal-content rounded-4 border-0 shadow text-center p-4">
                            <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: 44 }}></i>
                            <h3 className="mt-3 mb-2 fs-5 fw-bold">Supprimer ce patient ?</h3>
                            <p className="text-muted small mb-4">Cette action est irréversible.</p>
                            <div className="d-flex justify-content-center gap-3">
                                <button onClick={() => setDeleteId(null)} className="btn btn-light rounded-3 px-4">Annuler</button>
                                <button onClick={handleDelete} disabled={deleteLoading} className="btn btn-danger rounded-3 px-4 fw-semibold">
                                    {deleteLoading ? <span className="spinner-border spinner-border-sm"></span> : "Supprimer"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
}