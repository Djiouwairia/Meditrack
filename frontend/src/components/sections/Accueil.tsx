import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import heroImage from "../../assets/hero.png";
import img1 from "../../assets/1.jpg";
import img2 from "../../assets/2.jpg";

const heroCSS = `
.hero-section {
    height: 100vh;
    width: 100%;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
}
.hero-bg {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: center 20%;
    transition: opacity 1s ease;
    z-index: 1;
}
.hero-overlay {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.55);
    z-index: 2;
}
.hero-content {
    position: relative;
    z-index: 3;
    color: #fff;
    max-width: 700px;
    padding: 0 60px;
}
.hero-title {
    font-size: 3rem;
    font-weight: 800;
    line-height: 1.2;
}
.hero-subtitle {
    margin-top: 15px;
    font-size: 18px;
    opacity: 0.9;
    line-height: 1.6;
}
.hero-buttons {
    margin-top: 30px;
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
}
.hero-btn-primary {
    padding: 14px 28px;
    background: linear-gradient(135deg, #27A869, #1A7A52);
    color: #fff;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s;
}
.hero-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(27,122,82,0.4);
    color: #fff;
}
.hero-btn-secondary {
    padding: 14px 28px;
    border: 2px solid #fff;
    color: #fff;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s;
}
.hero-btn-secondary:hover {
    background: rgba(255,255,255,0.15);
    color: #fff;
}
.hero-indicators {
    margin-top: 25px;
    display: flex;
    gap: 8px;
}
@media (max-width: 991px) {
    .hero-content { padding: 0 40px; max-width: 90%; }
    .hero-title { font-size: 2.4rem; }
    .hero-subtitle { font-size: 16px; }
}
@media (max-width: 576px) {
    .hero-section { align-items: flex-end; padding-bottom: 60px; }
    .hero-content { padding: 0 20px; max-width: 100%; }
    .hero-title { font-size: 1.9rem; }
    .hero-subtitle { font-size: 15px; margin-top: 10px; }
    .hero-buttons { flex-direction: column; gap: 10px; margin-top: 20px; }
    .hero-btn-primary, .hero-btn-secondary {
        text-align: center;
        padding: 12px 20px;
        font-size: 0.95rem;
    }
}
`;

function Hero() {
    const images = [heroImage, img1, img2];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <style>{heroCSS}</style>
            <section id="accueil" className="hero-section">
                <img src={images[index]} alt="carousel" className="hero-bg" />
                <div className="hero-overlay" />
                <div className="hero-content">
                    <h1 className="hero-title">
                        Trouvez un médecin rapidement
                    </h1>
                    <p className="hero-subtitle">
                        Consultez les spécialistes disponibles et prenez rendez-vous en ligne
                        sans attendre à l'hôpital.
                    </p>
                    <div className="hero-buttons">
                        <a href="#specialites" className="hero-btn-primary">
                            Voir les spécialités
                        </a>
                        <Link to="/login" className="hero-btn-secondary">
                            Se connecter
                        </Link>
                    </div>
                    <div className="hero-indicators">
                        {images.map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    width: i === index ? "30px" : "10px",
                                    height: "5px",
                                    borderRadius: "10px",
                                    background: i === index ? "#27A869" : "rgba(255,255,255,0.4)",
                                    transition: "0.3s",
                                }}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

export default Hero;
