import React from "react";

const style = `
.contact {
  padding: 100px 40px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  position: relative;
}

.contact-container {
  max-width: 1200px;
  margin: 0 auto;
}

.contact-header {
  text-align: center;
  margin-bottom: 60px;
}

.contact-badge {
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

.contact h2 {
  font-size: 2.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1A7A52, #27A869);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 15px;
}

.contact-subtitle {
  font-size: 1.1rem;
  color: #5a6a7a;
  max-width: 600px;
  margin: 0 auto;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  margin-top: 40px;
}

.contact-info {
  border-radius: 30px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.05);
  border: 1px solid rgba(39,168,105,0.1);
}

.info-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1A7A52;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-icon {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, rgba(39,168,105,0.1), rgba(26,122,82,0.05));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon svg {
  width: 22px;
  height: 22px;
  stroke: #27A869;
  stroke-width: 1.5;
}

.info-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1A7A52;
  margin-bottom: 5px;
}

.info-content p, .info-content a {
  font-size: 1rem;
  color: #4a5568;
  text-decoration: none;
  transition: color 0.3s ease;
  margin: 0;
}

.info-content a:hover {
  color: #27A869;
}

.whatsapp-number {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.whatsapp-number span {
  font-size: 0.85rem;
  color: #e74c3c;
  background: rgba(231,76,60,0.1);
  padding: 4px 10px;
  border-radius: 50px;
}

.hours-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.hours-list li {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  color: #4a5568;
}

.hours-list li span:first-child {
  font-weight: 600;
  color: #1A7A52;
}

.contact-form {
  background: white;
  border-radius: 30px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.05);
  border: 1px solid rgba(39,168,105,0.1);
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1A7A52;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 14px 18px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #27A869;
  box-shadow: 0 0 0 3px rgba(39,168,105,0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.submit-btn {
  width: 100%;
  padding: 14px 28px;
  background: linear-gradient(135deg, #27A869, #1A7A52);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(39,168,105,0.3);
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(39,168,105,0.4);
}

.map-container {
  margin-top: 50px;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  border: 1px solid rgba(39,168,105,0.1);
}

.map-container iframe {
  width: 100%;
  height: 350px;
  border: none;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 50px;
}

.social-link {
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  border: 1px solid rgba(39,168,105,0.1);
}

.social-link:hover {
  transform: translateY(-3px);
  background: linear-gradient(135deg, #27A869, #1A7A52);
}

.social-link:hover svg {
  stroke: white;
}

.social-link svg {
  width: 22px;
  height: 22px;
  stroke: #27A869;
  stroke-width: 1.5;
  transition: all 0.3s ease;
}

@media (max-width: 992px) {
  .contact-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

@media (max-width: 768px) {
  .contact { padding: 60px 20px; }
  .contact h2 { font-size: 2rem; }
  .contact-info, .contact-form { padding: 25px; border-radius: 20px; }
  .hours-list li { flex-direction: column; gap: 5px; }
  .whatsapp-number { flex-direction: column; align-items: flex-start; }
}

@media (max-width: 480px) {
  .contact { padding: 50px 16px; }
  .contact h2 { font-size: 1.75rem; }
  .contact-subtitle { font-size: 0.95rem; }
  .contact-info, .contact-form { padding: 20px; }
  .info-title { font-size: 1.25rem; }
  .contact-header { margin-bottom: 40px; }
}
`;

function Contact() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Message envoyé ! Nous vous répondrons dans les plus brefs délais.");
    };

    return (
        <>
            <style>{style}</style>

            <section id="contact" className="contact">
                <div className="contact-container">
                    <div className="contact-header">
                        <div className="contact-badge">📞 Nous contacter</div>
                        <h2>Une question ? Un partenariat ?</h2>
                        <p className="contact-subtitle">
                            N'hésitez pas à nous écrire ou à nous appeler. Nous sommes à votre
                            disposition.
                        </p>
                    </div>

                    <div className="contact-grid">
                        {/* Informations de contact */}
                        <div className="contact-info">
                            <div className="info-title">
                                <svg
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#27A869"
                                    strokeWidth="1.5"
                                >
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                Nos coordonnées
                            </div>

                            <div className="info-item">
                                <div className="info-icon">
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                                            strokeWidth="1.5"
                                        />
                                        <circle cx="12" cy="10" r="3" strokeWidth="1.5" />
                                    </svg>
                                </div>
                                <div className="info-content">
                                    <h4>Adresse</h4>
                                    <p>Ziguinchor, Sénégal</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon">
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                                            strokeWidth="1.5"
                                        />
                                        <polyline points="22,6 12,13 2,6" strokeWidth="1.5" />
                                    </svg>
                                </div>
                                <div className="info-content">
                                    <h4>Email</h4>
                                    <a href="mailto:contact@meditrack.sn">contact@meditrack.sn</a>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon">
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
                                            strokeWidth="1.5"
                                        />
                                    </svg>
                                </div>
                                <div className="info-content">
                                    <h4>Téléphone / WhatsApp</h4>
                                    <div className="whatsapp-number">
                                        <a href="tel:+221779830075">77 123 45 67 </a>
                                    </div>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon">
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                                        <polyline points="12 6 12 12 16 14" strokeWidth="1.5" />
                                    </svg>
                                </div>
                                <div className="info-content">
                                    <h4>Horaires</h4>
                                    <ul className="hours-list">
                                        <li>
                                            <span>Lundi - Vendredi</span>
                                            <span>9h00 - 18h00</span>
                                        </li>
                                        <li>
                                            <span>Samedi</span>
                                            <span>10h00 - 14h00</span>
                                        </li>
                                        <li>
                                            <span>Dimanche</span>
                                            <span>Fermé</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Formulaire de contact */}
                        <div className="contact-form">
                            <div className="form-title">✉️ Envoyez-nous un message</div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <input type="text" placeholder="Votre nom complet" required />
                                </div>
                                <div className="form-group">
                                    <input type="email" placeholder="Votre email" required />
                                </div>
                                <div className="form-group">
                                    <input type="tel" placeholder="Votre téléphone" />
                                </div>
                                <div className="form-group">
                                    <textarea placeholder="Votre message..." required></textarea>
                                </div>
                                <button type="submit" className="submit-btn">
                                    Envoyer le message
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Carte Google Maps */}
                    <div className="map-container">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1570.5!2d-16.287888!3d12.547721!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2ssn!4v1700000000000!5m2!1sfr!2ssn"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Carte MediTrack Ziguinchor"
                        />
                    </div>
                </div>
            </section>
        </>
    );
}

export default Contact;