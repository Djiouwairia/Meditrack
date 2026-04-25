import axios from "axios";

const BASE_URL = "http://localhost:8080";

const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                const refreshToken = localStorage.getItem("refreshToken");
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

// ─────────────────── AUTH ───────────────────
export const authAPI = {
    login: (email: string, password: string) =>
        api.post("/login", { email, password }),
};

// ─────────────────── MÉDECINS ───────────────────
export const medecinAPI = {
    getAll: (page = 0, size = 10, sortBy = "nom") =>
        api.get(`/medecins?page=${page}&size=${size}&sortBy=${sortBy}`),
    getById: (id: string) => api.get(`/medecins/${id}`),
    getDisponibles: () => api.get("/medecins/disponibles"),
    getBySpecialite: (specialite: string, page = 0, size = 10) =>
        api.get(`/medecins/specialite/${specialite}?page=${page}&size=${size}`),
    create: (dto: any) => api.post("/medecins", dto),
    update: (id: string, dto: any) => api.put(`/medecins/${id}`, dto),
    toggleDisponibilite: (id: string) => api.patch(`/medecins/${id}/disponibilite`),
    delete: (id: string) => api.delete(`/medecins/${id}`),
};

// ─────────────────── PATIENTS ───────────────────
export const patientAPI = {
    getAll: (page = 0, size = 10, sortBy = "nom") =>
        api.get(`/patients?page=${page}&size=${size}&sortBy=${sortBy}`),
    getById: (id: string) => api.get(`/patients/${id}`),
    create: (dto: any) => api.post("/patients", dto),
    update: (id: string, dto: any) => api.put(`/patients/${id}`, dto),
    delete: (id: string) => api.delete(`/patients/${id}`),
};

// ─────────────────── SECRÉTAIRES ───────────────────
export const secretaireAPI = {
    getAll: (page = 0, size = 10, sortBy = "nom") =>
        api.get(`/secretaires?page=${page}&size=${size}&sortBy=${sortBy}`),
    getById: (id: string) => api.get(`/secretaires/${id}`),
    create: (dto: any) => api.post("/secretaires", dto),
    update: (id: string, dto: any) => api.put(`/secretaires/${id}`, dto),
    delete: (id: string) => api.delete(`/secretaires/${id}`),
    creerPatient: (id: string, dto: any) =>
        api.post(`/secretaires/${id}/creer-patient`, dto),
    prendreRendezVous: (id: string, dto: any) =>
        api.post(`/secretaires/${id}/rendez-vous`, dto),
    confirmerRdv: (id: string, rdvId: string) =>
        api.patch(`/secretaires/${id}/rendez-vous/${rdvId}/confirmer`),
    annulerRdv: (id: string, rdvId: string) =>
        api.patch(`/secretaires/${id}/rendez-vous/${rdvId}/annuler`),
};

// ─────────────────── RENDEZ-VOUS ───────────────────
export const rendezVousAPI = {
    getById: (id: string) => api.get(`/rendez-vous/${id}`),
    getByMedecin: (medecinId: string, page = 0, size = 10) =>
        api.get(`/rendez-vous/medecin/${medecinId}?page=${page}&size=${size}`),
    getByPatient: (patientId: string, page = 0, size = 10) =>
        api.get(`/rendez-vous/patient/${patientId}?page=${page}&size=${size}`),
    getAgendaMedecin: (medecinId: string, debut: string, fin: string) =>
        api.get(`/rendez-vous/medecin/${medecinId}/agenda?debut=${debut}&fin=${fin}`),
    getAgendaAujourdhui: (medecinId: string) =>
        api.get(`/rendez-vous/medecin/${medecinId}/aujourd-hui`),
    prendre: (dto: any) => api.post("/rendez-vous", dto),
    confirmer: (id: string) => api.patch(`/rendez-vous/${id}/confirmer`),
    annuler: (id: string) => api.patch(`/rendez-vous/${id}/annuler`),
    terminer: (id: string, diagnostic: string) =>
        api.patch(`/rendez-vous/${id}/terminer`, { diagnostic }),
    delete: (id: string) => api.delete(`/rendez-vous/${id}`),
};

// ─────────────────── DOSSIER MÉDICAL ───────────────────
export const dossierAPI = {
    getById: (id: string) => api.get(`/dossiers-medicaux/${id}`),
    getByPatient: (patientId: string) =>
        api.get(`/dossiers-medicaux/patient/${patientId}`),
    update: (id: string, dto: any) => api.put(`/dossiers-medicaux/${id}`, dto),
};

// ─────────────────── ORDONNANCES ───────────────────
export const ordonnanceAPI = {
    getById: (id: string) => api.get(`/ordonnances/${id}`),
    getByDossier: (dossierMedicalId: string, page = 0, size = 10) =>
        api.get(`/ordonnances/dossier/${dossierMedicalId}?page=${page}&size=${size}`),
    getByRendezVous: (rendezVousId: string, page = 0, size = 10) =>
        api.get(`/ordonnances/rendez-vous/${rendezVousId}?page=${page}&size=${size}`),
    creer: (dto: any) => api.post("/ordonnances", dto),
    delete: (id: string) => api.delete(`/ordonnances/${id}`),
};