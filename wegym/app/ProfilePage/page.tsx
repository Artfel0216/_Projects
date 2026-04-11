"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Zap, ChevronLeft, Camera, Weight, Ruler, 
  CheckCircle2, Crown, Smartphone, ChevronRight, Flame, Activity, Star 
} from 'lucide-react';

export default function AdvancedProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState({
    nome: "Arthur Fellipe",
    foto: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
    peso: 84.5,
    altura: 1.82,
    xp: 2450
  });

  const [isPro, setIsPro] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { nivel, progressoNivel, xpFaltante } = useMemo(() => {
    const n = Math.floor(userData.xp / 1000);
    const p = (userData.xp % 1000) / 10;
    return { nivel: n, progressoNivel: p, xpFaltante: 1000 - (userData.xp % 1000) };
  }, [userData.xp]);

  useEffect(() => {
    const routes = ['/ProPage', '/StatsPage', '/TrainingPage'];
    routes.forEach(route => router.prefetch(route));
  }, [router]);

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const syncHealthData = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setUserData(prev => ({ ...prev, xp: prev.xp + 150 }));
      setIsSyncing(false);
      triggerToast();
    }, 2000);
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-40 overflow-x-hidden font-sans">
      
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 inset-x-0 z-100 flex justify-center pointer-events-none"
          >
            <div className="bg-orange-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-orange-400/30">
              <CheckCircle2 size={18} />
              <span className="font-black italic uppercase text-xs tracking-widest">Sincronizado com Sucesso!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-50 bg-zinc-950/60 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Dashboard Elite</span>
          <div className="flex items-center gap-1">
             {isPro && <motion.div animate={pulseAnimation}><Crown size={12} className="text-orange-500 fill-orange-500" /></motion.div>}
             <span className="text-sm font-black italic text-white uppercase tracking-tighter">Level {nivel}</span>
          </div>
        </div>
        <button className="p-2 bg-white/5 rounded-full text-orange-500 hover:bg-orange-600/10"><Star size={20} /></button>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-8 space-y-10">

        <section className="flex flex-col items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-[40px] bg-zinc-900 border-4 border-zinc-950 overflow-hidden shadow-2xl">
              <img src={userData.foto} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <label className="absolute bottom-0 right-0 bg-orange-600 p-2.5 rounded-2xl border-4 border-zinc-950 text-white cursor-pointer hover:bg-orange-500 transition-colors">
              <Camera size={18} />
              <input type="file" className="hidden" onChange={() => triggerToast()} />
            </label>
          </div>
          <div className="text-center mt-6">
            <input 
              className="bg-transparent text-3xl font-black italic uppercase tracking-tighter text-center outline-none focus:text-orange-600 transition-colors"
              value={userData.nome}
              onChange={(e) => setUserData({...userData, nome: e.target.value})}
            />
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Sócio Wegym desde 2024</p>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-[30px] group hover:border-orange-500/30 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <Weight size={18} className="text-orange-500" />
              <span className="text-[10px] font-black text-zinc-500 uppercase">Peso Atual</span>
            </div>
            <input 
              type="number" 
              className="bg-transparent text-2xl font-black italic outline-none w-full"
              value={isNaN(userData.peso) ? "" : userData.peso}
              onChange={(e) => setUserData({...userData, peso: e.target.value === "" ? NaN : parseFloat(e.target.value)})}
            />
          </div>
          <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-[30px] group hover:border-blue-500/30 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <Ruler size={18} className="text-blue-500" />
              <span className="text-[10px] font-black text-zinc-500 uppercase">Altura</span>
            </div>
            <input 
              type="number" 
              step="0.01"
              className="bg-transparent text-2xl font-black italic outline-none w-full"
              value={isNaN(userData.altura) ? "" : userData.altura}
              onChange={(e) => setUserData({...userData, altura: e.target.value === "" ? NaN : parseFloat(e.target.value)})}
            />
          </div>
        </section>

        {!isPro && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateTo('/ProPage')}
            className="w-full bg-linear-to-r from-orange-600 to-orange-400 p-6 rounded-[35px] flex items-center justify-between shadow-[0_20px_40px_rgba(234,88,12,0.2)]"
          >
            <div className="text-left">
              <p className="text-white font-black italic uppercase text-xl leading-none">Seja Wegym Pro</p>
              <p className="text-white/80 text-[10px] font-bold uppercase mt-2">Treinos com IA e Análise Biométrica</p>
            </div>
            <Crown size={32} className="text-white fill-white/20" />
          </motion.button>
        )}

        <button 
          onClick={syncHealthData}
          disabled={isSyncing}
          className="w-full bg-zinc-900 border border-white/5 p-5 rounded-[30px] flex items-center justify-between group hover:bg-zinc-800 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isSyncing ? 'animate-spin' : ''} bg-white/5 text-orange-500`}>
              <Smartphone size={20} />
            </div>
            <div className="text-left">
              <p className="font-black italic uppercase text-xs">Sincronizar Dispositivo</p>
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tight">Apple Health / Google Fit</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-zinc-700" />
        </button>

        <section className="bg-zinc-900/20 border border-white/5 rounded-[35px] p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-orange-500" />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sua Jornada XP</span>
            </div>
            <span className="text-xs font-black italic text-orange-500">Faltam {xpFaltante} XP</span>
          </div>
          <div className="h-4 w-full bg-zinc-950 rounded-full overflow-hidden p-1 border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressoNivel}%` }}
              className="h-full bg-linear-to-r from-orange-600 to-yellow-400 rounded-full"
            />
          </div>
        </section>

      </main>

      <nav className="fixed bottom-0 inset-x-0 h-24 bg-zinc-950/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-12 z-50">
        <button onClick={() => navigateTo('/StatsPage')}>
          <Activity size={24} className="text-zinc-600 hover:text-white transition-colors" />
        </button>

        <button 
          onClick={() => navigateTo('/TrainingPage')}
          className="relative -mt-10"
        >
          <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center border-4 border-zinc-950 shadow-2xl hover:scale-110 transition-transform">
            <Zap size={30} className="text-white fill-white" />
          </div>
        </button>

        <button>
          <User size={24} className="text-orange-500" />
        </button>
      </nav>
    </div>
  );
}