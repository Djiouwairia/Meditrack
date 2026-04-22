import NavBar from "./components/layout/NavBar";
import ChatbotButton from "./components/layout/ChatbotButton";
import "bootstrap/dist/css/bootstrap.css";
import imagePath from "./assets/logo.png";
import Accueil from "./components/sections/Accueil";
import Fonctionnalites from "./components/sections/Fonctionnalites";
import Specialites from "./components/sections/Specialites";
import Apropos from "./components/sections/Apropos";
import Contact from "./components/sections/Contact";
import RDV from "./components/sections/RDV";
import Footer from "./components/layout/Footer";

function App() {
  return (
    <div style={{ paddingTop: "80px" }}>
      <NavBar brandName="Meditrack" imageSrcPath={imagePath} />

      <section id="accueil"><Accueil /></section>
      <section id="fonctionnalites"><Fonctionnalites /></section>
      <section id="specialites"><Specialites /></section>
      <section id="apropos"><Apropos /></section>
      <section id="contact"><Contact /></section>
      <section id="rdv"><RDV /></section>
      <Footer />

      <ChatbotButton />
    </div>
  );
}

export default App;