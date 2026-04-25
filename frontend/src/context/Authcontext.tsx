import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authAPI } from "../services/api.ts";

interface AuthUser {
    id: string;
    email: string;
    role: "MEDECIN" | "PATIENT" | "SECRETAIRE" | "ADMIN";
    nom?: string;
    prenom?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function decodeJWT(token: string): any {
    try {
        const payload = token.split(".")[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            const decoded = decodeJWT(token);
            if (decoded && decoded.exp * 1000 > Date.now()) {
                setUser({
                    id: decoded.sub || decoded.id,
                    email: decoded.email || decoded.sub,
                    role: decoded.role,
                    nom: decoded.nom,
                    prenom: decoded.prenom,
                });
            } else {
                localStorage.clear();
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const { data } = await authAPI.login(email, password);
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        const decoded = decodeJWT(data.accessToken);
        setUser({
            id: decoded.sub || decoded.id,
            email: decoded.email || decoded.sub,
            role: decoded.role,
            nom: decoded.nom,
            prenom: decoded.prenom,
        });
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}