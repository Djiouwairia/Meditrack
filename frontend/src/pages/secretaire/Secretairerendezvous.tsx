import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatusBadge from "../../components/common/StatusBadge";
import {
    secretaireService, patientService, medecinService, rendezVousService, disponibiliteService,
    type Secretaire, type Patient, type Medecin, type RendezVous, type Disponibilite,
} from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",   label: "Tableau de bord", path: "/dashboard/secretaire" },
    { icon: "bi-people",         label: "Patients",         path: "/dashboard/secretaire/patients" },
    { icon: "bi-calendar-check", label: "Rendez-vous",      path: "/dashboard/secretaire/rendez-vous" },
    { icon: "bi-person-gear",    label: "Mon profil",       path: "/dashboard/secretaire/profil" },
];

const ACCENT = "#27A869";
const fmt = (t: string) => t?.slice(0, 5) ?? "";
const inp: React.CSSProperties = { width: "100%", borderRadius: 8, border: "0.5px solid #EBEBEB", padding: "9px 12px", fontSize: 14, boxSizing: "border-box", outline: "none", background: "#FAFAFA" };

export default function SecretaireRendezVous() {
    // ✅ FIX: plus de useAuth() pour résoudre la secrétaire — on utilise getMe()
    const [secretaire, setSecretaire]   = useState<Secretaire | null>(null);
    const [patients, setPatients]       = useState<Patient[]>([]);
    const [medecins, setMedecins]       = useState<Medecin[]>([]);
    const [rdvs, setRdvs]               = useState<RendezVous[]>([]);
    const [loading, setLoading]         = useState(true);
    const [filterStatut, setFilterStatut] = useState("TOUS");
    const [search, setSearch]           = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [initError, setInitError]     = useState("");

    // Modal nouveau RDV — étapes
    const [modal, setModal]             = useState(false);
    const [step, setStep]               = useState<1|2|3>(1);
    const [selPatient, setSelPatient]   = useState<Patient | null>(null);
    const [selMedecin, setSelMedecin]   = useState<Medecin | null>(null);
    const [dispos, setDispos]           = useState<Disponibilite[]>([]);
    const [disposLoading, setDisposLoading] = useState(false);
    const [selDispo, setSelDispo]       = useState<Disponibilite | null>(null);
    const [motif, setMotif]             = useState("");
    const [formLoading, setFormLoading] = useState(false);
    const [formSuccess, setFormSuccess] = useState(false);
    const [formError, setFormError]     = useState("");

    // Modal terminer
    const [terminerRdv, setTerminerRdv] = useState<RendezVous | null>(null);
    const [diag, setDiag]               = useState("");
    const [diagLoading, setDiagLoading] = useState(false);

    // ── FIX: chargement des RDV en parallèle au lieu de boucle séquentielle ──
    const loadRdvs = useCallback(async (patientList: Patient[]) => {
        const results = await Promise.allSettled(
            patientList.slice(0, 40).map(p =>
                rendezVousService.getByPatient(p.id, 0, 50).then(d => d.content).catch(() => [] as RendezVous[])
            )
        );
        const allRdvs: RendezVous[] = results.flatMap(r => r.status === "fulfilled" ? r.value : []);
        const seen = new Set<string>();
        return allRdvs
            .filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; })
            .sort((a, b) => b.date.localeCompare(a.date) || b.heure.localeCompare(a.heure));
    }, []);

    // ✅ FIX: getMe() remplace getAll().find(email) — fiable et atomique
    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [sec, patPage, medPage] = await Promise.all([
                secretaireService.getMe(),
                patientService.getAll(0, 200),
                medecinService.getAll(0, 100),
            ]);
            setSecretaire(sec);
            setPatients(patPage.content);
            setMedecins(medPage.content);
            const rdvList = await loadRdvs(patPage.content);
            setRdvs(rdvList);
        } catch (e: any) {
            console.error("Erreur init secrétaire:", e);
            setInitError("Impossible de charger les données. Vérifiez votre connexion.");
        } finally { setLoading(false); }
    }, [loadRdvs]);

    useEffect(() => { loadAll(); }, [loadAll]);

    // ── Actions ───────────────────────────────────────────────────────────────
    const handleConfirmer = async (rdv: RendezVous) => {
        if (!secretaire) return;
        setActionLoading(rdv.id + "_c");
        try { await secretaireService.confirmerRdv(secretaire.id, rdv.id); await loadAll(); }
        finally { setActionLoading(null); }
    };

    const handleAnnuler = async (rdv: RendezVous) => {
        if (!secretaire) return;
        setActionLoading(rdv.id + "_a");
        try { await secretaireService.annulerRdv(secretaire.id, rdv.id); await loadAll(); }
        finally { setActionLoading(null); }
    };

    const handleTerminer = async () => {
        if (!terminerRdv) return;
        setDiagLoading(true);
        try { await rendezVousService.terminer(terminerRdv.id, diag); setTerminerRdv(null); setDiag(""); await loadAll(); }
        finally { setDiagLoading(false); }
    };

    // ── Étape 2 : sélection médecin → charge créneaux libres ─────────────────
    const handleSelectMedecin = async (med: Medecin) => {
        setSelMedecin(med);
        setSelDispo(null);
        setDisposLoading(true);
        setStep(3);
        try {
            const data = await disponibiliteService.getLibres(med.id);
            setDispos(data);
        } catch (e) {
            console.error("Erreur créneaux:", e);
            setDispos([]);
        } finally { setDisposLoading(false); }
    };

    // ── Création RDV ──────────────────────────────────────────────────────────
    const handleCreate = async () => {
        // ✅ FIX : erreur visible si secretaire toujours null
        if (!secretaire) { setFormError("Profil secrétaire non chargé. Rechargez la page."); return; }
        if (!selPatient || !selMedecin || !selDispo) return;
        setFormLoading(true); setFormError("");
        try {
            await secretaireService.prendreRendezVous(secretaire.id, {
                patientId:       selPatient.id,
                medecinId:       selMedecin.id,
                date:            selDispo.date,
                heure:           selDispo.heureDebut,
                motif,
                disponibiliteId: selDispo.id,
            });
            setFormSuccess(true);
            await loadAll();
            setTimeout(() => { setModal(false); setFormSuccess(false); resetModal(); }, 1800);
        } catch (e: any) {
            setFormError(e?.response?.data?.message || "Erreur création RDV");
        } finally { setFormLoading(false); }
    };

    const resetModal = () => {
        setStep(1); setSelPatient(null); setSelMedecin(null); setSelDispo(null);
        setDispos([]); setMotif(""); setFormError(""); setFormSuccess(false);
    };

    const filtered = rdvs
        .filter(r => filterStatut === "TOUS" || r.statut === filterStatut)
        .filter(r => {
            const s = search.toLowerCase();
            return !s || `${r.patient?.nom} ${r.patient?.prenom} ${r.medecin?.nom} ${r.motif}`.toLowerCase().includes(s);
        });

    const stats = [
        { label: "Total",      value: rdvs.length,                                        color: ACCENT,    bg: "#E8F5EE" },
        { label: "En attente", value: rdvs.filter(r => r.statut === "EN_ATTENTE").length,  color: "#F59E0B", bg: "#FEF3C7" },
        { label: "Confirmés",  value: rdvs.filter(r => r.statut === "CONFIRME").length,    color: "#0EA5E9", bg: "#E0F2FE" },
        { label: "Terminés",   value: rdvs.filter(r => r.statut === "TERMINE").length,     color: "#8B5CF6", bg: "#EDE9FE" },
    ];

    return (
        <DashboardLayout navItems={NAV} title="Gestion des rendez-vous">

            {initError && (
                <div className="alert alert-danger mb-3" style={{ borderRadius: 12 }}>
                    <i className="bi bi-exclamation-triangle me-2"></i>{initError}
                </div>
            )}

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 18 }}>
                {stats.map(s => (
                    <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", border: "0.5px solid #EBEBEB", display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#9E9E9E" }}>{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div style={{ background: "#fff", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", border: "0.5px solid #EBEBEB" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 180 }}>
                    <i className="bi bi-search" style={{ color: "#BDBDBD" }}></i>
                    <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
                           style={{ border: "none", outline: "none", fontSize: 14, flex: 1, background: "transparent" }} />
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["TOUS","EN_ATTENTE","CONFIRME","TERMINE","ANNULE"].map(s => (
                        <button key={s} onClick={() => setFilterStatut(s)}
                                style={{ background: filterStatut === s ? ACCENT : "#F5F5F5", color: filterStatut === s ? "#fff" : "#6B6B6B", border: "none", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            {s === "TOUS" ? "Tous" : s.replace("_", " ")}
                        </button>
                    ))}
                </div>
                <button onClick={() => { setModal(true); resetModal(); }}
                        style={{ background: `linear-gradient(135deg,#1A7A52,${ACCENT})`, color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13, flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="bi bi-calendar-plus"></i>Nouveau RDV
                </button>
            </div>

            {/* Liste */}
            <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "0.5px solid #EBEBEB" }}>
                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><div className="spinner-border" style={{ color: ACCENT }}></div></div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#BDBDBD" }}>
                        <i className="bi bi-calendar-x" style={{ fontSize: 48 }}></i>
                        <div style={{ marginTop: 14, fontSize: 15 }}>Aucun rendez-vous trouvé</div>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {filtered.map(rdv => (
                            <div key={rdv.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderRadius: 12, background: "#FAFAFA", border: "0.5px solid #EBEBEB", flexWrap: "wrap" }}>
                                <div style={{ minWidth: 54, textAlign: "center", background: "#E8F5EE", borderRadius: 9, padding: "7px 6px" }}>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: ACCENT, lineHeight: 1 }}>{rdv.date?.slice(8, 10)}</div>
                                    <div style={{ fontSize: 10, color: ACCENT, textTransform: "uppercase", fontWeight: 600 }}>
                                        {rdv.date ? new Date(rdv.date + "T00:00:00").toLocaleDateString("fr-FR", { month: "short" }) : ""}
                                    </div>
                                    <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, marginTop: 2 }}>{fmt(rdv.heure)}</div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 9, flex: "1 1 180px" }}>
                                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${ACCENT}18`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: ACCENT, fontSize: 12, flexShrink: 0 }}>
                                        {rdv.patient?.prenom?.[0]}{rdv.patient?.nom?.[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{rdv.patient?.prenom} {rdv.patient?.nom}</div>
                                        <div style={{ fontSize: 12, color: "#9E9E9E" }}>Dr. {rdv.medecin?.prenom} {rdv.medecin?.nom}</div>
                                        <div style={{ fontSize: 11, color: "#BDBDBD", marginTop: 2 }}><i className="bi bi-chat-text me-1"></i>{rdv.motif}</div>
                                    </div>
                                </div>
                                <StatusBadge status={rdv.statut} />
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                    {rdv.statut === "EN_ATTENTE" && (
                                        <button onClick={() => handleConfirmer(rdv)} disabled={!!actionLoading}
                                                style={{ background: "#D1FAE5", color: "#065F46", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                            {actionLoading === rdv.id + "_c" ? <span className="spinner-border spinner-border-sm"></span> : "✓ Confirmer"}
                                        </button>
                                    )}
                                    {(rdv.statut === "EN_ATTENTE" || rdv.statut === "CONFIRME") && (
                                        <>
                                            <button onClick={() => { setTerminerRdv(rdv); setDiag(""); }}
                                                    style={{ background: "#E0E7FF", color: "#3730A3", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Terminer</button>
                                            <button onClick={() => handleAnnuler(rdv)} disabled={!!actionLoading}
                                                    style={{ background: "#FEE2E2", color: "#991B1B", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                                {actionLoading === rdv.id + "_a" ? <span className="spinner-border spinner-border-sm"></span> : "Annuler"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Modal nouveau RDV (3 étapes) ── */}
            {modal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 18, width: 520, maxWidth: "90vw", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>

                        {/* Header avec progression */}
                        <div style={{ background: `linear-gradient(135deg,#1A7A52,${ACCENT})`, padding: "18px 24px", color: "#fff" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 16 }}>Nouveau rendez-vous</div>
                                    <div style={{ opacity: 0.8, fontSize: 13, marginTop: 2 }}>
                                        {step === 1 ? "Étape 1 — Sélectionner le patient"
                                            : step === 2 ? "Étape 2 — Choisir un médecin"
                                                : `Étape 3 — Créneaux de Dr. ${selMedecin?.prenom} ${selMedecin?.nom}`}
                                    </div>
                                </div>
                                <button onClick={() => setModal(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "#fff", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                            </div>
                            <div style={{ display: "flex", gap: 4, marginTop: 14 }}>
                                {[1,2,3].map(s => (
                                    <div key={s} style={{ height: 4, flex: 1, borderRadius: 2, background: step >= s ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)" }}></div>
                                ))}
                            </div>
                        </div>

                        <div style={{ overflowY: "auto", padding: 24, flex: 1 }}>
                            {formSuccess ? (
                                <div style={{ textAlign: "center", padding: "48px 0" }}>
                                    <div style={{ fontSize: 56 }}>✅</div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: "#1A7A52", marginTop: 12 }}>Rendez-vous créé !</div>
                                    <div style={{ fontSize: 13, color: "#9E9E9E", marginTop: 6 }}>
                                        {selPatient?.prenom} {selPatient?.nom} · Dr. {selMedecin?.prenom} {selMedecin?.nom}
                                    </div>
                                    <div style={{ fontSize: 13, color: "#9E9E9E" }}>{selDispo?.date} à {fmt(selDispo?.heureDebut || "")}</div>
                                </div>
                            ) : step === 1 ? (
                                /* ── Étape 1 : Patient ── */
                                <>
                                    {formError && <div className="alert alert-danger py-2 small mb-3">{formError}</div>}
                                    <p style={{ fontSize: 13, color: "#9E9E9E", marginBottom: 14 }}>Choisissez le patient :</p>
                                    <div style={{ marginBottom: 12 }}>
                                        <input placeholder="Rechercher un patient..." onChange={e => {
                                            const s = e.target.value.toLowerCase();
                                            document.querySelectorAll("[data-patient]").forEach(el => {
                                                (el as HTMLElement).style.display = (el as HTMLElement).dataset.patient?.toLowerCase().includes(s) ? "" : "none";
                                            });
                                        }} style={{ ...inp }} />
                                    </div>
                                    {patients.length === 0 ? (
                                        <div style={{ textAlign: "center", padding: "40px 0", color: "#BDBDBD" }}>
                                            <i className="bi bi-people" style={{ fontSize: 40 }}></i>
                                            <div style={{ marginTop: 12 }}>Aucun patient disponible</div>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                                            {patients.map(p => (
                                                <div key={p.id} data-patient={`${p.prenom} ${p.nom}`}
                                                     onClick={() => { setSelPatient(p); setStep(2); }}
                                                     style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, border: "0.5px solid #EBEBEB", cursor: "pointer", transition: "all 0.15s" }}
                                                     onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = ACCENT; el.style.background = "#F0FDF4"; }}
                                                     onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#EBEBEB"; el.style.background = ""; }}>
                                                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${ACCENT}18`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: ACCENT, fontSize: 13 }}>
                                                        {p.prenom?.[0]}{p.nom?.[0]}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.prenom} {p.nom}</div>
                                                        <div style={{ fontSize: 12, color: "#9E9E9E" }}>{p.telephone}</div>
                                                    </div>
                                                    <i className="bi bi-chevron-right" style={{ color: "#BDBDBD" }}></i>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : step === 2 ? (
                                /* ── Étape 2 : Médecin ── */
                                <>
                                    <button onClick={() => setStep(1)} style={{ background: "#F5F5F5", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", marginBottom: 14 }}>← Changer de patient</button>
                                    <div style={{ background: "#F0FDF4", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#065F46", fontWeight: 600 }}>
                                        <i className="bi bi-person-check me-2"></i>Patient : {selPatient?.prenom} {selPatient?.nom}
                                    </div>
                                    <p style={{ fontSize: 13, color: "#9E9E9E", marginBottom: 14 }}>Sélectionnez un médecin disponible :</p>
                                    {medecins.filter(m => m.disponible).length === 0 ? (
                                        <div style={{ textAlign: "center", padding: "40px 0", color: "#BDBDBD" }}>
                                            <i className="bi bi-person-x" style={{ fontSize: 40 }}></i>
                                            <div style={{ marginTop: 12 }}>Aucun médecin disponible</div>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                                            {medecins.filter(m => m.disponible).map(m => (
                                                <div key={m.id} onClick={() => handleSelectMedecin(m)}
                                                     style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, border: "0.5px solid #EBEBEB", cursor: "pointer", transition: "all 0.15s" }}
                                                     onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = ACCENT; el.style.background = "#F0FDF4"; }}
                                                     onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#EBEBEB"; el.style.background = ""; }}>
                                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${ACCENT}18`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: ACCENT, fontSize: 14 }}>
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
                                    )}
                                </>
                            ) : (
                                /* ── Étape 3 : Créneau + motif ── */
                                <>
                                    <button onClick={() => setStep(2)} style={{ background: "#F5F5F5", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", marginBottom: 14 }}>← Changer de médecin</button>
                                    {formError && <div className="alert alert-danger py-2 small mb-3">{formError}</div>}

                                    {disposLoading ? (
                                        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                                            <div className="spinner-border" style={{ color: ACCENT }}></div>
                                        </div>
                                    ) : dispos.length === 0 ? (
                                        <div style={{ textAlign: "center", padding: "40px 0", color: "#BDBDBD" }}>
                                            <i className="bi bi-calendar-x" style={{ fontSize: 40 }}></i>
                                            <div style={{ marginTop: 12, fontSize: 14 }}>Aucun créneau disponible pour ce médecin</div>
                                        </div>
                                    ) : (
                                        <>
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
                                                                        style={{ background: isSelected ? ACCENT : "#F0FDF4", color: isSelected ? "#fff" : "#1A7A52", border: `2px solid ${isSelected ? ACCENT : "#BBF7D0"}`, borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
                                                                    {fmt(d.heureDebut)} – {fmt(d.heureFin)}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}

                                            {selDispo && (
                                                <div style={{ marginTop: 8 }}>
                                                    <label style={{ fontSize: 12.5, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 6 }}>Motif de consultation</label>
                                                    <textarea value={motif} onChange={e => setMotif(e.target.value)} rows={3}
                                                              placeholder="Motif de la consultation..." style={{ ...inp, resize: "vertical" }} />
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {selDispo && (
                                        <div style={{ marginTop: 16 }}>
                                            <div style={{ background: "#F0FDF4", border: "0.5px solid #BBF7D0", borderRadius: 12, padding: "12px 16px", marginBottom: 14, fontSize: 13 }}>
                                                <div style={{ fontWeight: 600, color: "#065F46", marginBottom: 4 }}>Récapitulatif</div>
                                                <div style={{ color: "#047857" }}>
                                                    {selPatient?.prenom} {selPatient?.nom} · Dr. {selMedecin?.prenom} {selMedecin?.nom}
                                                </div>
                                                <div style={{ color: "#047857" }}>{selDispo.date} · {fmt(selDispo.heureDebut)}–{fmt(selDispo.heureFin)}</div>
                                            </div>
                                            <button onClick={handleCreate} disabled={formLoading || !motif.trim()}
                                                    style={{ background: `linear-gradient(135deg,#1A7A52,${ACCENT})`, color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700, cursor: formLoading || !motif.trim() ? "not-allowed" : "pointer", fontSize: 14, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                                {formLoading ? <><span className="spinner-border spinner-border-sm"></span> En cours...</> : <><i className="bi bi-check-circle"></i> Créer le rendez-vous</>}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal terminer */}
            {terminerRdv && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 18, padding: 28, width: 460, maxWidth: "90vw" }}>
                        <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700 }}>Terminer le rendez-vous</h3>
                        <p style={{ color: "#9E9E9E", fontSize: 13, marginBottom: 18 }}>
                            {terminerRdv.patient?.prenom} {terminerRdv.patient?.nom} · Dr. {terminerRdv.medecin?.prenom} {terminerRdv.medecin?.nom}
                        </p>
                        <label style={{ fontSize: 12.5, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 6 }}>Diagnostic</label>
                        <textarea value={diag} onChange={e => setDiag(e.target.value)} rows={4} placeholder="Entrez le diagnostic..."
                                  style={{ ...inp, resize: "vertical" }} />
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
                            <button onClick={() => setTerminerRdv(null)} style={{ background: "#F5F5F5", border: "none", borderRadius: 9, padding: "9px 18px", cursor: "pointer", fontSize: 13 }}>Annuler</button>
                            <button onClick={handleTerminer} disabled={diagLoading || !diag.trim()}
                                    style={{ background: `linear-gradient(135deg,#1A7A52,${ACCENT})`, color: "#fff", border: "none", borderRadius: 9, padding: "9px 22px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                                {diagLoading ? <span className="spinner-border spinner-border-sm"></span> : "Confirmer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}