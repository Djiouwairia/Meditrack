import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/common/Statcard";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { rendezVousService, ordonnanceService, dossierService, type RendezVous, type Medecin, type Patient } from "../../services/DomainServices";
import api from "../../services/api";

const NAV = [
    { icon: "bi-speedometer2",         label: "Tableau de bord",   path: "/dashboard/medecin" },
    { icon: "bi-calendar-check",       label: "Mon agenda",         path: "/dashboard/medecin/agenda" },
    { icon: "bi-people",               label: "Mes patients",       path: "/dashboard/medecin/patients" },
    { icon: "bi-file-earmark-medical", label: "Ordonnances",        path: "/dashboard/medecin/ordonnances" },
    { icon: "bi-person-gear",          label: "Mon profil",         path: "/dashboard/medecin/profil" },
];

const ACCENT       = "#1A7A52";
const ACCENT_LIGHT = "#E8F5EE";
const inp = {
    width: "100%",
    borderRadius: 8,
    border: "0.5px solid #EBEBEB",
    padding: "9px 12px",
    fontSize: 14,
    boxSizing: "border-box" as const,
    outline: "none",
    background: "#FAFAFA",
    color: "#0F0F0F"
};

function fmtTime(t: string) {
    return t?.slice(0, 5) || "";
}

