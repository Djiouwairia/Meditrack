import LogoImg from "../assets/logo.png";
import Img from "../assets/Sign up.gif";
import Typewriter from "typewriter-effect";

function Inscription() {
  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
         <div className="col-12 col-md-6 d-flex align-items-center justify-content-center px-4">

          <div className="w-100" style={{ maxWidth: "360px" }}>

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

            <form className="">
              <div className="d-flex gap-3">
                   <div className="mb-3">
                <label className="form-label ">Nom</label>
                <input type="text" className="form-control form-control-sm" />
              </div>

              <div className="mb-3">
                <label className="form-label ">Prénom</label>
                <input type="text" className="form-control form-control-sm" />
              </div>
              </div>
              <div className="d-flex gap-3">
                <div className="mb-3">
                <label className="form-label ">Téléphone</label>
                <input type="text" className="form-control form-control-sm" />
              </div>
              <div className="mb-3">
                <label className="form-label ">Email</label>
                <input type="email" className="form-control form-control-sm" />
              </div>
              </div>

              
              <div className="mb-3">
                <label className="form-label ">Mot de passe</label>
                <input type="password" className="form-control form-control-sm" />
              </div>
              <div className="mb-3">
                <label className="form-label ">Confirmer mot de passe</label>
                <input type="password" className="form-control form-control-sm" />
              </div>
             

              <button
                className="btn w-100  text-white"
                style={{
                  background: "linear-gradient(135deg,#1A7A52,#27A869)",
                }}
              >
                S'inscrire
              </button>
            </form>

            <div className="text-center mt-3">
              <span className="small text-muted">
                Vous avez déja un compte ?{" "}
              </span>
              <a href="#" className="small text-decoration-none fw-semibold">
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
        <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center bg-light p-4">
          <img src={Img} style={{ width: "28rem" }} alt="illustration" />
        </div>

        

      </div>
    </div>
  );
}

export default Inscription;