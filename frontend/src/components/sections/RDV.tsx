import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

interface Hopital {
    id: string;
    nom: string;
}

interface Medecin {
    id: string;
    nom: string;
    prenom: string;
    specialite: string;
    disponible: boolean;
    hopital?: Hopital;
}

// Suppression des faux créneaux (SLOTS_POOL)

const SPEC_ICONS: Record<string, string> = {
    "Cardiologie":       "❤️",
    "Dermatologie":      "🧴",
    "Endocrinologie":    "⚗️",
    "Gastroentérologie": "🫁",
    "Gynécologie":       "🌸",
    "Médecine générale": "🩺",
    "Neurologie":        "🧠",
    "Oncologie":         "🎗️",
    "Ophtalmologie":     "👁️",
    "ORL":               "👂",
    "Orthopédie":        "🦴",
    "Pédiatrie":         "👶",
    "Pneumologie":       "🫀",
    "Psychiatrie":       "🧘",
    "Radiologie":        "🔬",
    "Rhumatologie":      "💪",
    "Urologie":          "🧬",
};

const customStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

.rdv-section {
    background: linear-gradient(135deg, #f0f2f5 0%, #e9ecef 100%);
    min-height: 100vh;
    position: relative;
    padding: 80px 0;
}

.rdv-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 2000"><path fill="rgba(39,168,105,0.03)" d="M0,0 L2000,0 L2000,2000 L0,2000 Z M1000,500 C800,500 600,700 600,1000 C600,1300 800,1500 1000,1500 C1200,1500 1400,1300 1400,1000 C1400,700 1200,500 1000,500 Z"/></svg>') repeat;
    pointer-events: none;
}

.rdv-header {
    text-align: center;
    margin-bottom: 56px;
    position: relative;
    z-index: 1;
}

.rdv-badge {
    display: inline-block;
    background: rgba(39, 168, 105, 0.15);
    color: #1A7A52;
    padding: 8px 24px;
    border-radius: 50px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.5px;
    margin-bottom: 20px;
    text-transform: uppercase;
}

.rdv-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 4vw, 2.8rem);
    font-weight: 800;
    background: linear-gradient(135deg, #1A7A52, #27A869);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 20px;
}

.rdv-header p {
    font-size: 1.1rem;
    color: #5a6a7a;
    max-width: 700px;
    margin: 0 auto;
}

.rdv-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    margin-bottom: 48px;
    position: relative;
    z-index: 1;
}

