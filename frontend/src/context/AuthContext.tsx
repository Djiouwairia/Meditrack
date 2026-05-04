import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode
} from "react";
import { authService, type AuthUser } from "../services/Authservice";

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // 🔥 BOOT RAPIDE + SAFE
    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (token && authService.isAuthenticated()) {
            const u = authService.getCurrentUser();
            if (u) setUser(u);
        }

        setLoading(false);
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
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!localStorage.getItem("accessToken"),
                loading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}