export default function MedecinDashboard() {
    const { user } = useAuth();
    const [medecin, setMedecin]               = useState<Medecin | null>(null);
    const [rdvAujourdhui, setRdvAujourdhui]   = useState<RendezVous[]>([]);
    const [loading, setLoading]               = useState(true);
    const [actionLoading, setActionLoading]   = useState<string | null>(null);

    const [ordoModal, setOrdoModal]       = useState(false);
    const [selectedRdv, setSelectedRdv]   = useState<RendezVous | null>(null);
    const [medicaments, setMedicaments]   = useState<{ nom: string; posologie: string }[]>([{ nom: "", posologie: "" }]);
    const [ordoLoading, setOrdoLoading]   = useState(false);
    const [ordoSuccess, setOrdoSuccess]   = useState(false);

    const [terminerModal, setTerminerModal] = useState(false);
    const [terminerRdv, setTerminerRdv]     = useState<RendezVous | null>(null);
    const [terminerDiag, setTerminerDiag]   = useState("");
    const [terminerConstantes, setTerminerConstantes] = useState({ tension: "", temperature: "", poids: "" });
    const [terminerDossierId, setTerminerDossierId] = useState<string | null>(null);

    const navigate = useNavigate();

    const loadData = useCallback(async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            const med: Medecin = await api.get("/medecins/me").then(r => r.data);
            setMedecin(med);
            const rdvs = await rendezVousService.getAujourdhui(med.id);
            setRdvAujourdhui(rdvs.filter(r => r.statut === "CONFIRME" || r.statut === "TERMINE"));
        } catch (e) {
            console.error("Erreur chargement dashboard médecin:", e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { loadData(); }, [loadData]);


    const openDossier = (pat: Patient) => {
        navigate("/dashboard/medecin/patients/" + pat.id);
    };

    const openTerminerModal = async (rdv: RendezVous) => {
        setTerminerRdv(rdv);
        setTerminerDiag("");
        setTerminerConstantes({ tension: "", temperature: "", poids: "" });
        setTerminerDossierId(null);
        setTerminerModal(true);
        try {
            const dos = await dossierService.getByPatient(rdv.patient.id);
            if (dos && dos.id) {
                setTerminerDossierId(dos.id);
                setTerminerConstantes({ tension: dos.tension || "", temperature: dos.temperature || "", poids: dos.poids || "" });
            }
        } catch(e) { console.error(e); }
    };

    const handleTerminer = async () => {
        if (!terminerRdv) return;
        setActionLoading(terminerRdv.id + "_terminer");
        try {
            let did = terminerDossierId;
            if (!did) {
                const newDos = await dossierService.create(terminerRdv.patient.id);
                did = newDos.id;
            }
            if (did && (terminerConstantes.tension || terminerConstantes.temperature || terminerConstantes.poids)) {
                await dossierService.update(did, { 
                    tension: terminerConstantes.tension, 
                    temperature: terminerConstantes.temperature, 
                    poids: terminerConstantes.poids 
                });
            }
            await rendezVousService.terminer(terminerRdv.id, terminerDiag);
            setTerminerModal(false);
            await loadData();
        } catch(e) {
            console.error(e);
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
        termines:  rdvAujourdhui.filter(r => r.statut === "TERMINE").length,
    };

    return (
        <DashboardLayout navItems={NAV} title="Tableau de bord" >
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
                    <div className="spinner-border" style={{ color: ACCENT }}></div>
                </div>
            ) : (
                <>
                    {/* ── Banner ── */}
                    <div style={{ background: "#fff", border: "0.5px solid #EBEBEB", borderRadius: 14, padding: "20px 24px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <div style={{ fontSize: 11, color: "#4b4a4a", fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 4 }}>
                                Bonjour 👋
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 600, color: "#0F0F0F", letterSpacing: "-0.3px" }}>
                                Dr. {medecin?.prenom} {medecin?.nom} 
                            </div>
                            <div style={{ fontSize: 12.5, color: "#9E9E9E", marginTop: 3 }}>
                                {medecin?.specialite} · {medecin?.hopital?.nom}
                            </div>
                        </div>

                        
                    </div>

                    {/* ── Stat cards ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12, marginBottom: 20 }}>
                        <StatCard icon="bi-calendar-day"    label="RDV aujourd'hui" value={stats.total}     color={ACCENT}    bg={ACCENT_LIGHT} />
                        <StatCard icon="bi-check-circle"    label="Confirmés"       value={stats.confirmes} color="#0EA5E9"   bg="#E0F2FE" />
                        <StatCard icon="bi-check2-all"      label="Terminés"        value={stats.termines}  color="#8B5CF6"   bg="#EDE9FE" />
                    </div>

                    {/* ── Agenda du jour ── */}
                    <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #EBEBEB" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "0.5px solid #EBEBEB" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: ACCENT_LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <i className="bi bi-calendar-check" style={{ color: ACCENT, fontSize: 13 }}></i>
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 600, color: "#0F0F0F" }}>Agenda du jour</span>
                            </div>
                            <span style={{ fontSize: 12, color: "#BDBDBD", fontFamily: "'DM Mono', monospace" }}>
                                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                            </span>
                        </div>

                        {rdvAujourdhui.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "48px 0", color: "#BDBDBD" }}>
                                <i className="bi bi-calendar2-x" style={{ fontSize: 36 }}></i>
                                <div style={{ marginTop: 10, fontSize: 14 }}>Aucun rendez-vous aujourd'hui</div>
                            </div>
                        ) : (
                            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                                {rdvAujourdhui
                                    .sort((a, b) => a.heure.localeCompare(b.heure))
                                    .map(rdv => (
                                        <div key={rdv.id}
                                            style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 10, background: "#FAFAFA", border: "0.5px solid #EBEBEB", transition: "border-color 0.15s" }}
                                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "#BDBDBD"}
                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "#EBEBEB"}>

                                            {/* Heure */}
                                            <div style={{ textAlign: "center", minWidth: 46 }}>
                                                <div style={{ fontSize: 15, fontWeight: 600, color: ACCENT, fontFamily: "'DM Mono', monospace" }}>
                                                    {fmtTime(rdv.heure)}
                                                </div>
                                            </div>

                                            {/* Avatar */}
                                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: ACCENT_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, color: ACCENT, fontSize: 13, flexShrink: 0 }}>
                                                {rdv.patient?.prenom?.[0]}{rdv.patient?.nom?.[0]}
                                            </div>

                                            {/* Infos */}
                                            <div style={{ flex: 1, cursor: "pointer" }} onClick={() => openDossier(rdv.patient)}>
                                                <div style={{ fontWeight: 500, fontSize: 13.5, color: "#0F0F0F", display: "flex", alignItems: "center", gap: 6 }}>
                                                    {rdv.patient?.prenom} {rdv.patient?.nom}
                                                    <i className="bi bi-folder2-open" style={{ color: ACCENT, fontSize: 13 }} title="Voir le dossier médical"></i>
                                                </div>
                                                <div style={{ fontSize: 12, color: "#9E9E9E", marginTop: 2 }}>{rdv.motif}</div>
                                            </div>

                                            <StatusBadge status={rdv.statut} />

                                            {/* Actions */}
                                            <div style={{ display: "flex", gap: 6 }}>
                                                {rdv.statut === "CONFIRME" && (
                                                    <button onClick={() => openTerminerModal(rdv)} disabled={!!actionLoading}
                                                            style={{ background: "#E0E7FF", color: "#3730A3", border: "none", borderRadius: 7, padding: "5px 11px", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>
                                                            Terminer
                                                    </button>
                                                )}
                                                {rdv.statut === "TERMINE" && (
                                                    <button onClick={() => { setSelectedRdv(rdv); setOrdoModal(true); }}
                                                        style={{ background: ACCENT_LIGHT, color: ACCENT, border: `0.5px solid #A7D7BE`, borderRadius: 7, padding: "5px 11px", fontSize: 11.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                                                        <i className="bi bi-file-earmark-plus"></i> Ordonnance
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

            {/* ── Modal Terminer / Consultation ── */}
            {terminerModal && terminerRdv && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 540, maxWidth: "90vw", border: "0.5px solid #EBEBEB", maxHeight: "90vh", overflowY: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: "50%", background: ACCENT_LIGHT, color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                                    <i className="bi bi-clipboard2-pulse"></i>
                                </div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F0F0F" }}>Clôturer la consultation</h3>
                            </div>
                            <button onClick={() => setTerminerModal(false)}
                                style={{ background: "#F5F5F5", border: "none", width: 28, height: 28, borderRadius: 8, cursor: "pointer", color: "#6B6B6B", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                        </div>

                        <div style={{ background: "#FAFAFA", borderRadius: 10, padding: 12, marginBottom: 20, border: "0.5px solid #EBEBEB" }}>
                            <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 4 }}>Patient</div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "#0F0F0F" }}>{terminerRdv.patient?.prenom} {terminerRdv.patient?.nom}</div>
                            <div style={{ fontSize: 12.5, color: "#6B6B6B", marginTop: 4 }}>Motif : {terminerRdv.motif}</div>
                        </div>

                        <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, marginBottom: 10, borderBottom: "1px solid #EBEBEB", paddingBottom: 6 }}>
                            <i className="bi bi-activity me-2"></i>Constantes du jour
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 4 }}>Tension</label>
                                <input value={terminerConstantes.tension} onChange={e => setTerminerConstantes(c => ({...c, tension: e.target.value}))} placeholder="Ex: 12/8" style={inp} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 4 }}>Temp. (°C)</label>
                                <input value={terminerConstantes.temperature} onChange={e => setTerminerConstantes(c => ({...c, temperature: e.target.value}))} placeholder="Ex: 38.5" style={inp} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 4 }}>Poids (kg)</label>
                                <input value={terminerConstantes.poids} onChange={e => setTerminerConstantes(c => ({...c, poids: e.target.value}))} placeholder="Ex: 70" style={inp} />
                            </div>
                        </div>

                        <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, marginBottom: 10, borderBottom: "1px solid #EBEBEB", paddingBottom: 6 }}>
                            <i className="bi bi-file-medical me-2"></i>Conclusion
                        </div>
                        <label style={{ fontSize: 12.5, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 6 }}>Diagnostic</label>
                        <textarea
                            value={terminerDiag}
                            onChange={e => setTerminerDiag(e.target.value)}
                            rows={3}
                            placeholder="Saisissez le diagnostic final..."
                            style={{ ...inp, resize: "vertical" }}
                        />

                        <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
                            <button onClick={() => setTerminerModal(false)}
                                style={{ background: "#F5F5F5", border: "none", borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontSize: 13.5, color: "#6B6B6B", fontWeight: 600 }}>
                                Annuler
                            </button>
                            <button onClick={handleTerminer} disabled={!terminerDiag.trim() || !!actionLoading}
                                style={{ background: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "9px 22px", cursor: "pointer", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                                {actionLoading ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-check2-circle"></i> Enregistrer et Terminer</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal Ordonnance ── */}
            {ordoModal && selectedRdv && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 520, maxWidth: "90vw", border: "0.5px solid #EBEBEB" }}>
                        {ordoSuccess ? (
                            <div style={{ textAlign: "center", padding: "32px 0" }}>
                                <div style={{ fontSize: 48 }}>✅</div>
                                <div style={{ fontSize: 16, fontWeight: 600, color: ACCENT, marginTop: 12 }}>Ordonnance créée !</div>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0F0F0F" }}>Nouvelle ordonnance</h3>
                                    <button onClick={() => setOrdoModal(false)}
                                        style={{ background: "#F5F5F5", border: "none", width: 28, height: 28, borderRadius: 8, cursor: "pointer", color: "#6B6B6B", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                                </div>
                                <p style={{ color: "#9E9E9E", fontSize: 13, marginBottom: 16 }}>
                                    Patient : {selectedRdv.patient?.prenom} {selectedRdv.patient?.nom}
                                </p>

                                <label style={{ fontSize: 12.5, fontWeight: 500, color: "#6B6B6B", display: "block", marginBottom: 8 }}>Médicaments</label>
                                {medicaments.map((m, i) => (
                                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                        <input
                                            placeholder="Médicament"
                                            value={m.nom}
                                            onChange={e => { const copy = [...medicaments]; copy[i].nom = e.target.value; setMedicaments(copy); }}
                                            style={{ flex: 1, borderRadius: 8, border: "0.5px solid #EBEBEB", padding: "8px 12px", fontSize: 13, outline: "none", background: "#FAFAFA" }}
                                        />
                                        <input
                                            placeholder="Posologie"
                                            value={m.posologie}
                                            onChange={e => { const copy = [...medicaments]; copy[i].posologie = e.target.value; setMedicaments(copy); }}
                                            style={{ flex: 1, borderRadius: 8, border: "0.5px solid #EBEBEB", padding: "8px 12px", fontSize: 13, outline: "none", background: "#FAFAFA" }}
                                        />
                                        {medicaments.length > 1 && (
                                            <button onClick={() => setMedicaments(medicaments.filter((_, j) => j !== i))}
                                                style={{ background: "#FEE2E2", border: "none", borderRadius: 8, padding: "0 10px", color: "#991B1B", cursor: "pointer" }}>✕</button>
                                        )}
                                    </div>
                                ))}

                                <button onClick={() => setMedicaments([...medicaments, { nom: "", posologie: "" }])}
                                    style={{ background: "none", border: `0.5px dashed ${ACCENT}`, color: ACCENT, borderRadius: 8, padding: "6px 14px", fontSize: 12.5, cursor: "pointer", marginBottom: 20 }}>
                                    + Ajouter un médicament
                                </button>

                                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                                    <button onClick={() => setOrdoModal(false)}
                                        style={{ background: "#F5F5F5", border: "none", borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontSize: 13.5, color: "#6B6B6B" }}>
                                        Annuler
                                    </button>
                                    <button onClick={handleOrdonnance} disabled={ordoLoading || medicaments.every(m => !m.nom.trim())}
                                        style={{ background: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "9px 22px", cursor: "pointer", fontSize: 13.5, fontWeight: 500 }}>
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