"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Zap,
  ChevronLeft,
  Camera,
  Weight,
  Ruler,
  CheckCircle2,
  Crown,
  Smartphone,
  ChevronRight,
  Flame,
  Activity,
  Star,
  Mail,
  Loader2,
  IdCard,
} from "lucide-react";

const XP_STORAGE_PREFIX = "wegym-user-xp-";

const EXPERIENCE_LABEL: Record<string, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

type ProfileLoadState = "loading" | "error" | "ready";

type ApiProfile = {
  id: string;
  email: string;
  role: "atleta" | "personal";
  createdAt: string;
  avatarPlaceholder: string;
  athlete: {
    name: string;
    city: string;
    state: string;
    age: number;
    heightCm: number;
    weightKg: number;
    experienceLevel: string;
  } | null;
  personal: { name: string; cref: string } | null;
};

type LocalUser = {
  userId: string;
  nome: string;
  foto: string;
  peso: number;
  altura: number;
  xp: number;
  email: string;
  role: "atleta" | "personal";
  /** ex.: 15 de janeiro de 2026 */
  memberSinceLabel: string;
  experienceLabel: string;
  cityState: string;
  cref: string;
};

function formatMemberSince(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function readStoredXp(userId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const v = localStorage.getItem(XP_STORAGE_PREFIX + userId);
    if (v == null) return 0;
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? 0 : n;
  } catch {
    return 0;
  }
}

function writeStoredXp(userId: string, xp: number) {
  try {
    localStorage.setItem(XP_STORAGE_PREFIX + userId, String(xp));
  } catch {
    // ignore
  }
}

