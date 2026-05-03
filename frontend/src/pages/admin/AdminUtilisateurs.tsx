import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import EmptyImg from "../../assets/Empty.gif";

import { utilisateurService, type Utilisateur } from "../../services/Adminservice";

const NAV = [
    { icon: "bi-speedometer2",  label: "Tableau de bord", path: "/dashboard/admin" },
    { icon: "bi-hospital",      label: "Hôpitaux",        path: "/dashboard/admin/hopitaux" },
    { icon: "bi-people",        label: "Utilisateurs",    path: "/dashboard/admin/utilisateurs" },
    { icon: "bi-person-badge",  label: "Médecins",        path: "/dashboard/admin/medecins" },
    { icon: "bi-person-gear",   label: "Mon profil",      path: "/dashboard/admin/profil" },
];

const getRoleColor = (role?: string) => {
    switch (role) {
        case "ADMIN":      return { bg: "#EDE9FE", color: "#5B21B6" };
        case "MEDECIN":    return { bg: "#fcfedb", color: "#888a1e" };
        case "SECRETAIRE": return { bg: "#FFEDD5", color: "#9A3412" };
        default:           return { bg: "#F3F4F6", color: "#374151" };
    }
};

const getSexeColor = (sexe?: string) => {
    switch (sexe) {
        case "HOMME": return { bg: "#DBEAFE", color: "#1E3A8A" };
        case "FEMME": return { bg: "#FCE7F3", color: "#9D174D" };
        default:      return { bg: "#F3F4F6", color: "#374151" };
    }
};

const getStatutColor = (statut?: string) => {
    switch (statut) {
        case "ACTIF":    return { bg: "#DCFCE7", color: "#27A869" };
        case "INACTIF":  return { bg: "#FEE2E2", color: "#991B1B" };
        case "SUSPENDU": return { bg: "#FEF3C7", color: "#92400E" };
        default:         return { bg: "#F3F4F6", color: "#374151" };
    }
};

// ── Toast Component ──
type ToastType = "success" | "danger" | "warning";

interface ToastMsg {
    id: number;
    message: string;
    type: ToastType;
}

