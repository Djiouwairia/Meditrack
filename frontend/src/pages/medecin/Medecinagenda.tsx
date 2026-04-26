import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { rendezVousService, medecinService, type RendezVous, type Medecin } from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2", label: "Tableau de bord", path: "/dashboard/medecin" },
    { icon: "bi-calendar-check", label: "Mon agenda", path: "/dashboard/medecin/agenda" },
    { icon: "bi-people", label: "Mes patients", path: "/dashboard/medecin/patients" },
    { icon: "bi-file-earmark-medical", label: "Ordonnances", path: "/dashboard/medecin/ordonnances" },
    { icon: "bi-person-gear", label: "Mon profil", path: "/dashboard/medecin/profil" },
];

export default function MedecinAgenda() {
    const { user } = useAuth();
    const [medecin, setMedecin] = useState<Medecin | null>(null);
    const [rdvs, setRdvs] = useState<RendezVous[]>([]);
    const [loading, setLoading] = useState(true);
    const [debut, setDebut] = useState(() => new Date().toISOString().slice(0, 10));
    const [fin, setFin] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() + 6); return d.toISOString().slice(0, 10);
    });
    const [filterStatut, setFilterStatut] = useState("TOUS");

    const loadMedecin = useCallback(async () => {
        if (!user?.email) return;
        const page = await medecinService.getAll(0, 100);
        const med = page.content.find(m => m.email === user.email);
        setMedecin(med || null);
        return med;
    }, [user]);

    const loadRdvs = useCallback(async (med: Medecin | null, d: string, f: string) => {
        if (!med) return;
        setLoading(true);
        try {
            const data = await rendezVousService.getAgendaMedecin(med.id, d, f);
            setRdvs(data);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        loadMedecin().then(med => med && loadRdvs(med, debut, fin));
    }, []);

    const handleSearch = () => medecin && loadRdvs(medecin, debut, fin);

    const filtered = filterStatut === "TOUS" ? rdvs : rdvs.filter(r => r.statut === filterStatut);

    // Group by date
    const grouped = filtered.reduce<Record<string, RendezVous[]>>((acc, rdv) => {
        const key = rdv.date;
        if (!acc[key]) acc[key] = [];
        acc[key].push(rdv);
        return acc;
    }, {});

    return (
        <DashboardLayout navItems={NAV} title="Mon agenda" accentColor="#27A869">
            {/* Filters */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "16px 24px", marginBottom: 20, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #F0F2F7" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Du</label>
                    <input type="date" value={debut} onChange={e => setDebut(e.target.value)} style={{ borderRadius: 8, border: "1px solid #E5E7EB", padding: "6px 10px", fontSize: 13 }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Au</label>
                    <input type="date" value={fin} onChange={e => setFin(e.target.value)} style={{ borderRadius: 8, border: "1px solid #E5E7EB", padding: "6px 10px", fontSize: 13 }} />
                </div>
                <button onClick={handleSearch} style={{ background: "linear-gradient(135deg,#27A869,#27A869)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    Rechercher
                </button>
                <div style={{ display: "flex", gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
                    {["TOUS", "EN_ATTENTE", "CONFIRME", "TERMINE", "ANNULE"].map(s => (
                        <button key={s} onClick={() => setFilterStatut(s)} style={{ background: filterStatut === s ? "#27A869" : "#F3F4F6", color: filterStatut === s ? "#fff" : "#374151", border: "none", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
                            {s === "TOUS" ? "Tous" : s.replace("_", " ")}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="d-flex justify-content-center" style={{ padding: 60 }}>
                    <div className="spinner-border" style={{ color: "#27A869" }}></div>
                </div>
            ) : Object.keys(grouped).length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 0", color: "#8A94A6", background: "#fff", borderRadius: 16 }}>
                    <i className="bi bi-calendar2-x" style={{ fontSize: 48 }}></i>
                    <div style={{ marginTop: 16, fontSize: 16 }}>Aucun rendez-vous sur cette période</div>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {Object.entries(grouped)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([date, list]) => (
                            <div key={date} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #F0F2F7" }}>
                                <div style={{ background: "#F8FAFC", padding: "12px 24px", borderBottom: "1px solid #EEF1F6" }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#0D1F2D" }}>
                  {new Date(date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </span>
                                    <span style={{ marginLeft: 12, background: "#27A86922", color: "#27A869", fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>
                  {list.length} RDV
                </span>
                                </div>
                                <div style={{ padding: "12px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                                    {list.sort((a, b) => a.heure.localeCompare(b.heure)).map(rdv => (
                                        <div key={rdv.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", borderRadius: 12, background: "#F8FAFC", border: "1px solid #EEF1F6" }}>
                                            <div style={{ width: 52, textAlign: "center" }}>
                                                <span style={{ fontWeight: 700, color: "#27A869", fontSize: 16 }}>{rdv.heure?.slice(0, 5)}</span>
                                            </div>
                                            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#27A86922", display: "flex", alignItems: "center", justifyContent: "center", color: "#27A869", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                                                {rdv.patient?.prenom?.[0]}{rdv.patient?.nom?.[0]}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{rdv.patient?.prenom} {rdv.patient?.nom}</div>
                                                <div style={{ fontSize: 12, color: "#8A94A6" }}>{rdv.motif}</div>
                                                {rdv.diagnostic && <div style={{ fontSize: 12, color: "#6366F1", marginTop: 2 }}>Diag: {rdv.diagnostic}</div>}
                                            </div>
                                            <StatusBadge status={rdv.statut} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </DashboardLayout>
    );
}