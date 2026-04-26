import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { patientService, dossierService, ordonnanceService, type DossierMedical, type Ordonnance } from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",         label: "Tableau de bord",  path: "/dashboard/patient" },
    { icon: "bi-calendar-check",       label: "Mes rendez-vous",  path: "/dashboard/patient/rendez-vous" },
    { icon: "bi-folder2-open",         label: "Mon dossier",      path: "/dashboard/patient/dossier" },
    { icon: "bi-file-earmark-medical", label: "Ordonnances",      path: "/dashboard/patient/ordonnances" },
    { icon: "bi-person-gear",          label: "Mon profil",       path: "/dashboard/patient/profil" },
];

export default function PatientOrdonnances() {
    const { user } = useAuth();
    const [loading, setLoading]       = useState(true);
    const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([]);
    const [page, setPage]             = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [, setDossier]       = useState<DossierMedical | null>(null);
    const [selected, setSelected]     = useState<Ordonnance | null>(null);

    const load = useCallback(async (pg: number) => {
        if (!user?.email) return;
        setLoading(true);
        try {
            const pPage = await patientService.getAll(0, 200);
            const pat   = pPage.content.find(p => p.email === user.email);
            if (!pat) return;
            const dos = await dossierService.getByPatient(pat.id).catch(() => null);
            setDossier(dos);
            if (dos) {
                const data = await ordonnanceService.getByDossier(dos.id, pg, 6);
                setOrdonnances(data.content);
                setTotalPages(data.totalPages);
                setPage(pg);
            }
        } finally { setLoading(false); }
    }, [user]);

    useEffect(() => { load(0); }, [load]);

    return (
        <DashboardLayout navItems={NAV} title="Mes ordonnances" accentColor="#0EA5E9">
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                    <div className="spinner-border" style={{ color: "#0EA5E9" }}></div>
                </div>
            ) : ordonnances.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0", color: "#8A94A6", background: "#fff", borderRadius: 20 }}>
                    <i className="bi bi-file-earmark-x" style={{ fontSize: 56 }}></i>
                    <div style={{ marginTop: 16, fontSize: 17 }}>Aucune ordonnance disponible</div>
                    <div style={{ fontSize: 13, marginTop: 8, color: "#9CA3AF" }}>Vos ordonnances apparaîtront ici après chaque consultation</div>
                </div>
            ) : (
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, marginBottom: 24 }}>
                        {ordonnances.map(o => (
                            <div key={o.id} onClick={() => setSelected(o)}
                                 style={{ background: "#fff", borderRadius: 18, padding: 22, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #F0F2F7", cursor: "pointer", transition: "all 0.18s" }}
                                 onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-3px)"; el.style.boxShadow = "0 8px 28px rgba(14,165,233,0.15)"; el.style.borderColor = "#0EA5E9"; }}
                                 onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; el.style.borderColor = "#F0F2F7"; }}>

                                {/* Header */}
                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#0369A1,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15 }}>
                                        {o.medecin?.prenom?.[0]}{o.medecin?.nom?.[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: "#0D1F2D" }}>Dr. {o.medecin?.prenom} {o.medecin?.nom}</div>
                                        <div style={{ fontSize: 12, color: "#8A94A6" }}>{o.medecin?.specialite}</div>
                                    </div>
                                    <div style={{ marginLeft: "auto", background: "#E0F2FE", color: "#0369A1", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>
                                        {o.dateCreation ? new Date(o.dateCreation).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                                    </div>
                                </div>

                                {/* Médicaments preview */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {Object.entries(o.medicaments || {}).slice(0, 3).map(([med, posologie]) => (
                                        <div key={med} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "#F0FDF4" }}>
                                            <i className="bi bi-capsule" style={{ color: "#1A7A52", fontSize: 14 }}></i>
                                            <div>
                                                <span style={{ fontWeight: 600, fontSize: 13, color: "#065F46" }}>{med}</span>
                                                <span style={{ fontSize: 12, color: "#047857", marginLeft: 6 }}>— {posologie}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {Object.keys(o.medicaments || {}).length > 3 && (
                                        <div style={{ fontSize: 12, color: "#8A94A6", textAlign: "center", marginTop: 4 }}>
                                            +{Object.keys(o.medicaments).length - 3} médicament(s) supplémentaire(s)
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginTop: 14, fontSize: 12, color: "#0EA5E9", fontWeight: 600, textAlign: "right" }}>
                                    Voir le détail →
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                            <button onClick={() => load(page - 1)} disabled={page === 0}
                                    style={{ background: "#F3F4F6", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", color: "#374151", fontWeight: 600 }}>‹ Préc.</button>
                            <span style={{ display: "flex", alignItems: "center", fontSize: 13, color: "#6B7280" }}>Page {page + 1} / {totalPages}</span>
                            <button onClick={() => load(page + 1)} disabled={page >= totalPages - 1}
                                    style={{ background: "#F3F4F6", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", color: "#374151", fontWeight: 600 }}>Suiv. ›</button>
                        </div>
                    )}
                </>
            )}

            {/* Modal détail */}
            {selected && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 22, padding: 36, width: 480, maxWidth: "90vw", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
                        {/* En-tête style ordonnance */}
                        <div style={{ borderBottom: "2px dashed #E5E7EB", paddingBottom: 18, marginBottom: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div style={{ fontSize: 11, color: "#8A94A6", textTransform: "uppercase", letterSpacing: 1 }}>Ordonnance médicale</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: "#0D1F2D", marginTop: 4 }}>Dr. {selected.medecin?.prenom} {selected.medecin?.nom}</div>
                                    <div style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>{selected.medecin?.specialite}</div>
                                </div>
                                <button onClick={() => setSelected(null)} style={{ background: "#F3F4F6", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 18, color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                            </div>
                            <div style={{ marginTop: 12, fontSize: 13, color: "#8A94A6" }}>
                                Date : {selected.dateCreation ? new Date(selected.dateCreation).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                            </div>
                        </div>

                        <div style={{ fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 12 }}>Médicaments prescrits</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 320, overflowY: "auto" }}>
                            {Object.entries(selected.medicaments || {}).map(([med, posologie]) => (
                                <div key={med} style={{ padding: "14px 18px", borderRadius: 14, background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                        <i className="bi bi-capsule-pill" style={{ fontSize: 20, color: "#1A7A52" }}></i>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 15, color: "#065F46" }}>{med}</div>
                                            <div style={{ fontSize: 13, color: "#047857", marginTop: 3 }}>{posologie}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 22, padding: "12px 16px", borderRadius: 12, background: "#FEF9C3", border: "1px solid #FDE68A", fontSize: 12, color: "#92400E" }}>
                            <i className="bi bi-info-circle me-2"></i>Respectez bien la posologie indiquée par votre médecin.
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}