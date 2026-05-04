import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/common/Statcard";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from "../../context/AuthContext";
// @ts-ignore
// @ts-ignore
import {
    patientService, rendezVousService, dossierService,
    type Patient, type RendezVous, type DossierMedical} from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2", label: "Tableau de bord", path: "/dashboard/patient" },
    { icon: "bi-calendar-check", label: "Mes rendez-vous", path: "/dashboard/patient/rendez-vous" },
    { icon: "bi-folder2-open", label: "Mon dossier", path: "/dashboard/patient/dossier" },
    { icon: "bi-file-earmark-medical", label: "Ordonnances", path: "/dashboard/patient/ordonnances" },
    { icon: "bi-person-gear", label: "Mon profil", path: "/dashboard/patient/profil" },
];

export default function PatientDashboard() {
    const { user } = useAuth();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [rdvs, setRdvs] = useState<RendezVous[]>([]);
    const [dossier, setDossier] = useState<DossierMedical | null>(null);
    const [loading, setLoading] = useState(true);

    const [pendingRdv, setPendingRdv] = useState<any>(null);
    const [paymentModal, setPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("WAVE");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState("");

    useEffect(() => {
        const stored = sessionStorage.getItem("pendingRdv");
        if (stored) {
            setPendingRdv(JSON.parse(stored));
        }
    }, []);

    const navigate = useNavigate();

    const loadData = useCallback(async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            const pat = await patientService.getMe();
            if (pat) {
                setPatient(pat);
                const [rdvPage, dos] = await Promise.all([
                    rendezVousService.getByPatient(pat.id, 0, 20),
                    dossierService.getByPatient(pat.id).catch(() => null),
                ]);
                setRdvs(rdvPage.content);
                setDossier(dos);
            }
        } catch (e) { console.error("Erreur lors du chargement des données", e); }
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => { loadData(); }, [loadData]);

    const openRdvModal = () => {
        navigate("/dashboard/patient/rendez-vous");
    };

    const prochains = rdvs.filter(r => r.statut !== "ANNULE" && r.statut !== "TERMINE").slice(0, 3);
    const stats = {
        total: rdvs.length,
        confirmes: rdvs.filter(r => r.statut === "CONFIRME").length,
        enAttente: rdvs.filter(r => r.statut === "EN_ATTENTE").length,
        termines: rdvs.filter(r => r.statut === "TERMINE").length,
    };

    const handlePaymentAndConfirm = async () => {
        if (!phoneNumber || phoneNumber.length < 9) {
            setPaymentError("Veuillez renseigner un numéro valide à 9 chiffres.");
            return;
        }
        if (!patient || !pendingRdv) {
            setPaymentError("Erreur : Impossible d'identifier le patient ou le rendez-vous.");
            return;
        }
        
        setPaymentError("");
        setPaymentLoading(true);
        setTimeout(async () => {
            try {
                // Ensure heure format is HH:MM:00 or backend might fail if it strictly expects seconds
                const heureStr = pendingRdv.heure.length === 5 ? pendingRdv.heure + ":00" : pendingRdv.heure;
                
                await rendezVousService.prendre({ 
                    patientId: patient.id, 
                    medecinId: pendingRdv.medecinId,
                    date: pendingRdv.date, 
                    heure: heureStr, 
                    motif: pendingRdv.motif,
                    statutPaiement: "PAYE"
                });
                await loadData();
                sessionStorage.removeItem("pendingRdv");
                setPaymentSuccess(true);
                setTimeout(() => {
                    setPaymentModal(false);
                    setPendingRdv(null);
                    setPaymentSuccess(false);
                }, 3000);
            } catch (e: any) {
                console.error("Erreur paiement", e);
                setPaymentError(e?.response?.data?.message || "Une erreur est survenue lors de la création du rendez-vous.");
            } finally {
                setPaymentLoading(false);
            }
        }, 2000);
    };

    return (
        <DashboardLayout navItems={NAV} title="Tableau de bord" >
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                    <div className="spinner-border" style={{ color: "#27A869" }}></div>
                </div>
            ) : (
                <>
                    {/* Welcome Section */}
                    <div style={{ background: "linear-gradient(135deg, #1A7A52, #27A869)", borderRadius: 24, padding: "32px", color: "#fff", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 10px 30px rgba(39, 168, 105, 0.2)" }}>
                        <div>
                            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Espace Patient</div>
                            <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Bonjour, {patient?.prenom} 👋</div>
                            <div style={{ opacity: 0.85, fontSize: 15, display: "flex", gap: 12, alignItems: "center" }}>
                                <span><i className="bi bi-hospital me-2"></i>{patient?.hopital?.nom || "Centre principal"}</span>
                                {patient?.groupeSanguin && <span>• Groupe {patient.groupeSanguin}</span>}
                            </div>
                        </div>
                        <button
                            onClick={openRdvModal}
                            style={{ background: "#fff", color: "#1A7A52", border: "none", borderRadius: 14, padding: "14px 28px", fontWeight: 800, cursor: "pointer", fontSize: 15, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "transform 0.2s" }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "none"}
                        >
                            <i className="bi bi-calendar-plus-fill me-2"></i>Prendre RDV
                        </button>
                    </div>

                    {/* Pending RDV Banner (Reorganized to be more integrated) */}
                    {pendingRdv && !paymentSuccess && (
                        <div style={{ background: "#fff", border: "2px solid #F59E0B", borderRadius: 24, padding: "24px 32px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, boxShadow: "0 8px 24px rgba(245, 158, 11, 0.12)", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 6, background: "#F59E0B" }}></div>
                            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FEF3C7", color: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
                                    <i className="bi bi-bell-fill"></i>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 18, color: "#92400E", margin: "0 0 6px", fontWeight: 800 }}>Rendez-vous en attente de paiement</h3>
                                    <p style={{ margin: 0, color: "#64748B", fontSize: 15, lineHeight: 1.5 }}>
                                        Vous avez réservé un créneau avec <strong style={{ color: "#0F172A" }}>Dr. {pendingRdv.medecinPrenom} {pendingRdv.medecinNom}</strong> le <strong style={{ color: "#0EA5E9" }}>{pendingRdv.dateDisplay}</strong> à <strong style={{ color: "#0EA5E9" }}>{pendingRdv.heure}</strong>.
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
                                <button onClick={() => { sessionStorage.removeItem("pendingRdv"); setPendingRdv(null); }} style={{ background: "#F1F5F9", color: "#64748B", border: "none", borderRadius: 14, padding: "12px 20px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                                    Annuler
                                </button>
                                <button onClick={() => setPaymentModal(true)} style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#fff", border: "none", borderRadius: 14, padding: "12px 24px", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 16px rgba(245, 158, 11, 0.3)", transition: "all 0.2s" }}>
                                    Payer 5 000 FCFA <i className="bi bi-arrow-right ms-2"></i>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 16, marginBottom: 24 }}>
                        <StatCard icon="bi-calendar-check" label="Total RDV" value={stats.total} color="#27A869" bg="#E0F2FE" />
                        <StatCard icon="bi-check-circle" label="Confirmés" value={stats.confirmes} color="#1A7A52" bg="#E8F5EE" />
                        <StatCard icon="bi-hourglass" label="En attente" value={stats.enAttente} color="#F59E0B" bg="#FEF3C7" />
                        <StatCard icon="bi-check2-all" label="Terminés" value={stats.termines} color="#8B5CF6" bg="#EDE9FE" />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
                        {/* Prochains RDV */}
                        <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #F0F2F7" }}>
                            <h2 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700, color: "#0D1F2D" }}>
                                <i className="bi bi-clock-history me-2" style={{ color: "#27A869" }}></i>Prochains rendez-vous
                            </h2>
                            {prochains.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "40px 0", color: "#8A94A6" }}>
                                    <i className="bi bi-calendar-x" style={{ fontSize: 36 }}></i>
                                    <div style={{ marginTop: 10 }}>Aucun rendez-vous à venir</div>
                                    <button onClick={openRdvModal} style={{ marginTop: 16, background: "#27A869", color: "#fff", border: "none", borderRadius: 10, padding: "8px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                                        Prendre un RDV
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {prochains.map(rdv => (
                                        <div key={rdv.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderRadius: 12, background: "#F8FAFC", border: "1px solid #EEF1F6" }}>
                                            <div style={{ textAlign: "center", minWidth: 60, background: "#E0F2FE", borderRadius: 10, padding: "8px 4px" }}>
                                                <div style={{ fontSize: 18, fontWeight: 700, color: "#27A869" }}>{rdv.date?.slice(8, 10)}</div>
                                                <div style={{ fontSize: 11, color: "#0369A1", textTransform: "uppercase" }}>
                                                    {new Date(rdv.date + "T00:00:00").toLocaleDateString("fr-FR", { month: "short" })}
                                                </div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>Dr. {rdv.medecin?.prenom} {rdv.medecin?.nom}</div>
                                                <div style={{ fontSize: 12, color: "#8A94A6" }}>{rdv.medecin?.specialite} · {rdv.heure?.slice(0, 5)}</div>
                                                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{rdv.motif}</div>
                                            </div>
                                            <StatusBadge status={rdv.statut} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Dossier médical */}
                        <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #F0F2F7" }}>
                            <h2 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700, color: "#0D1F2D" }}>
                                <i className="bi bi-folder2-open me-2" style={{ color: "#27A869" }}></i>Dossier médical
                            </h2>
                            {dossier ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                    {[
                                        { icon: "bi-droplet-fill", label: "Groupe sanguin", value: patient?.groupeSanguin || "—", color: "#EF4444", bg: "#FEE2E2" },
                                        { icon: "bi-exclamation-triangle-fill", label: "Allergies", value: dossier.allergies || "Aucune", color: "#F59E0B", bg: "#FEF3C7" },
                                        { icon: "bi-activity", label: "Poids", value: dossier.poids ? `${dossier.poids} kg` : "—", color: "#1A7A52", bg: "#E8F5EE" },
                                        { icon: "bi-arrows-vertical", label: "Taille", value: dossier.taille ? `${dossier.taille} cm` : "—", color: "#27A869", bg: "#E0F2FE" },
                                    ].map(item => (
                                        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: "#F8FAFC" }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <i className={`bi ${item.icon}`} style={{ color: item.color, fontSize: 16 }}></i>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 11, color: "#8A94A6", fontWeight: 500 }}>{item.label}</div>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: "#0D1F2D" }}>{item.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", color: "#8A94A6", padding: "32px 0" }}>
                                    <i className="bi bi-folder2" style={{ fontSize: 36 }}></i>
                                    <div style={{ marginTop: 8, fontSize: 14 }}>Dossier non disponible</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal Paiement */}
                    {paymentModal && (
                        <div style={{ position:"fixed", inset:0, background:"rgba(15, 23, 42, 0.6)", backdropFilter:"blur(4px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding: 20 }}>
                            <div style={{ background:"#fff", borderRadius:24, padding:40, width:450, maxWidth:"100%", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", position: "relative", overflow: "hidden", animation: "scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}>
                                
                                {paymentSuccess ? (
                                    <div style={{ textAlign:"center", padding:"10px 0" }}>
                                        <div style={{ width: 80, height: 80, background: "#10B981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "#fff", fontSize: 40, boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4)" }}>
                                            <i className="bi bi-check-lg"></i>
                                        </div>
                                        <h3 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>Paiement Réussi !</h3>
                                        <p style={{ color: "#64748B", fontSize: 15, marginBottom: 0, lineHeight: 1.6 }}>
                                            Votre rendez-vous a été confirmé.<br/>Vous le retrouverez dans votre liste.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                                            <h3 style={{ margin:0, fontSize:20, fontWeight:800, color: "#0F172A" }}>Paiement du ticket</h3>
                                            <button onClick={() => setPaymentModal(false)} style={{ background:"#F1F5F9", border:"none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize:18, cursor:"pointer", color:"#64748B" }}>✕</button>
                                        </div>

                                        <div style={{ textAlign: "center", padding: "16px", background: "#F8FAFC", borderRadius: 16, marginBottom: 20 }}>
                                            <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Montant à payer</div>
                                            <div style={{ fontSize: 32, fontWeight: 900, color: "#0F172A", marginTop: 4 }}>5 000 <span style={{ fontSize: 18 }}>FCFA</span></div>
                                        </div>

                                        {paymentError && (
                                            <div style={{ background: "#FEF2F2", color: "#991B1B", padding: "12px 16px", borderRadius: 12, fontSize: 14, fontWeight: 500, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                                                <i className="bi bi-exclamation-triangle-fill"></i> {paymentError}
                                            </div>
                                        )}

                                        <div style={{ marginBottom: 20 }}>
                                            <label style={{ fontSize:14, fontWeight:600, color:"#334155", display:"block", marginBottom:12 }}>Moyen de paiement</label>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                                <div onClick={() => setPaymentMethod("WAVE")} style={{ border: paymentMethod === "WAVE" ? "2px solid #10B981" : "2px solid #E2E8F0", borderRadius: 12, padding: "16px", textAlign: "center", cursor: "pointer", background: paymentMethod === "WAVE" ? "#ECFDF5" : "#fff", transition: "all 0.2s" }}>
                                                    <div style={{ fontSize: 22, color: "#10B981", fontWeight: 900, letterSpacing: -1 }}>wave</div>
                                                </div>
                                                <div onClick={() => setPaymentMethod("ORANGE")} style={{ border: paymentMethod === "ORANGE" ? "2px solid #F97316" : "2px solid #E2E8F0", borderRadius: 12, padding: "16px", textAlign: "center", cursor: "pointer", background: paymentMethod === "ORANGE" ? "#FFF7ED" : "#fff", transition: "all 0.2s" }}>
                                                    <div style={{ fontSize: 16, color: "#F97316", fontWeight: 900 }}>Orange Money</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ fontSize:14, fontWeight:600, color:"#334155", display:"block", marginBottom:8 }}>Numéro de téléphone</label>
                                            <div style={{ position: "relative" }}>
                                                <div style={{ position: "absolute", left: 14, top: 11, fontWeight: 600, color: "#94A3B8" }}>+221</div>
                                                <input type="text" value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0,9))} placeholder="77 123 45 67" style={{ borderRadius:8, border:"1px solid #E5E7EB", padding:"10px 14px", paddingLeft: 60, fontSize: 16, width:"100%", boxSizing:"border-box", fontWeight: 600, letterSpacing: 1 }}/>
                                            </div>
                                        </div>
                                        
                                        <div style={{ marginTop:24 }}>
                                            <button onClick={handlePaymentAndConfirm} disabled={paymentLoading || phoneNumber.length < 9}
                                                    style={{ width: "100%", background: paymentMethod === "WAVE" ? "#10B981" : "#F97316", color:"#fff", border:"none", borderRadius:12, padding:"14px", cursor:(phoneNumber.length < 9)?"not-allowed":"pointer", fontWeight:800, fontSize:16, opacity: (phoneNumber.length < 9) ? 0.6 : 1, transition: "background 0.3s" }}>
                                                {paymentLoading ? <span className="spinner-border spinner-border-sm"></span> : <span>Valider le Paiement</span>}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                    <style>{`
                        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                    `}</style>
                </>
            )}
        </DashboardLayout>
    );
}