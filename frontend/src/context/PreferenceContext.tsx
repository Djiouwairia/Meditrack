import React, { createContext, useContext, useEffect, useState } from "react";
import i18n from "../i18n";

interface PreferenceContextType {
    theme: "light" | "dark";
    toggleTheme: () => void;
    language: string;
    changeLanguage: (lang: string) => void;
}

const PreferenceContext = createContext<PreferenceContextType | undefined>(undefined);

export function PreferenceProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<"light" | "dark">(
        (localStorage.getItem("theme") as "light" | "dark") || "light"
    );
    const [language, setLanguage] = useState<string>(
        localStorage.getItem("language") || "fr"
    );

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        document.documentElement.setAttribute("data-bs-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem("language", language);
        document.documentElement.lang = language;
        i18n.changeLanguage(language);
        if (language === "ar") {
            document.documentElement.dir = "rtl";
        } else {
            document.documentElement.dir = "ltr";
        }
    }, [language]);

    const toggleTheme = () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
    };

    const changeLanguage = (lang: string) => {
        setLanguage(lang);
    };

    return (
        <PreferenceContext.Provider value={{ theme, toggleTheme, language, changeLanguage }}>
            {children}
        </PreferenceContext.Provider>
    );
}

export function usePreferences() {
    const context = useContext(PreferenceContext);
    if (!context) {
        throw new Error("usePreferences must be used within a PreferenceProvider");
    }
    return context;
}
