import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/Authservice";
import { getServerBaseUrl, setServerBaseUrl, normalizeBaseUrl } from "../services/serverConfig";
import LogoImg from "../assets/logo.png";
import Img from "../assets/Privacy policy.gif";
import Typewriter from "typewriter-effect";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [showServerModal, setShowServerModal] = useState(false);
    const [serverInput, setServerInput] = useState(() => getServerBaseUrl());
    const [serverSaved, setServerSaved] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSaveServer = () => {
        try {
            setServerBaseUrl(serverInput);
            setServerSaved(true);
            setTimeout(() => { setServerSaved(false); setShowServerModal(false); }, 1200);
        } catch {
            // invalid — do nothing, input shows hint
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            // @ts-ignore
            const user = await login(email, password);
            // @ts-ignore — login retourne void mais on récupère user du context
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                navigate(authService.getDashboardPath(currentUser.role));
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Email ou mot de passe incorrect";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid vh-100">
            <div className="row h-100">
                {/* Illustration gauche */}
                <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center bg-light p-4">
                    <img src={Img} style={{ width: "28rem" }} alt="illustration" />
                </div>

                {/* Formulaire droite */}
                <div className="col-12 col-md-6 d-flex align-items-center justify-content-center px-4">
                    <div className="w-100" style={{ maxWidth: "360px" }}>

                        <div className="text-center mb-4">
                            <img src={LogoImg} className="w-75" alt="logo" />
                            <div className="rounded mt-3 p-2 text-muted bg-light">
                                <Typewriter
                                    options={{
                                        strings: [
                                            "Bienvenue sur Meditrack !",
                                            "Accédez à votre espace médical sécurisé",
                                            "Gérez vos rendez-vous en toute simplicité",
                                            "Votre santé, notre priorité",
                                        ],
                                        autoStart: true,
                                        loop: true,
                                        delay: 60,
                                        deleteSpeed: 30,
                                    }}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="alert alert-danger py-2 small" role="alert">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label small">Email</label>
                                <input
                                    type="email"
                                    className="form-control form-control-sm"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <div className="mb-2">
                                <label className="form-label small">Mot de passe</label>
                                <div className="input-group input-group-sm">
                                    <input
                                        type={showPwd ? "text" : "password"}
                                        className="form-control form-control-sm"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => setShowPwd(p => !p)}
                                        tabIndex={-1}
                                    >
                                        <i className={`bi ${showPwd ? "bi-eye-slash" : "bi-eye"}`}></i>
                                    </button>
                                </div>
                            </div>

                            <div className="d-flex justify-content-end mb-3">
                                <a href="#" className="small">Mot de passe oublié ?</a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn w-100 btn-sm text-white d-flex align-items-center justify-content-center gap-2"
                                style={{ background: "linear-gradient(135deg,#1A7A52,#27A869)" }}
                            >
                                {loading && <span className="spinner-border spinner-border-sm"></span>}
                                {loading ? "Connexion..." : "Se connecter"}
                            </button>
                        </form>

                        <div className="text-center mt-3">
                            <span className="small text-muted">Vous n'avez pas de compte ? </span>
                            <a href="/register" className="small text-decoration-none fw-semibold">S'inscrire</a>
                        </div>

                        <div className="position-relative my-4 text-center">
                            <div className="border-top"></div>
                            <span className="position-absolute top-50 start-50 translate-middle bg-white px-2 small text-muted">ou</span>
                        </div>

                        <div className="d-flex justify-content-center gap-3">
                            {[
                                { icon: "bi-google", color: undefined, textColor: "text-danger" },
                                { icon: "bi-facebook", color: "#1877F2", textColor: "text-white" },
                                { icon: "bi-twitter-x", color: undefined, textColor: undefined },
                                { icon: "bi-instagram", color: undefined, textColor: undefined },
                            ].map((s, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className={`d-flex align-items-center justify-content-center rounded-circle border ${s.textColor || ""}`}
                                    style={{ width: 38, height: 38, backgroundColor: s.color, border: s.color ? "none" : undefined }}
                                >
                                    <i className={`bi ${s.icon} small`}></i>
                                </a>
                            ))}
                        </div>

                        {/* ── Bouton config serveur ── */}
                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => { setServerInput(getServerBaseUrl()); setShowServerModal(true); }}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#adb5bd",
                                    fontSize: 12,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                    padding: "4px 8px",
                                    borderRadius: 6,
                                    transition: "color 0.2s",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.color = "#1A7A52")}
                                onMouseLeave={e => (e.currentTarget.style.color = "#adb5bd")}
                            >
                                <i className="bi bi-hdd-network"></i>
                                Serveur : {getServerBaseUrl()}
                            </button>
                        </div>

                        {/* ── Modal config serveur ── */}
                        {showServerModal && (
                            <div
                                style={{
                                    position: "fixed", inset: 0,
                                    background: "rgba(0,0,0,0.45)",
                                    zIndex: 9999,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "16px",
                                }}
                                onClick={e => { if (e.target === e.currentTarget) setShowServerModal(false); }}
                            >
                                <div style={{
                                    background: "#fff",
                                    borderRadius: 16,
                                    padding: "28px 24px",
                                    width: "100%",
                                    maxWidth: 380,
                                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <i className="bi bi-hdd-network" style={{ color: "#1A7A52", fontSize: 18 }}></i>
                                            <span style={{ fontWeight: 700, fontSize: 15 }}>Adresse du serveur</span>
                                        </div>
                                        <button
                                            onClick={() => setShowServerModal(false)}
                                            style={{ background: "none", border: "none", cursor: "pointer", color: "#adb5bd", fontSize: 18, lineHeight: 1 }}
                                        >
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    </div>

                                    <p style={{ fontSize: 13, color: "#6c757d", marginBottom: 16 }}>
                                        Entrez l'IP et le port de votre backend Spring Boot.
                                        Exemple : <code style={{ background: "#f1f3f5", padding: "2px 6px", borderRadius: 4 }}>192.168.1.10:8080</code>
                                    </p>

                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        border: "2px solid #dee2e6",
                                        borderRadius: 10,
                                        overflow: "hidden",
                                        marginBottom: 8,
                                    }}>
                                        <span style={{
                                            padding: "0 12px",
                                            background: "#f8f9fa",
                                            borderRight: "2px solid #dee2e6",
                                            color: "#1A7A52",
                                            fontSize: 16,
                                            alignSelf: "stretch",
                                            display: "flex",
                                            alignItems: "center",
                                        }}>
                                            <i className="bi bi-globe2"></i>
                                        </span>
                                        <input
                                            type="text"
                                            value={serverInput}
                                            onChange={e => setServerInput(e.target.value)}
                                            onKeyDown={e => e.key === "Enter" && handleSaveServer()}
                                            placeholder="192.168.1.10:8080"
                                            autoCapitalize="none"
                                            autoCorrect="off"
                                            spellCheck={false}
                                            style={{
                                                flex: 1,
                                                border: "none",
                                                outline: "none",
                                                padding: "12px 14px",
                                                fontSize: 15,
                                                fontFamily: "monospace",
                                                background: "transparent",
                                            }}
                                        />
                                    </div>

                                    <div style={{ fontSize: 12, color: "#adb5bd", marginBottom: 20 }}>
                                        URL finale : <code>{normalizeBaseUrl(serverInput) || "—"}</code>
                                    </div>

                                    <button
                                        onClick={handleSaveServer}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            background: serverSaved
                                                ? "linear-gradient(135deg,#1A7A52,#27A869)"
                                                : "linear-gradient(135deg,#1A7A52,#27A869)",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: 10,
                                            fontSize: 14,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 8,
                                            transition: "opacity 0.2s",
                                        }}
                                    >
                                        {serverSaved
                                            ? <><i className="bi bi-check-circle-fill"></i> Enregistré !</>
                                            : <><i className="bi bi-floppy"></i> Enregistrer</>
                                        }
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}