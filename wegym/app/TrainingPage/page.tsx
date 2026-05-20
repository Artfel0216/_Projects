"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {Dumbbell, Timer, RotateCcw, Zap, Trophy, X, ChevronDown, Activity,BrainCircuit, User, Plus, Flame, LayoutGrid, History, Menu,
} from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import { TrainingModalityId, Exercise, ModalitySessionEntry, AIChatMessage, DayPlan } from '@/app/types/training';
import { formatDurationHMS, parseKmInput } from '@/app/utils/training-helpers';
import { MODALITY_OPTIONS } from '@/app/constants/modalities';
import { ALL_AVAILABLE_EXERCISES } from '@/app/constants/exercises';
import { ExerciseItem} from '@/app/components/ExerciseItem/ExerciseItem';
import { INITIAL_WEEKLY_PLAN } from '@/app/constants/plans';
import { getSuggestedCardioBlock } from '@/app/utils/calculations';






export default function TrainingPage() {

const router = useRouter();

const modalityMenuRef = useRef<HTMLDivElement>(null);
const mobileMenuRef = useRef<HTMLDivElement>(null);
const progressBarRef = useRef<HTMLDivElement>(null);



const [activeDay, setActiveDay] = useState(new Date().getDay());
const [showAI, setShowAI] = useState(false);
const [visibleExercises, setVisibleExercises] = useState(10);
const [modalityMenuOpen, setModalityMenuOpen] = useState(false);
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

const [userPlans, setUserPlans] = useState<DayPlan[]>(INITIAL_WEEKLY_PLAN);
const [completedIds, setCompletedIds] = useState<string[]>([]);
const [timeLeft, setTimeLeft] = useState(60);
const [timerActive, setTimerActive] = useState(false);

const [trainingModality, setTrainingModality] = useState<TrainingModalityId>('gym');
const [sessionSec, setSessionSec] = useState(0);
const [sessionRun, setSessionRun] = useState(false);
const [distanceKm, setDistanceKm] = useState('');
const [paceChoice, setPaceChoice] = useState<'min' | 'max' | null>(null);
const [sessionCountdownActive, setSessionCountdownActive] = useState(false);
const [initialCountdownSec, setInitialCountdownSec] = useState(0);
const [modalityHistory, setModalityHistory] = useState<Partial<Record<TrainingModalityId, ModalitySessionEntry[]>>>({
  gym: [],
  cycling: [],
  running: [],
  aerobic: [],
  combat: [],
});

const [chatOpen, setChatOpen] = useState(false);
const [chatInput, setChatInput] = useState('');
const [chatLoading, setChatLoading] = useState(false);
const [aiLoading, setAiLoading] = useState(false);
const [aiResponse, setAiResponse] = useState('');
const [aiStep, setAiStep] = useState<'workout_goal' | 'add_manual' | 'result'>('workout_goal');
const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([
  {
    role: 'ai',
    text: 'Olá! Sou o assistente da WEGYM 💪 Pergunte sobre treino, cardio, hipertrofia, emagrecimento ou recuperação.'
  }
]);


const currentModalityMeta = useMemo(
  () => MODALITY_OPTIONS.find((m) => m.id === trainingModality) ?? MODALITY_OPTIONS[0],
  [trainingModality],
);

const runOrBikeSuggest = useMemo(() => {
  if (trainingModality !== 'running' && trainingModality !== 'cycling') return null;
  const km = parseKmInput(distanceKm);
  if (km == null) return null;
  return getSuggestedCardioBlock(km, trainingModality);
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
  }
}, []);

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
  }
}, [modalityHistory]);

useEffect(() => {
  if (progressBarRef.current) {
    progressBarRef.current.style.width = `${progressPercentage}%`;
  }
}, [progressPercentage]);

useEffect(() => {
  if (!timerActive) return;
  const id = setInterval(() => {
    setTimeLeft((t) => {
      if (t <= 1) {
        setTimerActive(false);
        return 0;
      }
      return t - 1;
    });
  }, 1000);
  return () => clearInterval(id);
}, [timerActive]);

