import { useEffect, useState } from "react";

import heroImage from "../../assets/hero.png";
import img1 from "../../assets/1.jpg";
import img2 from "../../assets/2.jpg";

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
    <section
      id="accueil"
      style={{
        height: "100vh",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* BACKGROUND IMAGE */}
      <img
        src={images[index]}
        alt="carousel"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 20%",
          transition: "opacity 1s ease",
          zIndex: 1,
        }}
      />

      {/* OVERLAY */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.55)",
          zIndex: 2,
        }}
      />

      {/* CONTENT */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          color: "#fff",
          maxWidth: "700px",
          padding: "0 60px",
        }}
      >
        <h1 style={{ fontSize: "3rem", fontWeight: 800 }}>
          Trouvez un médecin rapidement
        </h1>

        <p style={{ marginTop: "15px", fontSize: "18px", opacity: 0.9 }}>
          Consultez les spécialistes disponibles et prenez rendez-vous en ligne
          sans attendre à l’hôpital.
        </p>

        {/* BUTTONS */}
        <div style={{ marginTop: "30px", display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <a
            href="#specialites"
            style={{
              padding: "14px 28px",
              background: "linear-gradient(135deg,#27A869,#1A7A52)",
              color: "#fff",
              borderRadius: "50px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Voir les spécialités
          </a>

          <a
            href="#connexion"
            style={{
              padding: "14px 28px",
              border: "2px solid #fff",
              color: "#fff",
              borderRadius: "50px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Se connecter
          </a>
        </div>

        {/* INDICATORS */}
        <div style={{ marginTop: "25px", display: "flex", gap: "8px" }}>
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
  );
}

export default Hero;