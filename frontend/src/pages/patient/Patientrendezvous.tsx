import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatusBadge from "../../components/common/StatusBadge";
import {
    patientService, rendezVousService, medecinService, disponibiliteService,
    type Patient, type RendezVous, type Medecin, type Disponibilite,
} from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",         label: "Tableau de bord",  path: "/dashboard/patient" },
    { icon: "bi-calendar-check",       label: "Mes rendez-vous",  path: "/dashboard/patient/rendez-vous" },
    { icon: "bi-folder2-open",         label: "Mon dossier",      path: "/dashboard/patient/dossier" },
    { icon: "bi-file-earmark-medical", label: "Ordonnances",      path: "/dashboard/patient/ordonnances" },
    { icon: "bi-person-gear",          label: "Mon profil",       path: "/dashboard/patient/profil" },
];

const ACCENT = "#0EA5E9";
const fmt = (t: string) => t?.slice(0, 5) ?? "";
const inp: React.CSSProperties = { borderRadius: 8, border: "0.5px solid #EBEBEB", padding: "9px 12px", fontSize: 14, width: "100%", boxSizing: "border-box", outline: "none", background: "#FAFAFA" };

export default function PatientRendezVous() {
    const [patient, setPatient]           = useState<Patient | null>(null);
    const [rdvs, setRdvs]                 = useState<RendezVous[]>([]);
    // ✅ FIX: loading commence à false — on le passe à true explicitement dans loadAll
    const [loading, setLoading]           = useState(false);
    const [page, setPage]                 = useState(0);
    const [totalPages, setTotalPages]     = useState(0);
    const [filterStatut, setFilterStatut] = useState("TOUS");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [initError, setInitError]       = useState("");

    // Modal
    const [modal, setModal]               = useState(false);
    const [step, setStep]                 = useState<1|2>(1);
    const [medecins, setMedecins]         = useState<Medecin[]>([]);
    const [selMedecin, setSelMedecin]     = useState<Medecin | null>(null);
    const [dispos, setDispos]             = useState<Disponibilite[]>([]);
    const [disposLoading, setDisposLoading] = useState(false);
    const [selDispo, setSelDispo]         = useState<Disponibilite | null>(null);
    const [motif, setMotif]               = useState("");
    const [formLoading, setFormLoading]   = useState(false);
    const [formError, setFormError]       = useState("");
    const [formSuccess, setFormSuccess]   = useState(false);

    // ── FIX: une seule fonction init qui gère loading ET les erreurs ──────────
    const loadRdvs = useCallback(async (pat: Patient, pg: number) => {
        setLoading(true);
        try {
            const data = await rendezVousService.getByPatient(pat.id, pg, 8);
            setRdvs(data.content);
            setTotalPages(data.totalPages);
            setPage(pg);
        } catch (e) {
            console.error("Erreur chargement RDV:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ FIX: try/catch global — si getMe() échoue, loading repasse à false
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const pat = await patientService.getMe();
                setPatient(pat);
                await loadRdvs(pat, 0);
            } catch (e: any) {
                console.error("Erreur init patient:", e);
                setInitError(e?.response?.data?.message || "Impossible de charger vos informations.");
                setLoading(false); // ← crucial : évite le spinner infini
            }
        })();
    }, [loadRdvs]);

    // ── Actions ───────────────────────────────────────────────────────────────
    const handleAnnuler = async (id: string) => {
        setActionLoading(id);
        try { await rendezVousService.annuler(id); if (patient) await loadRdvs(patient, page); }
        finally { setActionLoading(null); }
    };

    // ── Ouverture modal ───────────────────────────────────────────────────────
    const openModal = async () => {
        setModal(true); setStep(1); setSelMedecin(null); setDispos([]); setSelDispo(null);
        setMotif(""); setFormError(""); setFormSuccess(false);
        try {
            const data = await medecinService.getDisponibles();
            setMedecins(data);
        } catch (e) {
            console.error("Erreur chargement médecins:", e);
            setMedecins([]);
        }
    };

    // ── Sélection médecin → charge créneaux libres ────────────────────────────
    const handleSelectMedecin = async (med: Medecin) => {
        setSelMedecin(med);
        setSelDispo(null);
        setDisposLoading(true);
        setStep(2);
        try {
            const data = await disponibiliteService.getLibres(med.id);
            setDispos(data);
        } catch (e) {
            console.error("Erreur chargement créneaux:", e);
            setDispos([]);
        } finally { setDisposLoading(false); }
    };

    // ── Prise de RDV ─────────────────────────────────────────────────────────
    const handlePrendreRdv = async () => {
        if (!patient || !selMedecin || !selDispo) return;
        setFormLoading(true); setFormError("");
        try {
            await rendezVousService.prendre({
                patientId:       patient.id,
                medecinId:       selMedecin.id,
                date:            selDispo.date,
                heure:           selDispo.heureDebut,
                motif,
                disponibiliteId: selDispo.id,
            });
            setFormSuccess(true);
            await loadRdvs(patient, 0);
            setTimeout(() => { setModal(false); setFormSuccess(false); }, 1800);
        } catch (e: any) {
            setFormError(e?.response?.data?.message || "Erreur lors de la prise de rendez-vous");
        } finally { setFormLoading(false); }
    };

    const filtered = filterStatut === "TOUS" ? rdvs : rdvs.filter(r => r.statut === filterStatut);

    return (
        <DashboardLayout navItems={NAV} title="Mes rendez-vous" accentColor={ACCENT}>

            {/* Toolbar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["TOUS","EN_ATTENTE","CONFIRME","TERMINE","ANNULE"].map(s => (
                        <button key={s} onClick={() => setFilterStatut(s)}
                                style={{ background: filterStatut === s ? ACCENT : "#F5F5F5", color: filterStatut === s ? "#fff" : "#6B6B6B", border: "none", borderRadius: 20, padding: "5px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            {s === "TOUS" ? "Tous" : s.replace("_", " ")}
                        </button>
                    ))}
                </div>
                <button onClick={openModal}
                        style={{ background: `linear-gradient(135deg,#0369A1,${ACCENT})`, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="bi bi-calendar-plus"></i>Nouveau RDV
                </button>
            </div>

            {/* Erreur init */}
            {initError && (
                <div className="alert alert-danger mb-3" style={{ borderRadius: 12 }}>
                    <i className="bi bi-exclamation-triangle me-2"></i>{initError}
                </div>
            )}

            {/* Liste RDV */}
            <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "0.5px solid #EBEBEB", display: "flex", flexDirection: "column", gap: 10 }}>
                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
                        <div className="spinner-border" style={{ color: ACCENT }}></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#BDBDBD" }}>
                        <i className="bi bi-calendar-x" style={{ fontSize: 48 }}></i>
                        <div style={{ marginTop: 16, fontSize: 16 }}>Aucun rendez-vous trouvé</div>
                    </div>
                ) : filtered.map(rdv => (
                    <div key={rdv.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: "#FAFAFA", border: "0.5px solid #EBEBEB", flexWrap: "wrap" }}>
                        <div style={{ textAlign: "center", minWidth: 52, background: "#E0F2FE", borderRadius: 10, padding: "8px 6px" }}>
                            <div style={{ fontSize: 20, fontWeight: 800, color: ACCENT, lineHeight: 1 }}>{rdv.date?.slice(8, 10)}</div>
                            <div style={{ fontSize: 10, color: "#0369A1", textTransform: "uppercase", fontWeight: 600 }}>
                                {rdv.date ? new Date(rdv.date + "T00:00:00").toLocaleDateString("fr-FR", { month: "short" }) : ""}
                            </div>
                            <div style={{ fontSize: 12, color: "#0369A1", fontWeight: 600, marginTop: 2 }}>{fmt(rdv.heure)}</div>
                        </div>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${ACCENT}18`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: ACCENT, fontSize: 14, flexShrink: 0 }}>
                            {rdv.medecin?.prenom?.[0]}{rdv.medecin?.nom?.[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>Dr. {rdv.medecin?.prenom} {rdv.medecin?.nom}</div>
                            <div style={{ fontSize: 12, color: "#9E9E9E" }}>{rdv.medecin?.specialite}</div>
                            <div style={{ fontSize: 12, color: "#BDBDBD", marginTop: 2 }}><i className="bi bi-chat-text me-1"></i>{rdv.motif}</div>
                        </div>
                        <StatusBadge status={rdv.statut} />
                        {(rdv.statut === "EN_ATTENTE" || rdv.statut === "CONFIRME") && (
                            <button onClick={() => handleAnnuler(rdv.id)} disabled={!!actionLoading}
                                    style={{ background: "#FEE2E2", color: "#991B1B", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                {actionLoading === rdv.id ? <span className="spinner-border spinner-border-sm"></span> : "Annuler"}
                            </button>
                        )}
                    </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
                        <button onClick={() => patient && loadRdvs(patient, page - 1)} disabled={page === 0}
                                style={{ background: "#F5F5F5", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>‹</button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button key={i} onClick={() => patient && loadRdvs(patient, i)}
                                    style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: page === i ? ACCENT : "#F5F5F5", color: page === i ? "#fff" : "#374151", cursor: "pointer", fontWeight: 600 }}>{i + 1}</button>
                        ))}
                        <button onClick={() => patient && loadRdvs(patient, page + 1)} disabled={page === totalPages - 1}
                                style={{ background: "#F5F5F5", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>›</button>
                    </div>
                )}
            </div>

            {/* ── Modal prise RDV ── */}
            {modal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 18, width: 520, maxWidth: "90vw", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>

                        {/* En-tête modal */}
                        <div style={{ background: `linear-gradient(135deg,#0369A1,${ACCENT})`, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fff" }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 16 }}>Nouveau rendez-vous</div>
                                <div style={{ opacity: 0.8, fontSize: 13, marginTop: 2 }}>
                                    {step === 1 ? "Étape 1 — Choisir un médecin" : `Étape 2 — Créneaux de Dr. ${selMedecin?.prenom} ${selMedecin?.nom}`}
                                </div>
                            </div>
                            <button onClick={() => setModal(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "#fff", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                        </div>

                        <div style={{ overflowY: "auto", padding: 24, flex: 1 }}>
                            {formSuccess ? (
                                <div style={{ textAlign: "center", padding: "48px 0" }}>
                                    <div style={{ fontSize: 56 }}>✅</div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: "#1A7A52", marginTop: 12 }}>Rendez-vous pris !</div>
                                    <div style={{ fontSize: 13, color: "#9E9E9E", marginTop: 6 }}>{selDispo?.date} à {fmt(selDispo?.heureDebut || "")}</div>
                                </div>
                            ) : step === 1 ? (
                                /* ── Étape 1 : Sélectionner un médecin ── */
                                <>
                                    {formError && <div className="alert alert-danger py-2 small mb-3">{formError}</div>}
                                    <p style={{ fontSize: 13, color: "#9E9E9E", marginBottom: 16 }}>Sélectionnez un médecin parmi ceux qui ont des créneaux disponibles :</p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {medecins.length === 0 ? (
                                            <div style={{ textAlign: "center", padding: 40, color: "#BDBDBD" }}>
                                                <i className="bi bi-person-x" style={{ fontSize: 40 }}></i>
                                                <div style={{ marginTop: 12 }}>Aucun médecin disponible pour le moment</div>
                                            </div>
                                        ) : medecins.map(m => (
                                            <div key={m.id} onClick={() => handleSelectMedecin(m)}
                                                 style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderRadius: 12, border: "0.5px solid #EBEBEB", cursor: "pointer", transition: "all 0.15s" }}
                                                 onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = ACCENT; el.style.background = "#F0F9FF"; }}
                                                 onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#EBEBEB"; el.style.background = ""; }}>
                                                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${ACCENT}18`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: ACCENT, fontSize: 15, flexShrink: 0 }}>
                                                    {m.prenom?.[0]}{m.nom?.[0]}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600, fontSize: 14 }}>Dr. {m.prenom} {m.nom}</div>
                                                    <div style={{ fontSize: 12, color: "#9E9E9E" }}>{m.specialite}</div>
                                                    {m.hopital?.nom && <div style={{ fontSize: 11, color: "#BDBDBD" }}><i className="bi bi-hospital me-1"></i>{m.hopital.nom}</div>}
                                                </div>
                                                <i className="bi bi-chevron-right" style={{ color: "#BDBDBD" }}></i>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                /* ── Étape 2 : Sélectionner un créneau ── */
                                <>
                                    <button onClick={() => { setStep(1); setSelDispo(null); }}
                                            style={{ background: "#F5F5F5", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", marginBottom: 16 }}>
                                        ← Changer de médecin
                                    </button>

                                    {formError && <div className="alert alert-danger py-2 small mb-3">{formError}</div>}

                                    {disposLoading ? (
                                        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                                            <div className="spinner-border" style={{ color: ACCENT }}></div>
                                        </div>
                                    ) : dispos.length === 0 ? (
                                        <div style={{ textAlign: "center", padding: "40px 0", color: "#BDBDBD" }}>
                                            <i className="bi bi-calendar-x" style={{ fontSize: 40 }}></i>
                                            <div style={{ marginTop: 12, fontSize: 15 }}>Aucun créneau disponible</div>
                                            <div style={{ fontSize: 13, marginTop: 6 }}>Ce médecin n'a pas encore renseigné ses disponibilités</div>
                                        </div>
                                    ) : (
                                        <>
                                            <p style={{ fontSize: 13, color: "#9E9E9E", marginBottom: 14 }}>Choisissez un créneau :</p>

                                            {Object.entries(
                                                dispos.reduce<Record<string, Disponibilite[]>>((acc, d) => {
                                                    (acc[d.date] = acc[d.date] || []).push(d); return acc;
                                                }, {})
                                            ).sort(([a], [b]) => a.localeCompare(b)).map(([date, slots]) => (
                                                <div key={date} style={{ marginBottom: 16 }}>
                                                    <div style={{ fontSize: 12, fontWeight: 600, color: "#9E9E9E", textTransform: "uppercase", marginBottom: 8 }}>
                                                        {new Date(date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                                                    </div>
                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                        {slots.sort((a, b) => a.heureDebut.localeCompare(b.heureDebut)).map(d => {
                                                            const isSelected = selDispo?.id === d.id;
                                                            return (
                                                                <button key={d.id} onClick={() => setSelDispo(d)}
                                                                        style={{ background: isSelected ? ACCENT : "#F0F9FF", color: isSelected ? "#fff" : "#0369A1", border: `2px solid ${isSelected ? ACCENT : "#BAE6FD"}`, borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
                                                                    {fmt(d.heureDebut)} – {fmt(d.heureFin)}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Motif */}
                                            {selDispo && (
                                                <div style={{ marginTop: 8 }}>
                                                    <label style={{ fontSize: 12.5, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 6 }}>Motif de consultation</label>
                                                    <textarea value={motif} onChange={e => setMotif(e.target.value)} rows={3}
                                                              placeholder="Décrivez le motif..." style={{ ...inp, resize: "vertical" }} />
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {selDispo && (
                                        <div style={{ marginTop: 20 }}>
                                            <div style={{ background: "#F0FDF4", border: "0.5px solid #BBF7D0", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>
                                                <div style={{ fontWeight: 600, color: "#065F46", marginBottom: 4 }}>Récapitulatif</div>
                                                <div style={{ color: "#047857" }}>
                                                    Dr. {selMedecin?.prenom} {selMedecin?.nom} · {selDispo.date} · {fmt(selDispo.heureDebut)}–{fmt(selDispo.heureFin)}
                                                </div>
                                            </div>
                                            <button onClick={handlePrendreRdv} disabled={formLoading || !motif.trim()}
                                                    style={{ background: `linear-gradient(135deg,#0369A1,${ACCENT})`, color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700, cursor: formLoading || !motif.trim() ? "not-allowed" : "pointer", fontSize: 14, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                                {formLoading ? <><span className="spinner-border spinner-border-sm"></span> En cours...</> : <><i className="bi bi-check-circle"></i> Confirmer le rendez-vous</>}
                                            </button>
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