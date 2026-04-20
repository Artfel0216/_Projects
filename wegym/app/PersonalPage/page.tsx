"use client";

import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Calendar, TrendingUp, Search, Filter, 
  MoreVertical, CalendarDays, User, Plus, Award, 
  ChevronRight, Target, Dumbbell, Send, X, Bot, CheckCircle2, Trash2
} from 'lucide-react';

const WEEKLY_CLASSES = [
  { id: '1', day: 'Seg', date: '21/04', time: '07:00', student: 'Carlos Silva', type: 'Hipertrofia', status: 'confirmed' },
  { id: '2', day: 'Seg', date: '21/04', time: '08:30', student: 'Ana Souza', type: 'Funcional', status: 'confirmed' },
  { id: '3', day: 'Ter', date: '22/04', time: '18:00', student: 'Marcos Reais', type: 'Powerlifting', status: 'pending' },
  { id: '4', day: 'Qua', date: '23/04', time: '06:00', student: 'Beatriz Luz', type: 'Emagrecimento', status: 'confirmed' },
  { id: '5', day: 'Qui', date: '24/04', time: '10:00', student: 'Ricardo Oliveira', type: 'Mobilidade', status: 'canceled' },
];

const STUDENTS_SUMMARY = [
  { name: 'Carlos Silva', plan: 'Premium', lastTraining: 'Hoje', progress: 85 },
  { name: 'Ana Souza', plan: 'Basic', lastTraining: 'Ontem', progress: 40 },
  { name: 'Beatriz Luz', plan: 'Premium', lastTraining: 'Há 2 dias', progress: 65 },
];