.rdv-filter-btn {
    background: white;
    border: 1px solid rgba(39,168,105,0.2);
    color: #3A5F4A;
    border-radius: 50px;
    padding: 10px 22px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.rdv-filter-btn:hover,
.rdv-filter-btn.active {
    background: linear-gradient(135deg, #27A869, #1A7A52);
    color: #fff;
    border-color: transparent;
    box-shadow: 0 6px 20px rgba(39,168,105,0.25);
    transform: translateY(-2px);
}

.rdv-card {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    transition: transform 0.25s, box-shadow 0.25s;
    box-shadow: 0 2px 16px rgba(27,122,82,0.06);
    height: 100%;
}

.rdv-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(27,122,82,0.12);
}

.rdv-card-header {
    background: linear-gradient(135deg, #27A869 0%, #1A7A52 100%);
    padding: 22px 24px 18px;
}

.rdv-avatar {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: rgba(255,255,255,0.22);
    border: 2px solid rgba(255,255,255,0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.35rem;
    font-weight: 800;
    color: #fff;
    flex-shrink: 0;
    font-family: 'Playfair Display', serif;
}

.rdv-card-name {
    color: #fff;
    font-size: 1.05rem;
    font-weight: 700;
    margin: 0;
}

.rdv-card-spec {
    color: rgba(255,255,255,0.82);
    font-size: 0.82rem;
    margin: 3px 0 0;
}

.rdv-card-hopital {
    color: rgba(255,255,255,0.70);
    font-size: 0.78rem;
    margin: 3px 0 0;
}

.rdv-slots {
    padding: 18px 20px 20px;
}

.rdv-slots-title {
    font-size: 0.78rem;
    font-weight: 600;
    color: #8A9E94;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 0 0 12px;
}

.rdv-slot {
    background: #F0FAF4;
    border: 1.5px solid #C8E8D4;
    border-radius: 10px;
    padding: 8px 6px;
    text-align: center;
    cursor: pointer;
    transition: all 0.18s;
    width: 100%;
}

.rdv-slot:hover,
.rdv-slot.selected {
    background: linear-gradient(135deg, #27A869, #1A7A52);
    border-color: transparent;
    color: #fff;
    box-shadow: 0 4px 12px rgba(27,122,82,.22);
    transform: scale(1.04);
}

.rdv-slot-date {
    font-size: 0.7rem;
    font-weight: 600;
    color: #3A6B4F;
    display: block;
    line-height: 1.2;
}

.rdv-slot.selected .rdv-slot-date,
.rdv-slot:hover .rdv-slot-date {
    color: rgba(255,255,255,0.85);
}

.rdv-slot-heure {
    font-size: 0.9rem;
    font-weight: 700;
    color: #1A7A52;
    display: block;
    margin-top: 2px;
}

.rdv-slot.selected .rdv-slot-heure,
.rdv-slot:hover .rdv-slot-heure {
    color: #fff;
}

.rdv-btn-reserver {
    width: 100%;
    background: linear-gradient(135deg, #27A869, #1A7A52);
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 12px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 16px;
}

.rdv-btn-reserver:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(27,122,82,.35);
    transform: translateY(-1px);
}

.rdv-btn-reserver:disabled {
    background: #C8D8CC;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.spinner-custom {
    width: 44px;
    height: 44px;
    border: 3px solid #D1E8DC;
    border-top-color: #27A869;
    border-radius: 50%;
    animation: rdv-spin 0.8s linear infinite;
    margin: 0 auto 16px;
}

@keyframes rdv-spin { to { transform: rotate(360deg); } }

@keyframes rdv-slidein {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.rdv-toast {
    position: fixed;
    bottom: 28px;
    right: 28px;
    background: linear-gradient(135deg, #27A869, #1A7A52);
    color: #fff;
    padding: 14px 22px;
    border-radius: 14px;
    font-size: 0.9rem;
    font-weight: 600;
    box-shadow: 0 8px 28px rgba(27,122,82,.35);
    z-index: 9999;
    animation: rdv-slidein 0.3s ease;
    max-width: 320px;
}

@media (max-width: 768px) {
    .rdv-filters { gap: 8px; }
    .rdv-filter-btn { padding: 6px 14px; font-size: 0.75rem; }
    .rdv-section { padding: 60px 0; }
    .rdv-header h2 { font-size: 1.9rem; }
    .rdv-header p { font-size: 0.95rem; }
    .rdv-card-header { padding: 18px 18px 14px; }
    .rdv-avatar { width: 48px; height: 48px; font-size: 1.1rem; border-radius: 12px; }
    .rdv-card-name { font-size: 0.95rem; }
    .rdv-toast { right: 12px; bottom: 12px; left: 12px; max-width: 100%; font-size: 0.85rem; }
}

@media (max-width: 480px) {
    .rdv-section { padding: 50px 0; }
    .rdv-header { margin-bottom: 36px; }
    .rdv-header h2 { font-size: 1.65rem; }
    .rdv-filters { justify-content: flex-start; overflow-x: auto; flex-wrap: nowrap; padding-bottom: 4px; }
    .rdv-filter-btn { flex-shrink: 0; }
    .rdv-slots { padding: 14px 14px 16px; }
    .rdv-btn-reserver { font-size: 0.85rem; padding: 10px; }
    .rdv-slot-date { font-size: 0.65rem; }
    .rdv-slot-heure { font-size: 0.82rem; }
}
`;

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

interface Creneau {
    id: string;
    date: string;
    heure: string;
    isoDate: string;
}

function MedecinCard({ medecin, onReserver }: { medecin: Medecin, onReserver: (m: Medecin, c: Creneau) => void }) {
    const [slots, setSlots] = useState<Creneau[]>([]);
    const [loading, setLoading] = useState(true);
    const [choix, setChoix] = useState<Creneau | null>(null);

    useEffect(() => {
        fetch(`${API_BASE}/disponibilites/medecin/${medecin.id}/libres`)
            .then(res => res.json())
            .then(data => {
                const mapped = data.map((d: any) => {
                    const dateObj = new Date(d.date);
                    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
                    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
                    const strDate = `${days[dateObj.getDay()]} ${dateObj.getDate().toString().padStart(2, '0')} ${months[dateObj.getMonth()]}`;
                    
                    return {
                        id: d.id,
                        date: strDate,
                        heure: d.heureDebut.substring(0, 5),
                        isoDate: d.date
                    };
                });
                setSlots(mapped);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [medecin.id]);

    const toggleSlot = (c: Creneau) => {
        setChoix(prev => (prev?.id === c.id ? null : c));
    };

    const initiales = `${medecin.prenom?.[0] ?? ""}${medecin.nom?.[0] ?? ""}`;

    return (
        <div className="col-12 col-md-6 col-lg-4">
            <div className="rdv-card">
                <div className="rdv-card-header">
                    <div className="d-flex gap-3">
                        <div className="rdv-avatar">{initiales}</div>
                        <div>
                            <h5 className="rdv-card-name">
                                Dr. {medecin.prenom} {medecin.nom}
                            </h5>
                            <p className="rdv-card-spec">
                                {SPEC_ICONS[medecin.specialite] ?? "🩺"} {medecin.specialite}
                            </p>
                            {medecin.hopital?.nom && (
                                <p className="rdv-card-hopital">
                                    🏥 {medecin.hopital.nom}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="rdv-slots">
                    <p className="rdv-slots-title">📆 Prochains créneaux</p>
                    
                    {loading ? (
                        <div className="text-center py-3"><span className="spinner-border spinner-border-sm text-success"></span></div>
                    ) : slots.length === 0 ? (
                        <div className="text-center text-muted small py-3">Aucun créneau disponible.</div>
                    ) : (
                        <div className="row g-2">
                            {slots.map((c) => {
                                const isSelected = choix?.id === c.id;
                                return (
                                    <div key={c.id} className="col-4">
                                        <div
                                            className={`rdv-slot ${isSelected ? "selected" : ""}`}
                                            onClick={() => toggleSlot(c)}
                                        >
                                            <span className="rdv-slot-date">{c.date}</span>
                                            <span className="rdv-slot-heure">{c.heure}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <button
                        className="rdv-btn-reserver"
                        disabled={!choix}
                        onClick={() => onReserver(medecin, choix!)}
                    >
                        {choix
                            ? `📅 Réserver — ${choix.date} ${choix.heure}`
                            : "🗓️ Choisissez un créneau"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function RDV() {
    const navigate = useNavigate();

    const [medecins, setMedecins]         = useState<Medecin[]>([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState<string | null>(null);
    const [specialites, setSpecialites]   = useState<string[]>([]);
    const [filtre, setFiltre]             = useState<string>("Tous");

    const [toast, setToast]               = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${API_BASE}/medecins/disponibles`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data: Medecin[] = await res.json();
                setMedecins(data);
                const specs = ["Tous", ...Array.from(new Set(data.map(m => m.specialite).filter(Boolean)))];
                setSpecialites(specs);
            } catch (e: any) {
                setError("Impossible de charger les médecins. Vérifiez votre connexion.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3500);
        return () => clearTimeout(t);
    }, [toast]);

    const medecinsFiltres = filtre === "Tous"
        ? medecins
        : medecins.filter(m => m.specialite === filtre);

    const handleReserver = (medecin: Medecin, creneau: Creneau) => {
        
        sessionStorage.setItem("pendingRdv", JSON.stringify({
            medecinId: medecin.id,
            medecinNom: medecin.nom,
            medecinPrenom: medecin.prenom,
            medecinSpecialite: medecin.specialite,
            date: creneau.isoDate,
            dateDisplay: creneau.date,
            heure: creneau.heure,
            motif: "Consultation en cabinet"
        }));

        setToast(
            `✓ Créneau sélectionné avec Dr. ${medecin.prenom} ${medecin.nom} — ${creneau.date} à ${creneau.heure}. Connectez-vous pour confirmer.`
        );
        setTimeout(() => navigate("/login"), 1800);
    };

    return (
        <>
            <style>{customStyles}</style>

            <section id="rdv" className="rdv-section">
                <div className="container">
                    <div className="rdv-header">
                        <div className="rdv-badge">📅 Prenez rendez-vous</div>
                        <h2>Prendre un rendez-vous</h2>
                        <p>
                            Consultez nos spécialistes disponibles, choisissez un créneau
                            et confirmez votre réservation en vous connectant.
                        </p>
                    </div>

                    {!loading && !error && specialites.length > 1 && (
                        <div className="rdv-filters">
                            {specialites.map(s => (
                                <button
                                    key={s}
                                    className={`rdv-filter-btn ${filtre === s ? "active" : ""}`}
                                    onClick={() => setFiltre(s)}
                                >
                                    {s !== "Tous" && (SPEC_ICONS[s] ?? "🩺")} {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-5">
                            <div className="spinner-custom"></div>
                            <p className="text-muted">Chargement des médecins disponibles…</p>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger text-center" role="alert">
                            ⚠️ {error}
                        </div>
                    )}

                    {!loading && !error && medecinsFiltres.length === 0 && (
                        <div className="text-center py-5">
                            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔍</div>
                            <p className="text-muted">Aucun médecin disponible pour cette spécialité.</p>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="row g-4">
                            {medecinsFiltres.map((medecin) => (
                                <MedecinCard key={medecin.id} medecin={medecin} onReserver={handleReserver} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {toast && <div className="rdv-toast">{toast}</div>}
        </>
    );
}

export default RDV;