"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import meditrackLogo from "../../assets/logo.png";

const SPECIALITES = [
  { icon: "👂", name: "ORL", description: "Oreille, nez, gorge - consultations spécialisées" },
  { icon: "🦷", name: "Dentiste", description: "Soins dentaires, implants, orthodontie" },
  { icon: "👁️", name: "Ophtalmo", description: "Vision, cataracte, laser, lunettes" },
  { icon: "❤️", name: "Cardiologue", description: "Cœur, tension, prévention cardiovasculaire" },
  { icon: "🩺", name: "Pédiatre", description: "Suivi médical des enfants et nourrissons" },
  { icon: "🦴", name: "Orthopédie", description: "Os, articulations, traumatologie" },
  { icon: "🧠", name: "Neurologie", description: "Cerveau, nerfs, migraines, épilepsie" },
  { icon: "🤰", name: "Gynécologie", description: "Santé de la femme, grossesse, suivi" },
  { icon: "🧪", name: "Dermatologie", description: "Peau, cheveux, ongles, allergie" },
  { icon: "🏥", name: "Urgences", description: "Service d'urgence 24h/24 - 7j/7" },
  { icon: "💆", name: "Psychiatrie", description: "Santé mentale, bien-être psychologique" },
  { icon: "🩻", name: "Radiologie", description: "Imagerie médicale, scanners, IRM" },
  { icon: "💊", name: "Pharmacie", description: "Conseils pharmaceutiques, médicaments, ordonnances" },
  { icon: "🧘", name: "Kinésithérapie", description: "Rééducation, massage, physiothérapie" },
  { icon: "🩹", name: "Chirurgie", description: "Interventions chirurgicales et suivi post-opératoire" },
] as const;

interface Medecin {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
  disponible: boolean;
  hopital?: { nom: string };
}

type BotMessage = {
  wolof: string;
  french: string;
  isUser?: boolean;
  docCards?: Medecin[];
  specialtiesRow?: boolean;
  ctaRow?: boolean;
  typing?: boolean;
};

type VoiceCue = "accueil" | "auth" | "malade" | "noDoctor";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Nunito:wght@400;500;600;700&display=swap');

:root {
  --g1: #27A869;
  --g2: #1A7A52;
  --g-light: #E8F7EF;
  --txt: #12211A;
  --txt-mid: #4A6357;
  --txt-soft: #8AA898;
  --white: #FFFFFF;
  --radius: 20px;
  --shadow: 0 8px 32px rgba(27,122,82,.18);
}

.mtk-fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-family: 'Nunito', sans-serif;
}

.mtk-fab-btn {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--g1), var(--g2));
  border: none;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow);
  transition: transform .2s, box-shadow .2s;
  position: relative;
  margin-top: 8px;
}
.mtk-fab-btn:hover { transform: scale(1.09); box-shadow: 0 10px 28px rgba(27,122,82,.38); }
.mtk-fab-btn:active { transform: scale(0.95); }

.mtk-pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(39,168,105,.28);
  animation: mtkPulse 2.4s ease-out infinite;
  pointer-events: none;
}
@keyframes mtkPulse {
  0%   { transform: scale(1);   opacity: .7; }
  70%  { transform: scale(1.6); opacity: 0;  }
  100% { transform: scale(1.6); opacity: 0;  }
}

.mtk-welcome-bubble {
  background: var(--white);
  border-radius: 18px 18px 4px 18px;
  padding: 12px 16px;
  box-shadow: 0 8px 28px rgba(27,122,82,.2);
  max-width: 250px;
  min-width: 190px;
  border: 1.5px solid rgba(39,168,105,.2);
  transform-origin: bottom right;
  animation: mtkBubbleIn .45s cubic-bezier(.22,.68,0,1.25) forwards;
  cursor: pointer;
  position: relative;
}
.mtk-welcome-bubble::after {
  content: '';
  position: absolute;
  bottom: -8px;
  right: 22px;
  border: 8px solid transparent;
  border-top-color: var(--white);
  border-bottom: none;
}
@keyframes mtkBubbleIn {
  0%   { opacity: 0; transform: scale(.6) translateY(10px); }
  100% { opacity: 1; transform: scale(1)  translateY(0);    }
}
.mtk-bubble-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--g1);
  margin-right: 6px;
  animation: mtkBlink 1.6s ease infinite;
  vertical-align: middle;
}
@keyframes mtkBlink { 0%,100%{opacity:1} 50%{opacity:.3} }
.mtk-bubble-wolof {
  font-family: 'Syne', sans-serif;
  font-size: .82rem;
  font-weight: 700;
  color: var(--txt);
  line-height: 1.35;
}
.mtk-bubble-french {
  font-size: .72rem;
  color: var(--txt-mid);
  font-style: italic;
  margin-top: 4px;
}

