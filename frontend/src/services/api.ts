import axios from "axios";
import { getServerBaseUrl } from "./serverConfig";

const PUBLIC_URLS = ["/login", "/auth/refresh"];

const api = axios.create({
    headers: { "Content-Type": "application/json" },
});

// ── Injecter dynamiquement la baseURL à chaque requête ──────────────────────
// Comme ça, si l'utilisateur change l'adresse dans les paramètres,
// la nouvelle URL est prise en compte immédiatement sans rechargement.
api.interceptors.request.use((config) => {
    config.baseURL = getServerBaseUrl();

    const isPublic = PUBLIC_URLS.some(url => config.url?.includes(url));
    if (!isPublic) {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// ── RESPONSE INTERCEPTOR (AUTO REFRESH) ─────────────────────────────────────
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        const isRefreshCall = original?.url?.includes("/auth/refresh");

        if (error.response?.status === 401 && !original._retry && !isRefreshCall) {
            original._retry = true;

            const refreshToken = localStorage.getItem("refreshToken");

            if (!refreshToken) {
                localStorage.clear();
                window.location.href = "/login";
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post(
                    `${getServerBaseUrl()}/auth/refresh`,
                    { refreshToken }
                );

                localStorage.setItem("accessToken", data.accessToken);
                original.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(original);

            } catch (err) {
                localStorage.clear();
                window.location.href = "/login";
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;