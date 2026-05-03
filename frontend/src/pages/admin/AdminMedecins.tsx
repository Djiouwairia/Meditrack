import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import EmptyImg from "../../assets/Empty.gif";

import { medecinService, type Medecin } from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",  label: "Tableau de bord", path: "/dashboard/admin" },
    { icon: "bi-hospital",      label: "Hôpitaux",        path: "/dashboard/admin/hopitaux" },
    { icon: "bi-people",        label: "Utilisateurs",    path: "/dashboard/admin/utilisateurs" },
    { icon: "bi-person-badge",  label: "Médecins",        path: "/dashboard/admin/medecins" },
    { icon: "bi-person-gear",   label: "Mon profil",      path: "/dashboard/admin/profil" },
];

export default function AdminMedecins() {
    const [medecins, setMedecins] = useState<Medecin[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState("");

    const loadMedecins = useCallback(async (pg: number) => {
        setLoading(true);
        try {
            const data = await medecinService.getAll(pg, 8, "nom");
            setMedecins(data.content);
            setTotalPages(data.totalPages);
            setPage(pg);
        } catch (error) {
            console.error("Erreur chargement médecins", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadMedecins(0); }, [loadMedecins]);

    const filtered = medecins.filter(m =>
        `${m.nom} ${m.prenom} ${m.email} ${m.specialite}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout navItems={NAV} title="Gestion des médecins">
            {/* ── Toolbar ── */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div
                    className="d-flex align-items-center gap-2 bg-white rounded-3 px-3 py-2 shadow-sm border flex-grow-1"
                    style={{ maxWidth: 360 }}
                >
                    <i className="bi bi-search text-secondary"></i>
                    <input
                        placeholder="Rechercher un médecin..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border-0 small flex-grow-1"
                        style={{ outline: "none" }}
                    />
                </div>
            </div>

            {/* ── Table ── */}
            <div className="bg-white rounded-4 p-4 shadow-sm border" style={{ overflowX: "auto" }}>
                {loading ? (
                    <div className="d-flex justify-content-center py-5">
                        <div className="spinner-border" style={{ color: "#27A869" }}></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center bg-white border rounded-4 py-5">
                        <img src={EmptyImg} alt="" style={{ width: "20rem" }} />
                        <div className="mt-3 text-muted">Aucun médecin trouvé</div>
                    </div>
                ) : (
                    <>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                            <thead>
                            <tr style={{ borderBottom: "2px solid #F0F2F7" }}>
                                {["Médecin", "Email", "Téléphone", "Spécialité", "Statut"].map(h => (
                                    <th
                                        key={h}
                                        style={{
                                            textAlign: "left",
                                            padding: "10px 14px",
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: "#6B7280",
                                            textTransform: "uppercase",
                                            letterSpacing: 0.5
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.map(m => {
                                const initials = `${m?.prenom?.[0] ?? "?"}${m?.nom?.[0] ?? "?"}`.toUpperCase();
                                return (
                                    <tr
                                        key={m.id}
                                        className="align-middle"
                                        style={{ borderBottom: "1px solid #F0F2F7", transition: "background 0.12s" }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FAFAFA"}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                                    >
                                        <td style={{ padding: "13px 14px" }}>
                                            <div className="d-flex align-items-center gap-2">
                                                <div
                                                    className="d-flex align-items-center justify-content-center"
                                                    style={{ width: 36, height: 36, borderRadius: "50%", background: "#fcfedb", color: "#888a1e", fontWeight: 700, fontSize: 13 }}
                                                >
                                                    {initials}
                                                </div>
                                                <div className="fw-semibold text-muted" style={{ fontSize: 14 }}>
                                                    Dr. {m.prenom} {m.nom}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "13px 14px", fontSize: 13 }} className="text-muted">{m.email}</td>
                                        <td style={{ padding: "13px 14px", fontSize: 13 }}>{m.telephone || <span className="text-secondary">—</span>}</td>
                                        <td style={{ padding: "13px 14px" }}>
                                            <span className="badge" style={{ background: "#F3F4F6", color: "#374151", fontSize: 11, borderRadius: 10 }}>
                                                {m.specialite || "Non défini"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "13px 14px" }}>
                                            {m.disponible ? (
                                                <span className="badge text-lowercase" style={{ background: "#DCFCE7", color: "#27A869", fontSize: 11, borderRadius: 10 }}>
                                                    Disponible
                                                </span>
                                            ) : (
                                                <span className="badge text-lowercase" style={{ background: "#FEE2E2", color: "#991B1B", fontSize: 11, borderRadius: 10 }}>
                                                    Indisponible
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center gap-2 mt-4">
                                <button onClick={() => loadMedecins(page - 1)} disabled={page === 0} className="btn btn-light rounded-3 px-3">‹</button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => loadMedecins(i)}
                                        className="btn rounded-3 px-3"
                                        style={{ background: page === i ? "#27A869" : "#F3F4F6", color: page === i ? "#fff" : "#374151", fontWeight: 600, border: "none" }}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button onClick={() => loadMedecins(page + 1)} disabled={page >= totalPages - 1} className="btn btn-light rounded-3 px-3">›</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
