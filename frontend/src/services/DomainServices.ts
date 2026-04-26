import api from "./api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface Medecin {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    specialite: string;
    disponible: boolean;
    hopital?: { id: string; nom: string };
}

export interface Patient {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    adresse?: string;
    dateDeNaissance?: string;
    groupeSanguin?: string;
    hopital?: { id: string; nom: string };
}

export interface RendezVous {
    id: string;
    date: string;
    heure: string;
    motif: string;
    statut: "EN_ATTENTE" | "CONFIRME" | "ANNULE" | "TERMINE";
    diagnostic?: string;
    patient: Patient;
    medecin: Medecin;
}

export interface DossierMedical {
    id: string;
    allergies?: string;
    poids?: string;
    taille?: string;
    patient: Patient;
    ordonnances?: Ordonnance[];
}

export interface Ordonnance {
    id: string;
    dateCreation: string;
    medicaments: Record<string, string>;
    medecin: Medecin;
    rendezVous?: RendezVous;
}

export interface Secretaire {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    hopital?: { id: string; nom: string };
}

// ─── Médecin Service ──────────────────────────────────────────────────────────

export const medecinService = {
    getAll: (page = 0, size = 10, sortBy = "nom") =>
        api.get<PageResponse<Medecin>>(`/medecins?page=${page}&size=${size}&sortBy=${sortBy}`).then(r => r.data),

    getById: (id: string) =>
        api.get<Medecin>(`/medecins/${id}`).then(r => r.data),

    getDisponibles: () =>
        api.get<Medecin[]>("/medecins/disponibles").then(r => r.data),

    getBySpecialite: (specialite: string, page = 0, size = 10) =>
        api.get<PageResponse<Medecin>>(`/medecins/specialite/${specialite}?page=${page}&size=${size}`).then(r => r.data),

    create: (dto: Partial<Medecin> & { motDePasse?: string; hopitalId?: string }) =>
        api.post<Medecin>("/medecins", dto).then(r => r.data),

    update: (id: string, dto: Partial<Medecin> & { motDePasse?: string; hopitalId?: string }) =>
        api.put<Medecin>(`/medecins/${id}`, dto).then(r => r.data),

    toggleDisponibilite: (id: string) =>
        api.patch<Medecin>(`/medecins/${id}/disponibilite`).then(r => r.data),

    delete: (id: string) =>
        api.delete(`/medecins/${id}`),
};

// ─── Patient Service ──────────────────────────────────────────────────────────

export const patientService = {
    getAll: (page = 0, size = 10, sortBy = "nom") =>
        api.get<PageResponse<Patient>>(`/patients?page=${page}&size=${size}&sortBy=${sortBy}`).then(r => r.data),

    getById: (id: string) =>
        api.get<Patient>(`/patients/${id}`).then(r => r.data),

    create: (dto: Partial<Patient> & { motDePasse?: string; hopitalId?: string }) =>
        api.post<Patient>("/patients", dto).then(r => r.data),

    update: (id: string, dto: Partial<Patient> & { hopitalId?: string }) =>
        api.put<Patient>(`/patients/${id}`, dto).then(r => r.data),

    delete: (id: string) =>
        api.delete(`/patients/${id}`),
};

// ─── Secrétaire Service ───────────────────────────────────────────────────────

export const secretaireService = {
    getAll: (page = 0, size = 10, sortBy = "nom") =>
        api.get<PageResponse<Secretaire>>(`/secretaires?page=${page}&size=${size}&sortBy=${sortBy}`).then(r => r.data),

    getById: (id: string) =>
        api.get<Secretaire>(`/secretaires/${id}`).then(r => r.data),

    create: (dto: Partial<Secretaire> & { motDePasse?: string; hopitalId?: string }) =>
        api.post<Secretaire>("/secretaires", dto).then(r => r.data),

    update: (id: string, dto: Partial<Secretaire> & { hopitalId?: string }) =>
        api.put<Secretaire>(`/secretaires/${id}`, dto).then(r => r.data),

    delete: (id: string) =>
        api.delete(`/secretaires/${id}`),

    creerPatient: (secretaireId: string, dto: Partial<Patient> & { motDePasse?: string; hopitalId?: string }) =>
        api.post<Patient>(`/secretaires/${secretaireId}/creer-patient`, dto).then(r => r.data),

    prendreRendezVous: (secretaireId: string, dto: any) =>
        api.post<RendezVous>(`/secretaires/${secretaireId}/rendez-vous`, dto).then(r => r.data),

    confirmerRdv: (secretaireId: string, rdvId: string) =>
        api.patch<RendezVous>(`/secretaires/${secretaireId}/rendez-vous/${rdvId}/confirmer`).then(r => r.data),

    annulerRdv: (secretaireId: string, rdvId: string) =>
        api.patch<RendezVous>(`/secretaires/${secretaireId}/rendez-vous/${rdvId}/annuler`).then(r => r.data),
};

