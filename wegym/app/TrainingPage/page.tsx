"use client";

import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, Timer, RotateCcw, Zap, CheckCircle2,
  Trophy, X, ChevronRight, ChevronDown, Activity,
  BrainCircuit, User, Plus, Flame, Utensils,
  Bike, Footprints, HeartPulse, Sword, LayoutGrid, History,
} from 'lucide-react';

type TrainingModalityId = 'gym' | 'cycling' | 'running' | 'aerobic' | 'combat';

const MODALITY_OPTIONS: {
  id: TrainingModalityId;
  label: string;
  short: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  showDistance: boolean;
}[] = [
  { id: 'gym', label: 'Musculação & academia', short: 'Academia', Icon: Dumbbell, showDistance: false },
  { id: 'cycling', label: 'Ciclismo', short: 'Bike', Icon: Bike, showDistance: true },
  { id: 'running', label: 'Corrida', short: 'Run', Icon: Footprints, showDistance: true },
  { id: 'aerobic', label: 'Aeróbico & cardio', short: 'Aeróbico', Icon: HeartPulse, showDistance: false },
  { id: 'combat', label: 'Luta & artes marciais', short: 'Luta', Icon: Sword, showDistance: false },
];

interface ModalitySessionEntry {
  id: string;
  at: string;
  durationSec: number;
  distanceKm?: number;
}

const MODALITY_STORAGE_KEY = 'wegym-modality-sessions-v1';