function ToastContainer({ toasts, onRemove }: { toasts: ToastMsg[]; onRemove: (id: number) => void }) {
    return (
        <div
            style={{
                position: "fixed",
                bottom: 20,
                right: 20,
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                minWidth: 300,
            }}
        >
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`toast show align-items-center text-white bg-${t.type} border-0 shadow`}
                    role="alert"
                    style={{ borderRadius: 12 }}
                >
                    <div className="d-flex">
                        <div className="toast-body fw-semibold d-flex align-items-center gap-2">
                            {t.type === "success" && <i className="bi bi-check-circle-fill fs-5"></i>}
                            {t.type === "danger"  && <i className="bi bi-x-circle-fill fs-5"></i>}
                            {t.type === "warning" && <i className="bi bi-exclamation-circle-fill fs-5"></i>}
                            {t.message}
                        </div>
                        <button
                            type="button"
                            className="btn-close btn-close-white me-2 m-auto"
                            onClick={() => onRemove(t.id)}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function AdminUtilisateurs() {
    const [utilisateurs, setUtilisateurs]     = useState<Utilisateur[]>([]);
    const [loading, setLoading]               = useState(true);
    const [page, setPage]                     = useState(0);
    const [totalPages, setTotalPages]         = useState(0);
    const [search, setSearch]                 = useState("");

    const [createModal, setCreateModal]       = useState(false);
    const [createForm, setCreateForm]         = useState({ nom: "", prenom: "", email: "", telephone: "", motDePasse: "", sexe: "", role: "" });
    const [createLoading, setCreateLoading]   = useState(false);
    const [createError, setCreateError]       = useState("");

    const [editModal, setEditModal]           = useState(false);
    const [editPat, setEditPat]               = useState<Utilisateur | null>(null);
    const [editForm, setEditForm]             = useState({ nom: "", prenom: "", telephone: "", role: "", email: "", sexe: "" });
    const [editLoading, setEditLoading]       = useState(false);
    const [editError, setEditError]           = useState("");

    const [deleteId, setDeleteId]             = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading]   = useState(false);

    // ── Toasts ──
    const [toasts, setToasts] = useState<ToastMsg[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);

    const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

    const loadUtilisateurs = useCallback(async (pg: number) => {
        setLoading(true);
        try {
            const data = await utilisateurService.getAll(pg, 8, "nom");
            setUtilisateurs(data.content);
            setTotalPages(data.totalPages);
            setPage(pg);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadUtilisateurs(0); }, []);

    const handleCreate = async () => {
        setCreateLoading(true);
        setCreateError("");
        try {
            await utilisateurService.create({ ...createForm });
            await loadUtilisateurs(0);
            setCreateModal(false);
            setCreateForm({ nom: "", prenom: "", email: "", telephone: "", motDePasse: "", sexe: "", role: "" });
            showToast("Utilisateur créé avec succès !");
        } catch (e: any) {
            setCreateError(e?.response?.data?.message || "Erreur lors de la création");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleActivate = async (id: string) => {
        try {
            await utilisateurService.activer(id);
            await loadUtilisateurs(page);
            showToast("Utilisateur activé avec succès !");
        } catch {
            showToast("Erreur lors de l'activation", "danger");
        }
    };

    const handleDeactivate = async (id: string) => {
        try {
            await utilisateurService.desactiver(id);
            await loadUtilisateurs(page);
            showToast("Utilisateur désactivé", "warning");
        } catch {
            showToast("Erreur lors de la désactivation", "danger");
        }
    };

    const openEdit = (u: Utilisateur) => {
        setEditPat(u);
        setEditForm({ nom: u.nom || "", prenom: u.prenom || "", telephone: u.telephone || "", role: u.role || "", sexe: u.sexe || "", email: u.email || "" });
        setEditModal(true);
    };

    const handleEdit = async () => {
        if (!editPat) return;
        setEditLoading(true);
        setEditError("");
        try {
            await utilisateurService.update(editPat.id, { ...editForm });
            await loadUtilisateurs(page);
            setEditModal(false);
            showToast("Utilisateur mis à jour avec succès !");
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
            await utilisateurService.delete(deleteId);
            await loadUtilisateurs(page);
            showToast("Utilisateur supprimé", "warning");
        } finally {
            setDeleteId(null);
            setDeleteLoading(false);
        }
    };

    const filtered = utilisateurs.filter(u =>
        `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout navItems={NAV} title="Gestion des utilisateurs">

            {/* ── Toasts ── */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {/* ── Toolbar ── */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div
                    className="d-flex align-items-center gap-2 bg-white rounded-3 px-3 py-2 shadow-sm border flex-grow-1"
                    style={{ maxWidth: 360 }}
                >
                    <i className="bi bi-search text-secondary"></i>
                    <input
                        placeholder="Rechercher un utilisateur..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border-0 small flex-grow-1"
                        style={{ outline: "none" }}
                    />
                </div>
                <button
                    onClick={() => setCreateModal(true)}
                    className="btn btn-primary"
                >
                    <i className="bi bi-person-plus me-2"></i>Nouveau utilisateur
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
                        <div className="mt-3 text-muted">Aucun utilisateur trouvé</div>
                    </div>
                ) : (
                    <>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                            <thead>
                            <tr style={{ borderBottom: "2px solid #F0F2F7" }}>
                                {["Utilisateur", "Email", "Sexe", "Téléphone", "Rôle", "État", "Actions"].map(h => (
                                    <th
                                        key={h}
                                        style={{
                                            textAlign: "left",
                                            padding: "10px 14px",
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: "#6B7280",
                                            textTransform: "uppercase",
                                            letterSpacing: 0.5
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.map(u => {
                                const initials = `${u?.prenom?.[0] ?? "?"}${u?.nom?.[0] ?? "?"}`.toUpperCase();
                                return (
                                    <tr
                                        key={u.id}
                                        className="align-middle"
                                        style={{ borderBottom: "1px solid #F0F2F7", transition: "background 0.12s" }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FAFAFA"}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                                    >
                                        <td style={{ padding: "13px 14px" }}>
                                            <div className="d-flex align-items-center gap-2">
                                                <div
                                                    className="d-flex align-items-center justify-content-center"
                                                    style={{ width: 36, height: 36, borderRadius: "50%", background: "#DCFCE7", color: "#27A869", fontWeight: 700, fontSize: 13 }}
                                                >
                                                    {initials}
                                                </div>
                                                <div className="fw-semibold text-muted" style={{ fontSize: 14 }}>
                                                    {u.prenom} {u.nom}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "13px 14px", fontSize: 13 }} className="text-muted">{u.email}</td>
                                        <td style={{ padding: "13px 14px" }}>
                                            {u.sexe ? (
                                                <span className="badge text-capitalize" style={{ background: getSexeColor(u.sexe).bg, color: getSexeColor(u.sexe).color, fontSize: 11, fontWeight: 700, borderRadius: 20 }}>
                                                        {u.sexe === "HOMME" && <i className="bi bi-gender-male me-1"></i>}
                                                    {u.sexe === "FEMME" && <i className="bi bi-gender-female me-1"></i>}
                                                    {u.sexe}
                                                    </span>
                                            ) : <span className="text-secondary">—</span>}
                                        </td>
                                        <td style={{ padding: "13px 14px", fontSize: 13 }}>{u.telephone || <span className="text-secondary">—</span>}</td>
                                        <td style={{ padding: "13px 14px" }}>
                                            {u.role ? (
                                                <span className="badge" style={{ background: getRoleColor(u.role).bg, color: getRoleColor(u.role).color, fontSize: 11, borderRadius: 10 }}>{u.role}</span>
                                            ) : <span className="text-secondary">—</span>}
                                        </td>
                                        <td style={{ padding: "13px 14px" }}>
                                            {u.statutUtilisateur ? (
                                                <span className="badge text-lowercase" style={{ background: getStatutColor(u.statutUtilisateur).bg, color: getStatutColor(u.statutUtilisateur).color, fontSize: 11, borderRadius: 10 }}>
                                                        {u.statutUtilisateur}
                                                    </span>
                                            ) : <span className="text-secondary">—</span>}
                                        </td>
                                        <td style={{ padding: "13px 14px" }}>
                                            <div className="d-flex gap-2">
                                                {u.statutUtilisateur === "ACTIF" ? (
                                                    <button className="btn text-danger btn-sm" title="Désactiver" onClick={() => handleDeactivate(u.id)}>
                                                        <i className="bi bi-x-octagon"></i>
                                                    </button>
                                                ) : (
                                                    <button className="btn btn-sm" title="Activer" onClick={() => handleActivate(u.id)} style={{ color: "#27A869" }}>
                                                        <i className="bi bi-check-circle"></i>
                                                    </button>
                                                )}
                                                <button onClick={() => openEdit(u)} className="btn text-primary btn-sm" title="Modifier">
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button onClick={() => setDeleteId(u.id)} className="btn text-secondary btn-sm" title="Supprimer">
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center gap-2 mt-4">
                                <button onClick={() => loadUtilisateurs(page - 1)} disabled={page === 0} className="btn btn-light rounded-3 px-3">‹</button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => loadUtilisateurs(i)}
                                        className="btn rounded-3 px-3"
                                        style={{ background: page === i ? "#27A869" : "#F3F4F6", color: page === i ? "#fff" : "#374151", fontWeight: 600, border: "none" }}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button onClick={() => loadUtilisateurs(page + 1)} disabled={page >= totalPages - 1} className="btn btn-light rounded-3 px-3">›</button>
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
                                <h5 className="modal-title fw-bold"><i className="bi bi-person-plus me-2"></i>Nouveau Utilisateur</h5>
                                <button type="button" className="btn-close" onClick={() => { setCreateModal(false); setCreateError(""); }} />
                            </div>
                            <div className="modal-body pt-2">
                                {createError && <div className="alert alert-danger py-2 small mb-3">{createError}</div>}
                                <div className="row g-3">
                                    <div className="col-6">
                                        <label className="form-label fw-semibold small"><i className="bi bi-person"></i> Nom *</label>
                                        <input className="form-control" value={createForm.nom} onChange={e => setCreateForm(f => ({ ...f, nom: e.target.value }))} />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label fw-semibold small"><i className="bi bi-person-badge"></i> Prénom *</label>
                                        <input className="form-control" value={createForm.prenom} onChange={e => setCreateForm(f => ({ ...f, prenom: e.target.value }))} />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label fw-semibold small"><i className="bi bi-envelope"></i> Email *</label>
                                        <input type="email" className="form-control" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label fw-semibold small"><i className="bi bi-telephone"></i> Téléphone *</label>
                                        <input className="form-control" value={createForm.telephone} onChange={e => setCreateForm(f => ({ ...f, telephone: e.target.value }))} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-bold small"><i className="bi bi-gender-ambiguous"></i> Sexe</label>
                                        <select className="form-select" value={createForm.sexe} onChange={e => setCreateForm(f => ({ ...f, sexe: e.target.value }))}>
                                            <option value="">Sélectionner</option>
                                            <option value="HOMME">Homme</option>
                                            <option value="FEMME">Femme</option>
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold small"><i className="bi bi-shield-lock"></i> Rôle</label>
                                        <select className="form-select" value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}>
                                            <option value="">Sélectionner</option>
                                            <option value="SECRETAIRE">Secrétaire</option>
                                            <option value="MEDECIN">Médecin</option>
                                            <option value="PATIENT">Patient</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button className="btn btn-danger rounded-3 px-4" onClick={() => { setCreateModal(false); setCreateError(""); }}>Annuler</button>
                                <button className="btn btn-primary" onClick={handleCreate} disabled={createLoading}>
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
                                        <label className="form-label fw-semibold small"><i className="bi bi-person me-1"></i>Nom</label>
                                        <input className="form-control" value={editForm.nom} onChange={e => setEditForm(f => ({ ...f, nom: e.target.value }))} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold small"><i className="bi bi-person me-1"></i>Prénom</label>
                                        <input className="form-control" value={editForm.prenom} onChange={e => setEditForm(f => ({ ...f, prenom: e.target.value }))} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold small"><i className="bi bi-telephone me-1"></i>Téléphone</label>
                                        <input className="form-control" value={editForm.telephone} onChange={e => setEditForm(f => ({ ...f, telephone: e.target.value }))} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold small"><i className="bi bi-gender-ambiguous me-1"></i>Sexe</label>
                                        <select className="form-select" value={editForm.sexe} onChange={e => setEditForm(f => ({ ...f, sexe: e.target.value }))}>
                                            <option value="">Sélectionner</option>
                                            <option value="HOMME">Homme</option>
                                            <option value="FEMME">Femme</option>
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold small"><i className="bi bi-shield-lock me-1"></i>Rôle</label>
                                        <select className="form-select" value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                                            <option value="">Sélectionner</option>
                                            <option value="ADMIN">Admin</option>
                                            <option value="SECRETAIRE">Secrétaire</option>
                                            <option value="MEDECIN">Médecin</option>
                                            <option value="PATIENT">Patient</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button className="btn btn-danger rounded-3 px-4" onClick={() => { setEditModal(false); setEditError(""); }}>Annuler</button>
                                <button className="btn btn-primary" onClick={handleEdit} disabled={editLoading}>
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
                            <h3 className="mt-3 mb-2 fs-5 fw-bold">Supprimer cet utilisateur ?</h3>
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