import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/Authservice";
import LogoImg from "../assets/logo.png";
import Img from "../assets/Privacy policy.gif";
import Typewriter from "typewriter-effect";
import axios from "axios";
import { API_URL } from "../constants/server";
import { Link, useNavigate } from "react-router-dom";

<<<<<<< HEAD
function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
 const navigate = useNavigate();
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(API_URL + "login", formData);
      const { token } = response.data;
      if (response.status == 200){
        navigate("/dashboard")
      }
      localStorage.setItem("token", token);
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.message || "Erreur de connexion");
      } else {
        setError("Serveur inaccessible");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center bg-light p-4">
          <img src={Img} style={{ width: "28rem" }} alt="illustration" />
        </div>

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

            <form onSubmit={login}>
              <div className="mb-3">
                <label className="form-label small">Email</label>
                <input
                  type="email"
                  className="form-control form-control-sm"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-2">
                <label className="form-label small">Mot de passe</label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="d-flex justify-content-end mb-3">
                <a href="#" className="small">
                  Mot de passe oublié ?
                </a>
              </div>

              {error && (
                <div className="alert alert-danger small py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn w-100 btn-sm text-white d-flex align-items-center justify-content-center"
                style={{
                  background: "linear-gradient(135deg,#1A7A52,#27A869)",
                }}
                disabled={loading}
              >
                {loading ? (
                  <ClipLoader size={18} color="#fff" />
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>

            <div className="text-center mt-3">
              <span className="small text-muted">
                Vous n'avez pas de compte ?{" "}
              </span>
              <Link to="/register" className="small text-decoration-none fw-semibold">
                S'inscrire
              </Link>
            </div>

            <div className="position-relative my-4 text-center">
              <div className="border-top"></div>
              <span className="position-absolute top-50 start-50 translate-middle bg-white px-2 small text-muted">
                ou
              </span>
            </div>

            <div className="d-flex justify-content-center gap-3">
              <a
                href="#"
                className="d-flex align-items-center justify-content-center rounded-circle border"
                style={{ width: "38px", height: "38px" }}
              >
                <i className="bi bi-google text-danger small"></i>
              </a>

              <a
                href="#"
                className="d-flex align-items-center justify-content-center rounded-circle border"
                style={{
                  width: "38px",
                  height: "38px",
                  backgroundColor: "#1877F2",
                  border: "none",
                  color: "white",
                }}
              >
                <i className="bi bi-facebook small"></i>
              </a>

              <a
                href="#"
                className="d-flex align-items-center justify-content-center rounded-circle border"
                style={{ width: "38px", height: "38px" }}
              >
                <i className="bi bi-twitter-x small"></i>
              </a>

              <a
                href="#"
                className="d-flex align-items-center justify-content-center rounded-circle border"
                style={{ width: "38px", height: "38px" }}
              >
                <i className="bi bi-instagram small"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
=======
export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

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
                    </div>
                </div>
            </div>
        </div>
    );
}
>>>>>>> dabde06c7a6164d75440614f3a5b53baf392b053