const ExerciseItem = memo(({ ex, isCompleted, onToggle }: { ex: Exercise, isCompleted: boolean, onToggle: (id: string) => void }) => (
  <div className="p-5 flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <button 
        onClick={() => ex.id && onToggle(ex.id)} 
        className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-colors cursor-pointer ${isCompleted ? 'bg-emerald-500 border-emerald-400' : 'bg-zinc-950 border-zinc-800'}`}
      >
        {isCompleted && <CheckCircle2 size={18} className="text-zinc-950" />}
      </button>
      <div>
        <p className={`font-black uppercase italic text-sm ${isCompleted ? 'text-zinc-600 line-through' : 'text-white'}`}>{ex.name}</p>
        <p className="text-[10px] text-orange-500 font-bold">{ex.muscle} • {ex.sets}x{ex.reps}</p>
      </div>
    </div>
    <input type="number" placeholder="KG" className="bg-zinc-950 border border-white/5 w-16 p-2 rounded-lg text-xs font-bold text-center outline-none focus:border-orange-500 text-white" />
  </div>
));
ExerciseItem.displayName = 'ExerciseItem';



interface Exercise {
  id?: string;
  name: string;
  sets: number | string;
  reps: string;
  muscle: string;
  obs: string;
}

interface DayPlan {
  day: string;
  target: string;
  muscles: string[];
  duration: string;
  calories: string;
  exercises: Exercise[];
}

const ALL_AVAILABLE_EXERCISES: Exercise[] = [
  { name: "Supino Reto c/ Barra", sets: 4, reps: "8-10", muscle: "Peito", obs: "Foco em carga" },
  { name: "Supino Inclinado Halter", sets: 3, reps: "12", muscle: "Peito", obs: "Peito superior" },
  { name: "Crucifixo Máquina (Peck Deck)", sets: 3, reps: "15", muscle: "Peito", obs: "Foco em isolamento" },
  { name: "Puxada Frontal Aberta", sets: 4, reps: "10-12", muscle: "Costas", obs: "Foco latíssimo" },
  { name: "Remada Curvada Pronada", sets: 3, reps: "10", muscle: "Costas", obs: "Tronco inclinado" },
  { name: "Desenvolvimento Militar", sets: 3, reps: "10", muscle: "Ombros", obs: "Ombros estáveis" },
  { name: "Elevação Lateral", sets: 4, reps: "15", muscle: "Ombros", obs: "Braços esticados" },
  { name: "Rosca Direta Barra W", sets: 4, reps: "10", muscle: "Bíceps", obs: "Sem balançar" },
  { name: "Tríceps Corda", sets: 3, reps: "12-15", muscle: "Tríceps", obs: "Pico de contração" },
  { name: "Agachamento Livre", sets: 4, reps: "8-10", muscle: "Pernas", obs: "Amplitude máxima" },
  { name: "Leg Press 45º", sets: 3, reps: "12", muscle: "Pernas", obs: "Pés largura ombro" },
  { name: "Cadeira Extensora", sets: 4, reps: "15", muscle: "Pernas", obs: "Quadríceps" },
  { name: "Panturrilha em Pé", sets: 5, reps: "20", muscle: "Panturrilha", obs: "Alongue bem" },
  { name: "Prancha Abdominal", sets: 3, reps: "1 min", muscle: "Core", obs: "Core travado" }
];

const INITIAL_WEEKLY_PLAN: DayPlan[] = [
  { day: "Dom", target: "Descanso Total", muscles: [], duration: "0 min", calories: "0", exercises: [] },
  { day: "Seg", target: "Push (Peito/Ombro/Tríceps)", muscles: ["Peito", "Ombros", "Tríceps"], duration: "65 min", calories: "480", exercises: [] },
  { day: "Ter", target: "Pull (Costas/Bíceps)", muscles: ["Costas", "Bíceps"], duration: "70 min", calories: "510", exercises: [] },
  { day: "Qua", target: "Legs (Inferiores)", muscles: ["Pernas", "Panturrilha"], duration: "75 min", calories: "600", exercises: [] },
  { day: "Qui", target: "Cardio e Core", muscles: ["Core"], duration: "40 min", calories: "300", exercises: [] },
  { day: "Sex", target: "Upper Body", muscles: ["Peito", "Costas", "Ombros"], duration: "60 min", calories: "450", exercises: [] },
  { day: "Sáb", target: "Lower Body", muscles: ["Pernas"], duration: "65 min", calories: "550", exercises: [] }
];

function formatClock(totalSec: number) {
  const t = Math.max(0, totalSec);
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatDurationHMS(totalSec: number) {
  const t = Math.max(0, totalSec);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return formatClock(t);
}

function parseKmInput(s: string): number | null {
  const t = s.replace(',', '.').trim();
  if (!t) return null;
  const n = parseFloat(t);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function suggestedBlock(km: number, modality: 'cycling' | 'running') {
  if (modality === 'running') {
    const minTimeSec = Math.round(km * 4.5 * 60);
    const maxTimeSec = Math.round(km * 7 * 60);
    return { minTimeSec, maxTimeSec, minHint: '~4:30 /km', maxHint: '~7:00 /km' };
  }
  const vFast = 32;
  const vSlow = 18;
  return {
    minTimeSec: Math.round((km / vFast) * 3600),
    maxTimeSec: Math.round((km / vSlow) * 3600),
    minHint: `~${vFast} km/h`,
    maxHint: `~${vSlow} km/h`,
  };
}

export default function TrainingPage() {
  const router = useRouter();
  const [activeDay, setActiveDay] = useState(new Date().getDay());
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [userPlans, setUserPlans] = useState<DayPlan[]>(INITIAL_WEEKLY_PLAN);
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiStep, setAiStep] = useState<'initial' | 'diet_goal' | 'workout_goal' | 'add_manual' | 'result'>('initial');

  const [trainingModality, setTrainingModality] = useState<TrainingModalityId>('gym');
  const [modalityMenuOpen, setModalityMenuOpen] = useState(false);
  const [sessionSec, setSessionSec] = useState(0);
  const [sessionRun, setSessionRun] = useState(false);
  const [distanceKm, setDistanceKm] = useState('');
  /** metas corrida/ciclismo: ritmo mín = menor tempo (mais intenso), ritmo máx = maior tempo (mais leve) */
  const [paceChoice, setPaceChoice] = useState<'min' | 'max' | null>(null);
  const [sessionCountdownActive, setSessionCountdownActive] = useState(false);
  const [initialCountdownSec, setInitialCountdownSec] = useState(0);
  const [modalityHistory, setModalityHistory] = useState<Record<TrainingModalityId, ModalitySessionEntry[]>>({
    gym: [],
    cycling: [],
    running: [],
    aerobic: [],
    combat: [],
  });
  const modalityMenuRef = useRef<HTMLDivElement>(null);

  const timerActiveRef = useRef(timerActive);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const currentModalityMeta = useMemo(
    () => MODALITY_OPTIONS.find((m) => m.id === trainingModality) ?? MODALITY_OPTIONS[0],
    [trainingModality],
  );

  const runOrBikeSuggest = useMemo(() => {
    if (trainingModality !== 'running' && trainingModality !== 'cycling') return null;
    const km = parseKmInput(distanceKm);
    if (km == null) return null;
    return suggestedBlock(km, trainingModality);
  }, [distanceKm, trainingModality]);

  const currentPlan = useMemo(() => userPlans[activeDay], [userPlans, activeDay]);
  
  const progressPercentage = useMemo(() => {
    const totalExercises = currentPlan.exercises.length;
    if (totalExercises === 0) return 0;
    const completedExercises = currentPlan.exercises.filter(ex => ex.id && completedIds.includes(ex.id)).length;
    return Math.round((completedExercises / totalExercises) * 100);
  }, [currentPlan.exercises, completedIds]);

  useEffect(() => {
    router.prefetch('/ProfilePage');
  }, [router]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MODALITY_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, ModalitySessionEntry[]>;
      setModalityHistory({
        gym: [],
        cycling: parsed.cycling ?? [],
        running: parsed.running ?? [],
        aerobic: parsed.aerobic ?? [],
        combat: parsed.combat ?? [],
      });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    timerActiveRef.current = timerActive;
  }, [timerActive]);

  const generateFullDiet = useCallback(async (goal: 'cut' | 'bulk') => {
    setAiLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Reduzi o delay artificial

    const content = goal === 'cut' 
      ? "🍎 DIETA EMAGRECIMENTO (DÉFICIT)\n\nREFEIÇÕES DIÁRIAS (SEG-DOM):\n• Café: 2 Ovos mexidos + 1 fatia de pão integral ou fruta.\n• Lanche: 1 Iogurte desnatado ou 10 amêndoas.\n• Almoço: 150g Frango/Tilápia + 3 col. Arroz integral + Mix de folhas e Brócolis.\n• Tarde: 1 Maçã ou 1 ovo cozido.\n• Jantar: 150g Peixe branco ou Omelete + Abobrinha e Salada verde.\n\n🛒 LISTA DE COMPRAS:\nOvos, Peito de Frango, Filé de Tilápia, Mix de Folhas, Brócolis, Arroz Integral, Maçã e Iogurte Desnatado."
      : "💪 DIETA HIPERTROFIA (SUPERÁVIT)\n\nREFEIÇÕES DIÁRIAS (SEG-DOM):\n• Café: 3 Ovos + 2 fatias de Pão Integral + 1 Banana com Aveia.\n• Lanche: Shake de Proteína ou Sanduíche de Frango com Queijo.\n• Almoço: 200g Carne moída (Patinho) + 200g Arroz + Feijão + Salada.\n• Tarde: Batata doce (150g) + 150g de Frango grelhado.\n• Jantar: 200g de Massa Integral ou Arroz + 150g de Proteína + Vegetais.\n\n🛒 LISTA DE COMPRAS:\nPatinho moído, Peito de Frango, Ovos, Arroz, Feijão, Macarrão Integral, Batata Doce, Aveia, Bananas e Pasta de Amendoim.";

    setAiResponse(content);
    setAiStep('result');
    setAiLoading(false);
  }, []);

  const generateAIWorkout = useCallback(async (goal: 'cut' | 'bulk') => {
    setAiLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newPlans = INITIAL_WEEKLY_PLAN.map(plan => {
      if (plan.day === "Dom") return plan;
      const filtered = ALL_AVAILABLE_EXERCISES.filter(ex => 
        plan.muscles.some(m => ex.muscle === m)
      ).map(ex => ({
        ...ex,
        id: Math.random().toString(36).substr(2, 9),
        sets: goal === 'bulk' ? 4 : 3,
        reps: goal === 'bulk' ? "8-12" : "15-20"
      }));
      return { 
        ...plan, 
        target: `${goal === 'bulk' ? 'HIPERTROFIA' : 'DEFINIÇÃO'} - ${plan.target}`,
        exercises: filtered 
      };
    });
    setUserPlans(newPlans);
    setAiResponse(`Novo plano de ${goal === 'bulk' ? 'Ganho de Massa' : 'Emagrecimento'} aplicado!`);
    setAiStep('result');
    setAiLoading(false);
  }, []);

  const addExerciseToPlan = useCallback((exercise: Exercise) => {
    const newEx = { ...exercise, id: Math.random().toString(36).substr(2, 9) };
    setUserPlans(prev => prev.map((p, i) => i === activeDay ? { ...p, exercises: [...p.exercises, newEx] } : p));
    setShowAI(false);
  }, [activeDay]);

  const toggleExercise = useCallback((id: string) => {
    setCompletedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActiveRef.current && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && timerActiveRef.current) {
      setTimeout(() => setTimerActive(false), 0);
    }
    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${progressPercentage}%`;
    }
  }, [progressPercentage]);

  useEffect(() => {
    if (!sessionRun) return;
    if (trainingModality === 'running' || trainingModality === 'cycling') {
      if (!sessionCountdownActive) return;
      const id = setInterval(() => {
        setSessionSec((s) => {
          if (s <= 1) {
            setSessionRun(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      return () => clearInterval(id);
    }
    if (trainingModality === 'aerobic' || trainingModality === 'combat') {
      const id = setInterval(() => setSessionSec((s) => s + 1), 1000);
      return () => clearInterval(id);
    }
  }, [sessionRun, trainingModality, sessionCountdownActive]);

  useEffect(() => {
    try {
      localStorage.setItem(
        MODALITY_STORAGE_KEY,
        JSON.stringify({
          cycling: modalityHistory.cycling,
          running: modalityHistory.running,
          aerobic: modalityHistory.aerobic,
          combat: modalityHistory.combat,
        }),
      );
    } catch {
      // ignore
    }
  }, [modalityHistory]);

  useEffect(() => {
    if (!modalityMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (modalityMenuRef.current && !modalityMenuRef.current.contains(e.target as Node)) {
        setModalityMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [modalityMenuOpen]);

  useEffect(() => {
    if (trainingModality === 'gym') return;
    setSessionRun(false);
    setSessionSec(0);
    setDistanceKm('');
    setPaceChoice(null);
    setSessionCountdownActive(false);
    setInitialCountdownSec(0);
  }, [trainingModality]);

  const finalizeModalitySession = useCallback(() => {
    if (trainingModality === 'gym') return;
    const distN = parseKmInput(distanceKm);
    const isRunBikeCountdown =
      (trainingModality === 'running' || trainingModality === 'cycling') && sessionCountdownActive;
    let durationSec: number;
    if (isRunBikeCountdown) {
      durationSec = initialCountdownSec - sessionSec;
      if (durationSec <= 0) return;
    } else {
      if (sessionSec === 0) return;
      durationSec = sessionSec;
    }
    const entry: ModalitySessionEntry = {
      id: Math.random().toString(36).slice(2, 12),
      at: new Date().toISOString(),
      durationSec,
      ...(currentModalityMeta.showDistance && distN != null ? { distanceKm: distN } : {}),
    };
    setModalityHistory((prev) => ({
      ...prev,
      [trainingModality]: [entry, ...(prev[trainingModality] ?? [])].slice(0, 50),
    }));
    setSessionSec(0);
    setSessionRun(false);
    setDistanceKm('');
    setPaceChoice(null);
    setSessionCountdownActive(false);
    setInitialCountdownSec(0);
  }, [
    trainingModality,
    distanceKm,
    currentModalityMeta.showDistance,
    sessionCountdownActive,
    initialCountdownSec,
    sessionSec,
  ]);

  const startRunBikeCountdown = useCallback(() => {
    if (trainingModality !== 'running' && trainingModality !== 'cycling') return;
    const km = parseKmInput(distanceKm);
    if (km == null || !paceChoice) return;
    const block = suggestedBlock(km, trainingModality);
    const total = paceChoice === 'min' ? block.minTimeSec : block.maxTimeSec;
    setInitialCountdownSec(total);
    setSessionSec(total);
    setSessionCountdownActive(true);
    setSessionRun(true);
  }, [distanceKm, paceChoice, trainingModality]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 relative overflow-hidden antialiased font-sans">
      <div className="fixed top-[-5%] right-[-5%] w-80 h-80 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-50 bg-zinc-950/40 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-4 flex justify-between items-center gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shrink-0">
            <Dumbbell className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black italic tracking-tighter text-white shrink-0">WEGYM</span>
          <div ref={modalityMenuRef} className="relative min-w-0">
            <button
              type="button"
              onClick={() => setModalityMenuOpen((o) => !o)}
              className="flex items-center gap-1.5 sm:gap-2 bg-white/5 border border-white/10 pl-2 pr-2 sm:pl-3 sm:pr-3 py-2 rounded-xl hover:border-orange-500/50 transition-colors cursor-pointer max-w-[140px] sm:max-w-[200px]"
            >
              <LayoutGrid size={16} className="text-orange-500 shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase italic text-zinc-200 truncate">
                {currentModalityMeta.short}
              </span>
              <ChevronDown
                size={14}
                className={`text-zinc-500 shrink-0 transition-transform ${modalityMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {modalityMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-[min(100vw-2rem,16rem)] bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-[60] py-1 overflow-hidden">
                {MODALITY_OPTIONS.map((m) => {
                  const MIcon = m.Icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setTrainingModality(m.id);
                        setModalityMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors cursor-pointer ${
                        trainingModality === m.id ? 'bg-orange-600/20 text-white' : 'text-zinc-300'
                      }`}
                    >
                      <MIcon size={18} className="text-orange-500 shrink-0" />
                      <span className="text-[10px] sm:text-[11px] font-black uppercase italic leading-tight">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {trainingModality === 'gym' && (
            <button
              onClick={() => { setShowAI(true); setAiStep('add_manual'); }}
              className="bg-white/5 border border-white/10 px-2 sm:px-4 py-2 rounded-xl flex items-center space-x-2 cursor-pointer"
            >
              <Plus size={14} className="text-orange-500" />
              <span className="text-[10px] font-black uppercase italic text-zinc-300 hidden sm:inline">Adicionar mais exercícios</span>
            </button>
          )}
          <Link href="/DietPage" className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase italic text-zinc-300 hover:border-orange-500 transition-colors cursor-pointer">
            Dieta
          </Link>
          <Link href="/TrainingPage" className="bg-orange-600 border border-orange-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase italic text-white cursor-pointer">
            Treinos
          </Link>
          <button onClick={() => router.push('/ProfilePage')} title="Ir para perfil" className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:border-orange-500 transition-colors cursor-pointer">
            <User size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8">
        {trainingModality === 'gym' ? (
          <>
            <div className="flex space-x-3 overflow-x-auto pb-6 mb-8 no-scrollbar">
              {userPlans.map((plan, index) => (
                <button
                  key={index}
                  onClick={() => setActiveDay(index)}
                  className={`shrink-0 px-6 py-3 rounded-2xl font-black text-xs uppercase italic border transition-all cursor-pointer hover:border-orange-500 ${activeDay === index ? 'bg-orange-600 border-orange-400 text-white' : 'bg-zinc-900/50 border-white/5 text-zinc-500'}`}
                >
                  {plan.day}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <aside className="space-y-6">
                <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 text-center">
                  <div className="flex justify-between items-center mb-4 text-zinc-400">
                    <Timer size={18} />
                    <RotateCcw size={16} onClick={() => setTimeLeft(60)} className="cursor-pointer hover:text-white transition-colors" />
                  </div>
                  <div className="text-6xl font-black text-white mb-6 font-mono tracking-tighter">
                    {timeLeft}
                    <span className="text-2xl text-orange-500">s</span>
                  </div>
                  <button
                    onClick={() => setTimerActive(!timerActive)}
                    className={`w-full py-4 rounded-xl font-black uppercase italic transition-all cursor-pointer ${timerActive ? 'bg-zinc-800 text-white' : 'bg-white text-black'}`}
                  >
                    {timerActive ? 'Pausar' : 'Iniciar Descanso'}
                  </button>
                </div>

                <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 space-y-4">
                  <div className="text-center">
                    <p className="text-xs font-black uppercase italic text-zinc-400 mb-3">Progresso do Treino</p>
                    <div className="mb-3">
                      <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                        <div ref={progressBarRef} className="h-full bg-linear-to-r from-orange-500 to-orange-600 transition-all duration-300" />
                      </div>
                    </div>
                    <p className="text-2xl font-black text-white">{progressPercentage}%</p>
                  </div>
                </div>

                <button
                  onClick={() => { setShowAI(true); setAiStep('workout_goal'); }}
                  className="w-full px-6 py-4 bg-orange-600 rounded-2xl shadow-2xl shadow-orange-600/40 border border-orange-400/50 hover:bg-orange-700 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-white font-black uppercase italic text-sm">Gerar meu treino com ia</span>
                    <Zap className="text-white w-5 h-5" />
                  </div>
                </button>
              </aside>

              <section className="lg:col-span-2 space-y-4">
                <div className="bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden">
                  <div className="p-5 border-b border-white/5 flex justify-between items-center">
                    <h2 className="font-black italic uppercase text-white leading-tight">
                      {currentPlan.day} - {currentPlan.target}
                    </h2>
                    <Activity size={20} className="text-orange-500 opacity-30" />
                  </div>
                  <div className="divide-y divide-white/5">
                    {currentPlan.exercises.length > 0 ? (
                      currentPlan.exercises.map((ex, idx) => (
                        <ExerciseItem
                          key={ex.id || idx}
                          ex={ex}
                          isCompleted={!!ex.id && completedIds.includes(ex.id)}
                          onToggle={toggleExercise}
                        />
                      ))
                    ) : (
                      <div className="p-16 text-center text-zinc-600 font-black uppercase italic text-xs">Sem treinos. Gere um com IA.</div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </>
        ) : (
          <div className="max-w-xl mx-auto space-y-6 pb-8">
            <div className="flex items-center gap-3 text-zinc-500">
              {React.createElement(currentModalityMeta.Icon, { className: 'text-orange-500', size: 22 })}
              <p className="text-sm font-bold uppercase tracking-wide">{currentModalityMeta.label}</p>
            </div>

            {trainingModality === 'running' || trainingModality === 'cycling' ? (
              <>
                <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/5">
                  <label className="block text-[10px] font-black uppercase italic text-zinc-400 mb-2">
                    Quantos km você deseja percorrer?
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={distanceKm}
                    onChange={(e) => {
                      setDistanceKm(e.target.value);
                      setPaceChoice(null);
                    }}
                    placeholder="ex: 5,2"
                    disabled={!!sessionCountdownActive}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-lg outline-none focus:border-orange-500 disabled:opacity-50"
                  />
                </div>

                {runOrBikeSuggest && (
                  <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/5 space-y-4">
                    <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">
                      Estimativa para {parseKmInput(distanceKm)} km, com base em faixas típicas de amadores:{' '}
                      {trainingModality === 'running'
                        ? 'ritmo 4:30/km (mais intenso) a 7:00/km (mais leve).'
                        : '32 km/h (ritmo mais forte) a 18 km/h (passeio leve).'}
                    </p>
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer text-left">
                        <input
                          type="checkbox"
                          className="mt-1 rounded border-zinc-600"
                          checked={paceChoice === 'min'}
                          onChange={() => setPaceChoice((c) => (c === 'min' ? null : 'min'))}
                          disabled={!!sessionCountdownActive}
                        />
                        <span className="text-sm text-zinc-200">
                          <span className="font-black uppercase text-[10px] text-orange-500 block">Tempo mínimo sugerido</span>
                          {formatDurationHMS(runOrBikeSuggest.minTimeSec)}{' '}
                          <span className="text-zinc-500">({runOrBikeSuggest.minHint})</span>
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer text-left">
                        <input
                          type="checkbox"
                          className="mt-1 rounded border-zinc-600"
                          checked={paceChoice === 'max'}
                          onChange={() => setPaceChoice((c) => (c === 'max' ? null : 'max'))}
                          disabled={!!sessionCountdownActive}
                        />
                        <span className="text-sm text-zinc-200">
                          <span className="font-black uppercase text-[10px] text-orange-500 block">Tempo máximo sugerido</span>
                          {formatDurationHMS(runOrBikeSuggest.maxTimeSec)}{' '}
                          <span className="text-zinc-500">({runOrBikeSuggest.maxHint})</span>
                        </span>
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={startRunBikeCountdown}
                      disabled={!paceChoice || !runOrBikeSuggest || sessionCountdownActive}
                      className="w-full py-3 rounded-xl font-black uppercase italic text-sm bg-white text-black hover:bg-orange-500 hover:text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Iniciar com o tempo selecionado
                    </button>
                  </div>
                )}

                <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 text-center">
                  <p className="text-[10px] font-black uppercase italic text-zinc-500 mb-2">
                    {sessionCountdownActive ? 'Tempo restante' : 'Cronômetro regressivo'}
                  </p>
                  <p
                    className={`text-5xl sm:text-6xl font-black font-mono tracking-tight tabular-nums min-h-[1.1em] ${
                      sessionCountdownActive ? 'text-white' : 'text-zinc-600'
                    }`}
                  >
                    {sessionCountdownActive ? formatDurationHMS(sessionSec) : '— : — : —'}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => setSessionRun((r) => !r)}
                      disabled={!sessionCountdownActive}
                      className={`px-6 py-3 rounded-xl font-black uppercase italic text-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                        sessionRun ? 'bg-zinc-800 text-white border border-white/10' : 'bg-white text-black'
                      }`}
                    >
                      {sessionRun ? 'Pausar' : 'Continuar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSessionRun(false);
                        setSessionSec(0);
                        setPaceChoice(null);
                        setSessionCountdownActive(false);
                        setInitialCountdownSec(0);
                      }}
                      className="px-6 py-3 rounded-xl font-black uppercase italic text-sm bg-zinc-950 border border-white/10 text-zinc-300 hover:border-orange-500/50 cursor-pointer transition-all"
                    >
                      Zerar
                    </button>
                    <button
                      type="button"
                      onClick={finalizeModalitySession}
                      disabled={
                        !sessionCountdownActive ||
                        initialCountdownSec - sessionSec <= 0
                      }
                      className="px-6 py-3 rounded-xl font-black uppercase italic text-sm bg-orange-600 text-white border border-orange-400/50 hover:bg-orange-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      Salvar sessão
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 text-center">
                  <p className="text-[10px] font-black uppercase italic text-zinc-500 mb-2">Tempo de sessão</p>
                  <p className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight tabular-nums">
                    {formatDurationHMS(sessionSec)}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => setSessionRun((r) => !r)}
                      className={`px-6 py-3 rounded-xl font-black uppercase italic text-sm cursor-pointer transition-all ${
                        sessionRun ? 'bg-zinc-800 text-white border border-white/10' : 'bg-white text-black'
                      }`}
                    >
                      {sessionRun ? 'Pausar' : sessionSec > 0 ? 'Continuar' : 'Iniciar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSessionRun(false);
                        setSessionSec(0);
                      }}
                      className="px-6 py-3 rounded-xl font-black uppercase italic text-sm bg-zinc-950 border border-white/10 text-zinc-300 hover:border-orange-500/50 cursor-pointer transition-all"
                    >
                      Zerar
                    </button>
                    <button
                      type="button"
                      onClick={finalizeModalitySession}
                      disabled={sessionSec === 0}
                      className="px-6 py-3 rounded-xl font-black uppercase italic text-sm bg-orange-600 text-white border border-orange-400/50 hover:bg-orange-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      Salvar sessão
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center gap-2">
                <History size={18} className="text-orange-500" />
                <h3 className="text-xs font-black uppercase italic text-zinc-400">Histórico nesta modalidade</h3>
              </div>
              <ul className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                {(modalityHistory[trainingModality] ?? []).length === 0 ? (
                  <li className="p-8 text-center text-zinc-600 text-xs font-bold uppercase italic">Nenhuma sessão ainda</li>
                ) : (
                  (modalityHistory[trainingModality] ?? []).map((row) => (
                    <li key={row.id} className="px-5 py-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-white font-mono">{formatDurationHMS(row.durationSec)}</p>
                        <p className="text-[9px] text-zinc-500 font-bold mt-0.5">
                          {new Date(row.at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {row.distanceKm != null && (
                        <span className="text-xs font-mono text-orange-400 shrink-0">{row.distanceKm} km</span>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showAI && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-100 bg-zinc-950/90 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-orange-600/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center"><BrainCircuit className="text-white w-6 h-6" /></div>
                  <h3 className="text-lg font-black uppercase italic text-white">Wegym IA</h3>
                </div>
                <X size={24} className="text-zinc-500 cursor-pointer" onClick={() => setShowAI(false)} />
              </div>
              <div className="p-6">
                {aiLoading ? (
                  <div className="py-12 flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-t-orange-600 border-zinc-800 rounded-full animate-spin" />
                    <p className="text-xs font-black uppercase text-orange-500">Sincronizando Dados...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiStep === 'initial' && (
                      <>
                        <button onClick={() => setAiStep('workout_goal')} className="w-full p-6 bg-zinc-950 border border-white/5 rounded-3xl text-left flex items-center justify-between hover:border-orange-500 transition-all group cursor-pointer">
                          <div className="flex items-center gap-4"><Zap className="text-orange-500" size={24} /><p className="font-black uppercase italic text-white text-sm">Gerar Novo Treino IA</p></div>
                          <ChevronRight size={18} className="text-zinc-800 group-hover:text-white" />
                        </button>
                        <button onClick={() => setAiStep('diet_goal')} className="w-full p-6 bg-zinc-950 border border-white/5 rounded-3xl text-left flex items-center justify-between hover:border-orange-500 transition-all group cursor-pointer">
                          <div className="flex items-center gap-4"><Utensils className="text-orange-500" size={24} /><p className="font-black uppercase italic text-white text-sm">Consultar Dieta IA</p></div>
                          <ChevronRight size={18} className="text-zinc-800 group-hover:text-white" />
                        </button>
                      </>
                    )}
                    {aiStep === 'workout_goal' && (
                      <div className="grid grid-cols-1 gap-3">
                        <button onClick={() => generateAIWorkout('bulk')} className="p-5 bg-zinc-950 border border-white/5 rounded-3xl flex items-center gap-4 hover:border-orange-500 transition-all cursor-pointer">
                          <Trophy className="text-orange-500" size={20} /><span className="font-black uppercase italic text-xs">Foco: Ganho de Massa</span>
                        </button>
                        <button onClick={() => generateAIWorkout('cut')} className="p-5 bg-zinc-950 border border-white/5 rounded-3xl flex items-center gap-4 hover:border-orange-500 transition-all cursor-pointer">
                          <Flame className="text-orange-500" size={20} /><span className="font-black uppercase italic text-xs">Foco: Emagrecimento</span>
                        </button>
                      </div>
                    )}
                    {aiStep === 'diet_goal' && (
                      <div className="grid grid-cols-1 gap-3">
                        <button onClick={() => generateFullDiet('cut')} className="p-5 bg-zinc-950 border border-white/5 rounded-3xl flex items-center gap-4 hover:border-orange-500 transition-all cursor-pointer">
                          <Flame className="text-orange-500" size={20} /><span className="font-black uppercase italic text-xs">Dieta Emagrecimento</span>
                        </button>
                        <button onClick={() => generateFullDiet('bulk')} className="p-5 bg-zinc-950 border border-white/5 rounded-3xl flex items-center gap-4 hover:border-orange-500 transition-all cursor-pointer">
                          <Trophy className="text-orange-500" size={20} /><span className="font-black uppercase italic text-xs">Dieta Ganho de Massa</span>
                        </button>
                      </div>
                    )}
                    {aiStep === 'add_manual' && (
                      <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                        {ALL_AVAILABLE_EXERCISES.map((ex, i) => (
                          <button key={i} onClick={() => addExerciseToPlan(ex)} className="w-full p-4 bg-zinc-950 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-emerald-500/5 transition-all cursor-pointer">
                            <div className="text-left"><p className="font-black uppercase italic text-white text-[11px]">{ex.name}</p><p className="text-[9px] text-zinc-500 font-bold uppercase">{ex.muscle}</p></div>
                            <Plus size={16} className="text-emerald-500" />
                          </button>
                        ))}
                      </div>
                    )}
                    {aiStep === 'result' && (
                      <div className="space-y-6">
                        <div className="bg-zinc-950 p-6 rounded-3xl border border-white/10 max-h-72 overflow-y-auto custom-scrollbar">
                          <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-line font-mono">{aiResponse}</p>
                        </div>
                        <button onClick={() => setShowAI(false)} className="w-full py-4 bg-white text-black font-black uppercase italic rounded-2xl hover:bg-orange-500 hover:text-white transition-all cursor-pointer">Confirmar e Ver Plano</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}