import api from "./api";

export interface PageResponse<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number; }
export interface Medecin { id: string; nom: string; prenom: string; email: string; telephone: string; specialite: string; disponible: boolean; hopital?: { id: string; nom: string }; }
export interface Patient { id: string; nom: string; prenom: string; email: string; telephone: string; adresse?: string; dateDeNaissance?: string; groupeSanguin?: string; hopital?: { id: string; nom: string }; }
export interface RendezVous { id: string; date: string; heure: string; motif: string; statut: "EN_ATTENTE" | "CONFIRME" | "ANNULE" | "TERMINE"; diagnostic?: string; patient: Patient; medecin: Medecin; }
export interface DossierMedical { id: string; allergies?: string; poids?: string; taille?: string; patient: Patient; ordonnances?: Ordonnance[]; }
export interface Ordonnance { id: string; date: string; dateCreation?: string; medicaments: Record<string, string>; medecin?: { id: string; nom: string; prenom: string }; rendezVous?: RendezVous; dossierMedical?: { id: string }; }
export interface Secretaire { id: string; nom: string; prenom: string; email: string; telephone: string; hopital?: { id: string; nom: string }; }
export interface Disponibilite { id: string; date: string; heureDebut: string; heureFin: string; estReserve: boolean; medecin?: { id: string; nom: string; prenom: string }; }

export const medecinService = {
    getMe: () => api.get<Medecin>("/medecins/me").then(r => r.data),
    getAll: (page = 0, size = 10, sortBy = "nom") => api.get<PageResponse<Medecin>>(`/medecins?page=${page}&size=${size}&sortBy=${sortBy}`).then(r => r.data),
    getById: (id: string) => api.get<Medecin>(`/medecins/${id}`).then(r => r.data),
    getDisponibles: () => api.get<Medecin[]>("/medecins/disponibles").then(r => r.data),
    getBySpecialite: (s: string, page = 0, size = 10) => api.get<PageResponse<Medecin>>(`/medecins/specialite/${s}?page=${page}&size=${size}`).then(r => r.data),
    create: (dto: any) => api.post<Medecin>("/medecins", dto).then(r => r.data),
    update: (id: string, dto: any) => api.put<Medecin>(`/medecins/${id}`, dto).then(r => r.data),
    toggleDisponibilite: (id: string) => api.patch<Medecin>(`/medecins/${id}/disponibilite`).then(r => r.data),
    delete: (id: string) => api.delete(`/medecins/${id}`),
};

export const patientService = {
    getMe: () => api.get<Patient>("/patients/me").then(r => r.data),
    getAll: (page = 0, size = 10, sortBy = "nom") => api.get<PageResponse<Patient>>(`/patients?page=${page}&size=${size}&sortBy=${sortBy}`).then(r => r.data),
    getById: (id: string) => api.get<Patient>(`/patients/${id}`).then(r => r.data),
    create: (dto: any) => api.post<Patient>("/patients", dto).then(r => r.data),
    update: (id: string, dto: any) => api.put<Patient>(`/patients/${id}`, dto).then(r => r.data),
    delete: (id: string) => api.delete(`/patients/${id}`),
};

export const secretaireService = {
    /** Secrétaire connectée via JWT */
    getMe: () => api.get<Secretaire>("/secretaires/me").then(r => r.data),
    getAll: (page = 0, size = 10, sortBy = "nom") => api.get<PageResponse<Secretaire>>(`/secretaires?page=${page}&size=${size}&sortBy=${sortBy}`).then(r => r.data),
    getById: (id: string) => api.get<Secretaire>(`/secretaires/${id}`).then(r => r.data),
    create: (dto: any) => api.post<Secretaire>("/secretaires", dto).then(r => r.data),
    update: (id: string, dto: any) => api.put<Secretaire>(`/secretaires/${id}`, dto).then(r => r.data),
    delete: (id: string) => api.delete(`/secretaires/${id}`),
    creerPatient: (sid: string, dto: any) => api.post<Patient>(`/secretaires/${sid}/creer-patient`, dto).then(r => r.data),
    prendreRendezVous: (sid: string, dto: any) => api.post<RendezVous>(`/secretaires/${sid}/rendez-vous`, dto).then(r => r.data),
    confirmerRdv: (sid: string, rid: string) => api.patch<RendezVous>(`/secretaires/${sid}/rendez-vous/${rid}/confirmer`).then(r => r.data),
    annulerRdv: (sid: string, rid: string) => api.patch<RendezVous>(`/secretaires/${sid}/rendez-vous/${rid}/annuler`).then(r => r.data),
};

