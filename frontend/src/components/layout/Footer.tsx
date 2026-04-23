const style = `
.footer {
  position: relative;
  background: linear-gradient(135deg, #1A7A52, #0d4f35);
  color: white;
  padding-top: 50px;
  overflow: hidden;
}

.footer-curve {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0;
}

.footer-curve svg {
  position: relative;
  display: block;
  width: calc(100% + 1.3px);
  height: 40px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 40px 25px;
  position: relative;
  z-index: 2;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 30px;
}

.footer-col h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
  color: white;
}

.footer-col h3::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 35px;
  height: 2px;
  background: #5DCC8A;
}

.footer-col p {
  line-height: 1.6;
  opacity: 0.85;
  font-size: 0.9rem;
  margin-bottom: 20px;
  color: white;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-links a {
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.footer-links a:hover {
  color: #5DCC8A;
  transform: translateX(5px);
}

.social-icons {
  display: flex;
  gap: 12px;
  margin-top: 15px;
}

.social-icons a {
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.social-icons a:hover {
  background: #5DCC8A;
  transform: translateY(-3px);
}

.social-icons svg {
  width: 18px;
  height: 18px;
  stroke: white;
  stroke-width: 1.5;
  fill: none;
}

.contact-info {
  list-style: none;
  padding: 0;
  margin: 0;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
}

.contact-info li {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.85);
  border: none;
}

.contact-info svg {
  width: 18px;
  height: 18px;
  stroke: #5DCC8A;
  stroke-width: 1.5;
  flex-shrink: 0;
}

.contact-info a {
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-info a:hover {
  color: #5DCC8A;
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
  font-size: 0.8rem;
  color: rgba(255,255,255,0.7);
}

@media (max-width: 768px) {
  .footer-container { padding: 30px 20px 20px; }
  .footer-grid { gap: 30px; }
  .footer-col { text-align: center; }
  .footer-col h3::after { left: 50%; transform: translateX(-50%); }
  .social-icons { justify-content: center; }
  .contact-info li { justify-content: center; }
  .footer-links a { justify-content: center; }
}
`;

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <style>{style}</style>

      <footer className="footer">
        <div className="footer-curve">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              fill="#ffffff" 
              opacity="0.1"
            />
          </svg>
        </div>

        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-col">
              <h3>MediTrack</h3>
              <p>
                Plateforme regroupant des spécialistes de plusieurs hôpitaux pour faciliter vos soins.
              </p>
              <div className="social-icons">
                <a href="#" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
                <a href="#" aria-label="WhatsApp">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </a>
                <a href="#" aria-label="TikTok">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v4a9 9 0 0 1-4-1v6a6 6 0 1 1-6-6z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="footer-col">
              <h3>Liens rapides</h3>
              <ul className="footer-links">
                <li><a href="#accueil">Accueil</a></li>
                <li><a href="#fonctionnalites">Fonctionnalités</a></li>
                <li><a href="#specialites">Spécialités</a></li>
                <li><a href="#apropos">À propos</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h3>Contact</h3>
              <ul className="contact-info">
                <li>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Ziguinchor, Sénégal
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <a href="tel:+221779830075">+221 77 123 45 67</a>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <polyline points="22,7 12,13 2,7"/>
                  </svg>
                  <a href="mailto:contact@meditrack.sn">contact@meditrack.sn</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; {currentYear} MediTrack. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
