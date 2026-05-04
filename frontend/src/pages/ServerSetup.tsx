import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getServerBaseUrl, setServerBaseUrl, normalizeBaseUrl } from "../services/serverConfig";

export default function ServerSetup() {
    const navigate = useNavigate();
    const [value, setValue] = useState(() => getServerBaseUrl());
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const normalized = useMemo(() => normalizeBaseUrl(value), [value]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            setServerBaseUrl(value);
            navigate("/login", { replace: true });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Adresse serveur invalide");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center px-4">
            <div className="w-100" style={{ maxWidth: 460 }}>
                <div className="text-center mb-4">
                    <img src="/logo.png" alt="Meditrack" style={{ width: 220, maxWidth: "70%" }} />
                    <div className="mt-3 fw-semibold" style={{ fontSize: 18 }}>
                        Adresse du serveur
                    </div>
                    <div className="text-muted small mt-1">
                        Ex. <code>192.168.1.10:8080</code> (IP de votre PC + port du backend)
                    </div>
                </div>

                {error && (
                    <div className="alert alert-danger py-2 small" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit} className="bg-white rounded-4 border p-4 shadow-sm">
                    <label className="form-label small fw-semibold">Host et port</label>
                    <input
                        className="form-control"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="192.168.1.10:8080"
                        inputMode="url"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                    />
                    <div className="text-muted small mt-2">
                        URL utilisée : <code>{normalized || "—"}</code>
                    </div>

                    <button
                        type="submit"
                        disabled={saving || !normalized}
                        className="btn w-100 text-white mt-3 d-flex align-items-center justify-content-center gap-2"
                        style={{ background: "linear-gradient(135deg,#1A7A52,#27A869)" }}
                    >
                        {saving && <span className="spinner-border spinner-border-sm"></span>}
                        {saving ? "Enregistrement…" : "Continuer"}
                    </button>
                </form>
            </div>
        </div>
    );
}
