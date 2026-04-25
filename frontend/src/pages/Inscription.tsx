import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { patientService } from "../services/DomainServices";
import LogoImg from "../assets/logo.png";
import Img from "../assets/Sign up.gif";
import Typewriter from "typewriter-effect";

function Inscription() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nom: "",
        prenom: "",
        telephone: "",
        email: "",
        motDePasse: "",
        confirmMotDePasse: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation côté client
        if (!form.nom || !form.prenom || !form.email || !form.telephone || !form.motDePasse) {
            setError("Veuillez remplir tous les champs.");
            return;
        }
        if (form.motDePasse !== form.confirmMotDePasse) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        if (form.motDePasse.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        setLoading(true);
        try {
            await patientService.create({
                nom: form.nom,
                prenom: form.prenom,
                email: form.email,
                telephone: form.telephone,
                motDePasse: form.motDePasse,
            });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000);
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                "Une erreur est survenue. Veuillez réessayer.";
            setError(typeof msg === "string" ? msg : "Erreur lors de l'inscription.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid vh-100">
            <div className="row h-100">
                {/* Formulaire gauche */}
                <div className="col-12 col-md-6 d-flex align-items-center justify-content-center px-4">
                    <div className="w-100" style={{ maxWidth: "380px" }}>

                        <div className="text-center mb-4">
                            <img src={LogoImg} className="w-75" alt="logo" />
                            <div className="rounded mt-1 p-2 small text-muted bg-light">
                                <Typewriter
                                    options={{
                                        strings: [
                                            "Créez votre compte Meditrack",
                                            "Rejoignez votre espace médical sécurisé",
                                            "Suivez votre santé en toute simplicité",
                                            "Bienvenue, votre bien-être commence ici",
                                        ],
                                        autoStart: true,
                                        loop: true,
                                        delay: 60,
                                        deleteSpeed: 30,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Feedback */}
                        {error && (
                            <div className="alert alert-danger py-2 small" role="alert">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="alert alert-success py-2 small" role="alert">
                                <i className="bi bi-check-circle-fill me-2"></i>
                                Compte créé avec succès ! Redirection vers la connexion…
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="d-flex gap-3">
                                <div className="mb-3 flex-fill">
                                    <label className="form-label">Nom</label>
                                    <input
                                        type="text"
                                        name="nom"
                                        className="form-control form-control-sm"
                                        value={form.nom}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3 flex-fill">
                                    <label className="form-label">Prénom</label>
                                    <input
                                        type="text"
                                        name="prenom"
                                        className="form-control form-control-sm"
                                        value={form.prenom}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="d-flex gap-3">
                                <div className="mb-3 flex-fill">
                                    <label className="form-label">Téléphone</label>
                                    <input
                                        type="tel"
                                        name="telephone"
                                        className="form-control form-control-sm"
                                        value={form.telephone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3 flex-fill">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control form-control-sm"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Mot de passe</label>
                                <input
                                    type="password"
                                    name="motDePasse"
                                    className="form-control form-control-sm"
                                    value={form.motDePasse}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Confirmer mot de passe</label>
                                <input
                                    type="password"
                                    name="confirmMotDePasse"
                                    className="form-control form-control-sm"
                                    value={form.confirmMotDePasse}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || success}
                                className="btn w-100 text-white d-flex align-items-center justify-content-center gap-2"
                                style={{ background: "linear-gradient(135deg,#1A7A52,#27A869)" }}
                            >
                                {loading && <span className="spinner-border spinner-border-sm"></span>}
                                {loading ? "Inscription en cours…" : "S'inscrire"}
                            </button>
                        </form>

                        <div className="text-center mt-3">
                            <span className="small text-muted">Vous avez déjà un compte ? </span>
                            <a href="/login" className="small text-decoration-none fw-semibold">
                                Se connecter
                            </a>
                        </div>

                        <div className="position-relative my-4 text-center">
                            <div className="border-top"></div>
                            <span className="position-absolute top-50 start-50 translate-middle bg-white px-2 small text-muted">
                                ou
                            </span>
                        </div>

                        <div className="d-flex justify-content-center gap-3">
                            <a href="#" className="d-flex align-items-center justify-content-center rounded-circle border" style={{ width: 38, height: 38 }}>
                                <i className="bi bi-google text-danger small"></i>
                            </a>
                            <a href="#" className="d-flex align-items-center justify-content-center rounded-circle border" style={{ width: 38, height: 38, backgroundColor: "#1877F2", color: "white" }}>
                                <i className="bi bi-facebook small"></i>
                            </a>
                            <a href="#" className="d-flex align-items-center justify-content-center rounded-circle border" style={{ width: 38, height: 38 }}>
                                <i className="bi bi-twitter-x small"></i>
                            </a>
                            <a href="#" className="d-flex align-items-center justify-content-center rounded-circle border" style={{ width: 38, height: 38 }}>
                                <i className="bi bi-instagram small"></i>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Illustration droite */}
                <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center bg-light p-4">
                    <img src={Img} style={{ width: "28rem" }} alt="illustration" />
                </div>
            </div>
        </div>
    );
}

export default Inscription;