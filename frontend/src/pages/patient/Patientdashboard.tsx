import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/common/Statcard";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from "../../context/AuthContext";
// @ts-ignore
// @ts-ignore
import {
    patientService, rendezVousService, dossierService, medecinService,
    type Patient, type RendezVous, type DossierMedical, type Medecin} from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2", label: "Tableau de bord", path: "/dashboard/patient" },
    { icon: "bi-calendar-check", label: "Mes rendez-vous", path: "/dashboard/patient/rendez-vous" },
    { icon: "bi-folder2-open", label: "Mon dossier", path: "/dashboard/patient/dossier" },
    { icon: "bi-file-earmark-medical", label: "Ordonnances", path: "/dashboard/patient/ordonnances" },
    { icon: "bi-person-gear", label: "Mon profil", path: "/dashboard/patient/profil" },
];

export default function PatientDashboard() {
    const { user } = useAuth();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [rdvs, setRdvs] = useState<RendezVous[]>([]);
    const [dossier, setDossier] = useState<DossierMedical | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal prise RDV
    const [rdvModal, setRdvModal] = useState(false);
    const [medecins, setMedecins] = useState<Medecin[]>([]);
    const [rdvForm, setRdvForm] = useState({ medecinId: "", date: "", heure: "", motif: "" });
    const [rdvLoading, setRdvLoading] = useState(false);
    const [rdvSuccess, setRdvSuccess] = useState(false);
    const [rdvError, setRdvError] = useState("");

    const loadData = useCallback(async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            const pPage = await patientService.getAll(0, 200);
            const pat = pPage.content.find(p => p.email === user.email);
            if (pat) {
                setPatient(pat);
                const [rdvPage, dos] = await Promise.all([
                    rendezVousService.getByPatient(pat.id, 0, 20),
                    dossierService.getByPatient(pat.id).catch(() => null),
                ]);
                setRdvs(rdvPage.content);
                setDossier(dos);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => { loadData(); }, [loadData]);

    const openRdvModal = async () => {
        setRdvModal(true);
        const data = await medecinService.getDisponibles();
        setMedecins(data);
    };

    const handlePrendreRdv = async () => {
        if (!patient) return;
        setRdvLoading(true);
        setRdvError("");
        try {
            await rendezVousService.prendre({ patientId: patient.id, ...rdvForm });
            setRdvSuccess(true);
            await loadData();
            setTimeout(() => { setRdvModal(false); setRdvSuccess(false); setRdvForm({ medecinId: "", date: "", heure: "", motif: "" }); }, 1500);
        } catch (e: any) {
            setRdvError(e?.response?.data?.message || "Erreur lors de la prise de rendez-vous");
        } finally { setRdvLoading(false); }
    };

    const prochains = rdvs.filter(r => r.statut !== "ANNULE" && r.statut !== "TERMINE").slice(0, 3);
    const stats = {
        total: rdvs.length,
        confirmes: rdvs.filter(r => r.statut === "CONFIRME").length,
        enAttente: rdvs.filter(r => r.statut === "EN_ATTENTE").length,
        termines: rdvs.filter(r => r.statut === "TERMINE").length,
    };

    return (
        <DashboardLayout navItems={NAV} title="Tableau de bord" >
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                    <div className="spinner-border" style={{ color: "#27A869" }}></div>
                </div>
            ) : (
                <>
                    {/* Welcome */}
                    <div style={{ background: "#27A869", borderRadius: 20, padding: "24px 32px", color: "#fff", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>Bienvenue 👋</div>
                            <div style={{ fontSize: 22, fontWeight: 700 }}>{patient?.prenom} {patient?.nom}</div>
                            <div style={{ opacity: 0.8, fontSize: 14, marginTop: 4 }}>{patient?.hopital?.nom} · {patient?.groupeSanguin && `Groupe ${patient.groupeSanguin}`}</div>
                        </div>
                        <button
                            onClick={openRdvModal}
                            style={{ background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.5)", color: "#fff", borderRadius: 12, padding: "12px 24px", fontWeight: 700, cursor: "pointer", fontSize: 14, backdropFilter: "blur(8px)" }}
                        >
                            <i className="bi bi-calendar-plus me-2"></i>Prendre RDV
                        </button>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 16, marginBottom: 24 }}>
                        <StatCard icon="bi-calendar-check" label="Total RDV" value={stats.total} color="#27A869" bg="#E0F2FE" />
                        <StatCard icon="bi-check-circle" label="Confirmés" value={stats.confirmes} color="#1A7A52" bg="#E8F5EE" />
                        <StatCard icon="bi-hourglass" label="En attente" value={stats.enAttente} color="#F59E0B" bg="#FEF3C7" />
                        <StatCard icon="bi-check2-all" label="Terminés" value={stats.termines} color="#8B5CF6" bg="#EDE9FE" />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
                        {/* Prochains RDV */}
                        <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #F0F2F7" }}>
                            <h2 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700, color: "#0D1F2D" }}>
                                <i className="bi bi-clock-history me-2" style={{ color: "#27A869" }}></i>Prochains rendez-vous
                            </h2>
                            {prochains.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "40px 0", color: "#8A94A6" }}>
                                    <i className="bi bi-calendar-x" style={{ fontSize: 36 }}></i>
                                    <div style={{ marginTop: 10 }}>Aucun rendez-vous à venir</div>
                                    <button onClick={openRdvModal} style={{ marginTop: 16, background: "#27A869", color: "#fff", border: "none", borderRadius: 10, padding: "8px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                                        Prendre un RDV
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {prochains.map(rdv => (
                                        <div key={rdv.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderRadius: 12, background: "#F8FAFC", border: "1px solid #EEF1F6" }}>
                                            <div style={{ textAlign: "center", minWidth: 60, background: "#E0F2FE", borderRadius: 10, padding: "8px 4px" }}>
                                                <div style={{ fontSize: 18, fontWeight: 700, color: "#27A869" }}>{rdv.date?.slice(8, 10)}</div>
                                                <div style={{ fontSize: 11, color: "#0369A1", textTransform: "uppercase" }}>
                                                    {new Date(rdv.date + "T00:00:00").toLocaleDateString("fr-FR", { month: "short" })}
                                                </div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>Dr. {rdv.medecin?.prenom} {rdv.medecin?.nom}</div>
                                                <div style={{ fontSize: 12, color: "#8A94A6" }}>{rdv.medecin?.specialite} · {rdv.heure?.slice(0, 5)}</div>
                                                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{rdv.motif}</div>
                                            </div>
                                            <StatusBadge status={rdv.statut} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Dossier médical */}
                        <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #F0F2F7" }}>
                            <h2 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700, color: "#0D1F2D" }}>
                                <i className="bi bi-folder2-open me-2" style={{ color: "#27A869" }}></i>Dossier médical
                            </h2>
                            {dossier ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                    {[
                                        { icon: "bi-droplet-fill", label: "Groupe sanguin", value: patient?.groupeSanguin || "—", color: "#EF4444", bg: "#FEE2E2" },
                                        { icon: "bi-exclamation-triangle-fill", label: "Allergies", value: dossier.allergies || "Aucune", color: "#F59E0B", bg: "#FEF3C7" },
                                        { icon: "bi-activity", label: "Poids", value: dossier.poids ? `${dossier.poids} kg` : "—", color: "#1A7A52", bg: "#E8F5EE" },
                                        { icon: "bi-arrows-vertical", label: "Taille", value: dossier.taille ? `${dossier.taille} cm` : "—", color: "#27A869", bg: "#E0F2FE" },
                                    ].map(item => (
                                        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: "#F8FAFC" }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <i className={`bi ${item.icon}`} style={{ color: item.color, fontSize: 16 }}></i>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 11, color: "#8A94A6", fontWeight: 500 }}>{item.label}</div>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: "#0D1F2D" }}>{item.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", color: "#8A94A6", padding: "32px 0" }}>
                                    <i className="bi bi-folder2" style={{ fontSize: 36 }}></i>
                                    <div style={{ marginTop: 8, fontSize: 14 }}>Dossier non disponible</div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Modal prise RDV */}
            {rdvModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 480, maxWidth: "90vw" }}>
                        {rdvSuccess ? (
                            <div style={{ textAlign: "center", padding: "32px 0" }}>
                                <div style={{ fontSize: 48 }}>✅</div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: "#1A7A52", marginTop: 12 }}>Rendez-vous pris !</div>
                            </div>
                        ) : (
                            <>
                                <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>Prendre un rendez-vous</h3>
                                {rdvError && <div className="alert alert-danger py-2 small">{rdvError}</div>}
                                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                    <div>
                                        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Médecin disponible</label>
                                        <select value={rdvForm.medecinId} onChange={e => setRdvForm(f => ({ ...f, medecinId: e.target.value }))} style={{ width: "100%", borderRadius: 8, border: "1px solid #E5E7EB", padding: "8px 12px", fontSize: 14 }}>
                                            <option value="">Sélectionner un médecin</option>
                                            {medecins.map(m => (
                                                <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom} — {m.specialite}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                        <div>
                                            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Date</label>
                                            <input type="date" value={rdvForm.date} onChange={e => setRdvForm(f => ({ ...f, date: e.target.value }))} min={new Date().toISOString().slice(0, 10)} style={{ width: "100%", borderRadius: 8, border: "1px solid #E5E7EB", padding: "8px 12px", fontSize: 14, boxSizing: "border-box" }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Heure</label>
                                            <input type="time" value={rdvForm.heure} onChange={e => setRdvForm(f => ({ ...f, heure: e.target.value }))} style={{ width: "100%", borderRadius: 8, border: "1px solid #E5E7EB", padding: "8px 12px", fontSize: 14, boxSizing: "border-box" }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Motif</label>
                                        <textarea value={rdvForm.motif} onChange={e => setRdvForm(f => ({ ...f, motif: e.target.value }))} rows={3} placeholder="Décrivez le motif de votre consultation..." style={{ width: "100%", borderRadius: 8, border: "1px solid #E5E7EB", padding: "8px 12px", fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "flex-end" }}>
                                    <button onClick={() => setRdvModal(false)} style={{ background: "#F3F4F6", border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontSize: 14 }}>Annuler</button>
                                    <button
                                        onClick={handlePrendreRdv}
                                        disabled={rdvLoading || !rdvForm.medecinId || !rdvForm.date || !rdvForm.heure || !rdvForm.motif}
                                        style={{ background: "linear-gradient(135deg,#0369A1,#27A869)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}
                                    >
                                        {rdvLoading ? <span className="spinner-border spinner-border-sm"></span> : "Confirmer"}
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