.mtk-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10,20,15,.55);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 0 28px 108px 0;
  animation: mtkFadeIn .22s ease;
}
@keyframes mtkFadeIn { from { opacity:0 } to { opacity:1 } }

.mtk-panel {
  width: 390px;
  max-width: calc(100vw - 32px);
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: 0 24px 64px rgba(10,20,15,.28);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 82vh;
  animation: mtkSlideUp .28s cubic-bezier(.22,.68,0,1.2);
  font-family: 'Nunito', sans-serif;
}
@keyframes mtkSlideUp {
  from { opacity:0; transform: translateY(40px) scale(.96) }
  to   { opacity:1; transform: translateY(0)    scale(1)   }
}

.mtk-header {
  background: linear-gradient(135deg, var(--g1) 0%, var(--g2) 100%);
  padding: 18px 20px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.mtk-avatar {
  width: 74px;
  height: 74px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid rgba(255,255,255,.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(0,0,0,.12);
}
.mtk-avatar img {
  width: 99%;
  height: 99%;
  object-fit: contain;
}
.mtk-header-name {
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}
.mtk-header-status {
  font-size: 0.75rem;
  color: rgba(255,255,255,.82);
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
}
.mtk-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #7EF5A8;
  animation: mtkBlink 1.8s ease infinite;
}

.mtk-icon-btn {
  background: rgba(255,255,255,.18) !important;
  border: 1px solid rgba(255,255,255,.3) !important;
  border-radius: 8px !important;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff !important;
  transition: background .15s;
  padding: 0 !important;
}
.mtk-icon-btn:hover { background: rgba(255,255,255,.3) !important; }
.mtk-icon-btn.muted { background: rgba(255,80,80,.35) !important; border-color: rgba(255,80,80,.5) !important; }

.mtk-body {
  flex: 1;
  overflow-y: auto;
  padding: 18px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  scrollbar-width: thin;
  scrollbar-color: #C8E8D4 transparent;
}

.mtk-msg {
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: mtkMsgIn .3s ease;
}
@keyframes mtkMsgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

.mtk-msg-bubble {
  background: var(--g-light);
  border-radius: 14px 14px 14px 4px;
  padding: 12px 16px;
  max-width: 94%;
  align-self: flex-start;
}
.mtk-msg-wolof {
  font-size: .95rem;
  font-weight: 700;
  color: var(--txt);
  line-height: 1.45;
}
.mtk-msg-french {
  font-size: .78rem;
  color: var(--txt-mid);
  font-style: italic;
  margin-top: 5px;
  padding-top: 5px;
  border-top: 1px solid rgba(39,168,105,.15);
  line-height: 1.4;
}
.mtk-msg.mtk-user .mtk-msg-bubble {
  background: linear-gradient(135deg, var(--g1), var(--g2));
  border-radius: 14px 14px 4px 14px;
  align-self: flex-end;
  margin-left: auto;
}
.mtk-msg.mtk-user .mtk-msg-wolof { color: #fff; font-weight: 600; }

.mtk-typing { display: flex; gap: 5px; padding: 4px 2px; }
.mtk-typing span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--g1);
  animation: mtkDot 1.2s ease infinite;
}
.mtk-typing span:nth-child(2) { animation-delay: .2s }
.mtk-typing span:nth-child(3) { animation-delay: .4s }
@keyframes mtkDot {
  0%,80%,100% { transform:scale(.6); opacity:.4 }
  40%         { transform:scale(1);  opacity:1  }
}

