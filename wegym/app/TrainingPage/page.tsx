"use client";

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, Timer, RotateCcw, Zap, CheckCircle2,
  Trophy, X, ChevronRight, Apple, Activity, 
  BrainCircuit, User, Plus, Sparkles, Flame, Target, Utensils, Search, ShoppingCart
} from 'lucide-react';

// --- Componentes Memorizados para Performance ---

const ExerciseItem = memo(({ ex, isCompleted, onToggle }: { ex: Exercise, isCompleted: boolean, onToggle: (id: string) => void }) => (
  <div className="p-5 flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <button 
        onClick={() => ex.id && onToggle(ex.id)} 
        className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-colors ${isCompleted ? 'bg-emerald-500 border-emerald-400' : 'bg-zinc-950 border-zinc-800'}`}
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

// --- Tipagens ---

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

  const currentPlan = useMemo(() => userPlans[activeDay], [userPlans, activeDay]);

  useEffect(() => {
    router.prefetch('/ProfilePage');
  }, [router]);

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
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 relative overflow-hidden antialiased font-sans">
      <div className="fixed top-[-5%] right-[-5%] w-80 h-80 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { setShowAI(true); setAiStep('initial'); }}
        className="fixed bottom-28 right-6 z-50 w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-600/40 border border-orange-400/50"
      >
        <Sparkles className="text-white w-6 h-6 animate-pulse" />
      </motion.button>

      <header className="sticky top-0 z-50 bg-zinc-950/40 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
            <Dumbbell className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black italic tracking-tighter text-white">WEGYM</span>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => { setShowAI(true); setAiStep('add_manual'); }} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center space-x-2">
            <Plus size={14} className="text-orange-500" />
            <span className="text-[10px] font-black uppercase italic text-zinc-300">Exercícios</span>
          </button>
          <button onClick={() => router.push('/ProfilePage')} className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:border-orange-500 transition-colors">
            <User size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8">
        <div className="flex space-x-3 overflow-x-auto pb-6 mb-8 no-scrollbar">
          {userPlans.map((plan, index) => (
            <button 
              key={index} 
              onClick={() => setActiveDay(index)} 
              className={`shrink-0 px-6 py-3 rounded-2xl font-black text-xs uppercase italic border transition-all ${activeDay === index ? "bg-orange-600 border-orange-400 text-white" : "bg-zinc-900/50 border-white/5 text-zinc-500"}`}
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
                {timeLeft}<span className="text-2xl text-orange-500">s</span>
              </div>
              <button 
                onClick={() => setTimerActive(!timerActive)} 
                className={`w-full py-4 rounded-xl font-black uppercase italic transition-all ${timerActive ? 'bg-zinc-800 text-white' : 'bg-white text-black'}`}
              >
                {timerActive ? 'Pausar' : 'Iniciar Descanso'}
              </button>
            </div>
          </aside>

          <section className="lg:col-span-2 space-y-4">
            <div className="bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden">
              <div className="p-5 border-b border-white/5 flex justify-between items-center">
                <h2 className="font-black italic uppercase text-white leading-tight">{currentPlan.day} - {currentPlan.target}</h2>
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
                        <button onClick={() => setAiStep('workout_goal')} className="w-full p-6 bg-zinc-950 border border-white/5 rounded-3xl text-left flex items-center justify-between hover:border-orange-500 transition-all group">
                          <div className="flex items-center gap-4"><Zap className="text-orange-500" size={24} /><p className="font-black uppercase italic text-white text-sm">Gerar Novo Treino IA</p></div>
                          <ChevronRight size={18} className="text-zinc-800 group-hover:text-white" />
                        </button>
                        <button onClick={() => setAiStep('diet_goal')} className="w-full p-6 bg-zinc-950 border border-white/5 rounded-3xl text-left flex items-center justify-between hover:border-orange-500 transition-all group">
                          <div className="flex items-center gap-4"><Utensils className="text-orange-500" size={24} /><p className="font-black uppercase italic text-white text-sm">Consultar Dieta IA</p></div>
                          <ChevronRight size={18} className="text-zinc-800 group-hover:text-white" />
                        </button>
                      </>
                    )}
                    {aiStep === 'workout_goal' && (
                      <div className="grid grid-cols-1 gap-3">
                        <button onClick={() => generateAIWorkout('bulk')} className="p-5 bg-zinc-950 border border-white/5 rounded-3xl flex items-center gap-4 hover:border-orange-500 transition-all">
                          <Trophy className="text-orange-500" size={20} /><span className="font-black uppercase italic text-xs">Foco: Ganho de Massa</span>
                        </button>
                        <button onClick={() => generateAIWorkout('cut')} className="p-5 bg-zinc-950 border border-white/5 rounded-3xl flex items-center gap-4 hover:border-orange-500 transition-all">
                          <Flame className="text-orange-500" size={20} /><span className="font-black uppercase italic text-xs">Foco: Emagrecimento</span>
                        </button>
                      </div>
                    )}
                    {aiStep === 'diet_goal' && (
                      <div className="grid grid-cols-1 gap-3">
                        <button onClick={() => generateFullDiet('cut')} className="p-5 bg-zinc-950 border border-white/5 rounded-3xl flex items-center gap-4 hover:border-orange-500 transition-all">
                          <Flame className="text-orange-500" size={20} /><span className="font-black uppercase italic text-xs">Dieta Emagrecimento</span>
                        </button>
                        <button onClick={() => generateFullDiet('bulk')} className="p-5 bg-zinc-950 border border-white/5 rounded-3xl flex items-center gap-4 hover:border-orange-500 transition-all">
                          <Trophy className="text-orange-500" size={20} /><span className="font-black uppercase italic text-xs">Dieta Ganho de Massa</span>
                        </button>
                      </div>
                    )}
                    {aiStep === 'add_manual' && (
                      <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                        {ALL_AVAILABLE_EXERCISES.map((ex, i) => (
                          <button key={i} onClick={() => addExerciseToPlan(ex)} className="w-full p-4 bg-zinc-950 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-emerald-500/5 transition-all">
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
                        <button onClick={() => setShowAI(false)} className="w-full py-4 bg-white text-black font-black uppercase italic rounded-2xl hover:bg-orange-500 hover:text-white transition-all">Confirmar e Ver Plano</button>
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