useEffect(() => {
  if (!sessionRun || trainingModality === 'gym') return;

  const isCountdownMode = 
    (trainingModality === 'running' || trainingModality === 'cycling') && sessionCountdownActive;

  if (isCountdownMode) {
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

  const id = setInterval(() => {
    setSessionSec((s) => s + 1);
  }, 1000);

  return () => clearInterval(id);
}, [sessionRun, trainingModality, sessionCountdownActive]);

useEffect(() => {
  if (trainingModality === 'gym') return;
  setSessionRun(false);
  setSessionSec(0);
  setDistanceKm('');
  setPaceChoice(null);
  setSessionCountdownActive(false);
  setInitialCountdownSec(0);
}, [trainingModality]);

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
  if (!mobileMenuOpen) return;
  const close = (e: MouseEvent) => {
    if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
      setMobileMenuOpen(false);
    }
  };
  document.addEventListener('mousedown', close);
  return () => document.removeEventListener('mousedown', close);
}, [mobileMenuOpen]);



const toggleExercise = useCallback((id: string) => {
  setCompletedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
}, []);

const addExerciseToPlan = useCallback((exercise: Exercise) => {
  const newEx = { ...exercise, id: Math.random().toString(36).substr(2, 9) };
  setUserPlans(prev => prev.map((p, i) => i === activeDay ? { ...p, exercises: [...p.exercises, newEx] } : p));
  setShowAI(false);
}, [activeDay]);

const startRunBikeCountdown = useCallback(() => {
  if (trainingModality !== 'running' && trainingModality !== 'cycling') return;
  const km = parseKmInput(distanceKm);
  if (km == null || !paceChoice) return;
  const block = getSuggestedCardioBlock(km, trainingModality);
  const total = paceChoice === 'min' ? block.minTimeSec : block.maxTimeSec;
  setInitialCountdownSec(total);
  setSessionSec(total);
  setSessionCountdownActive(true);
  setSessionRun(true);
}, [distanceKm, paceChoice, trainingModality]);

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

// --- Funções do Assistente IA ---
const sendChatMessage = useCallback(async () => {
  if (!chatInput.trim()) return;

  const userMessage = chatInput.trim();

  setChatMessages(prev => [
    ...prev,
    { role: 'user', text: userMessage },
  ]);

  setChatInput('');
  setChatLoading(true);

  await new Promise(resolve => setTimeout(resolve, 1200));

  let response = '';
  const lower = userMessage.toLowerCase();

  if (lower.includes('hipertrofia') || lower.includes('massa')) {
    response = 'Para hipertrofia foque em progressão de carga, descanso de 60-90 segundos, alimentação hipercalórica e exercícios compostos como supino, agachamento e levantamento terra.';
  } else if (lower.includes('emagrecer') || lower.includes('cut')) {
    response = 'Para emagrecimento combine musculação + cardio moderado, mantenha déficit calórico e priorize constância. O ideal é manter proteína alta para preservar massa muscular.';
  } else if (lower.includes('corrida')) {
    response = 'Na corrida é importante controlar ritmo e progressão semanal. Evite aumentar distância drasticamente para reduzir risco de lesão.';
  } else if (lower.includes('descanso')) {
    response = 'O descanso é essencial para recuperação muscular. Dormir bem melhora força, desempenho e recuperação hormonal.';
  } else if (lower.includes('cardio')) {
    response = 'Cardio ajuda no condicionamento e saúde cardiovascular. Você pode alternar HIIT e cardio contínuo dependendo do objetivo.';
  } else {
    response = 'Entendi 💪 Continue consistente nos treinos, alimentação e recuperação. Pequenas evoluções diárias geram grandes resultados.';
  }

  setChatMessages(prev => [
    ...prev,
    { role: 'ai', text: response },
  ]);

  setChatLoading(false);
}, [chatInput]);

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


  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 relative overflow-hidden antialiased font-sans">
      <button
  type="button"
  onClick={() => setChatOpen(true)}
  className="fixed bottom-6 right-6 z-120 w-16 h-16 rounded-full bg-orange-600 border border-orange-400 shadow-2xl shadow-orange-600/40 flex items-center justify-center hover:scale-105 transition-all cursor-pointer"
