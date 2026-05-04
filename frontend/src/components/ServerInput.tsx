import { useState, useEffect } from "react";

const ServerInput = () => {
  const [url, setUrl] = useState("");
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("meditrack_server_url");
    if (saved) {
      setSavedUrl(saved);
    }
  }, []);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    let finalUrl = url;
    if (!url.startsWith("http")) {
      finalUrl = `http://${url}`;
    }
    
    localStorage.setItem("meditrack_server_url", finalUrl);
    setSavedUrl(finalUrl);
  };

  const handleDisconnect = () => {
    localStorage.removeItem("meditrack_server_url");
    setSavedUrl(null);
    setIframeUrl(null);
  };

  if (savedUrl && !iframeUrl) {
    return (
      <div style={{ height: "100vh", width: "100vw" }}>
        <iframe
          src={savedUrl}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Meditrack"
          onError={() => alert("Erreur de connexion au serveur")}
        />
        <button
          onClick={handleDisconnect}
          style={{
            position: "fixed",
            top: 10,
            right: 10,
            zIndex: 9999,
            padding: "8px 16px",
            background: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px"
          }}
        >
          Déconnecter
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Meditrack</h2>
        <p style={styles.subtitle}>Connexion au serveur</p>
        
        <form onSubmit={handleConnect} style={styles.form}>
          <input
            type="text"
            placeholder="192.168.1.X:5173"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Se connecter
          </button>
        </form>
        
        {savedUrl && (
          <p style={styles.saved}>Serveur enregistré: {savedUrl}</p>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "#f5f5f5",
  },
  card: {
    padding: "40px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "90%",
    maxWidth: "400px",
  },
  title: {
    margin: 0,
    color: "#2c3e50",
    fontSize: "28px",
  },
  subtitle: {
    color: "#7f8c8d",
    marginBottom: "30px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "15px",
    fontSize: "16px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    outline: "none",
  },
  button: {
    padding: "15px",
    fontSize: "16px",
    background: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  saved: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#27ae60",
  },
};

export default ServerInput;