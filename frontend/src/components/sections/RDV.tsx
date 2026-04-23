function RDV() {
  return (
    <section
      id="rdv"
      style={{
        background: "#fff",
        padding: "90px 40px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: "800px", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#1A7A52" }}>
          Prendre un rendez-vous
        </h2>

        <p style={{ marginTop: "20px", fontSize: "18px", color: "#444", lineHeight: "1.7" }}>
          Cette section est en cours de développement.
        </p>

        <p style={{ marginTop: "10px", fontSize: "18px", color: "#444", lineHeight: "1.7" }}>
            J'attends l’intégration de la liste des médecins et de leurs disponibilités
          par les équipes concernées.
        </p>

        <p style={{ marginTop: "10px", fontSize: "18px", color: "#444", lineHeight: "1.7" }}>
          Une fois disponible, les patients pourront voir les spécialistes, voir leurs horaires
          et cliquer sur réserver qui va rediriger vers la page d'authentification.
        </p>

        {/* badge statut */}
        <div
          style={{
            marginTop: "30px",
            display: "inline-block",
            padding: "10px 20px",
            background: "rgba(39,168,105,0.1)",
            color: "#1A7A52",
            borderRadius: "50px",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          🚧 Module en construction
        </div>
      </div>
    </section>
  );
}

export default RDV;