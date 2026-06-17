"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {Timer, RotateCcw, Zap, Trophy, X, Activity, BrainCircuit, Plus, Flame, History,
  HeartPulse, Bluetooth, Send,
} from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import { BluetoothManager, type HRData, type ConnectionState } from '@/lib/bluetooth';

import { MODALITY_OPTIONS } from '@/constants/modalities';
import { MODALITY_STORAGE_KEY } from '@/constants/keys';
import { ALL_AVAILABLE_EXERCISES } from '@/constants/exercises';
import { ExerciseItem } from '@/components/ExerciseItem/ExerciseItem';
import { INITIAL_WEEKLY_PLAN } from '@/constants/plans';
import { getSuggestedCardioBlock } from '@/utils/calculations';
import type { DayPlan, TrainingModalityId, ModalitySessionEntry, AIChatMessage, Exercise, GpsCoordinate } from '@/types/training';
import { parseKmInput, formatDurationHMS } from '@/utils/training-helpers';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useGpsTracker } from '@/hooks/use-gps-tracker';
import GpsSessionResult from '@/components/training/GpsSessionResult';
import RouteMap from '@/components/training/RouteMap';

import { useTranslations } from '@/lib/i18n/hook';





export default function TrainingPage() {

const router = useRouter();
const searchParams = useSearchParams();

const { t } = useTranslations();

const DAY_TKEY_MAP: Record<string, string> = {
  "Seg": "days.mon",
  "Ter": "days.tue",
  "Qua": "days.wed",
  "Qui": "days.thu",
  "Sex": "days.fri",
  "Sáb": "days.sat",
  "Dom": "days.sun",
};

const TARGET_TKEY_MAP: Record<string, string> = {
  "Push": "planDayTarget.push",
  "Pull": "planDayTarget.pull",
  "Legs": "planDayTarget.legs",
  "Cardio e Core": "planDayTarget.cardioCore",
  "Upper Body": "planDayTarget.upperBody",
  "Lower Body": "planDayTarget.lowerBody",
  "Descanso": "planDayTarget.rest",
};

const progressBarRef = useRef<HTMLDivElement>(null);



const [activeDay, setActiveDay] = useState(new Date().getDay());
const [showAI, setShowAI] = useState(false);
const [visibleExercises, setVisibleExercises] = useState(10);

const [userPlans, setUserPlans] = useState<DayPlan[]>(INITIAL_WEEKLY_PLAN);
const [completedIds, setCompletedIds] = useState<string[]>([]);
const [timeLeft, setTimeLeft] = useState(60);
const [timerActive, setTimerActive] = useState(false);

const modalityParam = searchParams.get('modality');
const trainingModality: TrainingModalityId = (
  modalityParam && MODALITY_OPTIONS.some((m) => m.id === modalityParam)
    ? (modalityParam as TrainingModalityId)
    : 'gym'
);
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

const [useGpsMode, setUseGpsMode] = useState(true);
const [showGpsResult, setShowGpsResult] = useState(false);
const [targetKm, setTargetKm] = useState<number>(0);
const [selectedTarget, setSelectedTarget] = useState<'min' | 'avg' | 'max' | null>(null);
const GPS_MODALITIES: TrainingModalityId[] = ['running', 'walking', 'hiking', 'cycling'];
const isGpsModality = GPS_MODALITIES.includes(trainingModality);
const isSwimming = trainingModality === 'swimming';
const gps = useGpsTracker(trainingModality);

const PACE_ESTIMATES: Record<string, { minSecPerKm: number; avgSecPerKm: number; maxSecPerKm: number }> = {
  running: { minSecPerKm: 270, avgSecPerKm: 345, maxSecPerKm: 420 },
  walking: { minSecPerKm: 480, avgSecPerKm: 600, maxSecPerKm: 720 },
  hiking: { minSecPerKm: 360, avgSecPerKm: 480, maxSecPerKm: 600 },
  cycling: { minSecPerKm: 112, avgSecPerKm: 144, maxSecPerKm: 200 },
};

const targetTimes = useMemo(() => {
  if (!isGpsModality || targetKm <= 0) return null;
  const pace = PACE_ESTIMATES[trainingModality];
  if (!pace) return null;
  return {
    minSec: Math.round(targetKm * pace.minSecPerKm),
    avgSec: Math.round(targetKm * pace.avgSecPerKm),
    maxSec: Math.round(targetKm * pace.maxSecPerKm),
  };
}, [isGpsModality, targetKm, trainingModality]);

const targetPaceSec = useMemo(() => {
  if (!selectedTarget || !targetTimes || targetKm <= 0) return null;
  return Math.round(targetTimes[`${selectedTarget}Sec`] / targetKm);
}, [selectedTarget, targetTimes, targetKm]);

const [poolLengthM, setPoolLengthM] = useState(25);
const [lapCount, setLapCount] = useState(0);

const [chatOpen, setChatOpen] = useState(false);
const [chatInput, setChatInput] = useState('');
const [chatLoading, setChatLoading] = useState(false);
const [bleState, setBleState] = useState<ConnectionState>("idle");
const [lastHR, setLastHR] = useState<HRData | null>(null);
const btRef = useRef<BluetoothManager | null>(null);
const [aiLoading, setAiLoading] = useState(false);
const [aiResponse, setAiResponse] = useState('');
const [aiStep, setAiStep] = useState<'workout_goal' | 'add_manual' | 'result'>('workout_goal');
const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([
  {
    role: 'ai',
    text: t('training.chatInitialMessage')
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
  router.prefetch('/profile');
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
  setSelectedTarget(null);
  setSessionCountdownActive(false);
  setInitialCountdownSec(0);
}, [trainingModality]);

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

const saveModalityEntry = useCallback((entry: ModalitySessionEntry) => {
  setModalityHistory((prev) => ({
    ...prev,
    [trainingModality]: [entry, ...(prev[trainingModality] ?? [])].slice(0, 50),
  }));
}, [trainingModality]);

const finalizeModalitySession = useCallback(() => {
  if (trainingModality === 'gym') return;

  if (isGpsModality && gps.gpsState === 'tracking') {
    gps.stopGps();
    setShowGpsResult(true);
    return;
  }

  if (isSwimming) {
    if (sessionSec === 0) return;
    const distKm = (lapCount * poolLengthM) / 1000;
    const entry: ModalitySessionEntry = {
      id: Math.random().toString(36).slice(2, 12),
      at: new Date().toISOString(),
      durationSec: sessionSec,
      ...(lapCount > 0 ? { distanceKm: distKm } : {}),
    };
    saveModalityEntry(entry);
    setSessionSec(0);
    setSessionRun(false);
    setLapCount(0);
    return;
  }

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
  
  saveModalityEntry(entry);
  
  setSessionSec(0);
  setSessionRun(false);
  setDistanceKm('');
  setPaceChoice(null);
  setSessionCountdownActive(false);
  setInitialCountdownSec(0);
}, [
  trainingModality,
  isGpsModality,
  isSwimming,
  gps,
  lapCount,
  poolLengthM,
  sessionSec,
  distanceKm,
  currentModalityMeta.showDistance,
  sessionCountdownActive,
  initialCountdownSec,
  saveModalityEntry,
]);

const handleSaveGpsSession = useCallback(() => {
  const snap = gps.gpsSnapshot;
  if (!snap) return;
  const entry: ModalitySessionEntry = {
    id: Math.random().toString(36).slice(2, 12),
    at: new Date().toISOString(),
    durationSec: snap.durationSec,
    distanceKm: snap.distanceKm,
    avgPaceSecPerKm: snap.avgPaceSecPerKm,
    steps: snap.steps,
    coordinates: snap.coordinates,
  };
  saveModalityEntry(entry);
  setShowGpsResult(false);
  gps.resetGps();
  setSessionSec(0);
  setSessionRun(false);
}, [gps, saveModalityEntry]);

const handleDiscardGpsSession = useCallback(() => {
  setShowGpsResult(false);
  gps.resetGps();
  setSessionSec(0);
  setSessionRun(false);
}, [gps]);

// --- Bluetooth ---
const toggleBLE = useCallback(() => {
  if (bleState === "connected" && btRef.current) {
    btRef.current.disconnect();
    setLastHR(null);
    return;
  }
  const manager = new BluetoothManager({
    onHR: (data: HRData) => setLastHR(data),
    onState: (state: ConnectionState) => setBleState(state),
    onDevice: () => {},
    onError: () => {},
  }, t);
  btRef.current = manager;
  manager.scan();
}, [bleState]);

useEffect(() => {
  return () => { btRef.current?.disconnect(); };
}, []);
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

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await res.json();
    const response = data.text ?? t('training.chatError');

    setChatMessages(prev => [
      ...prev,
      { role: 'ai', text: response },
    ]);
  } catch {
    setChatMessages(prev => [
      ...prev,
      { role: 'ai', text: t('training.chatConnectionError') },
    ]);
  }

  setChatLoading(false);
}, [chatInput]);

