import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/common/Statcard";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from '../../context/AuthContext';
import { rendezVousService, ordonnanceService, type RendezVous, type Medecin } from "../../services/DomainServices";
import api from "../../services/api";

const NAV = [
    { icon: "bi-speedometer2",         label: "Tableau de bord",   path: "/dashboard/medecin" },
    { icon: "bi-calendar-check",       label: "Mon agenda",         path: "/dashboard/medecin/agenda" },
    { icon: "bi-people",               label: "Mes patients",       path: "/dashboard/medecin/patients" },
    { icon: "bi-file-earmark-medical", label: "Ordonnances",        path: "/dashboard/medecin/ordonnances" },
    { icon: "bi-person-gear",          label: "Mon profil",         path: "/dashboard/medecin/profil" },
];

function fmtTime(t: string) {
    return t?.slice(0, 5) || "";
}

export default function MedecinDashboard() {
    const { user } = useAuth();
    const [medecin, setMedecin]         = useState<Medecin | null>(null);
    const [rdvAujourdhui, setRdvAujourdhui] = useState<RendezVous[]>([]);
    const [loading, setLoading]         = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Modal ordonnance
    const [ordoModal, setOrdoModal]     = useState(false);
    const [selectedRdv, setSelectedRdv] = useState<RendezVous | null>(null);
    const [medicaments, setMedicaments] = useState<{ nom: string; posologie: string }[]>([{ nom: "", posologie: "" }]);
    const [ordoLoading, setOrdoLoading] = useState(false);
    const [ordoSuccess, setOrdoSuccess] = useState(false);

    // Modal terminer
    const [terminerModal, setTerminerModal] = useState(false);
    const [terminerRdv, setTerminerRdv]     = useState<RendezVous | null>(null);
    const [terminerDiag, setTerminerDiag]   = useState("");

    const loadData = useCallback(async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            // ✅ Utilise /medecins/me au lieu de parcourir toute la liste
            const med: Medecin = await api.get("/medecins/me").then(r => r.data);
            setMedecin(med);
            const rdvs = await rendezVousService.getAujourdhui(med.id);
            setRdvAujourdhui(rdvs);
        } catch (e) {
            console.error("Erreur chargement dashboard médecin:", e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleConfirmer = async (rdvId: string) => {
        setActionLoading(rdvId + "_confirmer");
        try { await rendezVousService.confirmer(rdvId); await loadData(); }
        finally { setActionLoading(null); }
    };

    const handleAnnuler = async (rdvId: string) => {
        setActionLoading(rdvId + "_annuler");
        try { await rendezVousService.annuler(rdvId); await loadData(); }
        finally { setActionLoading(null); }
    };

    const handleTerminer = async () => {
        if (!terminerRdv) return;
        setActionLoading(terminerRdv.id + "_terminer");
        try {
            await rendezVousService.terminer(terminerRdv.id, terminerDiag);
            setTerminerModal(false);
            setTerminerDiag("");
            await loadData();
        } finally { setActionLoading(null); }
    };

    const handleOrdonnance = async () => {
        if (!selectedRdv) return;
        setOrdoLoading(true);
        try {
            const meds: Record<string, string> = {};
            medicaments.filter(m => m.nom.trim()).forEach(m => { meds[m.nom] = m.posologie; });
            await ordonnanceService.creer({ rendezVousId: selectedRdv.id, medicaments: meds });
            setOrdoSuccess(true);
            setTimeout(() => { setOrdoModal(false); setOrdoSuccess(false); setMedicaments([{ nom: "", posologie: "" }]); }, 1500);
        } finally { setOrdoLoading(false); }
    };

    const stats = {
        total:     rdvAujourdhui.length,
        confirmes: rdvAujourdhui.filter(r => r.statut === "CONFIRME").length,
        enAttente: rdvAujourdhui.filter(r => r.statut === "EN_ATTENTE").length,
        termines:  rdvAujourdhui.filter(r => r.statut === "TERMINE").length,
    };

    return (
        <DashboardLayout navItems={NAV} title="Tableau de bord" accentColor="#1A7A52">
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                    <div className="spinner-border" style={{ color: "#1A7A52" }}></div>
                </div>
            ) : (
                <>
                    {/* Welcome banner */}
                    <div style={{ background: "linear-gradient(135deg, #1A7A52 0%, #27A869 100%)", borderRadius: 20, padding: "24px 32px", color: "#fff", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>Bonjour 👋</div>
                            <div style={{ fontSize: 22, fontWeight: 700 }}>Dr. {medecin?.prenom} {medecin?.nom}</div>
                            <div style={{ opacity: 0.8, fontSize: 14, marginTop: 4 }}>{medecin?.specialite} · {medecin?.hopital?.nom}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 13, opacity: 0.8 }}>Disponibilité</div>
                            <div style={{ marginTop: 6, cursor: "pointer" }}
                                 onClick={async () => { if (medecin) { await api.patch(`/medecins/${medecin.id}/disponibilite`); loadData(); } }}>
                                <span style={{ background: medecin?.disponible ? "rgba(255,255,255,0.25)" : "rgba(255,100,100,0.35)", padding: "4px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, border: "2px solid rgba(255,255,255,0.4)" }}>
                                    {medecin?.disponible ? "✓ Disponible" : "✗ Indisponible"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 16, marginBottom: 28 }}>
                        <StatCard icon="bi-calendar-day"     label="RDV aujourd'hui" value={stats.total}     color="#1A7A52" bg="#E8F5EE" />
                        <StatCard icon="bi-check-circle"     label="Confirmés"       value={stats.confirmes} color="#0EA5E9" bg="#E0F2FE" />
                        <StatCard icon="bi-hourglass-split"  label="En attente"      value={stats.enAttente} color="#F59E0B" bg="#FEF3C7" />
                        <StatCard icon="bi-check2-all"       label="Terminés"        value={stats.termines}  color="#8B5CF6" bg="#EDE9FE" />
                    </div>

                    {/* Agenda du jour */}
                    <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #F0F2F7" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0D1F2D" }}>
                                <i className="bi bi-calendar-check me-2" style={{ color: "#1A7A52" }}></i>
                                Agenda du jour
                            </h2>
                            <span style={{ fontSize: 13, color: "#8A94A6" }}>
                                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                            </span>
                        </div>

                        {rdvAujourdhui.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "48px 0", color: "#8A94A6" }}>
                                <i className="bi bi-calendar2-x" style={{ fontSize: 40 }}></i>
                                <div style={{ marginTop: 12, fontSize: 15 }}>Aucun rendez-vous aujourd'hui</div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {rdvAujourdhui
                                    .sort((a, b) => a.heure.localeCompare(b.heure))
                                    .map(rdv => (
                                        <div key={rdv.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", borderRadius: 14, background: "#F8FAFC", border: "1px solid #EEF1F6" }}>
                                            <div style={{ textAlign: "center", minWidth: 52 }}>
                                                <div style={{ fontSize: 18, fontWeight: 700, color: "#1A7A52" }}>{fmtTime(rdv.heure)}</div>
                                            </div>
                                            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1A7A5222", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#1A7A52", fontSize: 15, flexShrink: 0 }}>
                                                {rdv.patient?.prenom?.[0]}{rdv.patient?.nom?.[0]}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: 14, color: "#0D1F2D" }}>{rdv.patient?.prenom} {rdv.patient?.nom}</div>
                                                <div style={{ fontSize: 12, color: "#8A94A6", marginTop: 2 }}>{rdv.motif}</div>
                                            </div>
                                            <StatusBadge status={rdv.statut} />
                                            <div style={{ display: "flex", gap: 8 }}>
                                                {rdv.statut === "EN_ATTENTE" && (
                                                    <button onClick={() => handleConfirmer(rdv.id)} disabled={!!actionLoading}
                                                            style={{ background: "#D1FAE5", color: "#065F46", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                                        {actionLoading === rdv.id + "_confirmer" ? <span className="spinner-border spinner-border-sm"></span> : "✓ Confirmer"}
                                                    </button>
                                                )}
                                                {(rdv.statut === "EN_ATTENTE" || rdv.statut === "CONFIRME") && (
                                                    <>
                                                        <button onClick={() => { setTerminerRdv(rdv); setTerminerModal(true); }} disabled={!!actionLoading}
                                                                style={{ background: "#E0E7FF", color: "#3730A3", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                                            Terminer
                                                        </button>
                                                        <button onClick={() => handleAnnuler(rdv.id)} disabled={!!actionLoading}
                                                                style={{ background: "#FEE2E2", color: "#991B1B", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                                            Annuler
                                                        </button>
                                                    </>
                                                )}
                                                {rdv.statut === "TERMINE" && (
                                                    <button onClick={() => { setSelectedRdv(rdv); setOrdoModal(true); }}
                                                            style={{ background: "#F0FDF4", color: "#1A7A52", border: "1px solid #BBF7D0", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                                        <i className="bi bi-file-earmark-plus me-1"></i>Ordonnance
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Modal Terminer */}
            {terminerModal && terminerRdv && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 480, maxWidth: "90vw" }}>
                        <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>Terminer le rendez-vous</h3>
                        <p style={{ color: "#8A94A6", fontSize: 14, marginBottom: 20 }}>Patient : {terminerRdv.patient?.prenom} {terminerRdv.patient?.nom}</p>
                        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Diagnostic</label>
                        <textarea value={terminerDiag} onChange={e => setTerminerDiag(e.target.value)} rows={4} placeholder="Entrez le diagnostic..."
                                  style={{ width: "100%", borderRadius: 10, border: "1px solid #E5E7EB", padding: "10px 14px", fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
                        <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "flex-end" }}>
                            <button onClick={() => setTerminerModal(false)} style={{ background: "#F3F4F6", border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontSize: 14 }}>Annuler</button>
                            <button onClick={handleTerminer} disabled={!terminerDiag.trim() || !!actionLoading}
                                    style={{ background: "linear-gradient(135deg,#1A7A52,#27A869)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                                {actionLoading ? <span className="spinner-border spinner-border-sm"></span> : "Confirmer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ordonnance */}
            {ordoModal && selectedRdv && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 540, maxWidth: "90vw" }}>
                        {ordoSuccess ? (
                            <div style={{ textAlign: "center", padding: "32px 0" }}>
                                <div style={{ fontSize: 48 }}>✅</div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: "#1A7A52", marginTop: 12 }}>Ordonnance créée !</div>
                            </div>
                        ) : (
                            <>
                                <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>Nouvelle ordonnance</h3>
                                <p style={{ color: "#8A94A6", fontSize: 14, marginBottom: 20 }}>Patient : {selectedRdv.patient?.prenom} {selectedRdv.patient?.nom}</p>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 10 }}>Médicaments</label>
                                {medicaments.map((m, i) => (
                                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                                        <input placeholder="Médicament" value={m.nom}
                                               onChange={e => { const copy = [...medicaments]; copy[i].nom = e.target.value; setMedicaments(copy); }}
                                               style={{ flex: 1, borderRadius: 8, border: "1px solid #E5E7EB", padding: "8px 12px", fontSize: 13 }} />
                                        <input placeholder="Posologie" value={m.posologie}
                                               onChange={e => { const copy = [...medicaments]; copy[i].posologie = e.target.value; setMedicaments(copy); }}
                                               style={{ flex: 1, borderRadius: 8, border: "1px solid #E5E7EB", padding: "8px 12px", fontSize: 13 }} />
                                        {medicaments.length > 1 && (
                                            <button onClick={() => setMedicaments(medicaments.filter((_, j) => j !== i))}
                                                    style={{ background: "#FEE2E2", border: "none", borderRadius: 8, padding: "0 12px", color: "#991B1B", cursor: "pointer" }}>✕</button>
                                        )}
                                    </div>
                                ))}
                                <button onClick={() => setMedicaments([...medicaments, { nom: "", posologie: "" }])}
                                        style={{ background: "none", border: "1px dashed #1A7A52", color: "#1A7A52", borderRadius: 8, padding: "6px 16px", fontSize: 13, cursor: "pointer", marginBottom: 20 }}>
                                    + Ajouter un médicament
                                </button>
                                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                                    <button onClick={() => setOrdoModal(false)} style={{ background: "#F3F4F6", border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontSize: 14 }}>Annuler</button>
                                    <button onClick={handleOrdonnance} disabled={ordoLoading || medicaments.every(m => !m.nom.trim())}
                                            style={{ background: "linear-gradient(135deg,#1A7A52,#27A869)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                                        {ordoLoading ? <span className="spinner-border spinner-border-sm"></span> : "Créer l'ordonnance"}
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