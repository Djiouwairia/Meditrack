// @ts-ignore
import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authService, type AuthUser } from "../services/Authservice";

interface AuthContextType {
    user: AuthUser | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        const u = authService.getCurrentUser();
        if (u && authService.isAuthenticated()) setUser(u);
    }, []);

    const login = async (email: string, password: string) => {
        const u = await authService.login(email, password);
        setUser(u);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}