const StatCard = ({ title, value, icon: Icon, trend }: any) => (
  <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/5 relative overflow-hidden">
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 bg-orange-600/10 rounded-xl">
        <Icon className="text-orange-500" size={20} />
      </div>
      {trend && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">+{trend}%</span>}
    </div>
    <p className="text-zinc-500 text-[10px] font-black uppercase italic">{title}</p>
    <p className="text-2xl font-black text-white italic tracking-tighter">{value}</p>
  </div>
);

const AgendaItem = memo(({ item }: any) => (
  <div className="flex items-center justify-between p-4 bg-zinc-900/30 border border-white/5 rounded-2xl hover:border-orange-500/50 transition-all group">
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center justify-center bg-zinc-950 w-14 h-14 rounded-xl border border-white/5">
        <span className="text-[10px] font-black text-orange-500 uppercase">{item.day}</span>
        <span className="text-sm font-black text-white">{item.time}</span>
      </div>
      <div>
        <h4 className="font-black italic uppercase text-sm text-white">{item.student}</h4>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{item.type}</span>
          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'confirmed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </div>
      </div>
    </div>
    <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 transition-colors">
      <MoreVertical size={18} />
    </button>
  </div>
));

AgendaItem.displayName = 'AgendaItem';

export default function PersonalDashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<any>(null);

  // Estados para inclusão manual
  const [manualEx, setManualEx] = useState({ name: '', sets: '', reps: '', load: '' });

  const addManualExercise = () => {
    if (!manualEx.name) return;
    
    const newWorkout = activeWorkout ? { ...activeWorkout } : {
      student: "Novo Treino",
      goal: "Manual",
      exercises: []
    };

    newWorkout.exercises.push({ ...manualEx });
    setActiveWorkout(newWorkout);
    setManualEx({ name: '', sets: '', reps: '', load: '' });
  };

  const handleChat = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      
      if (data.workoutGenerated) {
        setActiveWorkout(data.workoutData);
      }
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (e) {
      setActiveWorkout({
        student: "Carlos Silva",
        goal: "Hipertrofia - Otimizado",
        exercises: [
          { name: "Supino Inclinado", sets: 4, reps: "10-12", load: "35kg" },
          { name: "Crucifixo Máquina", sets: 3, reps: "15", load: "45kg" }
        ]
      });
      setMessages(prev => [...prev, { role: 'assistant', content: "Houve um erro na conexão, mas gerei um treino padrão para você continuar." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 relative overflow-hidden antialiased font-sans">
      <div className="fixed top-[-10%] left-[-5%] w-96 h-96 bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-50 bg-zinc-950/60 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
            <Award className="text-white w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black italic tracking-tighter text-white block leading-none">PRO COACH</span>
            <span className="text-[9px] font-bold text-orange-500 uppercase tracking-[0.2em]">Personal Panel</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => { setShowManualAdd(!showManualAdd); if(!activeWorkout) setActiveWorkout({student: "Novo Aluno", goal: "Manual", exercises: []}) }}
            className="bg-orange-600 hover:bg-orange-700 p-2.5 rounded-xl transition-all flex items-center gap-2 group"
          >
            <Plus size={20} className="text-white group-hover:rotate-90 transition-transform" />
            <span className="text-[10px] font-black uppercase italic pr-1 hidden md:block text-white">Manual</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Alunos Ativos" value="24" icon={Users} trend="12" />
          <StatCard title="Aulas p/ Semana" value="38" icon={CalendarDays} />
          <StatCard title="Faturamento Mês" value="R$ 8.450" icon={TrendingUp} trend="5" />
          <StatCard title="Taxa de Retenção" value="94%" icon={Target} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode='wait'>
              {!activeWorkout ? (
                <motion.div key="agenda" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">Cronograma Semanal</h2>
                  <div className="space-y-3">
                    {WEEKLY_CLASSES.map((item) => <AgendaItem key={item.id} item={item} />)}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="workout" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-zinc-900/50 rounded-[40px] border border-white/10 p-8 relative">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-orange-600 rounded-3xl"><Dumbbell className="text-white" size={32} /></div>
                      <div>
                        <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">{activeWorkout.student}</h2>
                        <p className="text-orange-500 text-xs font-black uppercase tracking-[0.2em]">{activeWorkout.goal}</p>
                      </div>
                    </div>
                    <button onClick={() => {setActiveWorkout(null); setShowManualAdd(false)}} className="text-zinc-500 hover:text-white p-2 bg-white/5 rounded-full transition-colors"><X size={24} /></button>
                  </div>

                  {/* FORMULÁRIO MANUAL */}
                  {showManualAdd && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-8 p-6 bg-zinc-950/50 rounded-3xl border border-orange-500/20 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input value={manualEx.name} onChange={e => setManualEx({...manualEx, name: e.target.value})} placeholder="Exercício" className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:border-orange-500 outline-none" />
                      <input value={manualEx.sets} onChange={e => setManualEx({...manualEx, sets: e.target.value})} placeholder="Séries" className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:border-orange-500 outline-none" />
                      <input value={manualEx.reps} onChange={e => setManualEx({...manualEx, reps: e.target.value})} placeholder="Reps" className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:border-orange-500 outline-none" />
                      <button onClick={addManualExercise} className="bg-orange-600 text-white font-black italic uppercase text-[10px] rounded-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-2 py-2">
                        <Plus size={14} /> Adicionar
                      </button>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    {activeWorkout.exercises.map((ex: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-5 bg-zinc-950/50 rounded-2xl border border-white/5 group hover:border-orange-500/50 transition-all">
                        <div className="flex items-center gap-5">
                          <div className="w-10 h-10 rounded-full border-2 border-zinc-800 flex items-center justify-center text-zinc-500 font-black italic text-xs group-hover:border-orange-500 group-hover:text-orange-500">{idx + 1}</div>
                          <div>
                            <p className="font-black italic uppercase text-white text-sm">{ex.name}</p>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{ex.sets} séries x {ex.reps}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="bg-zinc-900 px-3 py-1 rounded-lg text-orange-500 font-black italic text-[10px] border border-white/5">{ex.load || '0kg'}</span>
                          <button onClick={() => {
                            const updated = {...activeWorkout};
                            updated.exercises.splice(idx, 1);
                            setActiveWorkout({...updated});
                          }} className="text-zinc-800 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <aside className="space-y-6">
            <div className="bg-orange-600 rounded-[40px] p-8 relative overflow-hidden shadow-2xl shadow-orange-600/20">
              <div className="relative z-10">
                <h3 className="text-white font-black italic uppercase text-2xl leading-tight mb-4">Otimização<br />por IA</h3>
                <button onClick={() => setIsChatOpen(true)} className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-black uppercase italic text-xs flex items-center gap-3 hover:scale-105 transition-transform shadow-xl">
                  Falar com Copilot <Bot size={16} />
                </button>
              </div>
              <Bot size={160} className="absolute -right-10 -bottom-10 text-white/10 -rotate-12" />
            </div>

            <div className="bg-zinc-900/50 rounded-3xl border border-white/5 p-6">
              <h3 className="text-white font-black italic uppercase text-sm mb-4">Meus Alunos</h3>
              <div className="space-y-5">
                {STUDENTS_SUMMARY.map((student, i) => (
                  <div key={i} className="flex flex-col gap-2 cursor-pointer hover:translate-x-1 transition-transform" onClick={() => setActiveWorkout({student: student.name, goal: "Prescrição Personalizada", exercises: []})}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-bold">{student.name.charAt(0)}</div>
                        <div>
                          <p className="text-[11px] font-black uppercase text-white">{student.name}</p>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase">{student.lastTraining}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-zinc-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* CHAT INTERFACE - Mantendo sua estrutura */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-24 right-6 w-95 h-125 bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col z-100 overflow-hidden backdrop-blur-xl">
            <div className="p-4 bg-orange-600 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white"><Bot size={20} /><span className="font-black italic uppercase text-xs">Gemini Copilot</span></div>
              <button onClick={() => setIsChatOpen(false)} className="text-white/80"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] ${msg.role === 'user' ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-300'}`}>{msg.content}</div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/5 flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChat()} placeholder="Gere o treino do Carlos..." className="flex-1 bg-zinc-900 rounded-xl px-4 text-xs text-white outline-none" />
              <button onClick={handleChat} disabled={loading} className="bg-orange-600 p-2.5 rounded-xl text-white"><Send size={18} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 px-8 py-4 flex justify-between items-center lg:hidden z-50">
        <Calendar size={24} className="text-orange-500" />
        <Users size={24} className="text-zinc-600" />
        <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center -mt-10 border-4 border-zinc-950 shadow-xl" onClick={() => setShowManualAdd(true)}><Plus size={24} className="text-white" /></div>
        <TrendingUp size={24} className="text-zinc-600" />
        <User size={24} className="text-zinc-600" />
      </nav>
    </div>
  );
}