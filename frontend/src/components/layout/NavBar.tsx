import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePreferences } from "../../context/PreferenceContext";

interface NavBarProps {
    brandName: string;
    imageSrcPath: string;
}

const css = `
html { scroll-behavior: smooth; }



.mn {
    min-height: 75px;
    background: #f8f9fa !important;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 1000;
    padding: 0.5rem 0;
}

.mn::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    width: 0;
    background: linear-gradient(90deg, #5DCC8A, #27A869, #1A7A52);
    animation: slidein .8s ease forwards .2s;
}

@keyframes slidein {
    to { width: 100%; }
}

.brand-name {
    font-weight: 700;
    font-size: 1.3rem;
    background: linear-gradient(135deg, #27A869, #1A7A52);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.mn .nav-link {
    display: flex !important;
    align-items: center;
    gap: 6px;
    font-size: 0.88rem !important;
    font-weight: 500 !important;
    color: #444 !important;
    border-radius: 9px;
    padding: 0.45rem 0.85rem !important;
    position: relative;
    transition: all .2s;
    white-space: nowrap;
}

.mn .nav-link svg {
    flex-shrink: 0;
    transition: transform .2s;
    width: 16px;
    height: 16px;
}

.mn .nav-link::after {
    content: '';
    position: absolute;
    bottom: 3px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #27A869, #1A7A52);
    border-radius: 2px;
    transition: width .22s;
}

.mn .nav-link:hover {
    color: #1A7A52 !important;
    background: rgba(39,168,105,.08);
}

.mn .nav-link:hover svg {
    transform: scale(1.15);
}

.mn .nav-link:hover::after {
    width: 55%;
}

.btn-connect {
    background: linear-gradient(135deg, #27A869, #1A7A52) !important;
    color: #fff !important;
    font-size: 0.88rem !important;
    font-weight: 600 !important;
    border-radius: 50px !important;
    display: inline-flex !important;
    align-items: center;
    gap: 7px;
    box-shadow: 0 4px 14px rgba(27,122,82,.3);
    border: none !important;
    padding: 0.45rem 1.1rem !important;
    transition: all .22s !important;
    white-space: nowrap;
}

.btn-connect:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(27,122,82,.4) !important;
}

.btn-rdv {
    background: linear-gradient(135deg, #1A7A52, #27A869) !important;
    color: #fff !important;
}

.navbar-toggler {
    background: transparent;
    border: none;
    cursor: pointer;
    position: relative;
    width: 42px;
    height: 42px;
    transition: all 0.3s ease;
    border-radius: 12px;
    display: none;
}

.navbar-toggler:hover {
    background: rgba(39,168,105,.08);
}

.burger-bar {
    display: block;
    width: 24px;
    height: 2.5px;
    background: #1A7A52;
    border-radius: 2px;
    transition: all 0.25s ease;
    margin: 5px auto;
}

.navbar-toggler.open .burger-bar:nth-child(1) {
    transform: translateY(7.5px) rotate(45deg);
}

.navbar-toggler.open .burger-bar:nth-child(2) {
    opacity: 0;
    transform: scaleX(0);
}

.navbar-toggler.open .burger-bar:nth-child(3) {
    transform: translateY(-7.5px) rotate(-45deg);
}

.navbar-nav {
    display: flex;
    align-items: center;
    gap: 0.1rem;
    margin-left: 1rem;
}

/* Desktop */
@media(min-width: 1200px) {
    .nav-center {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }
    .btn-connect-wrapper {
        margin-left: auto;
    }
    .mn .nav-link {
        font-size: 0.95rem !important;
        padding: 0.5rem 1rem !important;
    }
    .navbar-nav {
        margin-left: 2rem;
    }
}

/* Écrans moyens (13 pouces) */
@media(max-width: 1199px) and (min-width: 992px) {
    .container-fluid {
        padding-left: 1.5rem !important;
        padding-right: 1.5rem !important;
    }

    .mn .nav-link {
        font-size: 0.85rem !important;
        padding: 0.45rem 0.7rem !important;
        gap: 5px;
    }

    .btn-connect {
        font-size: 0.85rem !important;
        padding: 0.45rem 0.9rem !important;
        gap: 5px;
    }

    .brand-name {
        font-size: 1.2rem;
    }

    .navbar-brand img {
        height: 48px;
    }

    .navbar-nav {
        margin-left: 1.5rem;
    }
}

/* Mobile et tablettes */
@media(max-width: 991px) {
    .navbar-toggler {
        display: flex !important;
        flex-direction: column;
        justify-content: center;
        margin-left: auto;
    }

    .navbar-collapse {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #f8f9fa;
        z-index: 1000;
        padding: 1rem;
        border-radius: 0 0 12px 12px;
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }

    .navbar-nav {
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
        margin-left: 0;
    }

    .mn .nav-link {
        justify-content: center;
        white-space: normal;
        text-align: center;
        width: 100%;
        font-size: 0.95rem !important;
        padding: 0.7rem !important;
    }

    .btn-connect-wrapper {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 0.5rem;
    }

    .btn-connect {
        justify-content: center;
        width: 100%;
        font-size: 0.95rem !important;
        padding: 0.7rem 1rem !important;
    }
}
`;

