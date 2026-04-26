const style = `
.specialites {
  padding: 100px 40px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  text-align: center;
}

.specialites h2 {
  font-size: 2.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1A7A52, #27A869);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 15px;
}

.specialites p.sub {
  margin-top: 10px;
  color: #5a6a7a;
  font-size: 1.1rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50px;
}

.specialites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.specialite-item {
  text-align: center;
  padding: 30px 20px;
  background: white;
  border-radius: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(39,168,105,0.1);
}

.specialite-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(39,168,105,0.12);
  border-color: rgba(39,168,105,0.3);
}

.specialite-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, rgba(39,168,105,0.1), rgba(26,122,82,0.05));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.specialite-item:hover .specialite-icon {
  background: linear-gradient(135deg, #27A869, #1A7A52);
  transform: scale(1.05);
}

.specialite-item:hover .specialite-icon svg {
  stroke: white;
}

.specialite-icon svg {
  width: 35px;
  height: 35px;
  stroke: #27A869;
  stroke-width: 1.5;
  transition: all 0.3s ease;
}

.specialite-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1A7A52;
  margin-bottom: 8px;
}

.specialite-desc {
  font-size: 0.85rem;
  color: #6c7a8a;
  line-height: 1.4;
}

.cta-container {
  margin-top: 60px;
}

.cta-specialites {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #27A869, #1A7A52);
  color: white;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(39,168,105,0.3);
}

.cta-specialites:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(39,168,105,0.4);
}

@media (max-width: 768px) {
  .specialites { padding: 60px 20px; }
  .specialites h2 { font-size: 2rem; }
  .specialites-grid { gap: 20px; }
  .specialite-item { padding: 20px 15px; }
  .specialite-icon { width: 55px; height: 55px; }
  .specialite-icon svg { width: 28px; height: 28px; }
  .specialite-name { font-size: 1rem; }
}
`;

