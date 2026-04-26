import axios from "axios";

const BASE_URL = "http://localhost:8080";

// Endpoints qui ne doivent JAMAIS recevoir le token (évite le 401 du JwtAuthFilter)
const PUBLIC_URLS = ["/login", "/refresh-token"];

const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// ── Attache le token JWT sauf sur les routes publiques ──────────────────────
api.interceptors.request.use((config) => {
    const isPublic = PUBLIC_URLS.some(url => config.url?.endsWith(url));
    if (!isPublic) {
        const token = localStorage.getItem("accessToken");
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Auto-refresh sur 401 (sauf sur /login lui-même) ─────────────────────────
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        const isLoginUrl = PUBLIC_URLS.some(url => original?.url?.endsWith(url));

        if (error.response?.status === 401 && !original._retry && !isLoginUrl) {
            original._retry = true;
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
                localStorage.clear();
                window.location.href = "/login";
                return Promise.reject(error);
            }
            try {
                const { data } = await axios.post(`${BASE_URL}/refresh-token`, { refreshToken });
                localStorage.setItem("accessToken", data.accessToken);
                original.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(original);
            } catch {
                localStorage.clear();
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;