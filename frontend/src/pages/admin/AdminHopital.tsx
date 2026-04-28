import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import EmptyImg from "../../assets/Empty.gif";
import { hopitalService, type Hopital } from "../../services/Adminservice";

const NAV = [
    { icon: "bi-speedometer2", label: "Tableau de bord", path: "/dashboard/admin" },
    { icon: "bi-hospital",     label: "Hôpitaux",        path: "/dashboard/admin/hopitaux" },
    { icon: "bi-people",       label: "Utilisateurs",    path: "/dashboard/admin/utilisateurs" },
    { icon: "bi-person-badge", label: "Médecins",        path: "/dashboard/admin/medecins" },
    { icon: "bi-person-gear",  label: "Mon profil",      path: "/dashboard/admin/profil" },
];

// ── Toast ──
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

export default function AdminHopitaux() {
    const [hopitaux, setHopitaux]         = useState<Hopital[]>([]);
    const [loading, setLoading]           = useState(true);
    const [page, setPage]                 = useState(0);
    const [totalPages, setTotalPages]     = useState(0);
    const [search, setSearch]             = useState("");

    const [createModal, setCreateModal]   = useState(false);
    const [createForm, setCreateForm]     = useState({ nom: "", adresse: "", email: "", contact: "" });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError]   = useState("");

    const [editModal, setEditModal]       = useState(false);
    const [editPat, setEditPat]           = useState<Hopital | null>(null);
    const [editForm, setEditForm]         = useState({ nom: "", adresse: "", email: "", contact: "" });
    const [editLoading, setEditLoading]   = useState(false);
    const [editError, setEditError]       = useState("");

    const [deleteId, setDeleteId]         = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // ── Toasts ──
    const [toasts, setToasts] = useState<ToastMsg[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);

    const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

    const loadHopitaux = useCallback(async (pg: number) => {
        setLoading(true);
        try {
            const data = await hopitalService.getAll(pg, 8, "nom");
            setHopitaux(data.content);
            setTotalPages(data.totalPages);
            setPage(pg);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadHopitaux(0); }, []);

    const handleCreate = async () => {
        setCreateLoading(true);
        setCreateError("");
        try {
            await hopitalService.create({ ...createForm });
            await loadHopitaux(0);
            setCreateModal(false);
            setCreateForm({ nom: "", adresse: "", email: "", contact: "" });
            showToast("Hôpital créé avec succès !");
        } catch (e: any) {
            setCreateError(e?.response?.data?.message || "Erreur lors de la création");
        } finally {
            setCreateLoading(false);
        }
    };

    const openEdit = (u: Hopital) => {
        setEditPat(u);
        setEditForm({ nom: u.nom || "", adresse: u.adresse || "", contact: u.contact || "", email: u.email || "" });
        setEditModal(true);
    };

    const handleEdit = async () => {
        if (!editPat) return;
        setEditLoading(true);
        setEditError("");
        try {
            await hopitalService.update(editPat.id, { ...editForm });
            await loadHopitaux(page);
            setEditModal(false);
            showToast("Hôpital mis à jour avec succès !");
        } catch (e: any) {
            setEditError(e?.response?.data?.message || "Erreur lors de la modification");
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await hopitalService.delete(deleteId);
            await loadHopitaux(page);
            showToast("Hôpital supprimé", "warning");
        } finally {
            setDeleteId(null);
            setDeleteLoading(false);
        }
    };

    const filtered = hopitaux.filter(u =>
        `${u.nom} ${u.adresse} ${u.email}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout navItems={NAV} title="Gestion des hôpitaux">

            {/* ── Toasts ── */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {/* ── Toolbar ── */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2 bg-white rounded-3 px-3 py-2 shadow-sm border flex-grow-1" style={{ maxWidth: 360 }}>
                    <i className="bi bi-search text-secondary"></i>
                    <input
                        placeholder="Rechercher un hôpital..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border-0 small flex-grow-1"
                        style={{ outline: "none" }}
                    />
                </div>
                <button onClick={() => setCreateModal(true)} className="btn fw-bold text-white rounded-3 px-4" style={{ background: "#27A869" }}>
                    <i className="bi bi-plus me-2"></i>Ajouter un hôpital
                </button>
            </div>

            {/* ── Table ── */}
            <div className="bg-white rounded-4 p-4 shadow-sm border" style={{ overflowX: "auto" }}>
                {loading ? (
                    <div className="d-flex justify-content-center py-5">
                        <div className="spinner-border" style={{ color: "#27A869" }}></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center bg-white border rounded-4 py-5">
                        <img src={EmptyImg} alt="" style={{ width: "20rem" }} />
                        <div className="mt-3 text-muted">Aucun hôpital trouvé</div>
                    </div>
                ) : (
                    <>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid #F0F2F7" }}>
                                    {["#", "Nom", "Adresse", "Email", "Contact", "Actions"].map(h => (
                                        <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((h, index) => (
                                    <tr
                                        key={h.id}
                                        className="align-middle"
                                        style={{ borderBottom: "1px solid #F0F2F7", transition: "background 0.12s" }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FAFAFA"}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                                    >
                                        <td className="text-muted" style={{ padding: "13px 14px", fontSize: 13 }}>{index + 1}</td>
                                        <td style={{ padding: "13px 14px", fontSize: 13 }} className="text-muted">{h.nom}</td>
                                        <td style={{ padding: "13px 14px", fontSize: 13 }} className="text-muted">{h.adresse}</td>
                                        <td style={{ padding: "13px 14px", fontSize: 13 }} className="text-muted">{h.email}</td>
                                        <td style={{ padding: "13px 14px", fontSize: 13 }} className="text-muted">{h.contact || <span className="text-secondary">—</span>}</td>
                                        <td style={{ padding: "13px 14px" }}>
                                            <div className="d-flex gap-2">
                                                <button onClick={() => openEdit(h)} className="btn text-primary btn-sm" title="Modifier">
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button onClick={() => setDeleteId(h.id)} className="btn text-danger btn-sm" title="Supprimer">
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center gap-2 mt-4">
                                <button onClick={() => loadHopitaux(page - 1)} disabled={page === 0} className="btn btn-light rounded-3 px-3">‹</button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button key={i} onClick={() => loadHopitaux(i)} className="btn rounded-3 px-3"
                                        style={{ background: page === i ? "#27A869" : "#F3F4F6", color: page === i ? "#fff" : "#374151", fontWeight: 600, border: "none" }}>
                                        {i + 1}
                                    </button>
                                ))}
                                <button onClick={() => loadHopitaux(page + 1)} disabled={page >= totalPages - 1} className="btn btn-light rounded-3 px-3">›</button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── Modal Créer ── */}
            {createModal && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{ width: "30rem" }}>
                        <div className="modal-content rounded-4 border-0 shadow">
                            <div className="modal-header border-0 text-white" style={{ background: "#27A869" }}>
                                <h5 className="modal-title fw-bold"><i className="bi bi-hospital me-2"></i>Nouvel Hôpital</h5>
                                <button type="button" className="btn-close" onClick={() => { setCreateModal(false); setCreateError(""); }} />
                            </div>
                            <div className="modal-body pt-2">
                                {createError && <div className="alert alert-danger py-2 small mb-3">{createError}</div>}
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label fw-semibold small"><i className="bi bi-hospital me-1"></i>Nom *</label>
                                        <input className="form-control" type="text" value={createForm.nom} onChange={e => setCreateForm(f => ({ ...f, nom: e.target.value }))} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold small"><i className="bi bi-geo-alt me-1"></i>Adresse *</label>
                                        <input className="form-control" type="text" value={createForm.adresse} onChange={e => setCreateForm(f => ({ ...f, adresse: e.target.value }))} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold small"><i className="bi bi-envelope me-1"></i>Email *</label>
                                        <input type="email" className="form-control" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold small"><i className="bi bi-telephone me-1"></i>Contact *</label>
                                        <input className="form-control" type="text" value={createForm.contact} onChange={e => setCreateForm(f => ({ ...f, contact: e.target.value }))} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button className="btn btn-danger rounded-3 px-4" onClick={() => { setCreateModal(false); setCreateError(""); }}>Annuler</button>
                                <button className="btn text-white rounded-3 px-4 fw-semibold" style={{ background: "#27A869" }} onClick={handleCreate} disabled={createLoading}>
                                    {createLoading ? <span className="spinner-border spinner-border-sm"></span> : "Créer"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal Éditer ── */}
            {editModal && editPat && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{ width: "30rem" }}>
                        <div className="modal-content rounded-4 border-0 shadow">
                            <div className="modal-header border-0 text-white" style={{ background: "#27A869" }}>
                                <h5 className="modal-title fw-bold"><i className="bi bi-pencil me-2"></i>Modifier</h5>
                                <button type="button" className="btn-close" onClick={() => { setEditModal(false); setEditError(""); }} />
                            </div>
                            <div className="modal-body pt-2">
                                {editError && <div className="alert alert-danger py-2 small mb-3">{editError}</div>}
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label fw-semibold small"><i className="bi bi-hospital me-1"></i>Nom</label>
                                        <input className="form-control" value={editForm.nom} onChange={e => setEditForm(f => ({ ...f, nom: e.target.value }))} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold small"><i className="bi bi-geo-alt me-1"></i>Adresse</label>
                                        <input className="form-control" value={editForm.adresse} onChange={e => setEditForm(f => ({ ...f, adresse: e.target.value }))} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold small"><i className="bi bi-envelope me-1"></i>Email</label>
                                        <input className="form-control" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold small"><i className="bi bi-telephone me-1"></i>Contact</label>
                                        <input className="form-control" value={editForm.contact} onChange={e => setEditForm(f => ({ ...f, contact: e.target.value }))} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button className="btn btn-danger rounded-3 px-4" onClick={() => { setEditModal(false); setEditError(""); }}>Annuler</button>
                                <button className="btn text-white rounded-3 px-4 fw-semibold" style={{ background: "#27A869" }} onClick={handleEdit} disabled={editLoading}>
                                    {editLoading ? <span className="spinner-border spinner-border-sm"></span> : "Enregistrer"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Confirm Suppression ── */}
            {deleteId && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 380 }}>
                        <div className="modal-content rounded-4 border-0 shadow text-center p-4">
                            <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: 44 }}></i>
                            <h3 className="mt-3 mb-2 fs-5 fw-bold">Supprimer cet hôpital ?</h3>
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