function Specialites() {
    const specialitesList = [
        {
            name: "👂 ORL",
            description: "Oreille, nez, gorge - consultations spécialisées",
            icon: (
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 4a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3z" strokeWidth="1.5"/>
                    <path d="M8 13a4 4 0 0 0 8 0" strokeWidth="1.5"/>
                    <path d="M12 17v3" strokeWidth="1.5"/>
                    <path d="M9 20h6" strokeWidth="1.5"/>
                </svg>
            )
        },
        {
            name: "🦷 Dentiste",
            description: "Soins dentaires, implants, orthodontie",
            icon: (
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 3a6 6 0 0 0-6 6c0 3 1 5 3 7 1 1 2 2 2 4h2c0-2 1-3 2-4 2-2 3-4 3-7a6 6 0 0 0-6-6z" strokeWidth="1.5"/>
                    <path d="M9 8c1 1 2 1 3 0" strokeWidth="1.5"/>
                </svg>
            )
        },
        {
            name: "👁️ Ophtalmo",
            description: "Vision, cataracte, laser, lunettes",
            icon: (
                <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" strokeWidth="1.5"/>
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" strokeWidth="1.5"/>
                </svg>
            )
        },
        {
            name: "❤️ Cardiologue",
            description: "Cœur, tension, prévention cardiovasculaire",
            icon: (
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 4l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4l2-4z" strokeWidth="1.5"/>
                    <path d="M3 12h2l2-3 2 3 2-3 2 3 2-3 2 3 2-3 1 3h2" strokeWidth="1.5"/>
                </svg>
            )
        },
        {
            name: "🩺 Pédiatre",
            description: "Suivi médical des enfants et nourrissons",
            icon: (
                <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="10" r="4" strokeWidth="1.5"/>
                    <path d="M5 20v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2" strokeWidth="1.5"/>
                    <path d="M14 5l2-2 2 2" strokeWidth="1.5"/>
                </svg>
            )
        },
        {
            name: "🦴 Orthopédie",
            description: "Os, articulations, traumatologie",
            icon: (
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M17 7l-4-4-4 4" strokeWidth="1.5"/>
                    <path d="M13 3v10" strokeWidth="1.5"/>
                    <path d="M8 21h8" strokeWidth="1.5"/>
                    <path d="M10 17h4" strokeWidth="1.5"/>
                    <path d="M12 21v-4" strokeWidth="1.5"/>
                </svg>
            )
        },
        {
            name: "🧠 Neurologie",
            description: "Cerveau, nerfs, migraines, épilepsie",
            icon: (
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 4a4 4 0 0 0-4 4c0 1.5.5 2 2 3-1 1-2 2-2 4h8c0-2-1-3-2-4 1.5-1 2-1.5 2-3a4 4 0 0 0-4-4z" strokeWidth="1.5"/>
                    <path d="M9 17h6" strokeWidth="1.5"/>
                </svg>
            )
        },
        {
            name: "🤰 Gynécologie",
            description: "Santé de la femme, grossesse, suivi",
            icon: (
                <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" strokeWidth="1.5"/>
                    <path d="M5 20v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2" strokeWidth="1.5"/>
                    <path d="M12 16v4" strokeWidth="1.5"/>
                </svg>
            )
        },
        {
            name: "🧪 Dermatologie",
            description: "Peau, cheveux, ongles, allergie",
            icon: (
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 3a3 3 0 0 0-3 3c0 2 1 3 2 4-1 1-2 2-2 4h6c0-2-1-3-2-4 1-1 2-2 2-4a3 3 0 0 0-3-3z" strokeWidth="1.5"/>
                    <path d="M9 16h6" strokeWidth="1.5"/>
                </svg>
            )
        },
        {
            name: "🏥 Urgences",
            description: "Service d'urgence 24h/24 - 7j/7",
            icon: (
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 8v4l3 3M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" strokeWidth="1.5"/>
                </svg>
            )
        },
        {
            name: "💆 Psychiatrie",
            description: "Santé mentale, bien-être psychologique",
            icon: (
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 6v3m0 0v3m0-3h3m-3 0H9" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="9" strokeWidth="1.5"/>
                    <path d="M12 18v2" strokeWidth="1.5"/>
                </svg>
            )
        },
        {
            name: "🩻 Radiologie",
            description: "Imagerie médicale, scanners, IRM",
            icon: (
                <svg viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="1.5"/>
                    <path d="M8 8h8M8 12h5M8 16h3" strokeWidth="1.5"/>
                    <circle cx="18" cy="6" r="1" fill="#27A869"/>
                </svg>
            )
        },
        {
            name: "💊 Pharmacie",
            description: "Conseils pharmaceutiques, médicaments, ordonnances",
            icon: (
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2v4M8 4h8" strokeWidth="1.5"/>
                    <rect x="5" y="8" width="14" height="14" rx="2" strokeWidth="1.5"/>
                    <path d="M12 11v6M9 14h6" strokeWidth="1.5"/>
                    <circle cx="12" cy="18" r="1" fill="#27A869"/>
                </svg>
            )
        },
        {
            name: "🧘 Kinésithérapie",
            description: "Rééducation, massage, physiothérapie",
            icon: (
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" strokeWidth="1.5"/>
                    <path d="M12 8v4M9 11l3 2 3-2" strokeWidth="1.5"/>
                    <path d="M7 16l2-3 3 1 3-1 2 3" strokeWidth="1.5"/>
                    <path d="M9 20h6" strokeWidth="1.5"/>
                    <path d="M12 16v4" strokeWidth="1.5"/>
                </svg>
            )
        }
    ];

    return (
        <>
            <style>{style}</style>

            <section id="specialistes" className="specialites">
                <h2>Nos spécialités médicales</h2>
                <p className="sub">
                    Une équipe pluridisciplinaire de professionnels de santé à votre service
                </p>

                <div className="specialites-grid">
                    {specialitesList.map((spec, index) => (
                        <div className="specialite-item" key={index}>
                            <div className="specialite-icon">
                                {spec.icon}
                            </div>
                            <div className="specialite-name">{spec.name}</div>
                            <div className="specialite-desc">{spec.description}</div>
                        </div>
                    ))}
                </div>

                <div className="cta-container">
                    <a href="#rdv" className="cta-specialites">
                        Prendre rendez-vous avec un spécialiste
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12 5 19 12 12 19"/>
                        </svg>
                    </a>
                </div>
            </section>
        </>
    );
}

export default Specialites;