>
  <MessageCircle className="text-white" size={28} />
</button>
      <div className="fixed top-[-5%] right-[-5%] w-80 h-80 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-50 bg-zinc-950/40 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-4 flex justify-between items-center gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shrink-0">
            <Dumbbell className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black italic tracking-tighter text-white shrink-0">WEGYM</span>
          <div ref={modalityMenuRef} className="relative min-w-0 ml-2 sm:ml-4 hidden sm:block">
            <button
              type="button"
              onClick={() => setModalityMenuOpen((o) => !o)}
              className="flex items-center gap-1.5 sm:gap-2 bg-white/5 border border-white/10 pl-2 pr-2 sm:pl-3 sm:pr-3 py-2 rounded-xl hover:border-orange-500/50 transition-colors cursor-pointer max-w-35 sm:max-w-50"
            >
              <LayoutGrid size={16} className="text-orange-500 shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase italic text-zinc-200 truncate">
                {currentModalityMeta.label}
              </span>
              <ChevronDown
                size={14}
                className={`text-zinc-500 shrink-0 transition-transform ${modalityMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {modalityMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-[min(100vw-2rem,16rem)] bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-60 py-1 overflow-hidden">
                {MODALITY_OPTIONS.map((m) => {
                  const MIcon = m.Icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setTrainingModality(m.id as TrainingModalityId);
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
        <div className="hidden sm:flex items-center space-x-2 sm:space-x-3 shrink-0">
          {trainingModality === 'gym' && (
            <button
              onClick={() => { setShowAI(true); setAiStep('add_manual'); }}
              className="bg-white/5 border border-white/10 px-2 sm:px-4 py-2 rounded-xl flex items-center space-x-2 cursor-pointer"
            >
              <Plus size={14} className="text-orange-500" />
              <span className="text-[10px] font-black uppercase italic text-zinc-300 hidden sm:inline">Adicionar mais exercícios</span>
            </button>
          )}
          <Link href="/TrainingPage" className="bg-orange-600 border border-orange-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase italic text-white cursor-pointer">
            Treinos
          </Link>
          <button onClick={() => router.push('/ProfilePage')} title="Ir para perfil" className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:border-orange-500 transition-colors cursor-pointer">
            <User size={20} />
          </button>
        </div>
        <div ref={mobileMenuRef} className="relative sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-200"
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>
          {mobileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-70 p-2 space-y-1">
              {trainingModality === 'gym' && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAI(true);
                    setAiStep('add_manual');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[11px] font-black uppercase italic text-zinc-200 hover:bg-white/5"
                >
                  <Plus size={14} className="text-orange-500" />
                  Adicionar exercícios
                </button>
              )}
              <div className="my-1 border-t border-white/10" />
              {MODALITY_OPTIONS.map((m) => {
                const MIcon = m.Icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setTrainingModality(m.id as TrainingModalityId);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[11px] font-black uppercase italic ${
                      trainingModality === m.id ? 'bg-orange-600/20 text-white' : 'text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    <MIcon size={14} className="text-orange-500" />
                    {m.label}
                  </button>
                );
              })}
              <div className="my-1 border-t border-white/10" />
              <Link
                href="/TrainingPage"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-black uppercase italic bg-orange-600/20 text-white"
              >
                <Flame size={14} className="text-orange-500" />
                Treinos
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/ProfilePage');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[11px] font-black uppercase italic text-zinc-300 hover:bg-white/5"
              >
                <User size={14} className="text-orange-500" />
                Perfil
              </button>
            </div>
          )}
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
                      Finalizar sessão
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
                      Finalizar sessão
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
                          <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-line font-mono">{}</p>
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