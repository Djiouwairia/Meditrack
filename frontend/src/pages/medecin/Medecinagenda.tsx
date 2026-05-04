import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatusBadge from "../../components/common/StatusBadge";
import {
    medecinService, rendezVousService, disponibiliteService, dossierService,
    type RendezVous, type Medecin, type Disponibilite
} from "../../services/DomainServices";

const NAV = [
    { icon: "bi-speedometer2",         label: "Tableau de bord", path: "/dashboard/medecin" },
    { icon: "bi-calendar-check",       label: "Mon agenda",       path: "/dashboard/medecin/agenda" },
    { icon: "bi-people",               label: "Mes patients",     path: "/dashboard/medecin/patients" },
    { icon: "bi-file-earmark-medical", label: "Ordonnances",      path: "/dashboard/medecin/ordonnances" },
    { icon: "bi-person-gear",          label: "Mon profil",       path: "/dashboard/medecin/profil" },
];

const ACCENT = "#1A7A52";
const fmt = (t: string) => t?.slice(0, 5) ?? "";
const fmtDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
const diffMin = (debut: string, fin: string) =>
    Math.round((new Date("2000-01-01T" + fin).getTime() - new Date("2000-01-01T" + debut).getTime()) / 60000);

// ─── Onglet RDV ──────────────────────────────────────────────────────────────
function TabRdv({ medecin }: { medecin: Medecin | null }) {
    const [rdvs, setRdvs]       = useState<RendezVous[]>([]);
    const [loading, setLoading] = useState(true);
    const [action, setAction]   = useState<string | null>(null);
    const [filtre, setFiltre]   = useState("TOUS");
    const today = new Date().toISOString().slice(0, 10);
    const prev7 = (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10); })();
    const next7 = (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10); })();
    const [debut, setDebut] = useState(prev7);
    const [fin, setFin]     = useState(next7);

    const [terminerModal, setTerminerModal] = useState(false);
    const [terminerRdv, setTerminerRdv]     = useState<RendezVous | null>(null);
    const [terminerDiag, setTerminerDiag]   = useState("");
    const [terminerConstantes, setTerminerConstantes] = useState({ tension: "", temperature: "", poids: "" });
    const [terminerDossierId, setTerminerDossierId] = useState<string | null>(null);

    const inp = { width: "100%", borderRadius: 8, border: "0.5px solid #EBEBEB", padding: "9px 12px", fontSize: 14, boxSizing: "border-box" as const, outline: "none", background: "#FAFAFA", color: "#0F0F0F" };

    const openTerminerModal = async (rdv: RendezVous) => {
        setTerminerRdv(rdv);
        setTerminerDiag("");
        setTerminerConstantes({ tension: "", temperature: "", poids: "" });
        setTerminerDossierId(null);
        setTerminerModal(true);
        try {
            const dos = await dossierService.getByPatient(rdv.patient.id);
            if (dos && dos.id) {
                setTerminerDossierId(dos.id);
                setTerminerConstantes({ tension: dos.tension || "", temperature: dos.temperature || "", poids: dos.poids || "" });
            }
        } catch(e) { console.error(e); }
    };

    const handleTerminer = async () => {
        if (!terminerRdv) return;
        setAction(terminerRdv.id + "_terminer");
        try {
            let did = terminerDossierId;
            if (!did) {
                const newDos = await dossierService.create(terminerRdv.patient.id);
                did = newDos.id;
            }
            if (did && (terminerConstantes.tension || terminerConstantes.temperature || terminerConstantes.poids)) {
                await dossierService.update(did, { tension: terminerConstantes.tension, temperature: terminerConstantes.temperature, poids: terminerConstantes.poids });
            }
            await rendezVousService.terminer(terminerRdv.id, terminerDiag);
            setTerminerModal(false);
            await load();
        } catch(e) { console.error(e); } 
        finally { setAction(null); }
    };

    const load = useCallback(async (d = debut, f = fin) => {
        if (!medecin) return;
        setLoading(true);
        try { 
            const data = await rendezVousService.getAgendaMedecin(medecin.id, d, f);
            setRdvs(data.filter(r => r.statut === "CONFIRME" || r.statut === "TERMINE"));
        }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [medecin]);

    useEffect(() => { load(); }, [medecin]);

    const act = async (rdvId: string, key: string, fn: () => Promise<unknown>) => {
        setAction(rdvId + key);
        try { await fn(); await load(); } finally { setAction(null); }
    };

    const filtered = filtre === "TOUS" ? rdvs : rdvs.filter(r => r.statut === filtre);
    const grouped  = filtered.reduce<Record<string, RendezVous[]>>((acc, r) => {
        (acc[r.date] = acc[r.date] || []).push(r); return acc;
    }, {});

    return (
        <>
            <div style={{ background: "#fff", borderRadius: 12, padding: "13px 16px", marginBottom: 14, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", border: "0.5px solid #EBEBEB" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#9E9E9E" }}>Du</label>
                    <input type="date" value={debut} onChange={e => setDebut(e.target.value)} style={{ borderRadius: 8, border: "0.5px solid #EBEBEB", padding: "7px 10px", fontSize: 13, outline: "none" }} />
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#9E9E9E" }}>Au</label>
                    <input type="date" value={fin} onChange={e => setFin(e.target.value)} style={{ borderRadius: 8, border: "0.5px solid #EBEBEB", padding: "7px 10px", fontSize: 13, outline: "none" }} />
                    <button onClick={() => load(debut, fin)} style={{ background: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                        <i className="bi bi-search me-1"></i>Voir
                    </button>
                </div>
                <div style={{ display: "flex", gap: 6, marginLeft: "auto", flexWrap: "wrap" }}>
                    {[{ k: "TOUS", l: "Tous" }, { k: "CONFIRME", l: "Confirmés" }, { k: "TERMINE", l: "Terminés" }].map(s => (
                        <button key={s.k} onClick={() => setFiltre(s.k)} style={{ background: filtre === s.k ? ACCENT : "#F5F5F5", color: filtre === s.k ? "#fff" : "#6B6B6B", border: "none", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{s.l}</button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><div className="spinner-border" style={{ color: ACCENT }}></div></div>
            ) : Object.keys(grouped).length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#BDBDBD", background: "#fff", borderRadius: 14, border: "0.5px solid #EBEBEB" }}>
                    <i className="bi bi-calendar2-x" style={{ fontSize: 44 }}></i>
                    <div style={{ marginTop: 14, fontSize: 15 }}>Aucun rendez-vous sur cette période</div>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, list]) => (
                        <div key={date} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "0.5px solid #EBEBEB" }}>
                            <div style={{ background: "#FAFAFA", padding: "10px 18px", borderBottom: "0.5px solid #EBEBEB", display: "flex", alignItems: "center", gap: 10 }}>
                                <i className="bi bi-calendar3" style={{ color: ACCENT, fontSize: 13 }}></i>
                                <span style={{ fontWeight: 600, fontSize: 13.5 }}>{fmtDate(date)}</span>
                                <span style={{ background: `${ACCENT}18`, color: ACCENT, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>{list.length} RDV</span>
                            </div>
                            <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
                                {list.sort((a, b) => a.heure.localeCompare(b.heure)).map(rdv => (
                                    <div key={rdv.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "#FAFAFA", border: "0.5px solid #EBEBEB" }}>
                                        <span style={{ fontWeight: 700, fontSize: 14, color: ACCENT, fontFamily: "monospace", minWidth: 46 }}>{fmt(rdv.heure)}</span>
                                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${ACCENT}18`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: ACCENT, fontSize: 12 }}>
                                            {rdv.patient?.prenom?.[0]}{rdv.patient?.nom?.[0]}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{rdv.patient?.prenom} {rdv.patient?.nom}</div>
                                            <div style={{ fontSize: 12, color: "#9E9E9E" }}>{rdv.motif}</div>
                                        </div>
                                        <StatusBadge status={rdv.statut} />
                                        <div style={{ display: "flex", gap: 6 }}>
                                            {rdv.statut === "CONFIRME" && (
                                                <button onClick={() => openTerminerModal(rdv)} disabled={!!action} style={{ background: "#DBEAFE", color: "#1E40AF", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                                    {action === rdv.id + "_terminer" ? <span className="spinner-border spinner-border-sm"></span> : "✓ Terminer"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {terminerModal && terminerRdv && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 540, maxWidth: "90vw", border: "0.5px solid #EBEBEB", maxHeight: "90vh", overflowY: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E8F5EE", color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                                    <i className="bi bi-clipboard2-pulse"></i>
                                </div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F0F0F" }}>Clôturer la consultation</h3>
                            </div>
                            <button onClick={() => setTerminerModal(false)}
                                style={{ background: "#F5F5F5", border: "none", width: 28, height: 28, borderRadius: 8, cursor: "pointer", color: "#6B6B6B", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                        </div>

                        <div style={{ background: "#FAFAFA", borderRadius: 10, padding: 12, marginBottom: 20, border: "0.5px solid #EBEBEB" }}>
                            <div style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 4 }}>Patient</div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "#0F0F0F" }}>{terminerRdv.patient?.prenom} {terminerRdv.patient?.nom}</div>
                            <div style={{ fontSize: 12.5, color: "#6B6B6B", marginTop: 4 }}>Motif : {terminerRdv.motif}</div>
                        </div>

                        <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, marginBottom: 10, borderBottom: "1px solid #EBEBEB", paddingBottom: 6 }}>
                            <i className="bi bi-activity me-2"></i>Constantes du jour
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 4 }}>Tension</label>
                                <input value={terminerConstantes.tension} onChange={e => setTerminerConstantes(c => ({...c, tension: e.target.value}))} placeholder="Ex: 12/8" style={inp} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 4 }}>Temp. (°C)</label>
                                <input value={terminerConstantes.temperature} onChange={e => setTerminerConstantes(c => ({...c, temperature: e.target.value}))} placeholder="Ex: 38.5" style={inp} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 4 }}>Poids (kg)</label>
                                <input value={terminerConstantes.poids} onChange={e => setTerminerConstantes(c => ({...c, poids: e.target.value}))} placeholder="Ex: 70" style={inp} />
                            </div>
                        </div>

                        <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, marginBottom: 10, borderBottom: "1px solid #EBEBEB", paddingBottom: 6 }}>
                            <i className="bi bi-file-medical me-2"></i>Conclusion
                        </div>
                        <label style={{ fontSize: 12.5, fontWeight: 600, color: "#6B6B6B", display: "block", marginBottom: 6 }}>Diagnostic</label>
                        <textarea
                            value={terminerDiag}
                            onChange={e => setTerminerDiag(e.target.value)}
                            rows={3}
                            placeholder="Saisissez le diagnostic final..."
                            style={{ ...inp, resize: "vertical" }}
                        />

                        <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
                            <button onClick={() => setTerminerModal(false)}
                                style={{ background: "#F5F5F5", border: "none", borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontSize: 13.5, color: "#6B6B6B", fontWeight: 600 }}>
                                Annuler
                            </button>
                            <button onClick={handleTerminer} disabled={!terminerDiag.trim() || !!action}
                                style={{ background: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "9px 22px", cursor: "pointer", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                                {action === terminerRdv.id + "_terminer" ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-check2-circle"></i> Enregistrer et Terminer</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ─── Onglet Disponibilités ────────────────────────────────────────────────────
function TabDisponibilites({ medecin }: { medecin: Medecin | null }) {
    const [dispos, setDispos]         = useState<Disponibilite[]>([]);
    const [loading, setLoading]       = useState(true);
    const [deleteId, setDeleteId]     = useState<string | null>(null);
    const [form, setForm]             = useState({ date: "", heureDebut: "", heureFin: "", nombreMaxPatients: "1" });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError]     = useState("");
    const [addSuccess, setAddSuccess] = useState(false);

    const load = useCallback(async () => {
        if (!medecin) return;
        setLoading(true);
        try { setDispos(await disponibiliteService.getByMedecin(medecin.id)); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [medecin]);

    useEffect(() => { load(); }, [medecin]);

    const handleAdd = async () => {
        if (!form.date || !form.heureDebut || !form.heureFin) { setAddError("Tous les champs sont requis."); return; }
        setAddLoading(true); setAddError(""); setAddSuccess(false);
        try {
            await disponibiliteService.ajouter({ date: form.date, heureDebut: form.heureDebut + ":00", heureFin: form.heureFin + ":00", nombreMaxPatients: parseInt(form.nombreMaxPatients) || 1 });
            setForm({ date: "", heureDebut: "", heureFin: "", nombreMaxPatients: "1" });
            setAddSuccess(true);
            await load();
            setTimeout(() => setAddSuccess(false), 2500);
        } catch (e: any) {
            setAddError(e?.response?.data?.message || e?.message || "Erreur lors de l'ajout.");
        } finally { setAddLoading(false); }
    };

    const handleDelete = async (id: string) => {
        setDeleteId(id);
        try { await disponibiliteService.supprimer(id); await load(); }
        catch (e: any) { alert(e?.response?.data?.message || "Suppression impossible."); }
        finally { setDeleteId(null); }
    };

    const grouped = dispos.reduce<Record<string, Disponibilite[]>>((acc, d) => {
        (acc[d.date] = acc[d.date] || []).push(d); return acc;
    }, {});

    const inp: React.CSSProperties = { borderRadius: 8, border: "0.5px solid #EBEBEB", padding: "9px 12px", fontSize: 13, outline: "none", background: "#FAFAFA", width: "100%", boxSizing: "border-box" };

    return (
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>

            {/* ── Formulaire ── */}
            <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "0.5px solid #EBEBEB", flex: "0 0 268px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>
                    <i className="bi bi-plus-circle me-2" style={{ color: ACCENT }}></i>Nouveau créneau
                </h3>

                {addError && (
                    <div style={{ background: "#FEE2E2", color: "#991B1B", borderRadius: 8, padding: "8px 12px", fontSize: 12.5, marginBottom: 12 }}>
                        <i className="bi bi-exclamation-triangle me-2"></i>{addError}
                    </div>
                )}
                {addSuccess && (
                    <div style={{ background: "#D1FAE5", color: "#065F46", borderRadius: 8, padding: "8px 12px", fontSize: 12.5, marginBottom: 12 }}>
                        <i className="bi bi-check-circle me-2"></i>Créneau ajouté !
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#9E9E9E", display: "block", marginBottom: 5 }}>Date</label>
                        <input type="date" value={form.date} min={new Date().toISOString().slice(0, 10)}
                               onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inp} />
                    </div>
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#9E9E9E", display: "block", marginBottom: 5 }}>Heure début</label>
                        <input type="time" value={form.heureDebut}
                               onChange={e => setForm(f => ({ ...f, heureDebut: e.target.value }))} style={inp} />
                    </div>
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#9E9E9E", display: "block", marginBottom: 5 }}>Heure fin</label>
                        <input type="time" value={form.heureFin}
                               onChange={e => setForm(f => ({ ...f, heureFin: e.target.value }))} style={inp} />
                    </div>
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#9E9E9E", display: "block", marginBottom: 5 }}>Nombre max de patients</label>
                        <input type="number" min="1" max="50" value={form.nombreMaxPatients}
                               onChange={e => setForm(f => ({ ...f, nombreMaxPatients: e.target.value }))} style={inp} />
                    </div>
                    <button onClick={handleAdd} disabled={addLoading}
                            style={{ background: addLoading ? "#9E9E9E" : ACCENT, color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700, cursor: addLoading ? "not-allowed" : "pointer", fontSize: 13.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        {addLoading ? <><span className="spinner-border spinner-border-sm"></span> Ajout...</> : <><i className="bi bi-calendar-plus"></i> Ajouter</>}
                    </button>
                </div>

                <div style={{ marginTop: 18, padding: "12px 14px", background: "#FAFAFA", borderRadius: 10, border: "0.5px solid #EBEBEB" }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: "#9E9E9E", marginBottom: 8 }}>Légende</div>
                    {[{ color: "#D1FAE5", border: "#065F46", label: "Créneau libre" }, { color: "#FEE2E2", border: "#991B1B", label: "Créneau réservé" }].map(l => (
                        <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: l.color, border: `2px solid ${l.border}` }}></div>
                            <span style={{ fontSize: 12, color: "#6B6B6B" }}>{l.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Liste ── */}
            <div style={{ flex: 1, minWidth: 280 }}>
                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><div className="spinner-border" style={{ color: ACCENT }}></div></div>
                ) : dispos.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 14, border: "0.5px solid #EBEBEB", color: "#BDBDBD" }}>
                        <i className="bi bi-calendar-x" style={{ fontSize: 46 }}></i>
                        <div style={{ marginTop: 14, fontSize: 15, fontWeight: 500 }}>Aucun créneau renseigné</div>
                        <div style={{ fontSize: 13, marginTop: 8 }}>Ajoutez vos disponibilités pour que la secrétaire puisse planifier vos rendez-vous</div>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, list]) => (
                            <div key={date} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "0.5px solid #EBEBEB" }}>
                                <div style={{ background: "#FAFAFA", padding: "10px 18px", borderBottom: "0.5px solid #EBEBEB", display: "flex", alignItems: "center", gap: 10 }}>
                                    <i className="bi bi-calendar3" style={{ color: ACCENT, fontSize: 13 }}></i>
                                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>{fmtDate(date)}</span>
                                    <span style={{ background: `${ACCENT}18`, color: ACCENT, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>
                                        {list.filter(d => !d.estReserve).length} libre{list.filter(d => !d.estReserve).length > 1 ? "s" : ""}
                                        {list.some(d => d.estReserve) && ` · ${list.filter(d => d.estReserve).length} réservé${list.filter(d => d.estReserve).length > 1 ? "s" : ""}`}
                                    </span>
                                </div>
                                <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
                                    {list.sort((a, b) => a.heureDebut.localeCompare(b.heureDebut)).map(d => (
                                        <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, background: d.estReserve ? "#FFF8F8" : "#F0FDF4", border: `0.5px solid ${d.estReserve ? "#FECACA" : "#BBF7D0"}` }}>
                                            <div style={{ width: 34, height: 34, borderRadius: 9, background: d.estReserve ? "#FEE2E2" : "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <i className={`bi ${d.estReserve ? "bi-lock-fill" : "bi-unlock-fill"}`} style={{ fontSize: 15, color: d.estReserve ? "#991B1B" : "#065F46" }}></i>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "monospace" }}>{fmt(d.heureDebut)} – {fmt(d.heureFin)}</div>
                                                <div style={{ fontSize: 12, color: "#9E9E9E", marginTop: 2 }}>
                                                    {diffMin(d.heureDebut, d.heureFin)} min • {d.placesRestantes}/{d.nombreMaxPatients} places restantes
                                                </div>
                                            </div>
                                            <span style={{ background: d.estReserve ? "#FEE2E2" : "#D1FAE5", color: d.estReserve ? "#991B1B" : "#065F46", fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20 }}>
                                                {d.estReserve ? "Réservé" : "Libre"}
                                            </span>
                                            {!d.estReserve && (
                                                <button onClick={() => handleDelete(d.id)} disabled={deleteId === d.id}
                                                        style={{ background: "none", border: "0.5px solid #FECACA", color: "#991B1B", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 13 }} title="Supprimer">
                                                    {deleteId === d.id ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-trash3"></i>}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function MedecinAgenda() {
    const [medecin, setMedecin] = useState<Medecin | null>(null);
    const [tab, setTab]         = useState<"rdv" | "dispos">("rdv");

    useEffect(() => { medecinService.getMe().then(setMedecin).catch(console.error); }, []);

    const tabBtn = (active: boolean): React.CSSProperties => ({
        background: "none", border: "none", borderBottom: active ? `2.5px solid ${ACCENT}` : "2.5px solid transparent",
        color: active ? ACCENT : "#9E9E9E", fontWeight: active ? 700 : 500, fontSize: 14,
        padding: "10px 22px", cursor: "pointer", transition: "all 0.15s",
    });

    return (
        <DashboardLayout navItems={NAV} title="Mon agenda" accentColor={ACCENT}>
            <div style={{ borderBottom: "0.5px solid #EBEBEB", marginBottom: 20, display: "flex", gap: 4, background: "#fff", borderRadius: "12px 12px 0 0", padding: "0 12px" }}>
                <button onClick={() => setTab("rdv")} style={tabBtn(tab === "rdv")}>
                    <i className="bi bi-calendar-check me-2"></i>Rendez-vous
                </button>
                <button onClick={() => setTab("dispos")} style={tabBtn(tab === "dispos")}>
                    <i className="bi bi-clock-history me-2"></i>Mes disponibilités
                </button>
            </div>
            {tab === "rdv" ? <TabRdv medecin={medecin} /> : <TabDisponibilites medecin={medecin} />}
        </DashboardLayout>
    );
}