import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import EmptyImg from "../../assets/Empty.gif";

import {
    medecinService,
    rendezVousService,
    dossierService,
    type Medecin,
    type Patient,
    type DossierMedical
} from "../../services/DomainServices";

/* ─────────────────────────────
   🧪 MOCK DATA
───────────────────────────── */

const MOCK_PATIENTS: Patient[] = [
    {
        id: "1",
        nom: "Diallo",
        prenom: "Aminata",
        email: "aminata@example.com",
        telephone: "77 123 45 67",
        adresse: "Dakar, Médina",
        groupeSanguin: "O+",
        dateDeNaissance: "1995-06-12"
    },
    {
        id: "2",
        nom: "Sow",
        prenom: "Moussa",
        email: "moussa@example.com",
        telephone: "76 222 33 44",
        adresse: "Ziguinchor",
        groupeSanguin: "A+",
        dateDeNaissance: "1990-02-20"
    }
] as any;

const MOCK_DOSSIER: DossierMedical = {
    id: "d1",
    allergies: "Pénicilline",
    poids: 72,
    taille: 175
} as any;

/* ───────────────────────────── */

const NAV = [
    { icon: "bi-speedometer2", label: "Tableau de bord", path: "/dashboard/medecin" },
    { icon: "bi-calendar-check", label: "Mon agenda", path: "/dashboard/medecin/agenda" },
    { icon: "bi-people", label: "Mes patients", path: "/dashboard/medecin/patients" },
    { icon: "bi-file-earmark-medical", label: "Ordonnances", path: "/dashboard/medecin/ordonnances" },
    { icon: "bi-person-gear", label: "Mon profil", path: "/dashboard/medecin/profil" },
];

export default function MedecinPatients() {
    const { user } = useAuth();

    const [medecin, setMedecin] = useState<Medecin | null>(null);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [selPatient, setSelPatient] = useState<Patient | null>(null);
    const [dossier, setDossier] = useState<DossierMedical | null>(null);
    const [dossierLoading, setDossierLoading] = useState(false);

    /* ───── LOAD ───── */
    const load = useCallback(async () => {
        setLoading(true);

        try {
            const useMock = true;

            if (useMock) {
                setMedecin({
                    id: "m1",
                    nom: "Dr Ndiaye",
                    email: "medecin@test.com"
                } as any);

                setPatients(MOCK_PATIENTS);
                return;
            }

            if (!user?.email) return;

            const pMed = await medecinService.getAll(0, 100);
            const med = pMed.content.find(m => m.email === user.email);

            setMedecin(med ?? null);
            if (!med) return;

            const rdvPage = await rendezVousService.getByMedecin(med.id, 0, 200);

            const seen = new Set<string>();
            const unique: Patient[] = [];

            rdvPage.content.forEach(r => {
                if (r.patient && !seen.has(r.patient.id)) {
                    seen.add(r.patient.id);
                    unique.push(r.patient);
                }
            });

            setPatients(unique);

        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        load();
    }, [load]);

    /* ───── DOSSIER ───── */
    const openDossier = async (pat: Patient) => {
        setSelPatient(pat);
        setDossierLoading(true);
        setDossier(null);

        try {
            const useMock = true;

            if (useMock) {
                setDossier(MOCK_DOSSIER);
                return;
            }

            const dos = await dossierService.getByPatient(pat.id);
            setDossier(dos);

        } finally {
            setDossierLoading(false);
        }
    };

    const filtered = patients.filter(p =>
        `${p.nom} ${p.prenom} ${p.email}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <DashboardLayout navItems={NAV} title="Mes patients" accentColor="#27A869">

            {/* SEARCH */}
            <div className="d-flex justify-content-between align-items-center mb-3 gap-2">

                <div className="input-group bg-white border rounded-3 shadow-sm">
                    <span className="input-group-text bg-white border-0">
                        <i className="bi bi-search text-muted"></i>
                    </span>

                    <input
                        className="form-control border-0 shadow-none"
                        placeholder="Rechercher un patient..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

            </div>

            {/* CONTENT */}
            {loading ? (
                <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border text-success" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center bg-white border rounded-4 py-5">
                    <img src={EmptyImg} alt="" style={{ width: "20rem" }} />
                    <div className="mt-3 text-muted">Aucun patient trouvé</div>
                </div>
            ) : (
                <div className="row g-3">

                    {filtered.map((p) => (
                        <div className="col-12 col-md-6 col-lg-4" key={p.id}>

                            <div
                                className="card shadow-sm h-100 patient-card"
                                onClick={() => openDossier(p)}
                                style={{
                                    cursor: "pointer",
                                   
                                    border: "1px solid #E9ECEF",
                                    transition: "all 0.25s ease",
                                }}
                                onMouseEnter={(e) => {
                                    const el = e.currentTarget as HTMLElement;
                                    el.style.transform = "translateY(-4px)";
                                    el.style.boxShadow = "0 12px 28px rgba(39,168,105,0.12)";
                                   
                                }}
                                onMouseLeave={(e) => {
                                    const el = e.currentTarget as HTMLElement;
                                    el.style.transform = "translateY(0)";
                                    el.style.boxShadow = "";
                                    el.style.borderColor = "#E9ECEF";
                                }}
                            >

                                {/* HEADER */}
                                <div className="text-center p-4 border-bottom bg-light-subtle">

                                    <div
                                        className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold mx-auto mb-2 shadow-sm"
                                        style={{
                                            width: 62,
                                            height: 62,
                                            background: "linear-gradient(135deg,#27A869,#1A7A52)",
                                            fontSize: 20
                                        }}
                                    >
                                        {p.prenom?.[0]}{p.nom?.[0]}
                                    </div>

                                    <h6 className="fw-bold mb-1 text-dark">
                                        {p.prenom} {p.nom}
                                    </h6>

                                    {p.groupeSanguin && (
                                        <span className="badge bg-danger-subtle text-danger px-2 py-1">
                                            <i className="bi bi-droplet-fill me-1"></i>
                                            {p.groupeSanguin}
                                        </span>
                                    )}
                                </div>

                                {/* INFOS */}
                                <div className="p-3">

                                    {/* BADGE TITLE */}
                                    <div className="d-flex justify-content-center mb-3">
                                        <span
                                            className="badge rounded-pill px-3 py-2 text-uppercase fw-semibold"
                                            style={{
                                                backgroundColor: "#E8F5EE",
                                                color: "#27A869",
                                                fontSize: "11px",
                                                letterSpacing: "0.5px"
                                            }}
                                        >
                                            Informations supplémentaires
                                        </span>
                                    </div>

                                    <div className="d-flex flex-column gap-2 small text-muted">

                                        {p.email && (
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bi bi-envelope-fill text-primary"></i>
                                                <span className="text-truncate">{p.email}</span>
                                            </div>
                                        )}

                                        {p.telephone && (
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bi bi-telephone-fill text-success"></i>
                                                <span>{p.telephone}</span>
                                            </div>
                                        )}

                                        {p.adresse && (
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bi bi-geo-alt-fill text-danger"></i>
                                                <span className="text-truncate">{p.adresse}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* FOOTER */}
                                <div className="mt-auto p-3 border-top text-center bg-white">

                                    <span className="text-success fw-semibold small d-inline-flex align-items-center gap-1">
                                        <i className="bi bi-eye-fill"></i>
                                        Voir le dossier
                                    </span>

                                </div>

                            </div>
                        </div>
                    ))}

                </div>
            )}

        </DashboardLayout>
    );
}