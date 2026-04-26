=import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/common/Statcard";
import { useAuth } from "../../context/AuthContext";
import {
    hopitalService,
    utilisateurService,
    type Hopital,
    type Utilisateur
} from "../../services/Adminservice";

import {
    medecinService,
    patientService,
    secretaireService
} from "../../services/DomainServices";

import "../../styles/admin-dashboard.css";

const NAV = [
    { icon: "bi-speedometer2", label: "Tableau de bord", path: "/dashboard/admin" },
    { icon: "bi-hospital", label: "Hôpitaux", path: "/dashboard/admin/hopitaux" },
    { icon: "bi-people", label: "Utilisateurs", path: "/dashboard/admin/utilisateurs" },
    { icon: "bi-person-badge", label: "Médecins", path: "/dashboard/admin/medecins" },
    { icon: "bi-person-gear", label: "Mon profil", path: "/dashboard/admin/profil" },
];

const COLORS = {
    primary: "#DC2626",
    primaryLight: "#FEE2E2",
    success: "#1A7A52",
    successLight: "#E8F5EE",
};

function Modal({ title, onClose, children }: any) {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button onClick={onClose}>✕</button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const { user } = useAuth();

    const [tab, setTab] = useState<"hopitaux" | "utilisateurs">("hopitaux");
    const [loading, setLoading] = useState(true);

    const [hopitaux, setHopitaux] = useState<Hopital[]>([]);
    const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);

    const [search, setSearch] = useState("");

    const [stats, setStats] = useState({
        hopitaux: 0,
        medecins: 0,
        patients: 0,
        secretaires: 0
    });

    /* ───── LOAD DATA ───── */
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [h, u, m, p, s] = await Promise.all([
                hopitalService.getAll(0, 100),
                utilisateurService.getAll(0, 200),
                medecinService.getAll(0, 1),
                patientService.getAll(0, 1),
                secretaireService.getAll(0, 1),
            ]);

            setHopitaux(h.content);
            setUtilisateurs(u.content);

            setStats({
                hopitaux: h.totalElements,
                medecins: m.totalElements,
                patients: p.totalElements,
                secretaires: s.totalElements,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    /* ───── FILTERS ───── */
    const filteredHopitaux = hopitaux.filter(h =>
        h.nom?.toLowerCase().includes(search.toLowerCase())
    );

    const filteredUsers = utilisateurs.filter(u =>
        `${u.nom} ${u.prenom} ${u.email} ${u.role}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <DashboardLayout navItems={NAV} title="Administration" accentColor={COLORS.primary}>

            {/* ───── HEADER ───── */}
            <div className="admin-header">
                <div>
                    <div className="kicker">Administration</div>
                    <div className="title">Vue globale du système</div>
                </div>

                <div className="stats-inline">
                    <div><strong>{stats.hopitaux}</strong><span>Hôpitaux</span></div>
                    <div><strong>{stats.medecins}</strong><span>Médecins</span></div>
                    <div><strong>{stats.patients}</strong><span>Patients</span></div>
                    <div><strong>{stats.secretaires}</strong><span>Secrétaires</span></div>
                </div>
            </div>

            {/* ───── STAT CARDS ───── */}
            <div className="grid-cards">
                <StatCard icon="bi-hospital" label="Hôpitaux" value={stats.hopitaux} color={COLORS.primary} bg={COLORS.primaryLight} />
                <StatCard icon="bi-person-badge" label="Médecins" value={stats.medecins} color={COLORS.success} bg={COLORS.successLight} />
                <StatCard icon="bi-people" label="Patients" value={stats.patients} color="#0EA5E9" bg="#E0F2FE" />
                <StatCard icon="bi-person-lines-fill" label="Secrétaires" value={stats.secretaires} color="#7C3AED" bg="#EDE9FE" />
            </div>

            {/* ───── TABS ───── */}
            <div className="tabs">
                <button
                    className={tab === "hopitaux" ? "active" : ""}
                    onClick={() => setTab("hopitaux")}
                >
                    🏥 Hôpitaux
                </button>

                <button
                    className={tab === "utilisateurs" ? "active" : ""}
                    onClick={() => setTab("utilisateurs")}
                >
                    👥 Utilisateurs
                </button>
            </div>

            {/* ───── SEARCH ───── */}
            <div className="search-bar">
                <i className="bi bi-search"></i>
                <input
                    placeholder={
                        tab === "hopitaux"
                            ? "Rechercher un hôpital..."
                            : "Rechercher un utilisateur..."
                    }
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* ───── CONTENT ───── */}
            {loading ? (
                <div className="loading">
                    <div className="spinner-border" />
                </div>
            ) : tab === "hopitaux" ? (
                <div className="grid-hospital">
                    {filteredHopitaux.map(h => (
                        <div key={h.id} className="hospital-card">
                            <div className="hospital-header">
                                <div className="icon">🏥</div>
                                <div className="name">{h.nom}</div>
                            </div>

                            <div className="hospital-info">
                                <span>{h.adresse}</span>
                                <span>{h.telephone}</span>
                                <span>{h.email}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                        <tr>
                            <th>Utilisateur</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Hôpital</th>
                        </tr>
                        </thead>

                        <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div className="user">
                                        <div className="avatar">
                                            {u.prenom?.[0]}{u.nom?.[0]}
                                        </div>
                                        <span>{u.prenom} {u.nom}</span>
                                    </div>
                                </td>
                                <td>{u.email}</td>
                                <td>
                                    <span className={`badge role-${u.role}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td>{u.hopital?.nom || "—"}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    );
}