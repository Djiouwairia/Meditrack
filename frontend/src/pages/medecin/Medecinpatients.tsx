import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import {
    medecinService, rendezVousService,
    type Medecin, type Patient
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

    const navigate = useNavigate();

    // ── Chargement réel depuis l'API ──────────────────────────────────────
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const med = await medecinService.getMe();
            setMedecin(med);

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
    const openDossier = (pat: Patient) => {
        navigate("/dashboard/medecin/patients/" + pat.id);
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

                            <div style={{ padding: "10px 16px", borderTop: "0.5px solid #EBEBEB", textAlign: "center" }}>
                                <span style={{ color: ACCENT, fontSize: 13, fontWeight: 600 }}>
                                    <i className="bi bi-folder2-open me-2"></i>Voir le dossier
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}


        </DashboardLayout>
    );
}