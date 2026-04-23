const style = `
.fonctionnalites {
  padding: 80px 40px;
  background: #eef2f5;
  text-align: center;
}

.fonctionnalites h2 {
  font-size: 2.8rem;
  font-weight: 800;
  background: linear-gradient(135deg,#1A7A52,#27A869);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 15px;
}

.fonctionnalites p.sub {
  margin-top: 10px;
  color: #5a6a7a;
  font-size: 1.1rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.fonctionnalites-grid {
  margin-top: 60px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 35px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.card {
  background: white;
  border: 1px solid rgba(27,122,82,.1);
  padding: 35px 28px;
  border-radius: 24px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  text-align: left;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 45px rgba(39,168,105,0.15);
  border-color: rgba(39,168,105,0.3);
}

.icon {
  width: 52px;
  height: 52px;
  stroke: #27A869;
  stroke-width: 1.8;
  margin-bottom: 20px;
}

.title {
  font-weight: 700;
  margin-bottom: 12px;
  color: #1A7A52;
  font-size: 1.3rem;
}

.desc {
  font-size: 15px;
  color: #5a6a7a;
  line-height: 1.5;
  margin-bottom: 25px;
}

.cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 50px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
}

.cta:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #27A869, #1A7A52);
  color: white;
  box-shadow: 0 4px 12px rgba(39,168,105,0.25);
}

.btn-primary:hover {
  box-shadow: 0 8px 20px rgba(39,168,105,0.35);
}

.btn-outline {
  background: transparent;
  color: #27A869;
  border: 2px solid #27A869;
}

.btn-outline:hover {
  background: linear-gradient(135deg, #27A869, #1A7A52);
  color: white;
  border-color: transparent;
}

.btn-light {
  background: #f8f9fa;
  color: #27A869;
  border: 1px solid rgba(39,168,105,0.2);
}

.btn-light:hover {
  background: linear-gradient(135deg, #27A869, #1A7A52);
  color: white;
  border-color: transparent;
}

.btn-secondary {
  background: linear-gradient(135deg, #5DCC8A, #3DBA8E);
  color: white;
  box-shadow: 0 4px 12px rgba(93,204,138,0.25);
}

.btn-secondary:hover {
  box-shadow: 0 8px 20px rgba(93,204,138,0.35);
}

@media (max-width: 768px) {
  .fonctionnalites { padding: 60px 20px; }
  .fonctionnalites h2 { font-size: 2rem; }
  .card { padding: 25px 20px; }
  .icon { width: 42px; height: 42px; }
  .title { font-size: 1.1rem; }
}
`;

function Fonctionnalites() {
  return (
    <>
      <style>{style}</style>

      <section id="fonctionnalites" className="fonctionnalites">
        <h2>Fonctionnalités</h2>
        <p className="sub">
          Une plateforme simple et rapide pour gérer vos rendez-vous médicaux
        </p>

        <div className="fonctionnalites-grid">

          {/* Carte 1 - Recherche rapide */}
          <div className="card">
            <svg className="icon" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" strokeWidth="2"/>
              <path d="M21 21l-4.3-4.3" strokeWidth="2"/>
            </svg>
            <div className="title">🔍 Recherche rapide</div>
            <div className="desc">
              Trouvez facilement un spécialiste selon votre besoin, par spécialité ou localisation.
            </div>
            <a href="#rdv" className="cta btn-primary">
              Rechercher un médecin
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </div>

          {/* Carte 2 - Prise de rendez-vous */}
          <div className="card">
            <svg className="icon" viewBox="0 0 24 24" fill="none">
              <path d="M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 0 0 2-2V7H3v12a2 2 0 0 0 2 2z" strokeWidth="2"/>
            </svg>
            <div className="title">📅 Prise de rendez-vous</div>
            <div className="desc">
              Réservez votre consultation en quelques clics, choisissez le créneau qui vous arrange.
            </div>
            <a href="#rdv" className="cta btn-secondary">
              Prendre un RDV
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </div>

          {/* Carte 3 - Gain de temps */}
          <div className="card">
            <svg className="icon" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v4l3 3" strokeWidth="2"/>
              <circle cx="12" cy="12" r="9" strokeWidth="2"/>
            </svg>
            <div className="title">⏱️ Gain de temps</div>
            <div className="desc">
              Évitez les déplacements inutiles et les longues attentes. Consultez en ligne.
            </div>
            <a href="#connexion" className="cta btn-outline">
              Se connecter
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </div>

          {/* Carte 4 - Suivi simplifié */}
          <div className="card">
            <svg className="icon" viewBox="0 0 24 24" fill="none">
              <path d="M5 3h14v18H5V3zM9 7h6M9 11h6M9 15h4" strokeWidth="2"/>
            </svg>
            <div className="title">📂 Suivi simplifié</div>
            <div className="desc">
              Consultez vos rendez-vous et votre historique facilement. Recevez des rappels.
            </div>
            <a href="#connexion" className="cta btn-light">
              Se connecter
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </div>

        </div>
      </section>
    </>
  );
}

export default Fonctionnalites;