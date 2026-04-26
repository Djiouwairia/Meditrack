import api from "./api";
import { jwtDecode } from "jwt-decode";

export interface AuthUser {
    email: string;
    role: string;
    exp: number;
}

function debugJwt(decoded: Record<string, unknown>) {
    console.group("🔍 JWT Claims reçus du backend");
    Object.entries(decoded).forEach(([k, v]) => {
        console.log(`  ${k}:`, v, `(${typeof v})`);
    });
    console.groupEnd();
}

function extractRole(decoded: Record<string, unknown>): string {
    if (typeof decoded.role === "string" && decoded.role) return decoded.role;
    if (Array.isArray(decoded.roles) && decoded.roles.length > 0)
        return String(decoded.roles[0]);
    if (Array.isArray(decoded.authorities) && decoded.authorities.length > 0) {
        const first = decoded.authorities[0];
        if (typeof first === "string") return first;
        if (first && typeof first === "object" && "authority" in first)
            return String((first as { authority: string }).authority);
    }
    if (typeof decoded.scope === "string" && decoded.scope)
        return decoded.scope.split(" ")[0];
    if (typeof decoded.claim === "string" && decoded.claim) return decoded.claim;
    if (typeof decoded.userRole === "string" && decoded.userRole) return decoded.userRole;
    console.warn("⚠️ Rôle introuvable dans le JWT :");
    debugJwt(decoded);
    return "UNKNOWN";
}

export const authService = {
    async login(email: string, password: string): Promise<AuthUser> {
        const { data } = await api.post("/login", { email, password });
        const accessToken: string = data.accessToken ?? data.token;
        const refreshToken: string | undefined = data.refreshToken;
        if (!accessToken) {
            console.error("❌ Réponse backend :", data);
            throw new Error("Aucun token reçu — vérifiez le contrôleur /login");
        }
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        const decoded = jwtDecode<Record<string, unknown>>(accessToken);
        debugJwt(decoded);
        const rawRole = extractRole(decoded);
        const role = rawRole.replace(/^ROLE_/i, "").toUpperCase();
        const user: AuthUser = { email: decoded.sub as string, role, exp: decoded.exp as number };
        localStorage.setItem("user", JSON.stringify(user));
        console.info(`✅ Connecté en tant que ${role} (${user.email})`);
        return user;
    },
    logout() { localStorage.clear(); window.location.href = "/login"; },
    getCurrentUser(): AuthUser | null {
        const raw = localStorage.getItem("user");
        if (!raw) return null;
        try { return JSON.parse(raw) as AuthUser; } catch { return null; }
    },
    isAuthenticated(): boolean {
        const user = this.getCurrentUser();
        if (!user) return false;
        return Date.now() / 1000 < user.exp - 30;
    },
    getDashboardPath(role: string): string {
        switch (role.toUpperCase()) {
            case "ADMIN":      return "/dashboard/admin";
            case "MEDECIN":    return "/dashboard/medecin";
            case "PATIENT":    return "/dashboard/patient";
            case "SECRETAIRE": return "/dashboard/secretaire";
            default:           return "/login";
        }
    },
};