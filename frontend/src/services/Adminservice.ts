import api from "./api";
import type {PageResponse} from "./DomainServices";

export interface Hopital {
    id: string;
    nom: string;
    adresse?: string;
    telephone?: string;
    email?: string;
}

export interface Utilisateur {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    role?: string;
    actif?: boolean;
    archive?: boolean;
    hopital?: { id: string; nom: string };
}

export const hopitalService = {
    getAll: (page = 0, size = 10, sortBy = "nom") =>
        api.get<PageResponse<Hopital>>(`/hopital?page=${page}&size=${size}&sortBy=${sortBy}`).then(r => r.data),
    create: (dto: Partial<Hopital>) =>
        api.post<Hopital>("/hopital", dto).then(r => r.data),
    update: (id: string, dto: Partial<Hopital>) =>
        api.put<Hopital>(`/hopital/${id}`, dto).then(r => r.data),
    delete: (id: string) =>
        api.delete(`/hopital/${id}`),
};

export const utilisateurService = {
    getAll: (page = 0, size = 10, sortBy = "nom") =>
        api.get<PageResponse<Utilisateur>>(`/utilisateurs?page=${page}&size=${size}&sortBy=${sortBy}`).then(r => r.data),
    create: (dto: Partial<Utilisateur>) =>
        api.post<Utilisateur>("/utilisateurs", dto).then(r => r.data),
    update: (id: string, dto: Partial<Utilisateur>) =>
        api.put<Utilisateur>(`/utilisateurs/${id}`, dto).then(r => r.data),
    delete: (id: string) =>
        api.delete(`/utilisateurs/${id}`),
    activer: (id: string) =>
        api.patch<Utilisateur>(`/utilisateurs/activer/${id}`).then(r => r.data),
    desactiver: (id: string) =>
        api.patch<Utilisateur>(`/utilisateurs/desactiver/${id}`).then(r => r.data),
    archiver: (id: string) =>
        api.patch<Utilisateur>(`/utilisateurs/archiver/${id}`).then(r => r.data),
    desarchiver: (id: string) =>
        api.patch<Utilisateur>(`/utilisateurs/desarchiver/${id}`).then(r => r.data),
};