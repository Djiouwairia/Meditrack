import api from "./api";
import { jwtDecode } from "jwt-decode";

/* ─────────────────────────────
   👤 TYPE USER AUTH
───────────────────────────── */
export interface AuthUser {
    email: string;
    role: string;
    nom?: string;
    prenom?: string;
    exp: number;
}

/* ─────────────────────────────
   🔐 AUTH SERVICE
───────────────────────────── */
export const authService = {

    /* LOGIN */
    async login(email: string, password: string): Promise<AuthUser> {
        console.log("🔐 [LOGIN] Attempt:", { email });

        try {
            const { data } = await api.post("/login", { email, password });

            console.log("📦 [LOGIN] Response received:", data);

            const accessToken = data.accessToken ?? data.token;
            const refreshToken = data.refreshToken;

            if (!accessToken) {
                console.error("❌ [LOGIN] No access token in response");
                throw new Error("Aucun token reçu du serveur");
            }

            console.log("🎟️ [LOGIN] Access token OK");
            console.log("🔁 [LOGIN] Refresh token:", refreshToken ? "present" : "absent");

            /* stocker tokens */
            localStorage.setItem("accessToken", accessToken);
            if (refreshToken) {
                localStorage.setItem("refreshToken", refreshToken);
            }

            /* decode JWT */
            const decoded: any = jwtDecode(accessToken);

            console.log("🧾 [JWT DECODED]:", decoded);

            /* rôle robuste */
            const roleRaw =
                decoded.role ||
                decoded.roles?.[0] ||
                decoded.authorities?.[0]?.authority ||
                decoded.scope?.split(" ")[0] ||
                "UNKNOWN";

            const role = roleRaw.replace("ROLE_", "").toUpperCase();

            console.log("🧑‍⚕️ [ROLE RAW]:", roleRaw);
            console.log("🧑‍⚕️ [ROLE FINAL]:", role);

            const user: AuthUser = {
                email: decoded.sub || decoded.email,
                role,
                nom: decoded.nom,
                prenom: decoded.prenom,
                exp: decoded.exp,
            };

            console.log("👤 [USER OBJECT]:", user);

            localStorage.setItem("user", JSON.stringify(user));

            console.log("💾 [LOCALSTORAGE] user saved");

            return user;

        } catch (error: any) {
            console.error("❌ [LOGIN ERROR]:", error?.response?.data || error.message);
            throw error;
        }
    },

    /* LOGOUT */
    logout() {
        console.log("🚪 [LOGOUT] Clearing session...");

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        console.log("✅ [LOGOUT] Done → redirecting");
        window.location.href = "/login";
    },

    /* USER CURRENT */
    getCurrentUser(): AuthUser | null {
        const raw = localStorage.getItem("user");

        console.log("👤 [GET USER] raw:", raw);

        if (!raw) return null;

        try {
            const user = JSON.parse(raw);
            console.log("👤 [GET USER] parsed:", user);
            return user;
        } catch (e) {
            console.error("❌ [GET USER] parse error:", e);
            return null;
        }
    },

    /* AUTH CHECK */
    isAuthenticated(): boolean {
        const user = this.getCurrentUser();

        if (!user) {
            console.warn("⚠️ [AUTH] No user found");
            return false;
        }

        const now = Date.now() / 1000;
        const valid = now < user.exp - 30;

        console.log("⏳ [AUTH CHECK]", {
            now,
            exp: user.exp,
            valid
        });

        return valid;
    },

    /* ROLE REDIRECT */
    getDashboardPath(role: string): string {
        console.log("🧭 [REDIRECT ROLE]:", role);

        switch (role?.toUpperCase()) {
            case "ADMIN":
            case "ADMIN_HOPITAL":
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
    }
};