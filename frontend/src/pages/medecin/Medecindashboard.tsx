import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/common/Statcard";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from '../../context/AuthContext';
import { rendezVousService, ordonnanceService, dossierService, type RendezVous, type Medecin, type Patient, type DossierMedical, type Ordonnance } from "../../services/DomainServices";
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
const ACCENT_DARK  = "#145C3D";

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

    const [selPatient, setSelPatient]           = useState<Patient | null>(null);
    const [dossier, setDossier]                 = useState<DossierMedical | null>(null);
    const [dossierLoading, setDossierLoading]   = useState(false);
    const [selOrdo, setSelOrdo]                 = useState<Ordonnance | null>(null);
    const [selRdvMotif, setSelRdvMotif]         = useState("");

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

    const handleAnnuler = async (rdvId: string) => {
        setActionLoading(rdvId + "_annuler");
        try { await rendezVousService.annuler(rdvId); await loadData(); }
        finally { setActionLoading(null); }
    };

    const openDossier = async (pat: Patient, motif: string) => {
        setSelPatient(pat);
        setSelRdvMotif(motif);
        setDossier(null);
        setSelOrdo(null);
        setDossierLoading(true);
        try {
            const dos = await dossierService.getByPatient(pat.id);
            setDossier(dos);
        } catch (e) {
            console.error("Dossier introuvable:", e);
        } finally {
            setDossierLoading(false);
        }
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
                                            <div style={{ flex: 1, cursor: "pointer" }} onClick={() => openDossier(rdv.patient, rdv.motif)}>
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
                                                    <>
                                                        <button onClick={() => { setTerminerRdv(rdv); setTerminerModal(true); }} disabled={!!actionLoading}
                                                                style={{ background: "#E0E7FF", color: "#3730A3", border: "none", borderRadius: 7, padding: "5px 11px", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>
                                                                Terminer
                                                        </button>
                                                        <button onClick={() => handleAnnuler(rdv.id)} disabled={!!actionLoading}
                                                            style={{ background: "#FEE2E2", color: "#991B1B", border: "none", borderRadius: 7, padding: "5px 11px", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>
                                                            {actionLoading === rdv.id + "_annuler"
                                                                ? <span className="spinner-border spinner-border-sm"></span>
                                                                : "Annuler"}
                                                        </button>
                                                    </>
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

            {/* ── Modal Terminer ── */}
            {terminerModal && terminerRdv && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 460, maxWidth: "90vw", border: "0.5px solid #EBEBEB" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0F0F0F" }}>Terminer le rendez-vous</h3>
                            <button onClick={() => setTerminerModal(false)}
                                style={{ background: "#F5F5F5", border: "none", width: 28, height: 28, borderRadius: 8, cursor: "pointer", color: "#6B6B6B", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                        </div>
                        <p style={{ color: "#9E9E9E", fontSize: 13, marginBottom: 16 }}>
                            Patient : {terminerRdv.patient?.prenom} {terminerRdv.patient?.nom}
                        </p>
                        <label style={{ fontSize: 12.5, fontWeight: 500, color: "#6B6B6B", display: "block", marginBottom: 6 }}>Diagnostic</label>
                        <textarea
                            value={terminerDiag}
                            onChange={e => setTerminerDiag(e.target.value)}
                            rows={4}
                            placeholder="Entrez le diagnostic..."
                            style={{ ...inp, resize: "vertical" }}
                        />
                        <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
                            <button onClick={() => setTerminerModal(false)}
                                style={{ background: "#F5F5F5", border: "none", borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontSize: 13.5, color: "#6B6B6B" }}>
                                Annuler
                            </button>
                            <button onClick={handleTerminer} disabled={!terminerDiag.trim() || !!actionLoading}
                                style={{ background: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "9px 22px", cursor: "pointer", fontSize: 13.5, fontWeight: 500 }}>
                                {actionLoading ? <span className="spinner-border spinner-border-sm"></span> : "Confirmer"}
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

            {/* ── Modal dossier ── */}
            {selPatient && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 18, width: 520, maxWidth: "90vw", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", border: "0.5px solid #EBEBEB" }}>

                        {/* En-tête modal */}
                        <div style={{ background: `linear-gradient(135deg, ${ACCENT}, #27A869)`, padding: "20px 24px", display: "flex", alignItems: "center", gap: 14, color: "#fff" }}>
                            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17 }}>
                                {selPatient.prenom?.[0]}{selPatient.nom?.[0]}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 16 }}>{selPatient.prenom} {selPatient.nom}</div>
                                <div style={{ opacity: 0.85, fontSize: 13 }}>{selPatient.email}</div>
                            </div>
                            <button onClick={() => { setSelPatient(null); setDossier(null); }}
                                    style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "#fff", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                        </div>

                        <div style={{ overflowY: "auto", padding: 24, flex: 1 }}>
                            {selRdvMotif && (
                                <div style={{ background: "#FEF9C3", padding: "12px 16px", borderRadius: 12, border: "0.5px solid #FEF08A", marginBottom: 20 }}>
                                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "#CA8A04", textTransform: "uppercase", marginBottom: 4 }}>Symptômes actuels</div>
                                    <div style={{ fontSize: 14, color: "#854D0E", fontWeight: 500 }}>{selRdvMotif}</div>
                                </div>
                            )}

                            {dossierLoading ? (
                                <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                                    <div className="spinner-border" style={{ color: ACCENT }}></div>
                                </div>
                            ) : !dossier ? (
                                <div style={{ textAlign: "center", padding: "40px 0", color: "#BDBDBD" }}>
                                    <i className="bi bi-folder-x" style={{ fontSize: 44 }}></i>
                                    <div style={{ marginTop: 12, fontSize: 15 }}>Dossier médical introuvable</div>
                                </div>
                            ) : selOrdo ? (
                                <>
                                    <button onClick={() => setSelOrdo(null)} style={{ background: "#F5F5F5", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", marginBottom: 16 }}>
                                        ← Retour au dossier
                                    </button>
                                    <div style={{ background: "#F0FDF4", borderRadius: 12, padding: 16, border: "0.5px solid #BBF7D0", marginBottom: 12 }}>
                                        <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 4 }}>Date de prescription</div>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{selOrdo.date ? new Date(selOrdo.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}</div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {Object.entries(selOrdo.medicaments || {}).map(([med, pos]) => (
                                            <div key={med} style={{ padding: "12px 14px", borderRadius: 10, background: "#F0FDF4", border: "0.5px solid #BBF7D0" }}>
                                                <div style={{ fontWeight: 700, color: "#065F46", fontSize: 14 }}><i className="bi bi-capsule me-2"></i>{med}</div>
                                                <div style={{ fontSize: 13, color: "#047857", marginTop: 3 }}>{pos}</div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                                        {[
                                            { icon: "bi-lungs", label: "Allergies", value: dossier.allergies, color: "#EF4444", bg: "#FEE2E2" },
                                            { icon: "bi-activity", label: "Poids", value: dossier.poids ? `${dossier.poids} kg` : undefined, color: "#0EA5E9", bg: "#E0F2FE" },
                                            { icon: "bi-arrows-vertical", label: "Taille", value: dossier.taille ? `${dossier.taille} cm` : undefined, color: "#8B5CF6", bg: "#EDE9FE" },
                                        ].map(item => (
                                            <div key={item.label} style={{ background: item.bg, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                                                <i className={`bi ${item.icon}`} style={{ color: item.color, fontSize: 20 }}></i>
                                                <div style={{ fontSize: 11, color: "#9E9E9E", marginTop: 6 }}>{item.label}</div>
                                                <div style={{ fontWeight: 700, fontSize: 14, color: "#0F0F0F", marginTop: 2 }}>{item.value || "—"}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ fontSize: 13, fontWeight: 600, color: "#9E9E9E", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                        Ordonnances ({dossier.ordonnances?.length ?? 0})
                                    </div>
                                    {!dossier.ordonnances?.length ? (
                                        <div style={{ textAlign: "center", padding: "24px 0", color: "#BDBDBD", fontSize: 14 }}>Aucune ordonnance</div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            {dossier.ordonnances.map(o => (
                                                <div key={o.id} onClick={() => setSelOrdo(o)}
                                                     style={{ padding: "12px 14px", borderRadius: 10, background: "#FAFAFA", border: "0.5px solid #EBEBEB", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                                                     onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = ACCENT}
                                                     onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "#EBEBEB"}>
                                                    <i className="bi bi-file-earmark-medical" style={{ color: ACCENT, fontSize: 18 }}></i>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{Object.keys(o.medicaments || {}).length} médicament(s)</div>
                                                        <div style={{ fontSize: 12, color: "#9E9E9E" }}>{o.date ? new Date(o.date).toLocaleDateString("fr-FR") : "—"}</div>
                                                    </div>
                                                    <i className="bi bi-chevron-right" style={{ color: "#BDBDBD" }}></i>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}