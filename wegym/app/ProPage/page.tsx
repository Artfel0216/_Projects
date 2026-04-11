"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Crown, Zap, MapPin, 
  Utensils, BarChart3, Users, Check, 
  Star, ShieldCheck, Flame, Sparkles,
  CreditCard, CalendarCheck, Wallet
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('anual');

  useEffect(() => {
    const routes = ['/ProfilePage', '/StatsPage', '/TrainingPage', '/PaymentPage'];
    routes.forEach(route => router.prefetch(route));
  }, [router]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const packages = [
    {
      id: 'personal',
      title: 'Elite Coaching',
      icon: <MapPin className="text-orange-500" />,
      features: [
        'Encontrar Personais por geolocalização',
        'Agendar 1ª aula experimental grátis',
        'Pagamento seguro via app (Escrow)',
        'Consultoria por vídeo chamada'
      ]
    },
    {
      id: 'lifestyle',
      title: 'Nutrição & Saúde',
      icon: <Utensils className="text-emerald-500" />,
      features: [
        'Planos alimentares por nutricionistas',
        'Lista de compras inteligente',
        'Acesso a receitas exclusivas',
        'Suporte a jejum intermitente'
      ]
    },
    {
      id: 'wallet',
      title: 'Wegym Pay & Perks',
      icon: <Wallet className="text-blue-500" />,
      features: [
        'Cashback em suplementos parceiros',
        'Acesso a salas VIP em eventos',
        'Gestão de mensalidades de personal',
        'Seguro saúde esportivo incluso'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 font-sans selection:bg-orange-500/30">
      
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-orange-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-100 h-100 bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <header className="sticky top-0 z-50 bg-zinc-950/60 backdrop-blur-xl border-b border-white/5 px-6 py-5 flex items-center justify-between">
        <Link href="/ProfilePage" className="p-2 bg-white/5 rounded-full transition-colors hover:bg-white/10">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <Crown size={18} className="text-orange-500 fill-orange-500" />
          <span className="font-black italic uppercase tracking-tighter">Wegym Pro</span>
        </div>
        <div className="w-10 h-10" /> 
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-6 pt-10">
        
        <section className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-orange-600/10 border border-orange-500/20 px-4 py-1.5 rounded-full mb-6"
          >
            <Sparkles size={14} className="text-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Upgrade de Atleta</span>
          </motion.div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-4">
            Alcance o <br /> <span className="text-orange-500">Próximo Nível</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium max-w-70 mx-auto leading-relaxed">
            Conecte-se com os melhores profissionais e gerencie sua rotina em um só lugar.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 mb-12">
          {packages.map((pkg, idx) => (
            <motion.div 
              key={pkg.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-zinc-900/40 border border-white/5 p-6 rounded-[35px] backdrop-blur-sm group hover:border-orange-500/30 transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-zinc-800 rounded-2xl group-hover:scale-110 transition-transform">
                  {pkg.icon}
                </div>
                <h3 className="font-black italic uppercase text-lg leading-tight">{pkg.title}</h3>
              </div>
              <ul className="grid grid-cols-1 gap-3">
                {pkg.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-400 text-xs font-bold uppercase tracking-tight">
                    <Check size={14} className="text-orange-500 mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </section>

        <section className="bg-zinc-900/80 border-2 border-orange-500/30 rounded-[40px] p-8 relative overflow-hidden mb-10 shadow-2xl">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Zap size={100} className="text-orange-500 fill-orange-500" />
          </div>

          <div className="flex bg-zinc-950 p-1 rounded-2xl border border-white/5 mb-8 relative z-10">
            <button 
              onClick={() => setSelectedPlan('mensal')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${selectedPlan === 'mensal' ? 'bg-zinc-800 text-white' : 'text-zinc-600'}`}
            >
              Mensal
            </button>
            <button 
              onClick={() => setSelectedPlan('anual')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${selectedPlan === 'anual' ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-600'}`}
            >
              Anual <span className="ml-1 opacity-70 text-[8px]">-40%</span>
            </button>
          </div>

          <div className="text-center relative z-10 mb-8">
            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl font-black italic uppercase">
                {selectedPlan === 'anual' ? 'R$ 29,90' : 'R$ 49,90'}
              </span>
              <span className="text-zinc-500 text-xs font-bold uppercase">/mês</span>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavigation('/PaymentPage')}
            className="w-full bg-white text-black py-6 rounded-3xl font-black italic uppercase text-sm shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 transition-colors hover:bg-zinc-100"
          >
            Assinar Agora
            <CreditCard size={18} className="fill-black/10" />
          </motion.button>
        </section>

      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-zinc-900/80 backdrop-blur-2xl border border-white/10 h-16 rounded-3xl flex items-center justify-around px-8 z-50 shadow-2xl">
        <button 
          onMouseEnter={() => router.prefetch('/StatsPage')}
          onClick={() => handleNavigation('/StatsPage')}
          className="flex flex-col items-center gap-1 opacity-40 cursor-pointer transition-all hover:opacity-100 active:scale-90"
        >
           <BarChart3 size={20} />
           <span className="text-[8px] font-black uppercase tracking-tighter">Stats</span>
        </button>
        
        <div 
          onMouseEnter={() => router.prefetch('/TrainingPage')}
          onClick={() => handleNavigation('/TrainingPage')}
          className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center -mt-10 border-4 border-zinc-950 shadow-xl cursor-pointer hover:scale-110 transition-transform active:scale-95"
        >
           <Flame size={24} className="text-white" />
        </div>

        <div className="flex flex-col items-center gap-1 text-orange-500 cursor-default">
           <Crown size={20} />
           <span className="text-[8px] font-black uppercase tracking-tighter">Pro</span>
        </div>
      </nav>
    </div>
  );
}