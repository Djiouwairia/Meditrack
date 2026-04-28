import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import {
    medecinService, rendezVousService, dossierService,
    type Medecin, type Patient, type DossierMedical, type Ordonnance
} from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",         label: "Tableau de bord", path: "/dashboard/medecin" },
    { icon: "bi-calendar-check",       label: "Mon agenda",       path: "/dashboard/medecin/agenda" },
    { icon: "bi-people",               label: "Mes patients",     path: "/dashboard/medecin/patients" },
    { icon: "bi-file-earmark-medical", label: "Ordonnances",      path: "/dashboard/medecin/ordonnances" },
    { icon: "bi-person-gear",          label: "Mon profil",       path: "/dashboard/medecin/profil" },
];

const ACCENT = "#1A7A52";

export default function MedecinPatients() {
    // @ts-ignore
    const [medecin, setMedecin]           = useState<Medecin | null>(null);
    const [patients, setPatients]         = useState<Patient[]>([]);
    const [loading, setLoading]           = useState(true);
    const [search, setSearch]             = useState("");

    // Dossier modal
    const [selPatient, setSelPatient]     = useState<Patient | null>(null);
    const [dossier, setDossier]           = useState<DossierMedical | null>(null);
    const [dossierLoading, setDossierLoading] = useState(false);
    const [selOrdo, setSelOrdo]           = useState<Ordonnance | null>(null);

    // ── Chargement réel depuis l'API ──────────────────────────────────────
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const med = await medecinService.getMe();   // ← /medecins/me
            setMedecin(med);

            // Récupère tous les RDV pour extraire les patients uniques
            const rdvPage = await rendezVousService.getByMedecin(med.id, 0, 200);
            const seen    = new Set<string>();
            const unique: Patient[] = [];
            rdvPage.content.forEach(r => {
                if (r.patient && !seen.has(r.patient.id)) {
                    seen.add(r.patient.id);
                    unique.push(r.patient);
                }
            });
            setPatients(unique);
        } catch (e) {
            console.error("Erreur chargement patients:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // ── Dossier médical d'un patient ──────────────────────────────────────
    const openDossier = async (pat: Patient) => {
        setSelPatient(pat);
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

    const filtered = patients.filter(p =>
        `${p.nom} ${p.prenom} ${p.email}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout navItems={NAV} title="Mes patients" accentColor={ACCENT}>

            {/* Barre recherche */}
            <div style={{ background: "#fff", borderRadius: 12, padding: "10px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, border: "0.5px solid #EBEBEB" }}>
                <i className="bi bi-search" style={{ color: "#BDBDBD", fontSize: 15 }}></i>
                <input
                    placeholder="Rechercher un patient..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ border: "none", outline: "none", fontSize: 14, flex: 1, background: "transparent" }}
                />
                {patients.length > 0 && (
                    <span style={{ background: `${ACCENT}18`, color: ACCENT, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                        {filtered.length} patient{filtered.length > 1 ? "s" : ""}
                    </span>
                )}
            </div>

            {/* Contenu */}
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
                    <div className="spinner-border" style={{ color: ACCENT }}></div>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0", background: "#fff", borderRadius: 14, color: "#BDBDBD", border: "0.5px solid #EBEBEB" }}>
                    <i className="bi bi-people" style={{ fontSize: 52 }}></i>
                    <div style={{ marginTop: 16, fontSize: 16, fontWeight: 500 }}>
                        {search ? "Aucun patient ne correspond à votre recherche" : "Aucun patient pour l'instant"}
                    </div>
                    <div style={{ fontSize: 13, marginTop: 8 }}>
                        {!search && "Les patients apparaîtront ici après vos premiers rendez-vous"}
                    </div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14 }}>
                    {filtered.map(p => (
                        <div key={p.id} onClick={() => openDossier(p)}
                             style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: "0.5px solid #EBEBEB", cursor: "pointer", transition: "all 0.2s" }}
                             onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-3px)"; el.style.borderColor = ACCENT; el.style.boxShadow = `0 8px 24px ${ACCENT}18`; }}
                             onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.borderColor = "#EBEBEB"; el.style.boxShadow = ""; }}>

                            {/* Header */}
                            <div style={{ background: "linear-gradient(135deg, #F0FDF4, #E8F5EE)", padding: "24px 16px", textAlign: "center", borderBottom: "0.5px solid #EBEBEB" }}>
                                <div style={{ width: 60, height: 60, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #27A869)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 20, margin: "0 auto 10px" }}>
                                    {p.prenom?.[0]}{p.nom?.[0]}
                                </div>
                                <div style={{ fontWeight: 700, fontSize: 15, color: "#0F0F0F" }}>{p.prenom} {p.nom}</div>
                                {p.groupeSanguin && (
                                    <span style={{ background: "#FEE2E2", color: "#991B1B", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, marginTop: 6, display: "inline-block" }}>
                                        <i className="bi bi-droplet-fill me-1"></i>{p.groupeSanguin}
                                    </span>
                                )}
                            </div>

                            {/* Infos */}
                            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 7 }}>
                                {p.email && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6B6B6B" }}>
                                        <i className="bi bi-envelope-fill" style={{ color: "#0EA5E9", fontSize: 13 }}></i>
                                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.email}</span>
                                    </div>
                                )}
                                {p.telephone && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6B6B6B" }}>
                                        <i className="bi bi-telephone-fill" style={{ color: ACCENT, fontSize: 13 }}></i>
                                        <span>{p.telephone}</span>
                                    </div>
                                )}
                                {p.adresse && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6B6B6B" }}>
                                        <i className="bi bi-geo-alt-fill" style={{ color: "#EF4444", fontSize: 13 }}></i>
                                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.adresse}</span>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div style={{ padding: "10px 16px", borderTop: "0.5px solid #EBEBEB", textAlign: "center" }}>
                                <span style={{ color: ACCENT, fontSize: 13, fontWeight: 600 }}>
                                    <i className="bi bi-folder2-open me-2"></i>Voir le dossier
                                </span>
                            </div>
                        </div>
                    ))}
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
                                /* Détail ordonnance */
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
                                /* Dossier principal */
                                <>
                                    {/* Infos médicales */}
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

                                    {/* Ordonnances */}
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