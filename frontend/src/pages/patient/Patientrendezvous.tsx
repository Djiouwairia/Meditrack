import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import {
    patientService, rendezVousService, medecinService, disponibiliteService,
    type Patient, type RendezVous, type Medecin, type Disponibilite,
} from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",        label: "Tableau de bord",   path: "/dashboard/patient" },
    { icon: "bi-calendar-check",      label: "Mes rendez-vous",   path: "/dashboard/patient/rendez-vous" },
    { icon: "bi-folder2-open",        label: "Mon dossier",       path: "/dashboard/patient/dossier" },
    { icon: "bi-file-earmark-medical",label: "Ordonnances",       path: "/dashboard/patient/ordonnances" },
    { icon: "bi-person-gear",         label: "Mon profil",        path: "/dashboard/patient/profil" },
];

export default function PatientRendezVous() {
    const { user } = useAuth();
    const [patient, setPatient]         = useState<Patient | null>(null);
    const [rdvs, setRdvs]               = useState<RendezVous[]>([]);
    const [loading, setLoading]         = useState(true);
    const [page, setPage]               = useState(0);
    const [totalPages, setTotalPages]   = useState(0);
    const [filterStatut, setFilterStatut] = useState("TOUS");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    /* modal prise de RDV (Wizard) */
    const [rdvModal, setRdvModal]       = useState(false);
    const [step, setStep]               = useState(1);
    const [ticketModal, setTicketModal] = useState<RendezVous | null>(null);
    
    // Wizard State
    const [specialite, setSpecialite]   = useState("");
    const [motif, setMotif]             = useState("");
    const [searchMode, setSearchMode]   = useState<"GPS" | "ADDRESS">("GPS");
    const [addressQuery, setAddressQuery] = useState("");
    
    const [closestMedecins, setClosestMedecins] = useState<{medecin: Medecin, distanceKm: number}[]>([]);
    const [selectedMedecinId, setSelectedMedecinId] = useState("");
    const [medecinDispos, setMedecinDispos] = useState<Disponibilite[]>([]);
    const [selectedDispoId, setSelectedDispoId] = useState("");
    const [date, setDate]               = useState("");
    const [heure, setHeure]             = useState("");
    const [paymentMethod, setPaymentMethod] = useState("WAVE");
    const [phoneNumber, setPhoneNumber] = useState("");
    
    // Pour la recherche par adresse : médecins de la spécialité
    const [specialiteMedecins, setSpecialiteMedecins] = useState<Medecin[]>([]);
    
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError]     = useState("");

    const resolvePatient = useCallback(async () => {
        if (!user?.email) return null;
        const p = await patientService.getMe();
        setPatient(p);
        return p;
    }, [user]);

    const loadRdvs = useCallback(async (pat: Patient | null, pg: number) => {
        if (!pat) return;
        setLoading(true);
        try {
            const data = await rendezVousService.getByPatient(pat.id, pg, 8);
            setRdvs(data.content);
            setTotalPages(data.totalPages);
            setPage(pg);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (user?.email) {
            resolvePatient()
                .then(pat => {
                    if (pat) loadRdvs(pat, 0).catch(() => setLoading(false));
                    else setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [user, resolvePatient, loadRdvs]);

    useEffect(() => {
        if (specialite) {
            medecinService.getBySpecialite(specialite, 0, 100)
                .then(res => setSpecialiteMedecins(res.content.filter(m => m.disponible)))
                .catch(() => setSpecialiteMedecins([]));
        } else {
            setSpecialiteMedecins([]);
            setAddressQuery("");
        }
    }, [specialite]);

    const handleAnnuler = async (id: string) => {
        setActionLoading(id);
        try { await rendezVousService.annuler(id); await loadRdvs(patient, page); }
        finally { setActionLoading(null); }
    };

    const openModal = () => {
        setStep(1);
        setSpecialite("");
        setMotif("");
        setAddressQuery("");
        setClosestMedecins([]);
        setSelectedMedecinId("");
        setMedecinDispos([]);
        setSelectedDispoId("");
        setDate("");
        setHeure("");
        setPhoneNumber("");
        setFormError("");
        setRdvModal(true);
    };

    const handleFindMedecin = async () => {
        if (!specialite || !motif) {
            setFormError("Veuillez sélectionner une spécialité et décrire votre motif.");
            return;
        }
        if (searchMode === "ADDRESS" && !addressQuery) {
            setFormError("Veuillez saisir une adresse.");
            return;
        }
        
        setFormError("");
        setFormLoading(true);

        try {
            if (searchMode === "ADDRESS") {
                const doctorsAtAddress = specialiteMedecins.filter(m => m.hopital?.nom === addressQuery || (m.hopital as any)?.adresse === addressQuery);
                if (doctorsAtAddress.length > 0) {
                    setClosestMedecins(doctorsAtAddress.map(m => ({ medecin: m, distanceKm: 0 })));
                    setStep(2);
                } else {
                    setFormError("Aucun spécialiste disponible à cette adresse.");
                }
                setFormLoading(false);
                return;
            }

            let lat = 14.6928; // default Dakar
            let lon = -17.4467;

            if (!navigator.geolocation) {
                setFormError("La géolocalisation n'est pas supportée. Veuillez utiliser la recherche par adresse.");
                setFormLoading(false);
                return;
            }

            // Get Position Promise wrapper
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            }).catch(_e => {
                console.warn("Geolocation failed, using default coords");
                return null;
            });

            if (pos) {
                lat = pos.coords.latitude;
                lon = pos.coords.longitude;
            }

            const results = await (medecinService as any).getClosest(lat, lon, specialite);
            setClosestMedecins(results);
            setStep(2);
        } catch (e: any) {
            setFormError("Erreur lors de la recherche des médecins.");
        } finally {
            setFormLoading(false);
        }
    };

    // Load disponibilites when a medecin is selected
    useEffect(() => {
        if (selectedMedecinId) {
            disponibiliteService.getLibres(selectedMedecinId)
                .then(dispos => {
                    // Trier par date puis heure
                    const sorted = dispos.sort((a,b) => {
                        const d1 = new Date(a.date+"T"+a.heureDebut).getTime();
                        const d2 = new Date(b.date+"T"+b.heureDebut).getTime();
                        return d1 - d2;
                    });
                    setMedecinDispos(sorted);
                })
                .catch(() => setFormError("Impossible de charger les disponibilités du médecin."));
        } else {
            setMedecinDispos([]);
            setSelectedDispoId("");
            setDate("");
            setHeure("");
        }
    }, [selectedMedecinId]);

    const handleGoToPayment = () => {
        if (!selectedMedecinId || !selectedDispoId) {
            setFormError("Veuillez sélectionner un médecin et un créneau.");
            return;
        }

        const dispo = medecinDispos.find(d => d.id === selectedDispoId);
        if (dispo) {
            setDate(dispo.date);
            setHeure(dispo.heureDebut);
        }

        setFormError("");
        setStep(3);
    };

    const handlePaymentAndConfirm = async () => {
        if (!phoneNumber || phoneNumber.length < 9) {
            setFormError("Veuillez entrer un numéro de téléphone valide.");
            return;
        }
        if (!patient) return;

        setFormLoading(true);
        setFormError("");

        // Simulate mobile money payment processing
        setTimeout(async () => {
            try {
                await rendezVousService.prendre({
                    patientId: patient.id,
                    medecinId: selectedMedecinId,
                    disponibiliteId: selectedDispoId,
                    date,
                    heure,
                    motif,
                    statutPaiement: "PAYE"
                });
                await loadRdvs(patient, 0);
                setStep(4); // Success step
            } catch (e: any) {
                setFormError(e?.response?.data?.message || "Erreur lors de la confirmation du rendez-vous.");
            } finally {
                setFormLoading(false);
            }
        }, 2000); // 2 seconds simulated delay
    };

    const filtered = filterStatut === "TOUS" ? rdvs : rdvs.filter(r => r.statut === filterStatut);

    const inp = { borderRadius:8, border:"1px solid #E5E7EB", padding:"10px 14px", fontSize:14, width:"100%", boxSizing:"border-box" as const, transition: "all 0.2s" };

    return (
        <DashboardLayout navItems={NAV} title="Mes rendez-vous" accentColor="#27A869">
            {/* Toolbar */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {["TOUS","EN_ATTENTE","CONFIRME","TERMINE","ANNULE"].map(s => (
                        <button key={s} onClick={() => setFilterStatut(s)}
                                style={{ background: filterStatut===s?"#27A869":"#F3F4F6", color: filterStatut===s?"#fff":"#374151", border:"none", borderRadius:20, padding:"6px 16px", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
                            {s === "TOUS" ? "Tous" : s.replace("_"," ")}
                        </button>
                    ))}
                </div>
                <button onClick={openModal}
                        style={{ background:"linear-gradient(135deg,#1A7A52,#27A869)", color:"#fff", border:"none", borderRadius:12, padding:"10px 22px", fontWeight:700, cursor:"pointer", fontSize:14, boxShadow: "0 4px 12px rgba(39, 168, 105, 0.3)" }}>
                    <i className="bi bi-geo-alt-fill me-2"></i>Trouver un spécialiste
                </button>
            </div>

            {/* Liste */}
            <div style={{ background:"#fff", borderRadius:20, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", border:"1px solid #F0F2F7" }}>
                {loading ? (
                    <div className="d-flex justify-content-center" style={{ padding:60 }}>
                        <div className="spinner-border" style={{ color:"#27A869" }}></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"64px 0", color:"#8A94A6" }}>
                        <i className="bi bi-calendar-x" style={{ fontSize:48, opacity: 0.5 }}></i>
                        <div style={{ marginTop:16, fontSize:16, fontWeight: 500 }}>Aucun rendez-vous trouvé</div>
                    </div>
                ) : (
                    <>
                        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                            {filtered.map(rdv => (
                                <div key={rdv.id} style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 20px", borderRadius:14, background:"#F8FAFC", border:"1px solid #EEF1F6", transition:"box-shadow 0.15s" }}
                                     onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow="0 4px 16px rgba(0,0,0,0.07)"}
                                     onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow="none"}>

                                    {/* Date block */}
                                    <div style={{ textAlign:"center", minWidth:56, background:"#E8F5EE", borderRadius:12, padding:"10px 6px" }}>
                                        <div style={{ fontSize:22, fontWeight:800, color:"#27A869", lineHeight:1 }}>{rdv.date?.slice(8,10)}</div>
                                        <div style={{ fontSize:11, color:"#1A7A52", textTransform:"uppercase", fontWeight:600, marginTop:2 }}>
                                            {rdv.date ? new Date(rdv.date+"T00:00:00").toLocaleDateString("fr-FR",{month:"short"}) : ""}
                                        </div>
                                        <div style={{ fontSize:12, color:"#1A7A52", marginTop:4, fontWeight:600 }}>{rdv.heure?.slice(0,5)}</div>
                                    </div>

                                    {/* Médecin avatar */}
                                    <div style={{ width:44, height:44, borderRadius:"50%", background:"#27A86922", display:"flex", alignItems:"center", justifyContent:"center", color:"#27A869", fontWeight:700, fontSize:15, flexShrink:0 }}>
                                        {rdv.medecin?.prenom?.[0]}{rdv.medecin?.nom?.[0]}
                                    </div>

                                    <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ fontWeight:700, fontSize:15, color:"#0D1F2D" }}>Dr. {rdv.medecin?.prenom} {rdv.medecin?.nom}</div>
                                        <div style={{ fontSize:13, color:"#6B7280", marginTop:2 }}>{rdv.medecin?.specialite} • {rdv.medecin?.hopital?.nom}</div>
                                        <div style={{ fontSize:12, color:"#9CA3AF", marginTop:4, display:"flex", alignItems:"center", gap:4 }}>
                                            <i className="bi bi-chat-text"></i> {rdv.motif}
                                        </div>
                                        {rdv.diagnostic && (
                                            <div style={{ fontSize:12, color:"#6366F1", marginTop:4, display:"flex", alignItems:"center", gap:4 }}>
                                                <i className="bi bi-clipboard2-pulse"></i> {rdv.diagnostic}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
                                        <StatusBadge status={rdv.statut} />
                                        {/* To simulate payment status display if needed, though mostly implicit if RDV is created */}
                                        <span style={{ fontSize: 11, fontWeight: 700, color: "#10B981", background: "#D1FAE5", padding: "2px 8px", borderRadius: 12 }}>Payé (Ticket)</span>
                                    </div>

                                    <div style={{ display:"flex", gap:8, flexShrink:0, flexDirection:"column", alignItems:"stretch" }}>
                                        {rdv.statut === "CONFIRME" && (
                                            <button onClick={() => setTicketModal(rdv)}
                                                    style={{ background:"#F0FDF4", color:"#16A34A", border:"1px solid #BBF7D0", borderRadius:10, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                                                <i className="bi bi-ticket-detailed"></i> Voir le ticket
                                            </button>
                                        )}
                                        {(rdv.statut === "EN_ATTENTE" || rdv.statut === "CONFIRME") && (
                                            <button onClick={() => handleAnnuler(rdv.id)} disabled={!!actionLoading}
                                                    style={{ background:"#FEE2E2", color:"#991B1B", border:"none", borderRadius:10, padding:"8px 16px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                                                {actionLoading === rdv.id ? <span className="spinner-border spinner-border-sm"></span> : "Annuler"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:20 }}>
                                <button onClick={() => loadRdvs(patient,page-1)} disabled={page===0}
                                        style={{ background:"#F3F4F6", border:"none", borderRadius:8, padding:"7px 14px", cursor:"pointer", color:"#374151" }}>‹</button>
                                {Array.from({length:totalPages},(_,i)=>(
                                    <button key={i} onClick={() => loadRdvs(patient,i)}
                                            style={{ width:34, height:34, borderRadius:8, border:"none", background:page===i?"#27A869":"#F3F4F6", color:page===i?"#fff":"#374151", cursor:"pointer", fontWeight:600 }}>{i+1}</button>
                                ))}
                                <button onClick={() => loadRdvs(patient,page+1)} disabled={page===totalPages-1}
                                        style={{ background:"#F3F4F6", border:"none", borderRadius:8, padding:"7px 14px", cursor:"pointer", color:"#374151" }}>›</button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal prise RDV avec Wizard */}
            {rdvModal && (
                <div style={{ position:"fixed", inset:0, background:"rgba(15, 23, 42, 0.6)", backdropFilter:"blur(4px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding: 20 }}>
                    <div style={{ background:"#fff", borderRadius:24, padding:40, width:550, maxWidth:"100%", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", position: "relative", overflow: "hidden" }}>

                        {/* Progress Bar */}
                        <div style={{ position: "absolute", top: 0, left: 0, height: 4, background: "#E2E8F0", width: "100%" }}>
                            <div style={{ height: "100%", background: "linear-gradient(90deg, #208A56, #27A869)", width: `${(step / 4) * 100}%`, transition: "width 0.3s ease" }}></div>
                        </div>

                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                            <h3 style={{ margin:0, fontSize:22, fontWeight:800, color: "#0F172A" }}>
                                {step === 1 && "Trouver un spécialiste"}
                                {step === 2 && "Choix du créneau"}
                                {step === 3 && "Paiement du ticket"}
                                {step === 4 && "Confirmation"}
                            </h3>
                            {step < 4 && (
                                <button onClick={() => setRdvModal(false)} style={{ background:"#F1F5F9", border:"none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize:18, cursor:"pointer", color:"#64748B", transition: "all 0.2s" }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="#E2E8F0"}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="#F1F5F9"}>✕</button>
                            )}
                        </div>

                        {formError && <div style={{ background: "#FEF2F2", color: "#991B1B", padding: "12px 16px", borderRadius: 12, fontSize: 13, fontWeight: 500, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                            <i className="bi bi-exclamation-circle-fill"></i> {formError}
                        </div>}

                        {/* STEP 1: Spécialité et Motif */}
                        {step === 1 && (
                            <div style={{ display:"flex", flexDirection:"column", gap:20, animation: "fadeIn 0.3s ease" }}>
                                <div>
                                    <label style={{ fontSize:14, fontWeight:600, color:"#334155", display:"block", marginBottom:8 }}>De quel spécialiste avez-vous besoin ?</label>
                                    <select value={specialite} onChange={e => setSpecialite(e.target.value)} style={{...inp, backgroundColor: "#F8FAFC", cursor: "pointer"}}>
                                        <option value="">Sélectionner une spécialité</option>
                                        <option value="Cardiologie">Cardiologie</option>
                                        <option value="Pédiatrie">Pédiatrie</option>
                                        <option value="Chirurgie">Chirurgie</option>
                                        <option value="Dermatologie">Dermatologie</option>
                                        <option value="Généraliste">Généraliste</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize:14, fontWeight:600, color:"#334155", display:"block", marginBottom:8 }}>Symptômes / Motif de consultation</label>
                                    <textarea value={motif} onChange={e=>setMotif(e.target.value)} rows={4} placeholder="Décrivez brièvement vos symptômes..." style={{...inp, resize:"vertical", backgroundColor: "#F8FAFC"}}/>
                                </div>
                                <div>
                                    <label style={{ fontSize:14, fontWeight:600, color:"#334155", display:"block", marginBottom:8 }}>Localisation (Trouver le plus proche)</label>
                                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                                        <button onClick={() => setSearchMode("GPS")} style={{ flex: 1, padding: "8px 12px", border: searchMode === "GPS" ? "2px solid #27A869" : "2px solid transparent", background: searchMode === "GPS" ? "#F2F9F6" : "#F8FAFC", borderRadius: 8, fontWeight: 600, color: searchMode === "GPS" ? "#1A7A52" : "#64748B" }}>
                                            <i className="bi bi-geo-alt-fill me-2"></i>Ma Position
                                        </button>
                                        <button onClick={() => setSearchMode("ADDRESS")} style={{ flex: 1, padding: "8px 12px", border: searchMode === "ADDRESS" ? "2px solid #27A869" : "2px solid transparent", background: searchMode === "ADDRESS" ? "#F2F9F6" : "#F8FAFC", borderRadius: 8, fontWeight: 600, color: searchMode === "ADDRESS" ? "#1A7A52" : "#64748B" }}>
                                            <i className="bi bi-map-fill me-2"></i>Adresse
                                        </button>
                                    </div>

                                    {searchMode === "ADDRESS" && (
                                        <select value={addressQuery} onChange={e=>setAddressQuery(e.target.value)} style={{...inp, backgroundColor: "#F8FAFC", cursor: "pointer"}}>
                                            <option value="">Sélectionner un hôpital / adresse</option>
                                            {Array.from(new Set(specialiteMedecins.map(m => m.hopital?.nom || (m.hopital as any)?.adresse).filter(Boolean))).map(addr => (
                                                <option key={addr as string} value={addr as string}>{addr}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {searchMode === "GPS" && (
                                    <div style={{ background: "#F2F9F6", padding: 16, borderRadius: 12, display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
                                        <i className="bi bi-geo-alt-fill" style={{ fontSize: 24, color: "#27A869" }}></i>
                                        <div style={{ fontSize: 13, color: "#1A7A52" }}>
                                            <strong>Géolocalisation requise</strong><br/>
                                            Assurez-vous que votre navigateur autorise l'accès à votre position.
                                        </div>
                                    </div>
                                )}

                                <button onClick={handleFindMedecin} disabled={formLoading || !specialite || !motif}
                                        style={{ background:"linear-gradient(135deg,#1A7A52,#27A869)", color:"#fff", border:"none", borderRadius:12, padding:"14px", cursor:(!specialite || !motif)?"not-allowed":"pointer", fontWeight:700, fontSize:15, marginTop: 8, transition: "transform 0.1s", opacity: (!specialite || !motif) ? 0.7 : 1 }}
                                        onMouseDown={e => (e.currentTarget as HTMLElement).style.transform="scale(0.98)"}
                                        onMouseUp={e => (e.currentTarget as HTMLElement).style.transform="scale(1)"}>
                                    {formLoading ? <span className="spinner-border spinner-border-sm"></span> : <span><i className="bi bi-search me-2"></i>Rechercher le plus proche</span>}
                                </button>
                            </div>
                        )}

                        {/* STEP 2: Choix du médecin et du créneau */}
                        {step === 2 && (
                            <div style={{ display:"flex", flexDirection:"column", gap:20, animation: "fadeIn 0.3s ease" }}>

                                <label style={{ fontSize:14, fontWeight:600, color:"#334155", display:"block", marginBottom: -10 }}>Médecins à proximité</label>

                                {closestMedecins.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "30px", background: "#F8FAFC", borderRadius: 12 }}>
                                        <i className="bi bi-emoji-frown" style={{ fontSize: 32, color: "#94A3B8" }}></i>
                                        <p style={{ margin: "10px 0 0", color: "#475569", fontWeight: 500 }}>Aucun spécialiste disponible à proximité.</p>
                                    </div>
                                ) : (
                                    <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingRight: 4 }}>
                                        {closestMedecins.map(({ medecin, distanceKm }) => (
                                            <div key={medecin.id}
                                                 onClick={() => setSelectedMedecinId(medecin.id)}
                                                 style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: selectedMedecinId === medecin.id ? "2px solid #27A869" : "2px solid transparent", background: selectedMedecinId === medecin.id ? "#F2F9F6" : "#F8FAFC", cursor: "pointer", transition: "all 0.2s" }}>
                                                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#27A869", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                                                    {medecin.prenom[0]}{medecin.nom[0]}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 700, color: "#0F172A" }}>Dr. {medecin.prenom} {medecin.nom}</div>
                                                    <div style={{ fontSize: 12, color: "#64748B" }}>{medecin.hopital?.nom}</div>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <div style={{ fontSize: 14, fontWeight: 800, color: "#1A7A52" }}>{distanceKm.toFixed(1)} km</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ marginTop: 8 }}>
                                    <label style={{ fontSize:14, fontWeight:600, color:"#334155", display:"block", marginBottom:8 }}>Créneaux Disponibles</label>
                                    {!selectedMedecinId ? (
                                        <div style={{ fontSize: 13, color: "#64748B" }}>Veuillez sélectionner un médecin pour voir ses disponibilités.</div>
                                    ) : medecinDispos.length === 0 ? (
                                        <div style={{ fontSize: 13, color: "#991B1B", background: "#FEF2F2", padding: "10px 14px", borderRadius: 8 }}>
                                            Aucun créneau disponible pour ce médecin actuellement.
                                        </div>
                                    ) : (
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxHeight: 180, overflowY: "auto", paddingRight: 4 }}>
                                            {medecinDispos.map(d => (
                                                <div key={d.id} onClick={() => setSelectedDispoId(d.id)}
                                                     style={{ padding: "10px", border: selectedDispoId === d.id ? "2px solid #27A869" : "1px solid #E2E8F0", borderRadius: 8, background: selectedDispoId === d.id ? "#F2F9F6" : "#fff", cursor: "pointer", textAlign: "center", transition: "all 0.15s" }}>
                                                    <div style={{ fontSize: 12, fontWeight: 700, color: selectedDispoId === d.id ? "#1A7A52" : "#475569" }}>{new Date(d.date).toLocaleDateString("fr-FR", { weekday: 'short', day: 'numeric', month: 'short'})}</div>
                                                    <div style={{ fontSize: 14, fontWeight: 800, color: selectedDispoId === d.id ? "#27A869" : "#0F172A", marginTop: 2 }}>{d.heureDebut.slice(0,5)}</div>
                                                    <div style={{ fontSize: 10, color: "#64748B", marginTop: 4 }}>{d.placesRestantes} place(s) restante(s)</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display:"flex", gap:12, marginTop:16 }}>
                                    <button onClick={() => setStep(1)} style={{ background:"#F1F5F9", color: "#475569", border:"none", borderRadius:12, padding:"12px 20px", cursor:"pointer", fontWeight: 600 }}>Retour</button>
                                    <button onClick={handleGoToPayment} disabled={!selectedMedecinId || !selectedDispoId}
                                            style={{ flex: 1, background:"#0F172A", color:"#fff", border:"none", borderRadius:12, padding:"12px", cursor:(!selectedMedecinId || !selectedDispoId)?"not-allowed":"pointer", fontWeight:700, fontSize:15, opacity: (!selectedMedecinId || !selectedDispoId) ? 0.6 : 1 }}>
                                        Valider le créneau <i className="bi bi-arrow-right ms-2"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Paiement */}
                        {step === 3 && (
                            <div style={{ display:"flex", flexDirection:"column", gap:20, animation: "fadeIn 0.3s ease" }}>

                                <div style={{ textAlign: "center", padding: "16px", background: "#F8FAFC", borderRadius: 16 }}>
                                    <div style={{ fontSize: 14, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Montant à payer</div>
                                    <div style={{ fontSize: 36, fontWeight: 900, color: "#0F172A", marginTop: 4 }}>5 000 <span style={{ fontSize: 20 }}>FCFA</span></div>
                                </div>

                                <div>
                                    <label style={{ fontSize:14, fontWeight:600, color:"#334155", display:"block", marginBottom:12 }}>Moyen de paiement</label>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                        <div onClick={() => setPaymentMethod("WAVE")} style={{ border: paymentMethod === "WAVE" ? "2px solid #10B981" : "2px solid #E2E8F0", borderRadius: 12, padding: "16px", textAlign: "center", cursor: "pointer", background: paymentMethod === "WAVE" ? "#ECFDF5" : "#fff", transition: "all 0.2s" }}>
                                            <div style={{ fontSize: 24, color: "#10B981", fontWeight: 900, letterSpacing: -1 }}>wave</div>
                                        </div>
                                        <div onClick={() => setPaymentMethod("ORANGE")} style={{ border: paymentMethod === "ORANGE" ? "2px solid #F97316" : "2px solid #E2E8F0", borderRadius: 12, padding: "16px", textAlign: "center", cursor: "pointer", background: paymentMethod === "ORANGE" ? "#FFF7ED" : "#fff", transition: "all 0.2s" }}>
                                            <div style={{ fontSize: 18, color: "#F97316", fontWeight: 900 }}>Orange Money</div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontSize:14, fontWeight:600, color:"#334155", display:"block", marginBottom:8 }}>Numéro de téléphone</label>
                                    <div style={{ position: "relative" }}>
                                        <div style={{ position: "absolute", left: 14, top: 11, fontWeight: 600, color: "#94A3B8" }}>+221</div>
                                        <input type="text" value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0,9))} placeholder="77 123 45 67" style={{...inp, paddingLeft: 60, fontSize: 16, fontWeight: 600, letterSpacing: 1}}/>
                                    </div>
                                </div>

                                <div style={{ display:"flex", gap:12, marginTop:16 }}>
                                    <button onClick={() => setStep(2)} disabled={formLoading} style={{ background:"#F1F5F9", color: "#475569", border:"none", borderRadius:12, padding:"12px 20px", cursor:"pointer", fontWeight: 600 }}>Retour</button>
                                    <button onClick={handlePaymentAndConfirm} disabled={formLoading || phoneNumber.length < 9}
                                            style={{ flex: 1, background: paymentMethod === "WAVE" ? "#10B981" : "#F97316", color:"#fff", border:"none", borderRadius:12, padding:"12px", cursor:(phoneNumber.length < 9)?"not-allowed":"pointer", fontWeight:800, fontSize:16, opacity: (phoneNumber.length < 9) ? 0.6 : 1, transition: "background 0.3s" }}>
                                        {formLoading ? <span className="spinner-border spinner-border-sm"></span> : <span>Payer & Confirmer</span>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Succès */}
                        {step === 4 && (
                            <div style={{ textAlign:"center", padding:"32px 0", animation: "scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}>
                                <div style={{ width: 80, height: 80, background: "#10B981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "#fff", fontSize: 40, boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4)" }}>
                                    <i className="bi bi-check-lg"></i>
                                </div>
                                <h3 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>Paiement Réussi !</h3>
                                <p style={{ color: "#64748B", fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
                                    Votre paiement de <strong>5 000 FCFA</strong> a été traité avec succès.<br/>
                                    La secrétaire a été notifiée et va confirmer votre rendez-vous sous peu.<br/>
                                    Vous recevrez votre ticket électronique une fois confirmé.
                                </p>
                                <button onClick={() => setRdvModal(false)} style={{ background:"#27A869", color:"#fff", border:"none", borderRadius:12, padding:"14px 40px", cursor:"pointer", fontWeight:700, fontSize:16, boxShadow: "0 4px 12px rgba(39, 168, 105, 0.3)" }}>
                                    Voir mes rendez-vous
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* Modal Ticket */}
            {ticketModal && (
                <div style={{ position:"fixed", inset:0, background:"rgba(15, 23, 42, 0.6)", backdropFilter:"blur(4px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding: 20 }}>
                    <div style={{ background:"#fff", borderRadius:16, width:380, maxWidth:"100%", overflow:"hidden", boxShadow:"0 20px 40px rgba(0,0,0,0.15)", position:"relative", animation:"scaleIn 0.3s ease" }}>
                        <div style={{ background:"linear-gradient(135deg, #1A7A52, #27A869)", padding:"24px 20px 30px", color:"#fff", textAlign:"center", position:"relative" }}>
                            <button onClick={() => setTicketModal(null)} style={{ position:"absolute", top:12, right:12, background:"rgba(255,255,255,0.2)", border:"none", borderRadius:"50%", width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", cursor:"pointer" }}>✕</button>
                            <i className="bi bi-ticket-detailed" style={{ fontSize:36, opacity:0.9 }}></i>
                            <h3 style={{ margin:"10px 0 0", fontSize:18, fontWeight:700 }}>Ticket de Consultation</h3>
                            <div style={{ fontSize:13, opacity:0.8, marginTop:4 }}>Confirmé par la secrétaire</div>
                        </div>

                        <div style={{ background:"#fff", margin:"-16px 20px 0", borderRadius:12, padding:20, boxShadow:"0 4px 12px rgba(0,0,0,0.08)", position:"relative", zIndex:2 }}>
                            <div style={{ textAlign:"center", marginBottom:16 }}>
                                <div style={{ fontSize:11, textTransform:"uppercase", color:"#9CA3AF", fontWeight:700, letterSpacing:1, marginBottom:4 }}>Patient</div>
                                <div style={{ fontSize:16, fontWeight:800, color:"#1F2937" }}>{ticketModal.patient?.prenom} {ticketModal.patient?.nom}</div>
                            </div>

                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, borderTop:"1px dashed #E5E7EB", borderBottom:"1px dashed #E5E7EB", padding:"16px 0", marginBottom:16 }}>
                                <div>
                                    <div style={{ fontSize:11, color:"#9CA3AF", fontWeight:600 }}>Date</div>
                                    <div style={{ fontSize:14, fontWeight:700, color:"#1F2937" }}>{ticketModal.date ? new Date(ticketModal.date).toLocaleDateString("fr-FR") : ""}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize:11, color:"#9CA3AF", fontWeight:600 }}>Heure</div>
                                    <div style={{ fontSize:14, fontWeight:700, color:"#1F2937" }}>{ticketModal.heure?.slice(0,5)}</div>
                                </div>
                                <div style={{ gridColumn:"span 2" }}>
                                    <div style={{ fontSize:11, color:"#9CA3AF", fontWeight:600 }}>Médecin</div>
                                    <div style={{ fontSize:14, fontWeight:700, color:"#1F2937" }}>Dr. {ticketModal.medecin?.prenom} {ticketModal.medecin?.nom} ({ticketModal.medecin?.specialite})</div>
                                </div>
                                <div style={{ gridColumn:"span 2" }}>
                                    <div style={{ fontSize:11, color:"#9CA3AF", fontWeight:600 }}>Lieu</div>
                                    <div style={{ fontSize:13, fontWeight:600, color:"#4B5563" }}>{ticketModal.medecin?.hopital?.nom} - {(ticketModal.medecin?.hopital as any)?.adresse}</div>
                                </div>
                            </div>

                            <div style={{ textAlign:"center" }}>
                                <div style={{ fontSize:12, color:"#6B7280", marginBottom:4 }}>Montant réglé</div>
                                <div style={{ fontSize:24, fontWeight:900, color:"#10B981" }}>5 000 FCFA</div>
                                <div style={{ display:"inline-block", padding:"4px 10px", background:"#ECFDF5", color:"#059669", borderRadius:20, fontSize:11, fontWeight:700, marginTop:8 }}>
                                    <i className="bi bi-check-circle-fill me-1"></i>Paiement validé
                                </div>
                            </div>
                        </div>

                        <div style={{ padding:"20px", textAlign:"center", background:"#F9FAFB" }}>
                            <div style={{ width:100, height:100, margin:"0 auto", background:"#fff", border:"1px solid #E5E7EB", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#CBD5E1" }}>
                                <i className="bi bi-qr-code" style={{ fontSize:60 }}></i>
                            </div>
                            <div style={{ fontSize:11, color:"#9CA3AF", marginTop:12 }}>Présentez ce code à l'accueil lors de votre arrivée.</div>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
            `}</style>
        </DashboardLayout>
    );
}