import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { medecinService, rendezVousService, ordonnanceService, type Medecin, type RendezVous, type Ordonnance } from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",         label: "Tableau de bord",  path: "/dashboard/medecin" },
    { icon: "bi-calendar-check",       label: "Mon agenda",        path: "/dashboard/medecin/agenda" },
    { icon: "bi-people",               label: "Mes patients",      path: "/dashboard/medecin/patients" },
    { icon: "bi-file-earmark-medical", label: "Ordonnances",       path: "/dashboard/medecin/ordonnances" },
    { icon: "bi-person-gear",          label: "Mon profil",        path: "/dashboard/medecin/profil" },
];

const ACCENT = "#1A7A52";

const inp = {
    width: "100%",
    borderRadius: 8,
    border: "0.5px solid #EBEBEB",
    padding: "9px 12px",
    fontSize: 13,
    outline: "none",
    background: "#FAFAFA",
    boxSizing: "border-box" as const,
};

function fmtDate(d?: string) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function MedecinOrdonnances() {
    // @ts-ignore
    const [medecin, setMedecin]             = useState<Medecin | null>(null);
    const [rdvsTermines, setRdvsTermines]   = useState<RendezVous[]>([]);
    const [ordonnances, setOrdonnances]     = useState<Ordonnance[]>([]);
    const [loading, setLoading]             = useState(true);
    const [selected, setSelected]           = useState<Ordonnance | null>(null);

    // Filtre par RDV
    const [filterRdv, setFilterRdv]         = useState("");

    // Modal création
    const [modal, setModal]                 = useState(false);
    const [selRdv, setSelRdv]               = useState<RendezVous | null>(null);
    const [meds, setMeds]                   = useState<{ nom: string; posologie: string }[]>([{ nom: "", posologie: "" }]);
    const [createLoading, setCreateLoading] = useState(false);
    const [createSuccess, setCreateSuccess] = useState(false);
    const [createError, setCreateError]     = useState("");

    // ── Chargement principal ─────────────────────────────────────────────────
    const load = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Médecin connecté via /medecins/me
            const med = await medecinService.getMe();
            setMedecin(med);

            // 2. Tous ses RDV terminés (pour filtrer + créer)
            const rdvPage = await rendezVousService.getByMedecin(med.id, 0, 200);
            const termines = rdvPage.content.filter(r => r.statut === "TERMINE");
            setRdvsTermines(termines);

            // 3. Ordonnances : filtrées par RDV ou toutes (5 derniers RDV terminés)
            const cible = filterRdv
                ? [termines.find(r => r.id === filterRdv)].filter(Boolean) as RendezVous[]
                : termines.slice(0, 20); // on limite à 20 RDV pour les perfs

            const all: Ordonnance[] = [];
            await Promise.all(
                cible.map(rdv =>
                    ordonnanceService.getByRendezVous(rdv.id, 0, 50)
                        .then(p => all.push(...p.content))
                        .catch(() => {})
                )
            );

            // Trier par date décroissante
            all.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
            setOrdonnances(all);
        } catch (e) {
            console.error("Erreur chargement ordonnances:", e);
        } finally {
            setLoading(false);
        }
    }, [filterRdv]);

    useEffect(() => { load(); }, [load]);

    // ── Création ordonnance ──────────────────────────────────────────────────
    const handleCreate = async () => {
        if (!selRdv) return;
        setCreateLoading(true);
        setCreateError("");
        try {
            const medicaments: Record<string, string> = {};
            meds.filter(m => m.nom.trim()).forEach(m => { medicaments[m.nom] = m.posologie; });
            await ordonnanceService.creer({ rendezVousId: selRdv.id, medicaments });
            setCreateSuccess(true);
            await load();
            setTimeout(() => {
                setModal(false);
                setCreateSuccess(false);
                setMeds([{ nom: "", posologie: "" }]);
                setSelRdv(null);
            }, 1500);
        } catch (e: any) {
            setCreateError(e?.response?.data?.message || "Erreur lors de la création");
        } finally {
            setCreateLoading(false);
        }
    };

    const openModal = () => { setModal(true); setCreateSuccess(false); setCreateError(""); setMeds([{ nom: "", posologie: "" }]); setSelRdv(null); };

    return (
        <DashboardLayout navItems={NAV} title="Ordonnances" accentColor={ACCENT}>

            {/* ── Barre d'actions ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
                <select value={filterRdv} onChange={e => setFilterRdv(e.target.value)}
                        style={{ borderRadius: 10, border: "0.5px solid #EBEBEB", padding: "9px 14px", fontSize: 13, background: "#fff", flex: 1, maxWidth: 420, outline: "none" }}>
                    <option value="">Toutes les ordonnances</option>
                    {rdvsTermines.map(r => (
                        <option key={r.id} value={r.id}>
                            {r.patient?.prenom} {r.patient?.nom} — {r.date} à {r.heure?.slice(0, 5)}
                        </option>
                    ))}
                </select>

                <button onClick={openModal}
                        style={{ background: ACCENT, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 13.5, flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="bi bi-file-earmark-plus"></i>Nouvelle ordonnance
                </button>
            </div>

            {/* ── Contenu ── */}
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
                    <div className="spinner-border" style={{ color: ACCENT }}></div>
                </div>
            ) : ordonnances.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0", background: "#fff", borderRadius: 14, color: "#BDBDBD", border: "0.5px solid #EBEBEB" }}>
                    <i className="bi bi-file-earmark-x" style={{ fontSize: 52 }}></i>
                    <div style={{ marginTop: 16, fontSize: 16 }}>Aucune ordonnance</div>
                    <div style={{ fontSize: 13, marginTop: 8 }}>Créez des ordonnances après chaque consultation terminée</div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
                    {ordonnances.map(o => (
                        <div key={o.id} onClick={() => setSelected(o)}
                             style={{ background: "#fff", borderRadius: 14, padding: 20, border: "0.5px solid #EBEBEB", cursor: "pointer", transition: "all 0.15s" }}
                             onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = ACCENT; el.style.transform = "translateY(-2px)"; }}
                             onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#EBEBEB"; el.style.transform = ""; }}>

                            {/* En-tête patient */}
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${ACCENT}18`, display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                                    {o.rendezVous?.patient?.prenom?.[0]}{o.rendezVous?.patient?.nom?.[0]}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 13.5, color: "#0F0F0F" }}>
                                        {o.rendezVous?.patient?.prenom} {o.rendezVous?.patient?.nom}
                                    </div>
                                    <div style={{ fontSize: 11.5, color: "#9E9E9E", marginTop: 2 }}>
                                        <i className="bi bi-calendar3 me-1"></i>{fmtDate(o.date)}
                                    </div>
                                </div>
                                <span style={{ background: `${ACCENT}18`, color: ACCENT, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, flexShrink: 0 }}>
                                    {Object.keys(o.medicaments || {}).length} méd.
                                </span>
                            </div>

                            {/* Médicaments preview */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                {Object.entries(o.medicaments || {}).slice(0, 3).map(([med, pos]) => (
                                    <div key={med} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 10px", borderRadius: 8, background: "#F0FDF4" }}>
                                        <i className="bi bi-capsule" style={{ color: ACCENT, fontSize: 12, marginTop: 1 }}></i>
                                        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#065F46", flex: 1 }}>{med}</span>
                                        <span style={{ fontSize: 11.5, color: "#6B7280" }}>{pos}</span>
                                    </div>
                                ))}
                                {Object.keys(o.medicaments || {}).length > 3 && (
                                    <div style={{ fontSize: 11.5, color: "#9E9E9E", textAlign: "center", paddingTop: 4 }}>
                                        +{Object.keys(o.medicaments).length - 3} médicament(s) supplémentaire(s)
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Modal création ── */}
            {modal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 18, padding: 28, width: 520, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto", border: "0.5px solid #EBEBEB" }}>
                        {createSuccess ? (
                            <div style={{ textAlign: "center", padding: "40px 0" }}>
                                <div style={{ fontSize: 52 }}>✅</div>
                                <div style={{ fontSize: 17, fontWeight: 700, color: ACCENT, marginTop: 12 }}>Ordonnance créée !</div>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Nouvelle ordonnance</h3>
                                    <button onClick={() => setModal(false)} style={{ background: "#F5F5F5", border: "none", width: 28, height: 28, borderRadius: 8, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                                </div>

                                {createError && (
                                    <div className="alert alert-danger py-2 small mb-3">{createError}</div>
                                )}

                                {/* Sélection RDV */}
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 12.5, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 6 }}>
                                        Rendez-vous terminé
                                    </label>
                                    <select value={selRdv?.id || ""} onChange={e => setSelRdv(rdvsTermines.find(r => r.id === e.target.value) || null)}
                                            style={{ ...inp }}>
                                        <option value="">Sélectionner un rendez-vous</option>
                                        {rdvsTermines.map(r => (
                                            <option key={r.id} value={r.id}>
                                                {r.patient?.prenom} {r.patient?.nom} — {r.date} {r.heure?.slice(0, 5)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Médicaments */}
                                <label style={{ fontSize: 12.5, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 8 }}>Médicaments</label>
                                {meds.map((m, i) => (
                                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                        <input placeholder="Médicament" value={m.nom}
                                               onChange={e => { const c = [...meds]; c[i].nom = e.target.value; setMeds(c); }}
                                               style={{ flex: 1, borderRadius: 8, border: "0.5px solid #EBEBEB", padding: "8px 12px", fontSize: 13, outline: "none", background: "#FAFAFA" }} />
                                        <input placeholder="Posologie" value={m.posologie}
                                               onChange={e => { const c = [...meds]; c[i].posologie = e.target.value; setMeds(c); }}
                                               style={{ flex: 1, borderRadius: 8, border: "0.5px solid #EBEBEB", padding: "8px 12px", fontSize: 13, outline: "none", background: "#FAFAFA" }} />
                                        {meds.length > 1 && (
                                            <button onClick={() => setMeds(meds.filter((_, j) => j !== i))}
                                                    style={{ background: "#FEE2E2", border: "none", borderRadius: 8, padding: "0 10px", color: "#991B1B", cursor: "pointer" }}>✕</button>
                                        )}
                                    </div>
                                ))}
                                <button onClick={() => setMeds([...meds, { nom: "", posologie: "" }])}
                                        style={{ background: "none", border: `0.5px dashed ${ACCENT}`, color: ACCENT, borderRadius: 8, padding: "6px 14px", fontSize: 12.5, cursor: "pointer", marginBottom: 20, width: "100%" }}>
                                    + Ajouter un médicament
                                </button>

                                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                                    <button onClick={() => setModal(false)}
                                            style={{ background: "#F5F5F5", border: "none", borderRadius: 9, padding: "9px 18px", cursor: "pointer", fontSize: 13.5, color: "#6B6B6B" }}>
                                        Annuler
                                    </button>
                                    <button onClick={handleCreate} disabled={createLoading || !selRdv || meds.every(m => !m.nom.trim())}
                                            style={{ background: ACCENT, color: "#fff", border: "none", borderRadius: 9, padding: "9px 22px", cursor: "pointer", fontWeight: 600, fontSize: 13.5 }}>
                                        {createLoading ? <span className="spinner-border spinner-border-sm"></span> : "Créer"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── Modal détail ── */}
            {selected && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 18, padding: 28, width: 460, maxWidth: "90vw", border: "0.5px solid #EBEBEB" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Détail de l'ordonnance</h3>
                            <button onClick={() => setSelected(null)} style={{ background: "#F5F5F5", border: "none", width: 28, height: 28, borderRadius: 8, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                        </div>

                        <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px", marginBottom: 18, fontSize: 13, color: "#6B6B6B", lineHeight: 1.8 }}>
                            <div><strong>Patient :</strong> {selected.rendezVous?.patient?.prenom} {selected.rendezVous?.patient?.nom}</div>
                            <div><strong>Date :</strong> {fmtDate(selected.date)}</div>
                            {selected.rendezVous?.motif && <div><strong>Motif :</strong> {selected.rendezVous.motif}</div>}
                        </div>

                        <label style={{ fontSize: 12.5, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 10 }}>Médicaments prescrits</label>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {Object.entries(selected.medicaments || {}).map(([med, pos]) => (
                                <div key={med} style={{ padding: "12px 14px", borderRadius: 10, background: "#F0FDF4", border: "0.5px solid #BBF7D0" }}>
                                    <div style={{ fontWeight: 700, color: "#065F46", fontSize: 13.5 }}>
                                        <i className="bi bi-capsule me-2"></i>{med}
                                    </div>
                                    <div style={{ fontSize: 12.5, color: "#047857", marginTop: 4 }}>{pos}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}