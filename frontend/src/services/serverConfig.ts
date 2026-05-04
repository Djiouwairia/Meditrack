const STORAGE_KEY = "meditrack.serverBaseUrl";

export function normalizeBaseUrl(raw: string): string {
    const v = raw.trim();
    if (!v) return "";
    const withProto = /^https?:\/\//i.test(v) ? v : `http://${v}`;
    return withProto.replace(/\/+$/, "");
}

export function getServerBaseUrl(): string {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    // Fallback : variable d'env Vite (définie au build) ou localhost
    return import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ?? "http://localhost:8080";
}

export function setServerBaseUrl(value: string): void {
    const normalized = normalizeBaseUrl(value);
    if (!normalized) throw new Error("Adresse serveur invalide");
    localStorage.setItem(STORAGE_KEY, normalized);
}

export function clearServerBaseUrl(): void {
    localStorage.removeItem(STORAGE_KEY);
}

export function hasCustomServerUrl(): boolean {
    return !!localStorage.getItem(STORAGE_KEY);
}