"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AuthGuard } from '@/components/auth/AuthGuard';
import {
  Flame, Clock, Trophy, MapPin, Activity,
  ChevronRight, Loader2, Sparkles, Calendar, Zap, History, Dumbbell, Wind, Bike,
} from 'lucide-react';
import {
  buildHomeStats,
  formatRelative,
  readSessionsFromStorage,
} from '@/utils/home-stats';
import { formatDurationHMS } from '@/utils/training-helpers';
import { HomeStats } from '@/types/home';

type ProfileLite = {
  name: string;
  role: 'atleta' | 'personal';
  avatar: string;
  experienceLabel: string;
};

const EXPERIENCE_LABEL: Record<string, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

type ModalityOption = {
  id: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

const MODALITY_OPTIONS: ModalityOption[] = [
  { id: 'gym', label: 'Academia', Icon: Dumbbell },
  { id: 'running', label: 'Corrida', Icon: Activity },
  { id: 'cycling', label: 'Ciclismo', Icon: Bike },
  { id: 'aerobic', label: 'Aeróbico', Icon: Wind },
];

const QUICK_MODALITY_IDS = ['gym', 'running', 'cycling', 'aerobic'] as const;

// Key used to persist sessions in localStorage
const MODALITY_STORAGE_KEY = 'wegym:modality_sessions';

const STAT_FORMATTERS = {
  hours: (sec: number) => {
    if (sec <= 0) return '0h';
    const h = Math.floor(sec / 3600);
    const m = Math.round((sec % 3600) / 60);
    if (h === 0) return `${m} min`;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  },
  km: (km: number) => (km > 0 ? `${km.toFixed(1)} km` : '—'),
};

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [profile, setProfile] = useState<ProfileLite | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    router.prefetch('/training');
    router.prefetch('/profile');
    router.prefetch('/stats');
  }, [router]);

  useEffect(() => {
    const sessions = readSessionsFromStorage(MODALITY_STORAGE_KEY);
    setStats(buildHomeStats(sessions));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/user/profile', {
          credentials: 'include',
          signal: controller.signal,
        });
        if (res.status === 401) {
          router.replace('/');
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        const name = data.athlete?.name ?? data.personal?.name ?? 'Atleta';
        const expRaw = data.athlete?.experienceLevel ?? '';
        setProfile({
          name,
          role: data.role,
          avatar: data.avatarPlaceholder,
          experienceLabel: EXPERIENCE_LABEL[expRaw] ?? '',
        });
      } catch {
        // ignore aborts / network errors – page still works with mock stats
      } finally {
        setLoadingProfile(false);
      }
    })();
    return () => controller.abort();
  }, [router]);

  const firstName = useMemo(
    () => (profile?.name ? profile.name.split(' ')[0] : 'Atleta'),
    [profile?.name],
  );

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 6) return 'Boa madrugada';
    if (h < 12) return 'Bom dia';
    if (h < 19) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const quickModalities = useMemo(
    () =>
      QUICK_MODALITY_IDS.map((id) => MODALITY_OPTIONS.find((m) => m.id === id))
        .filter((m): m is (typeof MODALITY_OPTIONS)[number] => !!m),
    [],
  );

  const goModality = (id: string) => {
    router.push(`/training?modality=${id}`);
  };

  const topModalitiesWithRatio = useMemo(() => {
    if (!stats || stats.topModalities.length === 0) return [];
    const max = Math.max(...stats.topModalities.map((m) => m.count));
    return stats.topModalities.map((m) => ({
      ...m,
      ratio: max > 0 ? m.count / max : 0,
    }));
  }, [stats]);

  return (
    <AuthGuard>
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 relative overflow-hidden antialiased font-sans">
      <div className="fixed top-[-10%] right-[-5%] w-96 h-96 bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-80 h-80 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-40 bg-zinc-950/40 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-4 pl-16 lg:pl-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden shrink-0">
            {profile?.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-zinc-800" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black uppercase italic text-zinc-500 tracking-[0.2em] leading-none">
              {greeting}
            </span>
            <h1 className="text-base sm:text-lg font-black italic uppercase tracking-tighter text-white truncate leading-tight">
              {loadingProfile ? '...' : firstName}
            </h1>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push('/training')}
          className="bg-orange-600 hover:bg-orange-700 px-3 sm:px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors shrink-0"
        >
          <Zap size={14} className="text-white" />
          <span className="text-[10px] sm:text-[11px] font-black uppercase italic text-white">
            Treinar
          </span>
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8 relative z-10">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Sessões totais"
            value={stats ? String(stats.totalSessions) : '—'}
            sub={stats && stats.weekSessions > 0 ? `+${stats.weekSessions} esta semana` : 'Comece a treinar'}
            icon={Activity}
            accent="orange"
          />
          <StatCard
            label="Tempo treinado"
            value={stats ? STAT_FORMATTERS.hours(stats.totalSec) : '—'}
            sub={stats && stats.weekSec > 0 ? `${STAT_FORMATTERS.hours(stats.weekSec)} na semana` : 'Tempo registrado'}
            icon={Clock}
            accent="blue"
          />
          <StatCard
            label="Distância total"
            value={stats ? STAT_FORMATTERS.km(stats.totalKm) : '—'}
            sub="Corrida, ciclismo, etc."
            icon={MapPin}
            accent="emerald"
          />
          <StatCard
            label="Dias ativos"
            value={stats ? String(stats.activeDays) : '—'}
            sub={stats && stats.activeDays > 0 ? 'Constância é tudo' : 'Comece hoje'}
            icon={Flame}
            accent="rose"
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-zinc-900/40 border border-white/5 rounded-4xl p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-1">
                  Esportes mais praticados
                </p>
                <h2 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter text-white leading-tight">
                  Seu ranking pessoal
                </h2>
              </div>
              <Trophy size={20} className="text-orange-500 opacity-50 shrink-0" />
            </div>

            {topModalitiesWithRatio.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="Nenhum esporte registrado ainda"
                description="Inicie uma sessão na aba Treinos e seus esportes mais praticados aparecem aqui."
                actionLabel="Ir para treinos"
                onAction={() => router.push('/training')}
              />
            ) : (
              <div className="space-y-4">
                {topModalitiesWithRatio.map((m, idx) => {
                  const meta = MODALITY_OPTIONS.find((opt) => opt.id === m.id);
                  const Icon = meta?.Icon ?? Activity;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => goModality(m.id)}
                      className="w-full text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center shrink-0">
                          <Icon size={16} className="text-zinc-300 group-hover:text-orange-500 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0 flex items-baseline justify-between gap-2">
                          <span className="font-black italic uppercase text-sm text-white truncate">
                            {m.label}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 shrink-0">
                            {m.count} {m.count === 1 ? 'sessão' : 'sessões'}
                          </span>
                        </div>
                        {idx === 0 && (
                          <span className="text-[8px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                            Top
                          </span>
                        )}
                      </div>
                      <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-white/5 ml-11">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(6, Math.round(m.ratio * 100))}%` }}
                          transition={{ duration: 0.6, delay: idx * 0.08 }}
                          className={`h-full ${idx === 0 ? 'bg-linear-to-r from-orange-500 to-orange-600' : 'bg-zinc-700'}`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="bg-linear-to-br from-orange-600 to-orange-700 rounded-4xl p-6 sm:p-8 relative overflow-hidden shadow-2xl shadow-orange-900/30">
            <div className="relative z-10 space-y-5">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/70 mb-2">
                  Esporte favorito
                </p>
                {stats?.favoriteModality ? (
                  <h3 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
                    {stats.favoriteModality.label}
                  </h3>
                ) : (
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-white/80 leading-tight">
                    Descubra o seu
                  </h3>
                )}
              </div>

              {stats?.favoriteModality ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/60">
                      Sessões
                    </p>
                    <p className="text-xl font-black italic text-white">
                      {stats.favoriteModality.count}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/60">
                      Tempo
                    </p>
                    <p className="text-xl font-black italic text-white">
                      {STAT_FORMATTERS.hours(stats.favoriteModality.totalSec)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/80 leading-relaxed font-medium">
                  Treine em diferentes modalidades e descubra qual mais combina com você.
                </p>
              )}

              <button
                type="button"
                onClick={() =>
                  goModality(stats?.favoriteModality?.id ?? 'gym')
                }
                className="bg-white text-orange-600 px-4 py-2.5 rounded-xl font-black uppercase italic text-[10px] flex items-center gap-2 hover:scale-105 transition-transform shadow-xl cursor-pointer"
              >
                Treinar agora
                <ChevronRight size={14} />
              </button>
            </div>
            <Trophy size={140} className="absolute -right-6 -bottom-8 text-white/10 -rotate-12" />
          </aside>
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter text-white">
              Início rápido
            </h2>
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">
              Escolha uma modalidade
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {quickModalities.map((m) => {
              const Icon = m.Icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => goModality(m.id)}
                  className="bg-zinc-900/40 border border-white/5 rounded-[28px] p-5 flex flex-col items-start gap-3 hover:border-orange-500/40 hover:bg-zinc-900/60 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon size={18} className="text-zinc-300 group-hover:text-orange-500 transition-colors" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black italic uppercase tracking-tighter text-white leading-tight">
                      {m.label}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mt-1">
                      Iniciar
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-zinc-900/40 border border-white/5 rounded-4xl p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-1">
                Atividade recente
              </p>
              <h2 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter text-white leading-tight">
                Últimas sessões
              </h2>
            </div>
            <History size={20} className="text-orange-500 opacity-50 shrink-0" />
          </div>

          {!stats || stats.recentSessions.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Sem sessões registradas ainda"
              description="Quando você finalizar uma sessão de treino na aba Treinos, ela aparece aqui."
            />
          ) : (
            <ul className="divide-y divide-white/5">
              {stats.recentSessions.map((s) => {
                const meta = MODALITY_OPTIONS.find((opt) => opt.id === s.modalityId);
                const Icon = meta?.Icon ?? Activity;

                return (
                  <li key={s.id} className="py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-zinc-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black italic uppercase text-white truncate">
                        {s.modalityLabel}
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                        {formatRelative(s.at)} · {formatDurationHMS(s.durationSec)}
                        {s.distanceKm != null ? ` · ${s.distanceKm} km` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => goModality(s.modalityId)}
                      className="text-zinc-600 hover:text-orange-500 transition-colors shrink-0 cursor-pointer"
                      aria-label={`Repetir ${s.modalityLabel}`}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      {loadingProfile && !stats && (
        <div className="fixed inset-0 flex items-center justify-center bg-zinc-950/40 pointer-events-none z-50">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      )}
    </div>
    </AuthGuard>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: 'orange' | 'blue' | 'emerald' | 'rose';
}

const ACCENT_COLORS: Record<StatCardProps['accent'], string> = {
  orange: 'text-orange-500',
  blue: 'text-blue-400',
  emerald: 'text-emerald-400',
  rose: 'text-rose-400',
};

function StatCard({ label, value, sub, icon: Icon, accent }: StatCardProps) {
  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-4 sm:p-5 relative overflow-hidden">
      <div className={`mb-2 ${ACCENT_COLORS[accent]}`}>
        <Icon size={18} />
      </div>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 leading-tight">
        {label}
      </p>
      <p className="text-2xl font-black italic text-white mt-1 leading-none">{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 mt-2 truncate">
        {sub}
      </p>
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="text-center py-10 px-4">
      <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center mx-auto mb-4">
        <Icon size={20} className="text-zinc-500" />
      </div>
      <p className="text-sm font-black italic uppercase text-white tracking-tight">{title}</p>
      <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto font-medium leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 bg-orange-600 hover:bg-orange-700 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase italic text-white cursor-pointer transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