.mtk-doc-cards { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
.mtk-doc-card {
  background: var(--white);
  border: 1.5px solid rgba(39,168,105,.18);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: box-shadow .18s, border-color .18s;
}
.mtk-doc-card:hover { box-shadow: 0 4px 16px rgba(39,168,105,.14); border-color: var(--g1); }
.mtk-doc-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--g1), var(--g2));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: .9rem;
  flex-shrink: 0;
}
.mtk-doc-info { flex: 1; min-width: 0; }
.mtk-doc-name { font-size: .85rem; font-weight: 700; color: var(--txt); }
.mtk-doc-spec { font-size: .72rem; color: var(--txt-mid); }
.mtk-doc-hop  { font-size: .7rem; color: var(--txt-soft); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mtk-dispo-badge {
  font-size: .68rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 20px;
  background: #E8F7EF;
  color: var(--g2);
  white-space: nowrap;
}

.mtk-cta-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
.mtk-cta {
  flex: 1;
  min-width: 120px;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: .82rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all .18s;
  font-family: 'Nunito', sans-serif;
  text-align: center;
}
.mtk-cta-primary {
  background: linear-gradient(135deg, var(--g1), var(--g2));
  color: #fff;
  box-shadow: 0 4px 12px rgba(39,168,105,.25);
}
.mtk-cta-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(39,168,105,.35); }
.mtk-cta-outline {
  background: transparent;
  color: var(--g2);
  border: 1.5px solid rgba(39,168,105,.4) !important;
}
.mtk-cta-outline:hover { background: var(--g-light); }

.mtk-spec-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
.mtk-spec-btn {
  border: 1px solid rgba(39,168,105,.35);
  background: #fff;
  color: var(--g2);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: .76rem;
  font-weight: 700;
  cursor: pointer;
}
.mtk-spec-btn:hover {
  background: var(--g-light);
}

.mtk-spec-note {
  font-size: .72rem;
  color: var(--txt-soft);
  margin-top: 4px;
}

.mtk-error-bubble {
  background: #fff3f3;
  border: 1.5px solid #ffcccc;
  border-radius: 14px;
  padding: 10px 14px;
  font-size: .82rem;
  color: #c0392b;
  font-family: 'Nunito', sans-serif;
}

.mtk-input-row {
  padding: 12px 14px;
  background: #F8FAF9;
  border-top: 1px solid rgba(39,168,105,.1);
  display: flex;
  gap: 8px;
  align-items: center;
}
.mtk-input {
  flex: 1;
  border: 1.5px solid rgba(39,168,105,.25) !important;
  border-radius: 12px !important;
  padding: 10px 14px;
  font-size: .88rem;
  font-family: 'Nunito', sans-serif;
  color: var(--txt);
  background: var(--white);
  outline: none;
  transition: border-color .18s;
  box-shadow: none !important;
}
.mtk-input:focus { border-color: var(--g1) !important; }
.mtk-input::placeholder { color: var(--txt-soft); }
.mtk-input:disabled { opacity: .6; cursor: not-allowed; }

.mtk-send-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--g1), var(--g2));
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform .15s, opacity .15s;
}
.mtk-send-btn:hover { transform: scale(1.07); }
.mtk-send-btn:disabled { opacity: .45; cursor: not-allowed; transform: none; }

.mtk-footer {
  text-align: center;
  padding: 8px 0 10px;
  font-size: .7rem;
  color: var(--txt-soft);
  font-family: 'Nunito', sans-serif;
  border-top: 1px solid rgba(39,168,105,.08);
}

