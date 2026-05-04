import { useState } from "react";
import { setServerBaseUrl as saveBaseUrl } from "../services/serverConfig";
import LogoImg from "../assets/logo.png";

interface Props {
    onConnected: () => void;
}

export default function ServerSetup({ onConnected }: Props) {
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const [testing, setTesting] = useState(false);

    const handleConnect = async () => {
        if (!input.trim()) {
            setError("Veuillez entrer une adresse serveur.");
            return;
        }

        setError("");
        setTesting(true);

        try {
            // Normalise l'URL
            let url = input.trim();
            if (!/^https?:\/\//i.test(url)) url = `http://${url}`;
            url = url.replace(/\/+$/, "");

            // Test de connectivité (ping sur /actuator/health ou /login)
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            try {
                await fetch(`${url}/login`, {
                    method: "OPTIONS",
                    signal: controller.signal,
                });
                clearTimeout(timeout);
            } catch (fetchErr: any) {
                clearTimeout(timeout);
                // Si c'est une erreur réseau (pas CORS), le serveur n'est pas joignable
                if (fetchErr.name === "AbortError") {
                    setError("Délai dépassé — vérifiez l'adresse et que le serveur est démarré.");
                    setTesting(false);
                    return;
                }
                // CORS ou autre = serveur répond quand même → on continue
            }

            saveBaseUrl(url);
            onConnected();
        } catch (err: any) {
            setError("Adresse invalide.");
        } finally {
            setTesting(false);
        }
    };

    return (
        <div style={styles.bg}>
            <div style={styles.card}>
                {/* Logo */}
                <div style={styles.logoWrap}>
                    <img src={LogoImg} alt="Meditrack" style={styles.logo} />
                </div>

                <h2 style={styles.title}>Connexion au serveur</h2>
                <p style={styles.subtitle}>
                    Entrez l'adresse IP et le port du serveur backend
                </p>

                {/* Champ adresse */}
                <div style={styles.inputWrap}>
                    <span style={styles.inputIcon}>
                        <i className="bi bi-hdd-network" />
                    </span>
                    <input
                        type="text"
                        placeholder="192.168.1.X:8080"
                        value={input}
                        onChange={e => { setInput(e.target.value); setError(""); }}
                        onKeyDown={e => e.key === "Enter" && handleConnect()}
                        style={styles.input}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                    />
                </div>

                {/* Erreur */}
                {error && (
                    <div style={styles.errorBox}>
                        <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: 8 }} />
                        {error}
                    </div>
                )}

                {/* Bouton */}
                <button
                    onClick={handleConnect}
                    disabled={testing}
                    style={{
                        ...styles.btn,
                        opacity: testing ? 0.7 : 1,
                        cursor: testing ? "not-allowed" : "pointer",
                    }}
                >
                    {testing ? (
                        <>
                            <span
                                style={{
                                    display: "inline-block",
                                    width: 16,
                                    height: 16,
                                    border: "2px solid rgba(255,255,255,0.4)",
                                    borderTopColor: "#fff",
                                    borderRadius: "50%",
                                    animation: "spin 0.7s linear infinite",
                                    marginRight: 8,
                                }}
                            />
                            Connexion…
                        </>
                    ) : (
                        <>
                            <i className="bi bi-plug-fill" style={{ marginRight: 8 }} />
                            Se connecter
                        </>
                    )}
                </button>

                {/* Aide */}
                <p style={styles.hint}>
                    <i className="bi bi-info-circle" style={{ marginRight: 6 }} />
                    Le backend Spring Boot doit être démarré sur le même réseau Wi-Fi.
                </p>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    bg: {
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0f2c1e 0%, #1A7A52 60%, #27A869 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
    },
    card: {
        background: "#fff",
        borderRadius: 20,
        padding: "36px 28px",
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        textAlign: "center",
    },
    logoWrap: {
        marginBottom: 16,
    },
    logo: {
        width: "70%",
        maxWidth: 180,
    },
    title: {
        fontSize: 22,
        fontWeight: 700,
        color: "#1a2e1f",
        margin: "0 0 8px",
    },
    subtitle: {
        fontSize: 14,
        color: "#6c757d",
        marginBottom: 28,
    },
    inputWrap: {
        display: "flex",
        alignItems: "center",
        border: "2px solid #dee2e6",
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 16,
        transition: "border-color 0.2s",
    },
    inputIcon: {
        padding: "0 14px",
        color: "#1A7A52",
        fontSize: 18,
        background: "#f8f9fa",
        alignSelf: "stretch",
        display: "flex",
        alignItems: "center",
        borderRight: "2px solid #dee2e6",
    },
    input: {
        flex: 1,
        border: "none",
        outline: "none",
        padding: "14px 16px",
        fontSize: 16,
        fontFamily: "monospace",
        background: "transparent",
        color: "#212529",
    },
    errorBox: {
        background: "#fff5f5",
        border: "1px solid #f5c6cb",
        color: "#842029",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 13,
        marginBottom: 16,
        textAlign: "left",
    },
    btn: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "14px",
        background: "linear-gradient(135deg, #1A7A52, #27A869)",
        color: "#fff",
        border: "none",
        borderRadius: 10,
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 20,
        boxShadow: "0 4px 15px rgba(39,168,105,0.4)",
    },
    hint: {
        fontSize: 12,
        color: "#adb5bd",
        margin: 0,
    },
};
