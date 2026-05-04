import api from "./api";

export interface PageResponse<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number; }
export interface Hopital { id: string; nom: string; adresse?: string; email?: string; contact?: string; }
export interface Medecin { id: string; nom: string; prenom: string; email: string; telephone: string; specialite: string; disponible: boolean; hopital?: { id: string; nom: string }; }
export interface Patient { id: string; nom: string; prenom: string; email: string; telephone: string; adresse?: string; dateDeNaissance?: string; groupeSanguin?: string; nineaOuCin?: string; personneDeConfiance?: string; hopital?: { id: string; nom: string }; }
export interface RendezVous { id: string; date: string; heure: string; motif: string; statut: "EN_ATTENTE" | "CONFIRME" | "ANNULE" | "TERMINE"; diagnostic?: string; patient: Patient; medecin: Medecin; }
export interface DossierMedical { id: string; codeAccess?: string; allergies?: string; poids?: string; taille?: string; tension?: string; temperature?: string; antecedents?: string; terrain?: string; suiviPrenatal?: string; suiviInfantile?: string; preventionPaludisme?: string; analysesBiologiques?: string; imagerie?: string; rapportsSpecialistes?: string; patient: Patient; ordonnances?: Ordonnance[]; }
export interface Ordonnance { id: string; date: string; dateCreation?: string; medicaments: Record<string, string>; medecin?: { id: string; nom: string; prenom: string }; rendezVous?: RendezVous; dossierMedical?: { id: string }; }
export interface Secretaire { id: string; nom: string; prenom: string; email: string; telephone: string; hopital?: { id: string; nom: string }; }
export interface Disponibilite { id: string; date: string; heureDebut: string; heureFin: string; estReserve: boolean; nombreMaxPatients: number; placesRestantes: number; medecin?: { id: string; nom: string; prenom: string }; }

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

export const hopitalService = {
    getAll: (page = 0, size = 10, sortBy = "nom") => api.get<PageResponse<Hopital>>(`/hopitaux?page=${page}&size=${size}&sortBy=${sortBy}`).then(r => r.data),
    getById: (id: string) => api.get<Hopital>(`/hopitaux/${id}`).then(r => r.data),
    create: (dto: any) => api.post<Hopital>("/hopitaux", dto).then(r => r.data),
    update: (id: string, dto: any) => api.put<Hopital>(`/hopitaux/${id}`, dto).then(r => r.data),
    delete: (id: string) => api.delete(`/hopitaux/${id}`),
};

export const secretaireService = {
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
    getAll: (page = 0, size = 100, statut?: string) => api.get<PageResponse<RendezVous>>(`/rendez-vous?page=${page}&size=${size}${statut ? `&statut=${statut}` : ''}`).then(r => r.data),
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
    getById: (id: string, code?: string) => api.get<DossierMedical>(code ? `/dossiers-medicaux/${id}?code=${encodeURIComponent(code)}` : `/dossiers-medicaux/${id}`).then(r => r.data),
    getByPatient: (pid: string, code?: string) => api.get<DossierMedical>(code ? `/dossiers-medicaux/patient/${pid}?code=${encodeURIComponent(code)}` : `/dossiers-medicaux/patient/${pid}`).then(r => {
        // 204 No Content → pas de dossier
        if (r.status === 204 || !r.data) return null;
        return r.data;
    }),
    create: (pid: string) => api.post<DossierMedical>(`/dossiers-medicaux/patient/${pid}`).then(r => r.data),
    update: (id: string, dto: any) => api.put<DossierMedical>(`/dossiers-medicaux/${id}`, dto).then(r => r.data),
    patch: (id: string, dto: any) => api.patch<DossierMedical>(`/dossiers-medicaux/${id}`, dto).then(r => r.data),
};

export const ordonnanceService = {
    getById: (id: string) => api.get<Ordonnance>(`/ordonnances/${id}`).then(r => r.data),
    getByDossier: (did: string, page = 0, size = 10) => api.get<PageResponse<Ordonnance>>(`/ordonnances/dossier/${did}?page=${page}&size=${size}`).then(r => r.data),
    getByRendezVous: (rid: string, page = 0, size = 10) => api.get<PageResponse<Ordonnance>>(`/ordonnances/rendez-vous/${rid}?page=${page}&size=${size}`).then(r => r.data),
    getByMedecin: (mid: string, page = 0, size = 50) => api.get<PageResponse<Ordonnance>>(`/ordonnances/medecin/${mid}?page=${page}&size=${size}`).then(r => r.data),
    creer: (dto: { rendezVousId: string; medicaments: Record<string, string> }) => api.post<Ordonnance>("/ordonnances", dto).then(r => r.data),
    delete: (id: string) => api.delete(`/ordonnances/${id}`),
};

export const disponibiliteService = {
    getByMedecin: (medecinId: string) => api.get<Disponibilite[]>(`/disponibilites/medecin/${medecinId}`).then(r => r.data),
    getLibres: (medecinId: string) => api.get<Disponibilite[]>(`/disponibilites/medecin/${medecinId}/libres`).then(r => r.data),
    ajouter: (dto: { date: string; heureDebut: string; heureFin: string; nombreMaxPatients?: number }) => api.post<Disponibilite>("/disponibilites", dto).then(r => r.data),
    supprimer: (id: string) => api.delete(`/disponibilites/${id}`),
};