const icons: Record<string, JSX.Element> = {
    house: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#27A869" strokeWidth="2">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
            <path d="M9 21V12h6v9"/>
        </svg>
    ),
    sparkles: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#27A869" strokeWidth="2">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 3v2m0 14v2M3 12H1m22 0h-2"/>
        </svg>
    ),
    doctor: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#27A869" strokeWidth="2">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/>
            <path d="M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
    ),
    info: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#27A869" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="8"/>
            <line x1="12" y1="12" x2="12" y2="16"/>
        </svg>
    ),
    envelope: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#27A869" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m2 7 10 7 10-7"/>
        </svg>
    ),
    signup: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
    ),
    login: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <path d="M10 17l5-5-5-5"/>
            <path d="M15 12H3"/>
        </svg>
    ),
    rdv: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M8 2v4M16 2v4M3 10h18"/>
            <path d="M8 14h8M8 18h5"/>
        </svg>
    ),
};

function NavBar({ brandName, imageSrcPath }: NavBarProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const { t } = useTranslation();
    const { theme, toggleTheme, language, changeLanguage } = usePreferences();

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    return (
        <>
            <style>{css}</style>

            <nav className="mn navbar navbar-expand-lg shadow-sm">
                <div className="container-fluid px-3 px-lg-4">
                    <a className="navbar-brand d-flex align-items-center gap-2" href="/">
                        <img src={imageSrcPath} alt="logo" height="48" />
                        <span className="brand-name">{brandName}</span>
                    </a>

                    <button
                        className={`navbar-toggler ${isOpen ? "open" : ""}`}
                        onClick={toggleMenu}
                        aria-label="Menu"
                    >
                        <span className="burger-bar"></span>
                        <span className="burger-bar"></span>
                        <span className="burger-bar"></span>
                    </button>

                    <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
                        <ul className="navbar-nav">
                            <li><a className="nav-link" href="#accueil" onClick={closeMenu}>{icons.house}{t('navBar.home')}</a></li>
                            <li><a className="nav-link" href="#fonctionnalites" onClick={closeMenu}>{icons.sparkles}{t('navBar.features')}</a></li>
                            <li><a className="nav-link" href="#specialites" onClick={closeMenu}>{icons.doctor}{t('navBar.specialties')}</a></li>
                            <li><a className="nav-link" href="#apropos" onClick={closeMenu}>{icons.info}{t('navBar.about')}</a></li>
                            <li><a className="nav-link" href="#contact" onClick={closeMenu}>{icons.envelope}{t('navBar.contact')}</a></li>
                        </ul>

                        <div className="btn-connect-wrapper d-flex gap-2 align-items-center">
                            <button
                                className="btn btn-light rounded-circle"
                                style={{ width: 38, height: 38, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #EBEBEB" }}
                                onClick={toggleTheme}
                                title={theme === "dark" ? "Mode clair" : "Mode sombre"}
                            >
                                <i className={`bi ${theme === "dark" ? "bi-sun text-warning" : "bi-moon"}`}></i>
                            </button>

                            <div className="dropdown">
                                <button
                                    className="btn btn-light dropdown-toggle text-uppercase"
                                    data-bs-toggle="dropdown"
                                    style={{ borderRadius: 20, border: "1px solid #EBEBEB", padding: "0.3rem 0.8rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px" }}
                                >
                                    {language}
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end shadow-sm" style={{ minWidth: "120px" }}>
                                    <li><button className="dropdown-item" onClick={() => changeLanguage("fr")}>🇫🇷 FR</button></li>
                                    <li><button className="dropdown-item" onClick={() => changeLanguage("en")}>🇬🇧 EN</button></li>
                                    <li><button className="dropdown-item" onClick={() => changeLanguage("ar")}>🇸🇦 AR</button></li>
                                </ul>
                            </div>

                            <a className="btn btn-connect btn-rdv" href="#rdv" onClick={closeMenu}>
                                {icons.rdv} {t('navBar.bookAppt')}
                            </a>
                            <Link className="btn btn-connect" to="/login" onClick={closeMenu}>
                                {icons.login} {t('navBar.login')}
                            </Link>
                            <Link className="btn btn-connect" to="/register" onClick={closeMenu}>
                                {icons.signup} {t('navBar.register')}
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default NavBar;