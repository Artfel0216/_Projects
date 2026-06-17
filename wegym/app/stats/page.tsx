"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, TrendingUp,
  Flame, Clock,
  Dumbbell, Heart
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useTranslations } from '@/lib/i18n/hook';

export default function StatsPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState('semana');

  useEffect(() => {
    const routes = ['/profile', '/training', '/pro'];
    routes.forEach(route => router.prefetch(route));
  }, [router]);

  const stats = [
    { label: t('stats.totalVolume'), value: '42.5t', icon: <Dumbbell size={18} />, color: 'text-orange-500' },
    { label: t('stats.avgHeartRate'), value: '124 bpm', icon: <Heart size={18} />, color: 'text-rose-500' },
    { label: t('stats.calories'), value: '12.400', icon: <Flame size={18} />, color: 'text-yellow-500' },
    { label: t('stats.activeTime'), value: '18h 45m', icon: <Clock size={18} />, color: 'text-blue-500' },
  ];

  return (
    <AuthGuard>
    <div className="min-h-screen bg-zinc-950 text-white pb-32 font-sans selection:bg-orange-500/30">
      
      <header className="sticky top-0 z-50 bg-zinc-950/60 backdrop-blur-xl border-b border-white/5 px-6 py-5 flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors z-50 cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-black italic uppercase tracking-tighter text-lg">{t('stats.title')}</h1>
        <div className="p-2 bg-orange-600/10 rounded-full text-orange-500">
          <TrendingUp size={20} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-8 space-y-8 relative z-10">
        <section className="flex bg-zinc-900/50 p-1 rounded-2xl border border-white/5">
          {[{label: t('stats.week'), key: 'semana'}, {label: t('stats.month'), key: 'mês'}, {label: t('stats.year'), key: 'ano'}].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                activeTab === tab.key ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </section>

        <section className="grid grid-cols-2 gap-4">
          {stats.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-zinc-900/40 border border-white/5 p-5 rounded-[30px] relative overflow-hidden group"
            >
              <div className={`${item.color} mb-3 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.label}</p>
              <p className="text-2xl font-black italic mt-1">{item.value}</p>
            </motion.div>
          ))}
        </section>

        <section className="bg-zinc-900/40 border border-white/5 rounded-[40px] p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="font-black italic uppercase text-sm">{t('stats.loadVolume')}</h3>
            </div>
          </div>
          <div className="flex items-end justify-between h-40 gap-2">
            {[40, 70, 45, 90, 65, 80, 100].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  className={`w-full rounded-t-lg ${i === 6 ? 'bg-orange-600' : 'bg-zinc-800'}`}
                />
              </div>
            ))}
          </div>
        </section>
      </main>

    </div>
    </AuthGuard>
  );
}