@media (max-width: 480px) {
  .mtk-overlay { padding: 0; justify-content: center; align-items: flex-end; }
  .mtk-panel { width: 100%; border-radius: 20px 20px 0 0; max-height: 88vh; }
  .mtk-welcome-bubble { max-width: 200px; }
}
`;

const localVoiceFiles = import.meta.glob("../../assets/voices/*.mp3", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const VOICE_CUES: Record<VoiceCue, string> = {
  accueil:
    localVoiceFiles["../../assets/voices/1-accueil.mp3"] ?? "/voices/1-accueil.mp3",
  auth:
    localVoiceFiles["../../assets/voices/2-connexion-inscription.mp3"] ?? "/voices/2-connexion-inscription.mp3",
  malade:
    localVoiceFiles["../../assets/voices/3-si-vous-etes-malade.mp3"] ?? "/voices/3-si-vous-etes-malade.mp3",
  noDoctor:
    localVoiceFiles["../../assets/voices/4-aucun-medecin-dispo.mp3"] ?? "/voices/4-aucun-medecin-dispo.mp3",
};

// ─────────────────────────────────────────────────────────────────────────────
// useSpeech — FIX: audioRef tracks the current HTMLAudioElement so stop()
//             can pause it immediately (speechSynthesis.cancel() only covers
//             the TTS fallback, not the MP3 files played via new Audio()).
// ─────────────────────────────────────────────────────────────────────────────
function useSpeech(muted: boolean) {
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const audioRef = useRef<HTMLAudioElement | null>(null); // ← NEW

  useEffect(() => {
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      const femaleLike = voices.find((v) =>
        /fr|french/i.test(v.lang) &&
        /female|femme|hortense|julie|claire|audrey/i.test(v.name)
      );
      voiceRef.current =
        femaleLike ??
        voices.find((v) => /fr|french/i.test(v.lang)) ??
        voices[0];
    };
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const playCue = useCallback(
    (cue: VoiceCue, fallbackText?: string) => {
      if (muted) return Promise.resolve();
      queueRef.current = queueRef.current.then(
        () =>
          new Promise<void>((resolve) => {
            const fallbackSpeak = () => {
              if (!fallbackText?.trim()) return resolve();
              const utterance = new SpeechSynthesisUtterance(fallbackText);
              utterance.voice = voiceRef.current;
              utterance.lang = voiceRef.current?.lang ?? "fr-FR";
              utterance.rate = 0.86;
              utterance.pitch = 1.03;
              utterance.onend = () => resolve();
              utterance.onerror = () => resolve();
              window.speechSynthesis.speak(utterance);
            };

            const audio = new Audio(VOICE_CUES[cue]);
            audioRef.current = audio; // ← NEW: track current audio
            audio.onended = () => {
              audioRef.current = null; // ← NEW: clear when done
              resolve();
            };
            audio.onerror = fallbackSpeak;
            audio.play().catch(fallbackSpeak);
          })
      );
      return queueRef.current;
    },
    [muted]
  );

  // FIX: also pause the current MP3 (not only the TTS synth)
  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {           // ← NEW
      audioRef.current.pause();       // ← NEW
      audioRef.current.currentTime = 0; // ← NEW
      audioRef.current = null;        // ← NEW
    }
    queueRef.current = Promise.resolve();
  }, []);

  return { playCue, stop };
}

const SPECIALTY_KEYWORDS: Record<string, string[]> = {
  ORL: ["orl", "oreille", "nez", "gorge", "sinus", "angine"],
  Dentiste: ["dent", "dentaire", "carie", "gingivite", "implant"],
  Ophtalmo: ["oeil", "yeux", "vision", "lunette", "cataracte"],
  Cardiologue: ["coeur", "tension", "cardio", "poitrine", "palpitation"],
  "Pédiatre": ["enfant", "bébé", "nourrisson", "pediatre", "pédiatre"],
  Orthopédie: ["os", "articulation", "fracture", "genou", "dos", "orthopedie"],
  Neurologie: ["migraine", "epilepsie", "nerf", "cerveau", "neurologie"],
  Gynécologie: ["grossesse", "femme", "gyneco", "gynéco", "regles"],
  Dermatologie: ["peau", "allergie", "acne", "eczema", "cheveux", "ongles"],
  Urgences: ["urgence", "grave", "sang", "accident"],
  Psychiatrie: ["stress", "depression", "dépression", "anxiete", "anxiété", "mental"],
  Radiologie: ["irm", "scanner", "radio", "imagerie"],
  Pharmacie: ["medicament", "médicament", "ordonnance", "pharmacie"],
  Kinésithérapie: ["kine", "kiné", "reeducation", "rééducation", "massage"],
  Chirurgie: ["chirurgie", "operation", "opération", "chirurgien"],
};

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const normalize = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const SPECIALTY_ALIASES: Record<string, string[]> = {
  ORL: ["orl"],
  Dentiste: ["dentiste", "odontologie", "dentaire"],
  Ophtalmo: ["ophtalmo", "ophtalmologie"],
  Cardiologue: ["cardiologue", "cardiologie"],
  Pédiatre: ["pediatre", "pédiatre", "pediatrie", "pédiatrie"],
  Orthopédie: ["orthopedie", "orthopédie"],
  Neurologie: ["neurologie"],
  Gynécologie: ["gynecologie", "gynécologie"],
  Dermatologie: ["dermatologie"],
  Urgences: ["urgences", "urgence"],
  Psychiatrie: ["psychiatrie"],
  Radiologie: ["radiologie"],
  Pharmacie: ["pharmacie"],
  Kinésithérapie: ["kinesitherapie", "kinésithérapie", "kine", "kiné"],
  Chirurgie: ["chirurgie", "chirurgien", "operation", "opération"],
};

function matchSpecialite(backendSpecialite: string, detectedSpecialite: string): boolean {
  const backend = normalize(backendSpecialite);
  const target = normalize(detectedSpecialite);
  if (backend === target || backend.includes(target) || target.includes(backend)) return true;
  const aliases = SPECIALTY_ALIASES[detectedSpecialite] ?? [detectedSpecialite];
  return aliases.some((alias) => {
    const normAlias = normalize(alias);
    return backend === normAlias || backend.includes(normAlias);
  });
}

async function fetchMedecinsDisponibles(detectedSpecialite: string): Promise<Medecin[]> {
  try {
    const res = await fetch(`${API_BASE}/medecins/disponibles`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Medecin[] = await res.json();
    return data.filter((m) => m.disponible && matchSpecialite(m.specialite, detectedSpecialite));
  } catch {
    return [];
  }
}

function detectSpecialite(input: string): string | null {
  const normalizedInput = normalize(input);
  const byName = SPECIALITES.find((s) => normalizedInput.includes(normalize(s.name)));
  if (byName) return byName.name;

  for (const [specialite, keywords] of Object.entries(SPECIALTY_KEYWORDS)) {
    if (keywords.some((keyword) => normalizedInput.includes(normalize(keyword))))
      return specialite;
  }
  return null;
}

const INTRO_STEPS = [
  {
    wolof: "Asalaam maalekum, dalal ak jamm ci Meditrack.",
    french:
      "Meditrack est une plateforme de santé qui vous aide à trouver le bon spécialiste rapidement.",
    cue: "accueil" as VoiceCue,
    delay: 400,
  },
  {
    wolof:
      "Ngir tambali, bësal ci S'inscrire ngir sos sa kont, wala Se connecter ngir dugg ci sa espace.",
    french:
      "Pour continuer, cliquez sur S'inscrire si vous êtes nouveau, sinon cliquez sur Se connecter.",
    cue: "auth" as VoiceCue,
    delay: 2800,
  },
  {
    wolof:
      "Boo feebar, tànnal spécialité bi ci liiste bi, ma won la dokter yi ñuy disponible.",
    french: "Sélectionnez une spécialité ci-dessous pour voir les médecins disponibles.",
    cue: "malade" as VoiceCue,
    delay: 5400,
  },
];

export default function ChatbotButton() {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [logoMissing, setLogoMissing] = useState(false);
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [introsDone, setIntrosDone] = useState(false);

  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { playCue, stop } = useSpeech(muted);

  useEffect(() => {
    const t1 = setTimeout(() => setShowBubble(true), 1200);
    return () => clearTimeout(t1);
  }, []);

  const scrollBottom = () =>
    setTimeout(
      () =>
        bodyRef.current?.scrollTo({
          top: bodyRef.current.scrollHeight,
          behavior: "smooth",
        }),
      80
    );

  const addMessage = useCallback((msg: BotMessage, typingDelay = 1000) => {
    return new Promise<void>((resolve) => {
      setMessages((p) => [...p, { wolof: "", french: "", typing: true }]);
      scrollBottom();
      setTimeout(() => {
        setMessages((p) => {
          const next = [...p];
          next[next.length - 1] = { ...msg, typing: false };
          return next;
        });
        scrollBottom();
        resolve();
      }, typingDelay);
    });
  }, []);

  const runIntros = useCallback(async () => {
    for (const step of INTRO_STEPS) {
      await new Promise<void>((r) =>
        setTimeout(
          r,
          step.delay -
            (INTRO_STEPS.indexOf(step) > 0
              ? INTRO_STEPS[INTRO_STEPS.indexOf(step) - 1].delay
              : 0)
        )
      );
      await addMessage({ wolof: step.wolof, french: step.french }, 1200);
      await playCue(step.cue, step.french);
    }
    await addMessage(
      {
        wolof: "Spécialités disponibles :",
        french: "Choisissez une spécialité pour continuer.",
        specialtiesRow: true,
      },
      600
    );
    setIntrosDone(true);
    setTimeout(() => inputRef.current?.focus(), 200);
  }, [addMessage, playCue]);

  // FIX: stop() resets both TTS and MP3 before restarting intros
  const handleOpen = () => {
    stop(); // ← ensure any in-progress audio (MP3 or TTS) stops cleanly
    setOpen(true);
    setShowBubble(false);
    setMessages([]);
    setInputValue("");
    setIntrosDone(false);
    setTimeout(() => runIntros(), 300);
  };

  // FIX: handleClose calls stop() — now stops MP3 too (not only TTS)
  const handleClose = () => {
    stop();
    setOpen(false);
  };

  const submitUserMessage = async (rawValue: string) => {
    const val = rawValue.trim();
    if (!val || loading || !introsDone) return;

    setLoading(true);
    setMessages((p) => [...p, { wolof: val, french: val, isUser: true }]);
    scrollBottom();

    const specialite = detectSpecialite(val);
    const asksAuth = /inscrire|inscription|connect|login|compte/.test(normalize(val));

    if (asksAuth) {
      const reply = {
        wolof: "Mën nga sos sa kont ci S'inscrire, wala dugg ci sa espace ci Se connecter.",
        french:
          "Cliquez sur S'inscrire pour créer un compte, puis Se connecter pour continuer.",
        specialtiesRow: true,
        ctaRow: true,
      };
      await addMessage(reply, 800);
      await playCue("auth", reply.french);
    } else if (specialite) {
      const medecins = await fetchMedecinsDisponibles(specialite);
      const reply = medecins.length
        ? {
            wolof: `Baax na. Spécialité bi mooy ${specialite}. Ñii laay won, dokteer yi disponible.`,
            french: `Spécialité détectée : ${specialite}. Voici les médecins disponibles.`,
            docCards: medecins,
            specialtiesRow: true,
            ctaRow: true,
          }
        : {
            wolof: `Ma xam ne ${specialite} la, waaye fi yoon wi amul dokteer bu disponible.`,
            french: `Spécialité détectée : ${specialite}. Aucun médecin disponible actuellement.`,
            specialtiesRow: true,
            ctaRow: true,
          };
      await addMessage(reply, 800);
      if (medecins.length === 0) {
        await playCue("noDoctor", reply.french);
      }
    } else {
      const summary = SPECIALITES.slice(0, 6)
        .map((s) => s.name)
        .join(", ");
      const reply = {
        wolof: "Ma gisul spécialité bi. Tànnal benn ci liiste bi, ma gindee la ci yoon wi.",
        french: `Spécialités disponibles: ${summary}, et plus. Dites-en une pour afficher le médecin adapté.`,
        specialtiesRow: true,
      };
      await addMessage(reply, 800);
    }

    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = async () => {
    const current = inputValue;
    setInputValue("");
    await submitUserMessage(current);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  const handleSpecialtyClick = async (specialite: string) => {
    await submitUserMessage(specialite);
  };

  return (
    <>
      <style>{CSS}</style>

      <div className="mtk-fab">
        {showBubble && !open && (
          <div className="mtk-welcome-bubble" onClick={handleOpen}>
            <div className="mtk-bubble-wolof">
              <span className="mtk-bubble-dot" />
              Besoin d'aide ? Cliquez ici 👋
            </div>
            <div className="mtk-bubble-french">
              Discutez avec l'assistante Meditrack.
            </div>
          </div>
        )}

        <button
          className="mtk-fab-btn"
          onClick={handleOpen}
          aria-label="Ouvrir l'assistant Meditrack"
        >
          <span className="mtk-pulse" />
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="mtk-overlay" onClick={handleClose}>
          <div className="mtk-panel" onClick={(e) => e.stopPropagation()}>
            {/* ── Header ── */}
            <div className="mtk-header">
              <div className="mtk-avatar">
                {!logoMissing ? (
                  <img
                    src={meditrackLogo}
                    alt="Logo Meditrack"
                    onError={() => setLogoMissing(true)}
                  />
                ) : (
                  <span style={{ color: "#fff", fontWeight: 700 }}>M</span>
                )}
              </div>
              <div className="flex-grow-1">
                <p className="mtk-header-name">Assistante Meditrack</p>
                <div className="mtk-header-status">
                  <span className="mtk-status-dot" />
                  {loading ? "En train de répondre..." : "En ligne · Wolof & Français"}
                </div>
              </div>
              <div className="d-flex gap-2">
                <button
                  className={`btn mtk-icon-btn ${muted ? "muted" : ""}`}
                  onClick={() => {
                    setMuted((m) => !m);
                    if (!muted) stop();
                  }}
                  title={muted ? "Activer la voix" : "Couper la voix"}
                >
                  {muted ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  )}
                </button>
                <button
                  className="btn mtk-icon-btn"
                  onClick={handleClose}
                  title="Fermer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div className="mtk-body" ref={bodyRef}>
              {messages.map((msg, i) => (
                <div key={i} className={`mtk-msg ${msg.isUser ? "mtk-user" : ""}`}>
                  <div className="mtk-msg-bubble">
                    {msg.typing ? (
                      <div className="mtk-typing">
                        <span /><span /><span />
                      </div>
                    ) : (
                      <>
                        <div className="mtk-msg-wolof">{msg.wolof}</div>
                        {!msg.isUser && msg.french && (
                          <div className="mtk-msg-french">🇫🇷 {msg.french}</div>
                        )}
                      </>
                    )}
                  </div>

                  {msg.docCards && msg.docCards.length > 0 && (
                    <div className="mtk-doc-cards">
                      {msg.docCards.map((d) => (
                        <div key={d.id} className="mtk-doc-card">
                          <div className="mtk-doc-avatar">
                            {d.prenom[0]}{d.nom[0]}
                          </div>
                          <div className="mtk-doc-info">
                            <div className="mtk-doc-name">
                              Dr. {d.prenom} {d.nom}
                            </div>
                            <div className="mtk-doc-spec">🩺 {d.specialite}</div>
                            {d.hopital && (
                              <div className="mtk-doc-hop">🏥 {d.hopital.nom}</div>
                            )}
                          </div>
                          <span className="mtk-dispo-badge">✓ Dispo</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.ctaRow && (
                    <div className="mtk-cta-row">
                      <button
                        className="mtk-cta mtk-cta-primary"
                        onClick={() => {
                          handleClose();
                          window.location.href = "/register";
                        }}
                      >
                        ✍️ S'inscrire
                      </button>
                      <button
                        className="mtk-cta mtk-cta-outline"
                        onClick={() => {
                          handleClose();
                          window.location.href = "/login";
                        }}
                      >
                        🔐 Se connecter
                      </button>
                    </div>
                  )}

                  {msg.specialtiesRow && (
                    <>
                      <div className="mtk-spec-row">
                        {SPECIALITES.map((s) => (
                          <button
                            key={s.name}
                            className="mtk-spec-btn"
                            onClick={() => handleSpecialtyClick(s.name)}
                          >
                            {s.icon} {s.name}
                          </button>
                        ))}
                      </div>
                      <div className="mtk-spec-note">
                        Choisissez simplement une spécialité, sans rien saisir.
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* ── Input ── */}
            <div className="mtk-input-row">
              <input
                ref={inputRef}
                className="form-control mtk-input"
                placeholder={
                  introsDone
                    ? "Choisissez une spécialité dans la liste ou tapez-en une..."
                    : "Patientez..."
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKey}
                disabled={loading || !introsDone}
              />
              <button
                className="mtk-send-btn"
                onClick={handleSend}
                disabled={!inputValue.trim() || loading || !introsDone}
              >
                {loading ? (
                  <div
                    className="spinner-border spinner-border-sm text-white"
                    style={{ width: 16, height: 16, borderWidth: 2 }}
                  />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
              </button>
            </div>

            <div className="mtk-footer">✨ Assistante Meditrack</div>
          </div>
        </div>
      )}
    </>
  );
}