export const rendezVousService = {
    getById: (id: string) => api.get<RendezVous>(`/rendez-vous/${id}`).then(r => r.data),
    getByMedecin: (mid: string, page = 0, size = 10) => api.get<PageResponse<RendezVous>>(`/rendez-vous/medecin/${mid}?page=${page}&size=${size}`).then(r => r.data),
    getByPatient: (pid: string, page = 0, size = 10) => api.get<PageResponse<RendezVous>>(`/rendez-vous/patient/${pid}?page=${page}&size=${size}`).then(r => r.data),
    getAgendaMedecin: (mid: string, debut: string, fin: string) => api.get<RendezVous[]>(`/rendez-vous/medecin/${mid}/agenda?debut=${debut}&fin=${fin}`).then(r => r.data),
    getAujourdhui: (mid: string) => api.get<RendezVous[]>(`/rendez-vous/medecin/${mid}/aujourd-hui`).then(r => r.data),
    prendre: (dto: any) => api.post<RendezVous>("/rendez-vous", dto).then(r => r.data),
    confirmer: (id: string) => api.patch<RendezVous>(`/rendez-vous/${id}/confirmer`).then(r => r.data),
    annuler: (id: string) => api.patch<RendezVous>(`/rendez-vous/${id}/annuler`).then(r => r.data),
    terminer: (id: string, diagnostic: string) => api.patch<RendezVous>(`/rendez-vous/${id}/terminer`, { diagnostic }).then(r => r.data),
    delete: (id: string) => api.delete(`/rendez-vous/${id}`),
};

export const dossierService = {
    getById: (id: string) => api.get<DossierMedical>(`/dossiers-medicaux/${id}`).then(r => r.data),
    getByPatient: (pid: string) => api.get<DossierMedical>(`/dossiers-medicaux/patient/${pid}`).then(r => r.data),
    update: (id: string, dto: any) => api.put<DossierMedical>(`/dossiers-medicaux/${id}`, dto).then(r => r.data),
};

export const ordonnanceService = {
    getById: (id: string) => api.get<Ordonnance>(`/ordonnances/${id}`).then(r => r.data),
    getByDossier: (did: string, page = 0, size = 10) => api.get<PageResponse<Ordonnance>>(`/ordonnances/dossier/${did}?page=${page}&size=${size}`).then(r => r.data),
    getByRendezVous: (rid: string, page = 0, size = 10) => api.get<PageResponse<Ordonnance>>(`/ordonnances/rendez-vous/${rid}?page=${page}&size=${size}`).then(r => r.data),
    creer: (dto: { rendezVousId: string; medicaments: Record<string, string> }) => api.post<Ordonnance>("/ordonnances", dto).then(r => r.data),
    delete: (id: string) => api.delete(`/ordonnances/${id}`),
};

export const disponibiliteService = {
    getByMedecin: (medecinId: string) => api.get<Disponibilite[]>(`/disponibilites/medecin/${medecinId}`).then(r => r.data),
    getLibres: (medecinId: string) => api.get<Disponibilite[]>(`/disponibilites/medecin/${medecinId}/libres`).then(r => r.data),
    ajouter: (dto: { date: string; heureDebut: string; heureFin: string }) => api.post<Disponibilite>("/disponibilites", dto).then(r => r.data),
    supprimer: (id: string) => api.delete(`/disponibilites/${id}`),
};