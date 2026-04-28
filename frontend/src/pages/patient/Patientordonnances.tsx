import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { patientService, dossierService, ordonnanceService, type Ordonnance } from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",         label: "Tableau de bord",  path: "/dashboard/patient" },
    { icon: "bi-calendar-check",       label: "Mes rendez-vous",  path: "/dashboard/patient/rendez-vous" },
    { icon: "bi-folder2-open",         label: "Mon dossier",      path: "/dashboard/patient/dossier" },
    { icon: "bi-file-earmark-medical", label: "Ordonnances",      path: "/dashboard/patient/ordonnances" },
    { icon: "bi-person-gear",          label: "Mon profil",       path: "/dashboard/patient/profil" },
];

const ACCENT = "#0EA5E9";

function fmtDate(d?: string) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function PatientOrdonnances() {
    const [loading, setLoading]           = useState(true);
    const [ordonnances, setOrdonnances]   = useState<Ordonnance[]>([]);
    const [page, setPage]                 = useState(0);
    const [totalPages, setTotalPages]     = useState(0);
    const [selected, setSelected]         = useState<Ordonnance | null>(null);

    const load = useCallback(async (pg: number) => {
        setLoading(true);
        try {
            // ✅ /patients/me au lieu de getAll().find()
            const pat = await patientService.getMe();
            const dos = await dossierService.getByPatient(pat.id).catch(() => null);
            if (dos) {
                const data = await ordonnanceService.getByDossier(dos.id, pg, 6);
                setOrdonnances(data.content);
                setTotalPages(data.totalPages);
                setPage(pg);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(0); }, [load]);

    // Médecin de l'ordonnance = via le RDV associé
    const getMedecin = (o: Ordonnance) => o.rendezVous?.medecin;

    return (
        <DashboardLayout navItems={NAV} title="Mes ordonnances" accentColor={ACCENT}>
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
                    <div className="spinner-border" style={{ color: ACCENT }}></div>
                </div>
            ) : ordonnances.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0", color: "#BDBDBD", background: "#fff", borderRadius: 14, border: "0.5px solid #EBEBEB" }}>
                    <i className="bi bi-file-earmark-x" style={{ fontSize: 52 }}></i>
                    <div style={{ marginTop: 16, fontSize: 16, fontWeight: 500 }}>Aucune ordonnance disponible</div>
                    <div style={{ fontSize: 13, marginTop: 8 }}>Vos ordonnances apparaîtront ici après chaque consultation</div>
                </div>
            ) : (
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14, marginBottom: 24 }}>
                        {ordonnances.map(o => {
                            const med = getMedecin(o);
                            return (
                                <div key={o.id} onClick={() => setSelected(o)}
                                     style={{ background: "#fff", borderRadius: 14, padding: 20, border: "0.5px solid #EBEBEB", cursor: "pointer", transition: "all 0.18s" }}
                                     onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-3px)"; el.style.borderColor = ACCENT; el.style.boxShadow = `0 8px 24px ${ACCENT}20`; }}
                                     onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.borderColor = "#EBEBEB"; el.style.boxShadow = ""; }}>

                                    {/* Header médecin */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                                        <div style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg,#0369A1,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                                            {med?.prenom?.[0]}{med?.nom?.[0]}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                                                {med ? `Dr. ${med.prenom} ${med.nom}` : "Médecin inconnu"}
                                            </div>
                                            <div style={{ fontSize: 12, color: "#9E9E9E" }}>{med?.specialite || "—"}</div>
                                        </div>
                                        {/* ✅ Champ "date" (pas "dateCreation") */}
                                        <span style={{ background: "#E0F2FE", color: "#0369A1", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, flexShrink: 0 }}>
                                            {o.date ? new Date(o.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "—"}
                                        </span>
                                    </div>

                                    {/* Médicaments preview */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                        {Object.entries(o.medicaments || {}).slice(0, 3).map(([med, pos]) => (
                                            <div key={med} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, background: "#F0FDF4" }}>
                                                <i className="bi bi-capsule" style={{ color: "#1A7A52", fontSize: 13 }}></i>
                                                <span style={{ fontWeight: 600, fontSize: 12.5, color: "#065F46", flex: 1 }}>{med}</span>
                                                <span style={{ fontSize: 11.5, color: "#6B7280" }}>{pos}</span>
                                            </div>
                                        ))}
                                        {Object.keys(o.medicaments || {}).length > 3 && (
                                            <div style={{ fontSize: 12, color: "#9E9E9E", textAlign: "center", paddingTop: 3 }}>
                                                +{Object.keys(o.medicaments).length - 3} médicament(s) supplémentaire(s)
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ marginTop: 12, fontSize: 12.5, color: ACCENT, fontWeight: 600, textAlign: "right" }}>
                                        Voir le détail →
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                            <button onClick={() => load(page - 1)} disabled={page === 0}
                                    style={{ background: "#F5F5F5", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 600, color: page === 0 ? "#BDBDBD" : "#374151" }}>‹ Préc.</button>
                            <span style={{ display: "flex", alignItems: "center", fontSize: 13, color: "#6B7280" }}>Page {page + 1} / {totalPages}</span>
                            <button onClick={() => load(page + 1)} disabled={page >= totalPages - 1}
                                    style={{ background: "#F5F5F5", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 600, color: page >= totalPages - 1 ? "#BDBDBD" : "#374151" }}>Suiv. ›</button>
                        </div>
                    )}
                </>
            )}

            {/* Modal détail ordonnance */}
            {selected && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 480, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto" }}>
                        <div style={{ borderBottom: "2px dashed #E5E7EB", paddingBottom: 18, marginBottom: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div style={{ fontSize: 11, color: "#9E9E9E", textTransform: "uppercase", letterSpacing: 1 }}>Ordonnance médicale</div>
                                    <div style={{ fontSize: 19, fontWeight: 800, color: "#0D1F2D", marginTop: 4 }}>
                                        {getMedecin(selected) ? `Dr. ${getMedecin(selected)!.prenom} ${getMedecin(selected)!.nom}` : "Médecin inconnu"}
                                    </div>
                                    <div style={{ fontSize: 14, color: "#6B7280" }}>{getMedecin(selected)?.specialite || "—"}</div>
                                </div>
                                <button onClick={() => setSelected(null)} style={{ background: "#F5F5F5", border: "none", borderRadius: 10, width: 34, height: 34, cursor: "pointer", fontSize: 16, color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                            </div>
                            <div style={{ marginTop: 12, fontSize: 13, color: "#9E9E9E" }}>
                                Prescrit le : {fmtDate(selected.date)}
                            </div>
                        </div>

                        <div style={{ fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 12 }}>Médicaments prescrits</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {Object.entries(selected.medicaments || {}).map(([med, pos]) => (
                                <div key={med} style={{ padding: "14px 16px", borderRadius: 12, background: "#F0FDF4", border: "0.5px solid #BBF7D0" }}>
                                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                        <i className="bi bi-capsule-pill" style={{ fontSize: 20, color: "#1A7A52" }}></i>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 14, color: "#065F46" }}>{med}</div>
                                            <div style={{ fontSize: 13, color: "#047857", marginTop: 3 }}>{pos}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 20, padding: "10px 14px", borderRadius: 10, background: "#FEF9C3", border: "0.5px solid #FDE68A", fontSize: 12, color: "#92400E" }}>
                            <i className="bi bi-info-circle me-2"></i>Respectez bien la posologie indiquée par votre médecin.
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}