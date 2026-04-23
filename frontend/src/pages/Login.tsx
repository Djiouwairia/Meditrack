import LogoImg from "../assets/logo.png";
import Img from "../assets/Privacy policy.gif";
import Typewriter from "typewriter-effect";

function Login() {
  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">

        <div className="col-md-7 d-none d-md-flex align-items-center justify-content-center bg-light p-4">
          <img src={Img} className="img-fluid w-75" alt="illustration" />
        </div>

        <div className="col-12 col-md-5 d-flex align-items-center justify-content-center px-4">

          <div className="w-100" style={{ maxWidth: "360px" }}>

            <div className="text-center mb-4">
              <img src={LogoImg} style={{ width: "70px" }} alt="logo" />
              <h4 className="mt-2 fw-semibold fs-5">Meditrack</h4>

              <div className="rounded mt-3 p-2 small text-muted bg-light">
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

            <form className="small">

              <div className="mb-3">
                <label className="form-label small">Email</label>
                <input type="email" className="form-control form-control-sm" />
              </div>

              <div className="mb-2">
                <label className="form-label small">Mot de passe</label>
                <input type="password" className="form-control form-control-sm" />
              </div>

              <div className="d-flex justify-content-end mb-3">
                <a href="#" className="small ">
                  Mot de passe oublié ?
                </a>
              </div>

              <button
                className="btn w-100 btn-sm text-white"
                style={{
                  background: "linear-gradient(135deg,#1A7A52,#27A869)",
                }}
              >
                Se connecter
              </button>
            </form>

            <div className="text-center mt-3">
              <span className="small text-muted">
                Vous n'avez pas de compte ?{" "}
              </span>
              <a href="#" className="small text-decoration-none fw-semibold">
                S'inscrire
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

      </div>
    </div>
  );
}

export default Login;