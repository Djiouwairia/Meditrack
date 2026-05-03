import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./i18n";
import App from "./App";
import { PreferenceProvider } from "./context/PreferenceContext";
import "./App.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <PreferenceProvider>
                <App />
            </PreferenceProvider>
        </BrowserRouter>
    </React.StrictMode>
);