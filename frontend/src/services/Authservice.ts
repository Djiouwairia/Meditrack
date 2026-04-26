import api from "./api";
import { jwtDecode } from "jwt-decode";

export interface AuthUser {
    email: string;
    role: string;
    exp: number;
}

export const authService = {
    async login(email: string, password: string): Promise<AuthUser> {
        const { data } = await api.post("/login", { email, password });

        const accessToken = data.accessToken ?? data.token;
        const refreshToken = data.refreshToken;

        if (!accessToken) throw new Error("Aucun token reçu");

        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

        const decoded = jwtDecode<any>(accessToken);

        const roleRaw =
            decoded.role ||
            decoded.roles?.[0] ||
            decoded.authorities?.[0]?.authority ||
            decoded.scope?.split(" ")[0] ||
            "UNKNOWN";

        const role = roleRaw.replace("ROLE_", "").toUpperCase();

        const user: AuthUser = {
            email: decoded.sub,
            role,
            exp: decoded.exp,
        };

        localStorage.setItem("user", JSON.stringify(user));

        return user;
    },

    logout() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
    },

    getCurrentUser(): AuthUser | null {
        const raw = localStorage.getItem("user");
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },

    isAuthenticated(): boolean {
        const user = this.getCurrentUser();
        if (!user) return false;
        return Date.now() / 1000 < user.exp - 30;
    },

    getDashboardPath(role: string): string {
        switch (role.toUpperCase()) {
            case "ADMIN":
                return "/dashboard/admin";
            case "MEDECIN":
                return "/dashboard/medecin";
            case "PATIENT":
                return "/dashboard/patient";
            case "SECRETAIRE":
                return "/dashboard/secretaire";
            default:
                return "/login";
        }
    },
};