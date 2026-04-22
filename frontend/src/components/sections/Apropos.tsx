const style = `
.apropos {
  padding: 100px 40px;
  background: linear-gradient(135deg, #f0f2f5 0%, #e9ecef 100%);
  position: relative;
  overflow: hidden;
}

.apropos::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 2000"><path fill="rgba(39,168,105,0.03)" d="M0,0 L2000,0 L2000,2000 L0,2000 Z M1000,500 C800,500 600,700 600,1000 C600,1300 800,1500 1000,1500 C1200,1500 1400,1300 1400,1000 C1400,700 1200,500 1000,500 Z"/></svg>') repeat;
  pointer-events: none;
}

.apropos-container {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.apropos-header {
  text-align: center;
  margin-bottom: 60px;
}

.apropos-badge {
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

.apropos h2 {
  font-size: 2.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1A7A52, #27A869);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 20px;
}

.apropos-subtitle {
  font-size: 1.1rem;
  color: #5a6a7a;
  max-width: 700px;
  margin: 0 auto;
}

.apropos-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.apropos-text {
  background: white;
  padding: 40px;
  border-radius: 30px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.05);
  border: 1px solid rgba(39,168,105,0.1);
}

.apropos-text p {
  font-size: 1.05rem;
  line-height: 1.7;
  color: #4a5568;
  margin-bottom: 25px;
}

.apropos-text p:last-child {
  margin-bottom: 0;
}

.apropos-highlight {
  background: linear-gradient(135deg, rgba(39,168,105,0.08), rgba(26,122,82,0.05));
  padding: 20px;
  border-radius: 20px;
  border-left: 4px solid #27A869;
  margin-top: 20px;
}

.apropos-highlight p {
  margin-bottom: 0;
  font-weight: 500;
  color: #1A7A52;
}

.apropos-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

.apropos-card {
  background: white;
  padding: 30px 25px;
  border-radius: 24px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(39,168,105,0.1);
  box-shadow: 0 10px 25px rgba(0,0,0,0.03);
}

.apropos-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 35px rgba(39,168,105,0.12);
  border-color: rgba(39,168,105,0.3);
}

.apropos-card-icon {
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

.apropos-card:hover .apropos-card-icon {
  background: linear-gradient(135deg, #27A869, #1A7A52);
}

.apropos-card:hover .apropos-card-icon svg {
  stroke: white;
}

.apropos-card-icon svg {
  width: 32px;
  height: 32px;
  stroke: #27A869;
  stroke-width: 1.5;
  transition: all 0.3s ease;
}

.apropos-card h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1A7A52;
  margin-bottom: 10px;
}

.apropos-card p {
  font-size: 0.9rem;
  color: #6c7a8a;
  line-height: 1.5;
  margin-bottom: 0;
}

@media (max-width: 992px) {
  .apropos-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .apropos-features {
    order: -1;
  }
}

@media (max-width: 768px) {
  .apropos { padding: 60px 20px; }
  .apropos h2 { font-size: 2rem; }
  .apropos-text { padding: 25px; }
  .apropos-features { grid-template-columns: 1fr; gap: 20px; }
  .apropos-card { padding: 20px; }
}
`;

function Apropos() {
  return (
    <>
      <style>{style}</style>

      <section id="apropos" className="apropos">
        <div className="apropos-container">
          <div className="apropos-header">
            <div className="apropos-badge">✨ Qui sommes-nous ?</div>
            <h2>À propos de MediTrack</h2>
            <p className="apropos-subtitle">
              Une plateforme innovante au service de votre santé
            </p>
          </div>

          <div className="apropos-content">
            <div className="apropos-text">
              <p>
                <strong>MediTrack</strong> est un système qui regroupe différents spécialistes de la médecine 
                provenant de plusieurs hôpitaux à travers tout le pays.
              </p>
              <p>
                Il permet à chaque patient, quelle que soit sa maladie, de trouver rapidement un médecin adapté 
                et de fixer un rendez-vous en ligne sans perte de temps.
              </p>
              <div className="apropos-highlight">
                <p>
                  ✨ Lors de votre consultation chez un nouveau médecin, un <strong>QR code personnel</strong> vous permet 
                  d'accéder instantanément à votre dossier médical, facilitant ainsi le suivi et la continuité des soins 
                  en cas de besoin.
                </p>
              </div>
            </div>

            <div className="apropos-features">
              <div className="apropos-card">
                <div className="apropos-card-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" strokeWidth="1.5"/>
                    <path d="M12 6v6l4 2" strokeWidth="1.5"/>
                  </svg>
                </div>
                <h3>Gain de temps</h3>
                <p>Trouvez un médecin et prenez rendez-vous en quelques clics</p>
              </div>

              <div className="apropos-card">
                <div className="apropos-card-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" strokeWidth="1.5"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" strokeWidth="1.5"/>
                  </svg>
                </div>
                <h3>Multi-hôpitaux</h3>
                <p>Spécialistes de plusieurs hôpitaux à travers tout le pays</p>
              </div>

              <div className="apropos-card">
                <div className="apropos-card-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="1.5"/>
                    <path d="M9 8h6M9 12h6M9 16h4" strokeWidth="1.5"/>
                    <circle cx="18" cy="6" r="1" fill="#27A869"/>
                  </svg>
                </div>
                <h3>Dossier médical</h3>
                <p>Accès instantané via QR code personnel</p>
              </div>

              <div className="apropos-card">
                <div className="apropos-card-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="1.5"/>
                    <polyline points="22 4 12 14.01 9 11.01" strokeWidth="1.5"/>
                  </svg>
                </div>
                <h3>Suivi simplifié</h3>
                <p>Continuité des soins facilitée</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Apropos;