// ─── RendezVous Service ───────────────────────────────────────────────────────

export const rendezVousService = {
    getById: (id: string) =>
        api.get<RendezVous>(`/rendez-vous/${id}`).then(r => r.data),

    getByMedecin: (medecinId: string, page = 0, size = 10) =>
        api.get<PageResponse<RendezVous>>(`/rendez-vous/medecin/${medecinId}?page=${page}&size=${size}`).then(r => r.data),

    getByPatient: (patientId: string, page = 0, size = 10) =>
        api.get<PageResponse<RendezVous>>(`/rendez-vous/patient/${patientId}?page=${page}&size=${size}`).then(r => r.data),

    getAgendaMedecin: (medecinId: string, debut: string, fin: string) =>
        api.get<RendezVous[]>(`/rendez-vous/medecin/${medecinId}/agenda?debut=${debut}&fin=${fin}`).then(r => r.data),

    getAujourdhui: (medecinId: string) =>
        api.get<RendezVous[]>(`/rendez-vous/medecin/${medecinId}/aujourd-hui`).then(r => r.data),

    prendre: (dto: { patientId: string; medecinId: string; date: string; heure: string; motif: string }) =>
        api.post<RendezVous>("/rendez-vous", dto).then(r => r.data),

    confirmer: (id: string) =>
        api.patch<RendezVous>(`/rendez-vous/${id}/confirmer`).then(r => r.data),

    annuler: (id: string) =>
        api.patch<RendezVous>(`/rendez-vous/${id}/annuler`).then(r => r.data),

    terminer: (id: string, diagnostic: string) =>
        api.patch<RendezVous>(`/rendez-vous/${id}/terminer`, { diagnostic }).then(r => r.data),

    delete: (id: string) =>
        api.delete(`/rendez-vous/${id}`),
};

// ─── Dossier Médical Service ──────────────────────────────────────────────────

export const dossierService = {
    getById: (id: string) =>
        api.get<DossierMedical>(`/dossiers-medicaux/${id}`).then(r => r.data),

    getByPatient: (patientId: string) =>
        api.get<DossierMedical>(`/dossiers-medicaux/patient/${patientId}`).then(r => r.data),

    update: (id: string, dto: { allergies?: string; poids?: string; taille?: string }) =>
        api.put<DossierMedical>(`/dossiers-medicaux/${id}`, dto).then(r => r.data),
};

// ─── Ordonnance Service ───────────────────────────────────────────────────────

export const ordonnanceService = {
    getById: (id: string) =>
        api.get<Ordonnance>(`/ordonnances/${id}`).then(r => r.data),

    getByDossier: (dossierId: string, page = 0, size = 10) =>
        api.get<PageResponse<Ordonnance>>(`/ordonnances/dossier/${dossierId}?page=${page}&size=${size}`).then(r => r.data),

    getByRendezVous: (rdvId: string, page = 0, size = 10) =>
        api.get<PageResponse<Ordonnance>>(`/ordonnances/rendez-vous/${rdvId}?page=${page}&size=${size}`).then(r => r.data),

    creer: (dto: { rendezVousId: string; medicaments: Record<string, string> }) =>
        api.post<Ordonnance>("/ordonnances", dto).then(r => r.data),

    delete: (id: string) =>
        api.delete(`/ordonnances/${id}`),
};

export class type {
}