import { useState, useEffect, useCallback, useRef } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/common/Statcard";
import { useAuth } from "../../context/AuthContext";
import {
    hopitalService,
    utilisateurService,
    type Hopital,
    type Utilisateur
} from "../../services/Adminservice";
import { medecinService, patientService, secretaireService } from "../../services/DomainServices";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Filler,
    Title,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale, LinearScale, BarElement, ArcElement,
    LineElement, PointElement, Tooltip, Legend, Filler, Title
);

const NAV = [
    { icon: "bi-speedometer2", label: "Tableau de bord", path: "/dashboard/admin" },
    { icon: "bi-hospital",     label: "Hôpitaux",        path: "/dashboard/admin/hopitaux" },
    { icon: "bi-people",       label: "Utilisateurs",    path: "/dashboard/admin/utilisateurs" },
    { icon: "bi-person-badge", label: "Médecins",        path: "/dashboard/admin/medecins" },
    { icon: "bi-person-gear",  label: "Mon profil",      path: "/dashboard/admin/profil" },
];

// ── Carte graphique ──
function ChartCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
    return (
        <div style={{
            background: "#fff",
            borderRadius: 16,
            padding: "20px 24px",
            border: "1px solid #EBEBEB",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <i className={`bi ${icon}`} style={{ color: "#27A869", fontSize: 16 }}></i>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{title}</span>
            </div>
            {children}
        </div>
    );
}

export default function AdminDashboard() {
    useAuth();

    const [hopitaux, setHopitaux]       = useState<Hopital[]>([]);
    const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
    const [loading, setLoading]         = useState(true);

    const [stats, setStats] = useState({
        hopitaux: 0,
        medecins: 0,
        patients: 0,
        secretaires: 0
    });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [hops, users, meds, pats, secs] = await Promise.all([
                hopitalService.getAll(0, 100),
                utilisateurService.getAll(0, 200),
                medecinService.getAll(0, 1),
                patientService.getAll(0, 1),
                secretaireService.getAll(0, 1),
            ]);
            setHopitaux(hops.content);
            setUtilisateurs(users.content);
            setStats({
                hopitaux:    hops.totalElements,
                medecins:    meds.totalElements,
                patients:    pats.totalElements,
                secretaires: secs.totalElements,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // ── Données graphiques ──

    // 1. Donut — répartition des rôles
    const roleCount = utilisateurs.reduce<Record<string, number>>((acc, u) => {
        const r = u.role || "AUTRE";
        acc[r] = (acc[r] || 0) + 1;
        return acc;
    }, {});

    const doughnutData = {
        labels: Object.keys(roleCount),
        datasets: [{
            data: Object.values(roleCount),
            backgroundColor: ["#27A869", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"],
            borderWidth: 2,
            borderColor: "#fff",
            hoverOffset: 6,
        }]
    };

    // 2. Barres — utilisateurs par statut
    const statutCount = utilisateurs.reduce<Record<string, number>>((acc, u) => {
        const s = u.statutUtilisateur || "INCONNU";
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});

    const barData = {
        labels: Object.keys(statutCount),
        datasets: [{
            label: "Utilisateurs",
            data: Object.values(statutCount),
            backgroundColor: ["#27A869", "#EF4444", "#F59E0B", "#6B7280"],
            borderRadius: 8,
            borderSkipped: false,
        }]
    };

    // 3. Line — vue d'ensemble des entités
    const lineData = {
        labels: ["Hôpitaux", "Médecins", "Patients", "Secrétaires"],
        datasets: [{
            label: "Total",
            data: [stats.hopitaux, stats.medecins, stats.patients, stats.secretaires],
            borderColor: "#27A869",
            backgroundColor: "rgba(39,168,105,0.12)",
            borderWidth: 2.5,
            pointBackgroundColor: "#27A869",
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: true,
            tension: 0.4,
        }]
    };

    // 4. Barres horizontales — top hôpitaux (nombre de caractères nom = placeholder visuel)
    const topHopitaux = hopitaux.slice(0, 6);
    const hBarData = {
        labels: topHopitaux.map(h => h.nom?.length > 20 ? h.nom.slice(0, 18) + "…" : h.nom),
        datasets: [{
            label: "Hôpitaux enregistrés",
            data: topHopitaux.map((_, i) => i + 1),
            backgroundColor: "rgba(39,168,105,0.75)",
            borderRadius: 6,
            borderSkipped: false,
        }]
    };

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: "#1F2937", titleColor: "#fff", bodyColor: "#D1FAE5", padding: 10, cornerRadius: 8 },
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: "#6B7280", font: { size: 11 } } },
            y: { grid: { color: "#F3F4F6" }, ticks: { color: "#6B7280", font: { size: 11 } } },
        }
    };

    const now = new Date();
    const greeting = now.getHours() < 12 ? "Bonjour" : now.getHours() < 18 ? "Bon après-midi" : "Bonsoir";

    return (
        <DashboardLayout navItems={NAV} title="Administration">

            {/* ── Banner ── */}
            <div style={{
                background: "#fff",
                borderRadius: 14,
                padding: "20px 24px",
                marginBottom: 20,
                display: "flex",
                justifyContent: "space-between",
                border: "1px solid #EBEBEB"
            }}>
                <div>
                    <div style={{ fontSize: 12, opacity: 0.85 }}>{greeting} 👋</div>
                    <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>
                        {user?.prenom} {user?.nom}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                        Administrateur
                    </div>
                </div>
                <i className="bi bi-shield-check" style={{ fontSize: 42, opacity: 0.3 }}></i>
            </div>

            {/* ── Stats ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 16, marginBottom: 28 }}>
                <StatCard icon="bi-hospital"          label="Hôpitaux"    value={stats.hopitaux}    color="#DC2626" bg="#FEE2E2" />
                <StatCard icon="bi-person-badge"      label="Médecins"    value={stats.medecins}    color="#1A7A52" bg="#E8F5EE" />
                <StatCard icon="bi-people"            label="Patients"    value={stats.patients}    color="#0EA5E9" bg="#E0F2FE" />
                <StatCard icon="bi-person-lines-fill" label="Secrétaires" value={stats.secretaires} color="#7C3AED" bg="#EDE9FE" />
            </div>

            {loading ? (
                <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border" style={{ color: "#27A869" }}></div>
                </div>
            ) : (
                <>
                    {/* ── Ligne 1 : Line + Donut ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>

                        <ChartCard title="Vue d'ensemble des entités" icon="bi-graph-up">
                            <Line
                                data={lineData}
                                options={{
                                    ...commonOptions,
                                    plugins: {
                                        ...commonOptions.plugins,
                                        legend: { display: false },
                                    }
                                }}
                                height={100}
                            />
                        </ChartCard>

                        <ChartCard title="Répartition des rôles" icon="bi-pie-chart">
                            <Doughnut
                                data={doughnutData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: true,
                                    cutout: "68%",
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: "bottom",
                                            labels: { color: "#374151", font: { size: 11 }, padding: 12, boxWidth: 12, borderRadius: 4 }
                                        },
                                        tooltip: { backgroundColor: "#1F2937", titleColor: "#fff", bodyColor: "#D1FAE5", padding: 10, cornerRadius: 8 },
                                    }
                                }}
                            />
                        </ChartCard>

                    </div>

                    {/* ── Ligne 2 : Bar statuts + Bar hôpitaux ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

                        <ChartCard title="Utilisateurs par statut" icon="bi-bar-chart">
                            <Bar
                                data={barData}
                                options={{
                                    ...commonOptions,
                                    plugins: {
                                        ...commonOptions.plugins,
                                        legend: { display: false },
                                    }
                                }}
                                height={140}
                            />
                        </ChartCard>

                        <ChartCard title="Hôpitaux enregistrés" icon="bi-building">
                            <Bar
                                data={hBarData}
                                options={{
                                    indexAxis: "y" as const,
                                    responsive: true,
                                    maintainAspectRatio: true,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: { backgroundColor: "#1F2937", titleColor: "#fff", bodyColor: "#D1FAE5", padding: 10, cornerRadius: 8 },
                                    },
                                    scales: {
                                        x: { grid: { color: "#F3F4F6" }, ticks: { color: "#6B7280", font: { size: 11 } } },
                                        y: { grid: { display: false }, ticks: { color: "#374151", font: { size: 11 } } },
                                    }
                                }}
                                height={140}
                            />
                        </ChartCard>

                    </div>
                </>
            )}

        </DashboardLayout>
    );
}