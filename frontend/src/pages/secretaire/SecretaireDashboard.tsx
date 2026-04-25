import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout.tsx";
import StatCard from "../../components/common/Statcard.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import {
    secretaireService, patientService, medecinService,
    type Secretaire, type Patient, type Medecin
} from "../../services/DomainServices.ts";

const NAV = [
    { icon: "bi-speedometer2",      label: "Tableau de bord",  path: "/dashboard/secretaire" },
    { icon: "bi-people",            label: "Patients",          path: "/dashboard/secretaire/patients" },
    { icon: "bi-calendar-check",    label: "Rendez-vous",       path: "/dashboard/secretaire/rendez-vous" },
    { icon: "bi-person-gear",       label: "Mon profil",        path: "/dashboard/secretaire/profil" },
];

// ── Composant Modal générique ────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 520, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#6B7280" }}>✕</button>
                </div>
                {children}
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
            {children}
        </div>
    );
}

const inputStyle = { width: "100%", borderRadius: 8, border: "1px solid #E5E7EB", padding: "8px 12px", fontSize: 14, boxSizing: "border-box" }  as const;

export default function SecretaireDashboard() {
    const { user } = useAuth();
    const [secretaire, setSecretaire] = useState<Secretaire | null>(null);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [medecins, setMedecins] = useState<Medecin[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
// Modal créer patient
    const [patientModal, setPatientModal] = useState(false);
    const [patientForm, setPatientForm] = useState({ nom: "", prenom: "", email: "", telephone: "", motDePasse: "", adresse: "", dateDeNaissance: "", groupeSanguin: "" });
    const [patientLoading, setPatientLoading] = useState(false);
    const [patientSuccess, setPatientSuccess] = useState(false);
    const [patientError, setPatientError] = useState("");

    // Modal RDV
    const [rdvModal, setRdvModal] = useState(false);
    const [rdvForm, setRdvForm] = useState({ patientId: "", medecinId: "", date: "", heure: "", motif: "" });
    const [rdvLoading, setRdvLoading] = useState(false);
    const [rdvSuccess, setRdvSuccess] = useState(false);
    const [rdvError, setRdvError] = useState("");

    // Pagination patients
    const [patPage, setPatPage] = useState(0);
    const [patTotal, setPatTotal] = useState(0);

    const loadData = useCallback(async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            const [secPage, medData] = await Promise.all([
                secretaireService.getAll(0, 100),
                medecinService.getAll(0, 100),
            ]);
            const sec = secPage.content.find(s => s.email === user.email);
            setSecretaire(sec || null);
            setMedecins(medData.content);
            await loadPatients(0);
        } finally { setLoading(false); }
    }, [user]);

    const loadPatients = async (page: number) => {
        const data = await patientService.getAll(page, 8);
        setPatients(data.content);
        setPatTotal(data.totalPages);
        setPatPage(page);
    };

    useEffect(() => { loadData(); }, [loadData]);

    const handleCreatePatient = async () => {
        if (!secretaire) return;
        setPatientLoading(true);
        setPatientError("");
        try {
            await secretaireService.creerPatient(secretaire.id, {
                ...patientForm,
                hopitalId: secretaire.hopital?.id,
            });
            setPatientSuccess(true);
            await loadPatients(0);
            setTimeout(() => { setPatientModal(false); setPatientSuccess(false); setPatientForm({ nom: "", prenom: "", email: "", telephone: "", motDePasse: "", adresse: "", dateDeNaissance: "", groupeSanguin: "" }); }, 1500);
        } catch (e: any) {
            setPatientError(e?.response?.data?.message || "Erreur lors de la création");
        } finally { setPatientLoading(false); }
    };

    const handleCreateRdv = async () => {
        if (!secretaire) return;
        setRdvLoading(true);
        setRdvError("");
        try {
            await secretaireService.prendreRendezVous(secretaire.id, rdvForm);
            setRdvSuccess(true);
            setTimeout(() => { setRdvModal(false); setRdvSuccess(false); setRdvForm({ patientId: "", medecinId: "", date: "", heure: "", motif: "" }); }, 1500);
        } catch (e: any) {
            setRdvError(e?.response?.data?.message || "Erreur lors de la prise de RDV");
        } finally { setRdvLoading(false); }
    };
    const filteredPatients = patients.filter(p =>
        `${p.nom} ${p.prenom} ${p.email}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout navItems={NAV} title="Tableau de bord" accentColor="#7C3AED">
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                    <div className="spinner-border" style={{ color: "#7C3AED" }}></div>
                </div>
            ) : (
                <>
                    {/* Welcome */}
                    <div style={{ background: "linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)", borderRadius: 20, padding: "24px 32px", color: "#fff", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>Bonjour 👋</div>
                            <div style={{ fontSize: 22, fontWeight: 700 }}>{secretaire?.prenom} {secretaire?.nom}</div>
                            <div style={{ opacity: 0.8, fontSize: 14, marginTop: 4 }}>Secrétaire médicale · {secretaire?.hopital?.nom}</div>
                        </div>
                        <div style={{ display: "flex", gap: 12 }}>
                            <button onClick={() => setPatientModal(true)} style={{ background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.5)", color: "#fff", borderRadius: 12, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                                <i className="bi bi-person-plus me-2"></i>Nouveau patient
                            </button>
                            <button onClick={() => setRdvModal(true)} style={{ background: "#fff", border: "none", color: "#7C3AED", borderRadius: 12, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                                <i className="bi bi-calendar-plus me-2"></i>Nouveau RDV
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 16, marginBottom: 24 }}>
                        <StatCard icon="bi-people-fill" label="Total patients" value={patients.length} color="#7C3AED" bg="#EDE9FE" />
                        <StatCard icon="bi-calendar-check" label="Médecins dispo" value={medecins.filter(m => m.disponible).length} color="#1A7A52" bg="#E8F5EE" />
                        <StatCard icon="bi-hospital" label="Hôpital" value={secretaire?.hopital?.nom || "—"} color="#0EA5E9" bg="#E0F2FE" />
                    </div>

                    {/* Liste patients */}
                    <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #F0F2F7", marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                                <i className="bi bi-people me-2" style={{ color: "#7C3AED" }}></i>Patients
                            </h2>
                            <div style={{ position: "relative" }}>
                                <i className="bi bi-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", fontSize: 14 }}></i>
                                <input
                                    placeholder="Rechercher..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    style={{ paddingLeft: 32, borderRadius: 10, border: "1px solid #E5E7EB", padding: "7px 12px 7px 32px", fontSize: 13 }}
                                />
                            </div>
                        </div>

                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                <tr style={{ borderBottom: "2px solid #F0F2F7" }}>
                                    {["Patient", "Email", "Téléphone", "Groupe sanguin", "Actions"].map(h => (
                                        <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 12, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {filteredPatients.map(p => (
                                    <tr key={p.id} style={{ borderBottom: "1px solid #F0F2F7" }}
                                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "#FAFAFA"}
                                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                                    >
                                        <td style={{ padding: "12px 16px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", color: "#7C3AED", fontWeight: 700, fontSize: 13 }}>
                                                    {p.prenom?.[0]}{p.nom?.[0]}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.prenom} {p.nom}</div>
                                                    {p.dateDeNaissance && <div style={{ fontSize: 11, color: "#8A94A6" }}>{new Date(p.dateDeNaissance).toLocaleDateString("fr-FR")}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{p.email}</td>
                                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{p.telephone}</td>
                                        <td style={{ padding: "12px 16px" }}>
                                            {p.groupeSanguin ? (
                                                <span style={{ background: "#FEE2E2", color: "#991B1B", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{p.groupeSanguin}</span>
                                            ) : <span style={{ color: "#9CA3AF" }}>—</span>}
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <button
                                                onClick={() => { setRdvForm(f => ({ ...f, patientId: p.id })); setRdvModal(true); }}
                                                style={{ background: "#EDE9FE", color: "#7C3AED", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                                            >
                                                <i className="bi bi-calendar-plus me-1"></i>RDV
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {patTotal > 1 && (
                            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
                                {Array.from({ length: patTotal }, (_, i) => (
                                    <button key={i} onClick={() => loadPatients(i)} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: patPage === i ? "#7C3AED" : "#F3F4F6", color: patPage === i ? "#fff" : "#374151", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Modal Nouveau Patient */}
            {patientModal && (
                <Modal title="Créer un patient" onClose={() => setPatientModal(false)}>
                    {patientSuccess ? (
                        <div style={{ textAlign: "center", padding: "32px 0" }}>
                            <div style={{ fontSize: 48 }}>✅</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#1A7A52", marginTop: 12 }}>Patient créé !</div>
                        </div>
                    ) : (
                        <>
                            {patientError && <div className="alert alert-danger py-2 small mb-3">{patientError}</div>}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                                <Field label="Nom"><input value={patientForm.nom} onChange={e => setPatientForm(f => ({ ...f, nom: e.target.value }))} style={inputStyle} /></Field>
                                <Field label="Prénom"><input value={patientForm.prenom} onChange={e => setPatientForm(f => ({ ...f, prenom: e.target.value }))} style={inputStyle} /></Field>
                                <Field label="Email"><input type="email" value={patientForm.email} onChange={e => setPatientForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} /></Field>
                                <Field label="Téléphone"><input value={patientForm.telephone} onChange={e => setPatientForm(f => ({ ...f, telephone: e.target.value }))} style={inputStyle} /></Field>
                                <Field label="Mot de passe"><input type="password" value={patientForm.motDePasse} onChange={e => setPatientForm(f => ({ ...f, motDePasse: e.target.value }))} style={inputStyle} /></Field>
                                <Field label="Groupe sanguin">
                                    <select value={patientForm.groupeSanguin} onChange={e => setPatientForm(f => ({ ...f, groupeSanguin: e.target.value }))} style={inputStyle}>
                                        <option value="">Sélectionner</option>
                                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <option key={g}>{g}</option>)}
                                    </select>
                                </Field>
                                <Field label="Date de naissance"><input type="date" value={patientForm.dateDeNaissance} onChange={e => setPatientForm(f => ({ ...f, dateDeNaissance: e.target.value }))} style={inputStyle} /></Field>
                                <Field label="Adresse"><input value={patientForm.adresse} onChange={e => setPatientForm(f => ({ ...f, adresse: e.target.value }))} style={inputStyle} /></Field>
                            </div>
                            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                                <button onClick={() => setPatientModal(false)} style={{ background: "#F3F4F6", border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer" }}>Annuler</button>
                                <button onClick={handleCreatePatient} disabled={patientLoading || !patientForm.nom || !patientForm.email} style={{ background: "linear-gradient(135deg,#5B21B6,#7C3AED)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontWeight: 600 }}>
                                    {patientLoading ? <span className="spinner-border spinner-border-sm"></span> : "Créer"}
                                </button>
                            </div>
                        </>
                    )}
                </Modal>
            )}

            {/* Modal Nouveau RDV */}
            {rdvModal && (
                <Modal title="Prendre un rendez-vous" onClose={() => setRdvModal(false)}>
                    {rdvSuccess ? (
                        <div style={{ textAlign: "center", padding: "32px 0" }}>
                            <div style={{ fontSize: 48 }}>✅</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#1A7A52", marginTop: 12 }}>RDV créé !</div>
                        </div>
                    ) : (
                        <>
                            {rdvError && <div className="alert alert-danger py-2 small mb-3">{rdvError}</div>}
                            <Field label="Patient">
                                <select value={rdvForm.patientId} onChange={e => setRdvForm(f => ({ ...f, patientId: e.target.value }))} style={inputStyle}>
                                    <option value="">Sélectionner un patient</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
                                </select>
                            </Field>
                            <Field label="Médecin">
                                <select value={rdvForm.medecinId} onChange={e => setRdvForm(f => ({ ...f, medecinId: e.target.value }))} style={inputStyle}>
                                    <option value="">Sélectionner un médecin</option>
                                    {medecins.filter(m => m.disponible).map(m => <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom} — {m.specialite}</option>)}
                                </select>
                            </Field>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                                <Field label="Date"><input type="date" value={rdvForm.date} onChange={e => setRdvForm(f => ({ ...f, date: e.target.value }))} min={new Date().toISOString().slice(0, 10)} style={inputStyle} /></Field>
                                <Field label="Heure"><input type="time" value={rdvForm.heure} onChange={e => setRdvForm(f => ({ ...f, heure: e.target.value }))} style={inputStyle} /></Field>
                            </div>
                            <Field label="Motif">
                                <textarea value={rdvForm.motif} onChange={e => setRdvForm(f => ({ ...f, motif: e.target.value }))} rows={3} placeholder="Motif de la consultation..." style={{ ...inputStyle, resize: "vertical" }} />
                            </Field>
                            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                                <button onClick={() => setRdvModal(false)} style={{ background: "#F3F4F6", border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer" }}>Annuler</button>
                                <button onClick={handleCreateRdv} disabled={rdvLoading || !rdvForm.patientId || !rdvForm.medecinId || !rdvForm.date || !rdvForm.heure} style={{ background: "linear-gradient(135deg,#5B21B6,#7C3AED)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontWeight: 600 }}>
                                    {rdvLoading ? <span className="spinner-border spinner-border-sm"></span> : "Créer"}
                                </button>
                            </div>
                        </>
                    )}
                </Modal>
            )}
        </DashboardLayout>
    );
}