export default function AdvancedProfilePage() {
  const router = useRouter();
  const [loadState, setLoadState] = useState<ProfileLoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userData, setUserData] = useState<LocalUser | null>(null);

  const [isPro] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { nivel, progressoNivel, xpFaltante } = useMemo(() => {
    const xp = userData?.xp ?? 0;
    const n = Math.floor(xp / 1000);
    const p = (xp % 1000) / 10;
    return { nivel: n, progressoNivel: p, xpFaltante: 1000 - (xp % 1000) };
  }, [userData?.xp]);

  const mapApiToLocal = useCallback(
    (data: ApiProfile, prevXp: number) => {
      const userId = data.id;
      const since = formatMemberSince(data.createdAt);
      if (data.role === "atleta" && data.athlete) {
        const a = data.athlete;
        return {
          userId,
          nome: a.name,
          foto: data.avatarPlaceholder,
          peso: a.weightKg,
          altura: a.heightCm / 100,
          xp: prevXp,
          email: data.email,
          role: "atleta" as const,
          memberSinceLabel: since,
          experienceLabel: EXPERIENCE_LABEL[a.experienceLevel] ?? a.experienceLevel,
          cityState: `${a.city} · ${a.state}`,
          cref: "",
        };
      }
      if (data.role === "personal" && data.personal) {
        const p = data.personal;
        return {
          userId,
          nome: p.name,
          foto: data.avatarPlaceholder,
          peso: 0,
          altura: 0,
          xp: prevXp,
          email: data.email,
          role: "personal" as const,
          memberSinceLabel: since,
          experienceLabel: "Personal trainer",
          cityState: "",
          cref: p.cref,
        };
      }
      return {
        userId,
        nome: "Usuário",
        foto: data.avatarPlaceholder,
        peso: 0,
        altura: 0,
        xp: prevXp,
        email: data.email,
        role: data.role,
        memberSinceLabel: since,
        experienceLabel: "",
        cityState: "",
        cref: "",
      };
    },
    [],
  );

  const loadProfile = useCallback(async () => {
    setLoadState("loading");
    setLoadError(null);
    try {
      const res = await fetch("/api/user/profile", { credentials: "include" });
      if (res.status === 401) {
        router.replace("/");
        return;
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setLoadError((j as { error?: string }).error || "Não foi possível carregar o perfil.");
        setLoadState("error");
        return;
      }
      const data = (await res.json()) as ApiProfile;
      const storedXp = readStoredXp(data.id);
      setUserData(mapApiToLocal(data, storedXp));
      setLoadState("ready");
    } catch {
      setLoadError("Falha de conexão.");
      setLoadState("error");
    }
  }, [router, mapApiToLocal]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    ["/ProPage", "/StatsPage", "/TrainingPage"].forEach((route) => router.prefetch(route));
  }, [router]);

  const persistField = useCallback(
    async (patch: { name?: string; weightKg?: number; heightCm?: number }) => {
      if (!userData) return;
      if (userData.role === "personal") {
        if (patch.name) {
          const res = await fetch("/api/user/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name: patch.name }),
          });
          if (res.ok) {
            const data = (await res.json()) as ApiProfile;
            setUserData(mapApiToLocal(data, userData.xp));
          }
        }
        return;
      }
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const data = (await res.json()) as ApiProfile;
        setUserData((prev) => (prev ? mapApiToLocal(data, prev.xp) : null));
      }
    },
    [userData, mapApiToLocal],
  );

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const syncHealthData = () => {
    if (!userData) return;
    setIsSyncing(true);
    setTimeout(() => {
      setUserData((prev) => {
        if (!prev) return prev;
        const next = { ...prev, xp: prev.xp + 150 };
        writeStoredXp(next.userId, next.xp);
        return next;
      });
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
    transition: { duration: 2, repeat: Infinity },
  };

  if (loadState === "error") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-6 px-6 font-sans">
        <p className="text-sm text-zinc-400 text-center max-w-sm">{loadError}</p>
        <button
          type="button"
          onClick={() => void loadProfile()}
          className="px-6 py-3 rounded-xl bg-orange-600 text-black font-black uppercase italic text-sm cursor-pointer"
        >
          Tentar de novo
        </button>
        <button type="button" onClick={() => router.push("/")} className="text-xs text-zinc-600 font-bold uppercase cursor-pointer">
          Voltar ao login
        </button>
      </div>
    );
  }

  if (loadState === "loading" || !userData) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4 font-sans">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        <p className="text-xs font-black uppercase italic text-zinc-500">Carregando seu perfil…</p>
      </div>
    );
  }

  const isAtleta = userData.role === "atleta";

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
          className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col items-center min-w-0">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Dashboard Elite</span>
          <div className="flex items-center gap-1">
            {isPro && (
              <motion.div animate={pulseAnimation}>
                <Crown size={12} className="text-orange-500 fill-orange-500" />
              </motion.div>
            )}
            <span className="text-sm font-black italic text-white uppercase tracking-tighter">Level {nivel}</span>
          </div>
        </div>
        <button type="button" className="p-2 bg-white/5 rounded-full text-orange-500 hover:bg-orange-600/10 cursor-pointer">
          <Star size={20} />
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-8 space-y-10">
        <section className="flex flex-col items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-[40px] bg-zinc-900 border-4 border-zinc-950 overflow-hidden shadow-2xl">
              <img src={userData.foto} alt="" className="w-full h-full object-cover" />
            </div>
            <label className="absolute bottom-0 right-0 bg-orange-600 p-2.5 rounded-2xl border-4 border-zinc-950 text-white cursor-pointer hover:bg-orange-500 transition-colors">
              <Camera size={18} />
              <input type="file" className="hidden" onChange={() => triggerToast()} />
            </label>
          </div>
          <div className="text-center mt-6 w-full max-w-md">
            <input
              className="bg-transparent text-3xl font-black italic uppercase tracking-tighter text-center outline-none focus:text-orange-600 transition-colors w-full"
              value={userData.nome}
              onChange={(e) => setUserData({ ...userData, nome: e.target.value })}
              onBlur={() => persistField({ name: userData.nome })}
            />
            <p className="text-zinc-500 text-[11px] font-medium mt-2 flex items-center justify-center gap-1.5">
              <Mail size={12} className="shrink-0" />
              {userData.email}
            </p>
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-center max-w-sm mx-auto leading-relaxed">
              Usuário Wegym desde {userData.memberSinceLabel}
            </p>
            {isAtleta && userData.cityState ? (
              <p className="text-zinc-500 text-[10px] font-bold uppercase mt-1">{userData.cityState}</p>
            ) : null}
            <p className="text-orange-500/80 text-[10px] font-black uppercase mt-2 tracking-widest">
              {userData.experienceLabel}
            </p>
            {!isAtleta && userData.cref ? (
              <p className="text-zinc-500 text-[10px] font-mono mt-2 flex items-center justify-center gap-1">
                <IdCard size={12} />
                {userData.cref}
              </p>
            ) : null}
          </div>
        </section>

        {isAtleta ? (
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-[30px] group hover:border-orange-500/30 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <Weight size={18} className="text-orange-500" />
                <span className="text-[10px] font-black text-zinc-500 uppercase">Peso Atual (kg)</span>
              </div>
              <input
                type="number"
                className="bg-transparent text-2xl font-black italic outline-none w-full"
                value={Number.isNaN(userData.peso) ? "" : userData.peso}
                onChange={(e) =>
                  setUserData({
                    ...userData,
                    peso: e.target.value === "" ? Number.NaN : parseFloat(e.target.value),
                  })
                }
                onBlur={() => {
                  if (!Number.isNaN(userData.peso) && userData.peso > 0) {
                    void persistField({ weightKg: userData.peso });
                  }
                }}
              />
            </div>
            <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-[30px] group hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <Ruler size={18} className="text-blue-500" />
                <span className="text-[10px] font-black text-zinc-500 uppercase">Altura (m)</span>
              </div>
              <input
                type="number"
                step="0.01"
                className="bg-transparent text-2xl font-black italic outline-none w-full"
                value={Number.isNaN(userData.altura) ? "" : userData.altura}
                onChange={(e) =>
                  setUserData({
                    ...userData,
                    altura: e.target.value === "" ? Number.NaN : parseFloat(e.target.value),
                  })
                }
                onBlur={() => {
                  if (!Number.isNaN(userData.altura) && userData.altura > 0) {
                    void persistField({ heightCm: userData.altura * 100 });
                  }
                }}
              />
            </div>
          </section>
        ) : (
          <section className="bg-zinc-900/40 border border-white/5 p-6 rounded-[30px]">
            <div className="flex items-center gap-3 mb-1">
              <IdCard size={20} className="text-orange-500" />
              <span className="text-[10px] font-black text-zinc-500 uppercase">CREF</span>
            </div>
            <p className="text-lg font-mono text-white font-bold tracking-tight">{userData.cref}</p>
          </section>
        )}

        {!isPro && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateTo("/ProPage")}
            className="w-full bg-linear-to-r from-orange-600 to-orange-400 p-6 rounded-[35px] flex items-center justify-between shadow-[0_20px_40px_rgba(234,88,12,0.2)] cursor-pointer"
          >
            <div className="text-left">
              <p className="text-white font-black italic uppercase text-xl leading-none">Seja Wegym Pro</p>
              <p className="text-white/80 text-[10px] font-bold uppercase mt-2">Treinos com IA e Análise Biométrica</p>
            </div>
            <Crown size={32} className="text-white fill-white/20" />
          </motion.button>
        )}

        <button
          type="button"
          onClick={syncHealthData}
          disabled={isSyncing}
          className="w-full bg-zinc-900 border border-white/5 p-5 rounded-[30px] flex items-center justify-between group hover:bg-zinc-800 transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isSyncing ? "animate-spin" : ""} bg-white/5 text-orange-500`}>
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

      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 px-8 py-4 flex justify-between items-center z-50">
        <button type="button" onClick={() => navigateTo("/StatsPage")} className="cursor-pointer">
          <Activity size={24} className="text-zinc-600 hover:text-white transition-colors" />
        </button>

        <button type="button" onClick={() => navigateTo("/TrainingPage")} className="cursor-pointer">
          <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center -mt-10 shadow-xl hover:scale-105 transition-transform">
            <Zap size={24} className="text-white fill-white" />
          </div>
        </button>

        <button type="button" className="cursor-pointer">
          <User size={24} className="text-orange-500" />
        </button>
      </nav>
    </div>
  );
}
