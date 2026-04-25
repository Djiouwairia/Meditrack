import { useEffect, useState } from "react";
import { patientAPI, secretaireAPI } from "../../../services/api.ts";
import { useAuth } from "../../../context/AuthContext";

export default function SecretairePatients() {
    const { user } = useAuth();
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editPatient, setEditPatient] = useState<any>(null);
    const [form, setForm] = useState({
        nom: "", prenom: "", email: "", telephone: "",
        motDePasse: "", adresse: "", dateDeNaissance: "",
        groupeSanguin: "", hopitalId: "",
    });
    const [saving, setSaving] = useState(false);

    const fetchPatients = async (p = 0) => {
        setLoading(true);
        try {
            const { data } = await patientAPI.getAll(p, 10);
            setPatients(data.content || []);
            setTotalPages(data.totalPages || 1);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPatients(page); }, [page]);

    const openCreate = () => {
        setEditPatient(null);
        setForm({ nom: "", prenom: "", email: "", telephone: "", motDePasse: "", adresse: "", dateDeNaissance: "", groupeSanguin: "", hopitalId: "" });
        setShowModal(true);
    };

    const openEdit = (p: any) => {
        setEditPatient(p);
        setForm({
            nom: p.nom || "", prenom: p.prenom || "", email: p.email || "",
            telephone: p.telephone || "", motDePasse: "",
            adresse: p.adresse || "", dateDeNaissance: p.dateDeNaissance || "",
            groupeSanguin: p.groupeSanguin || "", hopitalId: p.hopital?.id || "",
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            if (editPatient) {
                await patientAPI.update(editPatient.id, form);
            } else {
                // secrétaire crée le patient
                await secretaireAPI.creerPatient(user!.id, form);
            }
            setShowModal(false);
            fetchPatients(page);
        } catch (e: any) {
            alert(e.response?.data?.message || "Erreur.");
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer ce patient ?")) return;
        try {
            await patientAPI.delete(id);
            fetchPatients(page);
        } catch { alert("Erreur."); }
    };

    const filtered = patients.filter((p) =>
        `${p.nom} ${p.prenom} ${p.email}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <h1 className="page-title">Gestion des patients</h1>
            <p className="page-subtitle">Enregistrez et gérez les dossiers patients</p>

            <div className="dash-card">
                <div className="section-header">
                    <input
                        type="search"
                        placeholder="Rechercher…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ padding: "0.45rem 0.9rem", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.875rem", outline: "none", width: "240px" }}
                    />
                    <button className="btn-primary-green" onClick={openCreate}>
                        <i className="bi bi-person-plus" /> Nouveau patient
                    </button>
                </div>

                {loading ? (
                    <div className="loading-spinner"><div className="spinner" /></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <i className="bi bi-person-x" />
                        <p>Aucun patient trouvé</p>
                    </div>
                ) : (
                    <>
                        <div style={{ overflowX: "auto" }}>
                            <table className="dash-table">
                                <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Email</th>
                                    <th>Téléphone</th>
                                    <th>Groupe sanguin</th>
                                    <th>Date de naissance</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filtered.map((p) => (
                                    <tr key={p.id}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: "50%",
                                                    background: "linear-gradient(135deg,#1A7A52,#27A869)",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    color: "#fff", fontSize: "0.72rem", fontWeight: 700, flexShrink: 0,
                                                }}>
                                                    {p.prenom?.[0]}{p.nom?.[0]}
                                                </div>
                                                <span><strong>{p.prenom}</strong> {p.nom}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{p.email}</td>
                                        <td style={{ fontSize: "0.85rem" }}>{p.telephone || "—"}</td>
                                        <td>
                                            {p.groupeSanguin ? (
                                                <span style={{ background: "#fdecea", color: "#c0392b", padding: "0.2em 0.5em", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700 }}>
                            {p.groupeSanguin}
                          </span>
                                            ) : "—"}
                                        </td>
                                        <td style={{ fontSize: "0.85rem" }}>
                                            {p.dateDeNaissance ? new Date(p.dateDeNaissance).toLocaleDateString("fr-FR") : "—"}
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: "0.4rem" }}>
                                                <button className="btn-icon" title="Modifier" onClick={() => openEdit(p)}>
                                                    <i className="bi bi-pencil" />
                                                </button>
                                                <button className="btn-danger-soft" title="Supprimer" onClick={() => handleDelete(p.id)}>
                                                    <i className="bi bi-trash3" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination-bar">
                                <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                                    <i className="bi bi-chevron-left" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button key={i} className={`page-btn ${i === page ? "active" : ""}`} onClick={() => setPage(i)}>
                                        {i + 1}
                                    </button>
                                ))}
                                <button className="page-btn" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>
                                    <i className="bi bi-chevron-right" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-title">
                            <i className="bi bi-person-plus" style={{ color: "#1A7A52" }} />
                            {editPatient ? "Modifier le patient" : "Nouveau patient"}
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <i className="bi bi-x-lg" />
                            </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                            {[
                                { key: "prenom", label: "Prénom" },
                                { key: "nom", label: "Nom" },
                                { key: "email", label: "Email", type: "email" },
                                { key: "telephone", label: "Téléphone" },
                                { key: "adresse", label: "Adresse" },
                                { key: "groupeSanguin", label: "Groupe sanguin" },
                            ].map((f) => (
                                <div className="form-group" key={f.key} style={{ margin: 0 }}>
                                    <label>{f.label}</label>
                                    <input type={f.type || "text"} value={(form as any)[f.key]}
                                           onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))} />
                                </div>
                            ))}
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Date de naissance</label>
                                <input type="date" value={form.dateDeNaissance}
                                       onChange={(e) => setForm((f) => ({ ...f, dateDeNaissance: e.target.value }))} />
                            </div>
                            {!editPatient && (
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Mot de passe</label>
                                    <input type="password" value={form.motDePasse}
                                           onChange={(e) => setForm((f) => ({ ...f, motDePasse: e.target.value }))} />
                                </div>
                            )}
                        </div>

                        <button
                            className="btn-primary-green"
                            style={{ marginTop: "1.25rem", width: "100%", justifyContent: "center" }}
                            onClick={handleSubmit} disabled={saving}
                        >
                            {saving ? "Enregistrement…" : <><i className="bi bi-check2" /> {editPatient ? "Mettre à jour" : "Créer le patient"}</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}