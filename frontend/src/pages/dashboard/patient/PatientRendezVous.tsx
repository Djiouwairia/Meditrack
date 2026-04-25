import { useEffect, useState } from "react";
import { rendezVousAPI, medecinAPI } from "../../../services/api.ts";
import { useAuth } from "../../../context/AuthContext";

export default function PatientRendezVous() {
    const { user } = useAuth();
    const [rdvs, setRdvs] = useState<any[]>([]);
    const [medecins, setMedecins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [form, setForm] = useState({ medecinId: "", date: "", heure: "", motif: "" });
    const [saving, setSaving] = useState(false);

    const fetchRdvs = async (p = 0) => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const { data } = await rendezVousAPI.getByPatient(user.id, p, 10);
            setRdvs(data.content || []);
            setTotalPages(data.totalPages || 1);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchRdvs(page);
        medecinAPI.getDisponibles().then(({ data }) => setMedecins(data)).catch(() => {});
    }, [user, page]);

    const handlePrendre = async () => {
        if (!form.medecinId || !form.date || !form.heure) { alert("Remplissez tous les champs."); return; }
        setSaving(true);
        try {
            await rendezVousAPI.prendre({
                patientId: user!.id,
                medecinId: form.medecinId,
                date: form.date,
                heure: form.heure,
                motif: form.motif,
            });
            setShowModal(false);
            setForm({ medecinId: "", date: "", heure: "", motif: "" });
            fetchRdvs(0);
        } catch (e: any) {
            alert(e.response?.data?.message || "Erreur lors de la prise de rendez-vous.");
        } finally { setSaving(false); }
    };

    const handleAnnuler = async (id: string) => {
        if (!confirm("Annuler ce rendez-vous ?")) return;
        try {
            await rendezVousAPI.annuler(id);
            setRdvs((prev) => prev.map((r) => r.id === id ? { ...r, statut: "ANNULE" } : r));
        } catch { alert("Erreur."); }
    };

    const badge: Record<string, string> = {
        PLANIFIE: "badge-status badge-planifie",
        CONFIRME: "badge-status badge-confirme",
        ANNULE: "badge-status badge-annule",
        TERMINE: "badge-status badge-termine",
    };

    return (
        <div>
            <h1 className="page-title">Mes rendez-vous</h1>
            <p className="page-subtitle">Gérez vos consultations</p>

            <div className="dash-card">
                <div className="section-header">
                    <div />
                    <button className="btn-primary-green" onClick={() => setShowModal(true)}>
                        <i className="bi bi-plus-lg" /> Prendre un RDV
                    </button>
                </div>

                {loading ? (
                    <div className="loading-spinner"><div className="spinner" /></div>
                ) : rdvs.length === 0 ? (
                    <div className="empty-state">
                        <i className="bi bi-calendar-plus" />
                        <p>Aucun rendez-vous. Prenez votre premier RDV !</p>
                    </div>
                ) : (
                    <>
                        <div style={{ overflowX: "auto" }}>
                            <table className="dash-table">
                                <thead>
                                <tr>
                                    <th>Date & Heure</th>
                                    <th>Médecin</th>
                                    <th>Spécialité</th>
                                    <th>Motif</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {rdvs.map((rdv) => (
                                    <tr key={rdv.id}>
                                        <td>
                                            <strong>{new Date(rdv.date).toLocaleDateString("fr-FR")}</strong>
                                            <span style={{ color: "var(--muted)", marginLeft: 8, fontSize: "0.83rem" }}>{rdv.heure}</span>
                                        </td>
                                        <td>Dr. {rdv.medecin?.prenom} {rdv.medecin?.nom}</td>
                                        <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{rdv.medecin?.specialite}</td>
                                        <td style={{ color: "var(--muted)", fontSize: "0.83rem" }}>{rdv.motif || "—"}</td>
                                        <td><span className={badge[rdv.statut] || "badge-status"}>{rdv.statut}</span></td>
                                        <td>
                                            {(rdv.statut === "PLANIFIE" || rdv.statut === "CONFIRME") && (
                                                <button className="btn-danger-soft" onClick={() => handleAnnuler(rdv.id)}>
                                                    <i className="bi bi-x-lg" /> Annuler
                                                </button>
                                            )}
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

            {/* Modal nouveau RDV */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-title">
                            <i className="bi bi-calendar2-plus" style={{ color: "#1A7A52" }} />
                            Prendre un rendez-vous
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <i className="bi bi-x-lg" />
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Médecin disponible</label>
                            <select value={form.medecinId} onChange={(e) => setForm((f) => ({ ...f, medecinId: e.target.value }))}>
                                <option value="">— Sélectionner —</option>
                                {medecins.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        Dr. {m.prenom} {m.nom} — {m.specialite}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" value={form.date} min={new Date().toISOString().split("T")[0]}
                                   onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label>Heure</label>
                            <input type="time" value={form.heure}
                                   onChange={(e) => setForm((f) => ({ ...f, heure: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label>Motif (optionnel)</label>
                            <textarea rows={2} value={form.motif}
                                      onChange={(e) => setForm((f) => ({ ...f, motif: e.target.value }))}
                                      placeholder="Décrivez brièvement le motif de la consultation…" />
                        </div>

                        <button className="btn-primary-green" style={{ width: "100%", justifyContent: "center" }}
                                onClick={handlePrendre} disabled={saving}>
                            {saving ? "Enregistrement…" : <><i className="bi bi-check2" /> Confirmer le RDV</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}