const generateAIWorkout = useCallback(async (goal: 'cut' | 'bulk') => {
  setAiLoading(true);
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newPlans = INITIAL_WEEKLY_PLAN.map(plan => {
    if (plan.day === "Dom") return plan;
const filtered = ALL_AVAILABLE_EXERCISES.filter(ex => 
  plan.muscles.some((m: string) => ex.muscle === m)
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
  setAiResponse(goal === 'bulk' ? t('training.planBulkApplied') : t('training.planCutApplied'));
  setAiStep('result');
  setAiLoading(false);
}, []);


  return (
    <AuthGuard>
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 relative overflow-hidden antialiased font-sans">
      <button
  type="button"
  role="button"
  tabIndex={0}
  onClick={() => setChatOpen(true)}
  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setChatOpen(true); } }}
  className="fixed bottom-6 right-6 z-120 w-16 h-16 rounded-full bg-orange-600 border border-orange-400 shadow-2xl shadow-orange-600/40 flex items-center justify-center hover:scale-105 transition-all btn-fab"
>
  <MessageCircle className="text-white" size={28} />
</button>
      <div className="fixed top-[-5%] right-[-5%] w-80 h-80 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-50 bg-zinc-950/40 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-4 flex justify-between items-center gap-2 pl-16 lg:pl-6">
        <div className="flex items-center gap-3 min-w-0">
          {React.createElement(currentModalityMeta.Icon, {
            size: 22,
            className: 'text-orange-500 shrink-0',
          })}
          <h1 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter text-white truncate">
{t(currentModalityMeta.tKey)}
          </h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <button
            type="button"
            onClick={toggleBLE}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border transition-colors cursor-pointer ${
              bleState === "connected"
                ? "bg-emerald-600/15 border-emerald-500/30 text-emerald-400"
                : "bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200"
            }`}
            aria-label={t('training.connectSmartwatch')}
          >
            {bleState === "connected" && lastHR ? (
              <>
                <HeartPulse size={14} className="text-emerald-400" />
                <span className="text-xs font-black tabular-nums">{lastHR.bpm}</span>
              </>
            ) : bleState === "scanning" || bleState === "connecting" ? (
              <Bluetooth size={14} className="animate-pulse text-orange-500" />
            ) : (
              <Bluetooth size={14} />
            )}
          </button>
          {trainingModality === 'gym' && (
            <button
              onClick={() => { setShowAI(true); setAiStep('add_manual'); }}
              className="bg-white/5 border border-white/10 px-2 sm:px-4 py-2 rounded-xl flex items-center space-x-2 cursor-pointer"
            >
              <Plus size={14} className="text-orange-500" />
              <span className="text-[10px] font-black uppercase italic text-zinc-300 hidden sm:inline">{t('training.addMoreExercises')}</span>
            </button>
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
                  {t(DAY_TKEY_MAP[plan.day] ?? plan.day)}
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
                    {timerActive ? t('training.pause') : t('training.startRest')}
                  </button>
                </div>

                <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 space-y-4">
                  <div className="text-center">
                    <p className="text-xs font-black uppercase italic text-zinc-400 mb-3">{t('training.workoutProgress')}</p>
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
                    <span className="text-white font-black uppercase italic text-sm">{t('training.generateAI')}</span>
                    <Zap className="text-white w-5 h-5" />
                  </div>
                </button>
              </aside>

              <section className="lg:col-span-2 space-y-4">
                <div className="bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden">
                  <div className="p-5 border-b border-white/5 flex justify-between items-center">
                    <h2 className="font-black italic uppercase text-white leading-tight">
                      {t(DAY_TKEY_MAP[currentPlan.day] ?? currentPlan.day)} - {t(TARGET_TKEY_MAP[currentPlan.target] ?? currentPlan.target)}
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
                      <div className="p-16 text-center text-zinc-600 font-black uppercase italic text-xs">{t('training.noWorkouts')}</div>
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
              <p className="text-sm font-bold uppercase tracking-wide">{t(currentModalityMeta.tKey)}</p>
            </div>

            {isGpsModality && useGpsMode ? (
              <>
                {gps.gpsError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <p className="text-xs text-red-400 font-bold">{gps.gpsError}</p>
                  </div>
                )}

                {gps.gpsState === 'tracking' ? (
                  <>
                    <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase italic text-zinc-400">{t('training.gpsTracking')}</span>
                        <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          {t('training.gpsActive')}
                        </div>
                      </div>

                      {targetKm > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between text-[10px] font-bold text-zinc-500 mb-1">
                            <span>{gps.liveDistKm.toFixed(2)} km</span>
                            <span>{targetKm} km</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-linear-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((gps.liveDistKm / targetKm) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-zinc-950 rounded-xl p-3 text-center">
                          <p className="text-[9px] font-black uppercase text-zinc-500">{t('training.resultDistance')}</p>
                          <p className="text-lg font-black text-white mt-1 font-mono">
                            {gps.liveDistKm.toFixed(2)}
                            <span className="text-[10px] text-orange-500 ml-1">{t('common.kmUnit')}</span>
                          </p>
                        </div>
                        <div className="bg-zinc-950 rounded-xl p-3 text-center">
                          <p className="text-[9px] font-black uppercase text-zinc-500">{t('training.resultPace')}</p>
                          <p className="text-lg font-black text-white mt-1 font-mono">
                            {gps.livePace > 0
                              ? `${Math.floor(gps.livePace / 60)}:${(gps.livePace % 60).toString().padStart(2, '0')}`
                              : '—'}
                          </p>
                        </div>
                        <div className="bg-zinc-950 rounded-xl p-3 text-center">
                          <p className="text-[9px] font-black uppercase text-zinc-500">{t('training.resultSteps')}</p>
                          <p className="text-lg font-black text-white mt-1">
                            {gps.liveSteps.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {selectedTarget && targetPaceSec != null && targetTimes && (
                        <div className="bg-zinc-950 rounded-xl p-3 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-zinc-400">
                            Ritmo alvo ({selectedTarget === 'min' ? t('training.minTime') : selectedTarget === 'avg' ? t('training.avgTime') : t('training.maxTime')})
                          </span>
                          <span className={`text-sm font-mono font-black flex items-center gap-2 ${
                            gps.livePace > 0 && gps.livePace <= targetPaceSec
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}>
                            {gps.livePace > 0 && (
                              <span>{gps.livePace <= targetPaceSec ? '✅' : '⚠️'}</span>
                            )}
                            {formatDurationHMS(targetPaceSec)}/km
                          </span>
                        </div>
                      )}

                      <div className="mt-6 flex flex-wrap gap-2 justify-center">
                        <button
                          type="button"
                          onClick={finalizeModalitySession}
                          className="px-6 py-3 rounded-xl font-black uppercase italic text-sm bg-orange-600 text-white border border-orange-400/50 hover:bg-orange-700 cursor-pointer transition-all"
                        >
                          {t('training.finishSession')}
                        </button>
                        <button
                          type="button"
                          onClick={gps.resetGps}
                          className="px-6 py-3 rounded-xl font-black uppercase italic text-sm bg-zinc-950 border border-white/10 text-zinc-300 hover:border-orange-500/50 cursor-pointer transition-all"
                        >
                          {t('training.reset')}
                        </button>
                      </div>
                    </div>

                    <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-black uppercase italic text-zinc-400 mb-2">{t('training.sessionTime')}</p>
                      <p className="text-4xl font-black text-white font-mono tracking-tight tabular-nums">
                        {formatDurationHMS(gps.liveSec)}
                      </p>
                      {bleState === "connected" && lastHR && (
                        <div className="mt-4 flex items-center gap-2 text-emerald-400">
                          <HeartPulse size={18} className="animate-pulse" />
                          <span className="text-2xl font-black tabular-nums">{lastHR.bpm}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('training.bpm')}</span>
                        </div>
                      )}
                    </div>

                    {gps.liveCoordinates.length >= 2 && (
                      <div className="bg-zinc-900/50 p-3 rounded-3xl border border-white/5">
                        <p className="text-[9px] font-black uppercase italic text-zinc-400 mb-2">{t('training.resultRoute')}</p>
                        <div className="w-full rounded-2xl overflow-hidden" style={{ height: 200 }}>
                          <RouteMap coordinates={gps.liveCoordinates} height={200} interactive={true} />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-black uppercase italic text-zinc-400 mb-3">
                        {t('training.kmQuestion')}
                      </p>
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          inputMode="decimal"
                          value={targetKm || ''}
                          onChange={(e) => { setTargetKm(Number(e.target.value) || 0); setSelectedTarget(null); }}
                          placeholder="0"
                          className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-lg outline-none focus:border-orange-500"
                          min={0}
                          step={0.1}
                        />
                        <span className="text-sm font-black text-zinc-500">{t('common.kmUnit')}</span>
                      </div>
                    </div>

                    {targetTimes && targetKm > 0 && (
                      <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/5 space-y-3">
                        <p className="text-[10px] font-black uppercase italic text-zinc-400">{t('training.targetTime')}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-emerald-400 font-bold">{t('training.minTime')}</span>
                            <span className="text-sm font-mono text-white font-black">{formatDurationHMS(targetTimes.minSec)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-zinc-400 font-bold">{t('training.avgTime')}</span>
                            <span className="text-sm font-mono text-white font-black">{formatDurationHMS(targetTimes.avgSec)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-amber-400 font-bold">{t('training.maxTime')}</span>
                            <span className="text-sm font-mono text-white font-black">{formatDurationHMS(targetTimes.maxSec)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {targetTimes && targetKm > 0 && (
                      <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/5 space-y-3">
                        <p className="text-[10px] font-black uppercase italic text-zinc-400">Selecionar ritmo alvo</p>
                        <div className="grid grid-cols-3 gap-2">
                          {(['min', 'avg', 'max'] as const).map((key) => {
                            const sec = targetTimes[`${key}Sec`];
                            const labels: Record<string, { label: string; color: string }> = {
                              min: { label: t('training.minTime'), color: 'border-emerald-500/50 text-emerald-400' },
                              avg: { label: t('training.avgTime'), color: 'border-zinc-500/50 text-zinc-300' },
                              max: { label: t('training.maxTime'), color: 'border-amber-500/50 text-amber-400' },
                            };
                            const isActive = selectedTarget === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => setSelectedTarget(key)}
                                className={`px-3 py-3 rounded-xl font-black uppercase italic text-[10px] border transition-all cursor-pointer ${
                                  isActive
                                    ? 'bg-orange-600 border-orange-400 text-white'
                                    : `${labels[key].color} bg-zinc-950 border-white/10 hover:border-white/30`
                                }`}
                              >
                                <span className="block">{labels[key].label}</span>
                                <span className="block mt-1 font-mono text-[11px] not-italic">{formatDurationHMS(sec)}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={gps.startGps}
                      className="w-full py-4 rounded-xl font-black uppercase italic text-sm bg-white text-black hover:bg-orange-500 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      🛰️ {t('training.startGps')}
                    </button>
                  </>
                )}
              </>
            ) : isSwimming ? (
              <>
                <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/5">
                  <label className="block text-[10px] font-black uppercase italic text-zinc-400 mb-2">
                    {t('training.poolLength')}
                  </label>
                  <div className="flex gap-2">
                    {[25, 50].map((len) => (
                      <button
                        key={len}
                        type="button"
                        onClick={() => setPoolLengthM(len)}
                        className={`px-4 py-2 rounded-xl font-black uppercase italic text-xs cursor-pointer transition-all ${
                          poolLengthM === len
                            ? 'bg-orange-600 text-white border border-orange-400/50'
                            : 'bg-zinc-950 border border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {len}m
                      </button>
                    ))}
                    <input
                      type="number"
                      value={poolLengthM}
                      onChange={(e) => setPoolLengthM(Number(e.target.value) || 25)}
                      className="w-20 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm outline-none focus:border-orange-500"
                      min={1}
                    />
                  </div>
                </div>

                <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 text-center">
                  <p className="text-[10px] font-black uppercase italic text-zinc-500 mb-2">{t('training.sessionTime')}</p>
                  <p className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight tabular-nums">
                    {formatDurationHMS(sessionSec)}
                  </p>
                  <div className="mt-4">
                    <p className="text-[10px] font-black uppercase italic text-zinc-500 mb-1">{t('training.laps')}</p>
                    <p className="text-4xl font-black text-orange-500 font-mono">{lapCount}</p>
                    {lapCount > 0 && (
                      <p className="text-xs text-zinc-400 mt-1 font-mono">
                        {((lapCount * poolLengthM) / 1000).toFixed(2)} {t('common.kmUnit')}
                      </p>
                    )}
                  </div>
                  {bleState === "connected" && lastHR && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400">
                      <HeartPulse size={18} className="animate-pulse" />
                      <span className="text-3xl font-black tabular-nums">{lastHR.bpm}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('training.bpm')}</span>
                    </div>
                  )}
                  <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => setSessionRun((r) => !r)}
                      className={`px-6 py-3 rounded-xl font-black uppercase italic text-sm cursor-pointer transition-all ${
                        sessionRun ? 'bg-zinc-800 text-white border border-white/10' : 'bg-white text-black'
                      }`}
                    >
                      {sessionRun ? t('training.pause') : sessionSec > 0 ? t('training.resume') : t('home.start')}
                    </button>
                    {sessionRun && (
                      <button
                        type="button"
                        onClick={() => setLapCount((c) => c + 1)}
                        className="px-6 py-3 rounded-xl font-black uppercase italic text-sm bg-emerald-600 text-white border border-emerald-400/50 hover:bg-emerald-700 cursor-pointer transition-all"
                      >
                        +1 {t('training.lap')}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSessionRun(false);
                        setSessionSec(0);
                        setLapCount(0);
                      }}
                      className="px-6 py-3 rounded-xl font-black uppercase italic text-sm bg-zinc-950 border border-white/10 text-zinc-300 hover:border-orange-500/50 cursor-pointer transition-all"
                    >
                      {t('training.reset')}
                    </button>
                    <button
                      type="button"
                      onClick={finalizeModalitySession}
                      disabled={sessionSec === 0}
                      className="px-6 py-3 rounded-xl font-black uppercase italic text-sm bg-orange-600 text-white border border-orange-400/50 hover:bg-orange-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      {t('training.finishSession')}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 text-center">
                  <p className="text-[10px] font-black uppercase italic text-zinc-500 mb-2">{t('training.sessionTime')}</p>
                  <p className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight tabular-nums">
                    {formatDurationHMS(sessionSec)}
                  </p>
                  {bleState === "connected" && lastHR && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400">
                      <HeartPulse size={18} className="animate-pulse" />
                      <span className="text-3xl font-black tabular-nums">{lastHR.bpm}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('training.bpm')}</span>
                    </div>
                  )}
                  <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => setSessionRun((r) => !r)}
                      className={`px-6 py-3 rounded-xl font-black uppercase italic text-sm cursor-pointer transition-all ${
                        sessionRun ? 'bg-zinc-800 text-white border border-white/10' : 'bg-white text-black'
                      }`}
                    >
                      {sessionRun ? t('training.pause') : sessionSec > 0 ? t('training.resume') : t('home.start')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSessionRun(false);
                        setSessionSec(0);
                      }}
                      className="px-6 py-3 rounded-xl font-black uppercase italic text-sm bg-zinc-950 border border-white/10 text-zinc-300 hover:border-orange-500/50 cursor-pointer transition-all"
                    >
                      {t('training.reset')}
                    </button>
                    <button
                      type="button"
                      onClick={finalizeModalitySession}
                      disabled={sessionSec === 0}
                      className="px-6 py-3 rounded-xl font-black uppercase italic text-sm bg-orange-600 text-white border border-orange-400/50 hover:bg-orange-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      {t('training.finishSession')}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center gap-2">
                <History size={18} className="text-orange-500" />
                <h3 className="text-xs font-black uppercase italic text-zinc-400">{t('training.modalityHistory')}</h3>
              </div>
              <ul className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                {(modalityHistory[trainingModality] ?? []).length === 0 ? (
                  <li className="p-8 text-center text-zinc-600 text-xs font-bold uppercase italic">{t('training.noSessionsYet')}</li>
                ) : (
                    (modalityHistory[trainingModality] ?? []).map((row) => (
                      <li key={row.id} className="px-5 py-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-white font-mono">{formatDurationHMS(row.durationSec)}</p>
                          <p className="text-[9px] text-zinc-500 font-bold mt-0.5">
                            {new Date(row.at).toLocaleString('en-US', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          {row.distanceKm != null && (
                            <span className="text-xs font-mono text-orange-400 shrink-0">{row.distanceKm}{t('common.kmUnit')}</span>
                          )}
                          {row.avgPaceSecPerKm != null && (
                            <span className="text-[9px] font-mono text-zinc-500">
                              {Math.floor(row.avgPaceSecPerKm / 60)}:{(row.avgPaceSecPerKm % 60).toString().padStart(2, '0')}/km
                            </span>
                          )}
                          {row.steps != null && (
                            <span className="text-[9px] font-mono text-zinc-500">{row.steps} {t('training.resultSteps')}</span>
                          )}
                        </div>
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
                  <h3 className="text-lg font-black uppercase italic text-white">{t('training.wegymAI')}</h3>
                </div>
                <X size={24} role="button" tabIndex={0} className="text-zinc-500 cursor-pointer" onClick={() => setShowAI(false)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowAI(false); } }} />
              </div>
              <div className="p-6">
                {aiLoading ? (
                  <div className="py-12 flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-t-orange-600 border-zinc-800 rounded-full animate-spin" />
                    <p className="text-xs font-black uppercase text-orange-500">{t('training.syncingData')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiStep === 'workout_goal' && (
                      <div className="grid grid-cols-1 gap-3">
                        <button onClick={() => generateAIWorkout('bulk')} className="p-5 bg-zinc-950 border border-white/5 rounded-3xl flex items-center gap-4 hover:border-orange-500 transition-all cursor-pointer">
                          <Trophy className="text-orange-500" size={20} /><span className="font-black uppercase italic text-xs">{t('training.focusBulk')}</span>
                        </button>
                        <button onClick={() => generateAIWorkout('cut')} className="p-5 bg-zinc-950 border border-white/5 rounded-3xl flex items-center gap-4 hover:border-orange-500 transition-all cursor-pointer">
                          <Flame className="text-orange-500" size={20} /><span className="font-black uppercase italic text-xs">{t('training.focusCut')}</span>
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
                        <button onClick={() => setShowAI(false)} className="w-full py-4 bg-white text-black font-black uppercase italic rounded-2xl hover:bg-orange-500 hover:text-white transition-all cursor-pointer">{t('training.confirmPlan')}</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-24 right-6 w-95 h-125 bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col z-100 overflow-hidden backdrop-blur-xl">
            <div className="p-4 bg-orange-600 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <BrainCircuit size={20} />
                <span className="font-black italic uppercase text-xs">{t('training.wegymAssistant')}</span>
              </div>
              <button type="button" onClick={() => setChatOpen(false)} className="text-white/80 cursor-pointer"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-300'}`}>{msg.text}</div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800 p-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-white/5 flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !chatLoading) sendChatMessage(); }}
                placeholder={t('training.chatPlaceholder')}
                className="flex-1 bg-zinc-800 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-orange-500/50"
              />
              <button
                type="button"
                onClick={sendChatMessage}
                disabled={chatLoading || !chatInput.trim()}
                className="bg-orange-600 hover:bg-orange-700 disabled:opacity-40 p-2.5 rounded-xl text-white cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showGpsResult && gps.gpsSnapshot && (
          <GpsSessionResult
            snapshot={gps.gpsSnapshot}
            targetTimes={targetTimes}
            targetKm={targetKm}
            selectedTarget={selectedTarget}
            onSave={handleSaveGpsSession}
            onDiscard={handleDiscardGpsSession}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
    </AuthGuard>
  );
}