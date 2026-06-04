"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  Crown,
  Heart,
  IdCard,
  Info,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Ruler,
  Settings,
  ShieldCheck,
  Smartphone,
  Trophy,
  User as UserIcon,
  Weight,
  X,
} from "lucide-react";

const EXPERIENCE_LABEL: Record<string, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

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
  pesoKg: number;
  alturaCm: number;
  email: string;
  role: "atleta" | "personal";
  memberSinceLabel: string;
  experienceLabel: string;
  cityState: string;
  cref: string;
};

type LoadState = "loading" | "error" | "ready";
type EditableField = "name" | "weight" | "height" | null;
type ToastTone = "success" | "info";

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

function mapApiToLocal(data: ApiProfile): LocalUser {
  const since = formatMemberSince(data.createdAt);
  if (data.role === "atleta" && data.athlete) {
    const a = data.athlete;
    return {
      userId: data.id,
      nome: a.name,
      foto: data.avatarPlaceholder,
      pesoKg: a.weightKg,
      alturaCm: a.heightCm,
      email: data.email,
      role: "atleta",
      memberSinceLabel: since,
      experienceLabel: EXPERIENCE_LABEL[a.experienceLevel] ?? a.experienceLevel,
      cityState: `${a.city} · ${a.state}`,
      cref: "",
    };
  }
  if (data.role === "personal" && data.personal) {
    const p = data.personal;
    return {
      userId: data.id,
      nome: p.name,
      foto: data.avatarPlaceholder,
      pesoKg: 0,
      alturaCm: 0,
      email: data.email,
      role: "personal",
      memberSinceLabel: since,
      experienceLabel: "Personal trainer",
      cityState: "",
      cref: p.cref,
    };
  }
  return {
    userId: data.id,
    nome: "Usuário",
    foto: data.avatarPlaceholder,
    pesoKg: 0,
    alturaCm: 0,
    email: data.email,
    role: data.role,
    memberSinceLabel: since,
    experienceLabel: "",
    cityState: "",
    cref: "",
  };
}

function imcCategory(imc: number): { label: string; tone: string } {
  if (imc < 18.5) return { label: "Abaixo do peso", tone: "text-blue-400" };
  if (imc < 25) return { label: "Saudável", tone: "text-emerald-400" };
  if (imc < 30) return { label: "Sobrepeso", tone: "text-amber-400" };
  return { label: "Obesidade", tone: "text-rose-400" };
}

export default function ProfilePage() {
  const router = useRouter();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userData, setUserData] = useState<LocalUser | null>(null);
  const [isPro] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [editingField, setEditingField] = useState<EditableField>(null);
  const [draft, setDraft] = useState("");

  const [toast, setToast] = useState<{ msg: string; tone: ToastTone } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerToast = useCallback((msg: string, tone: ToastTone = "success") => {
    setToast({ msg, tone });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

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
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setLoadError(j.error || "Não foi possível carregar o perfil.");
        setLoadState("error");
        return;
      }
      const data = (await res.json()) as ApiProfile;
      setUserData(mapApiToLocal(data));
      setLoadState("ready");
    } catch {
      setLoadError("Falha de conexão. Verifique sua internet.");
      setLoadState("error");
    }
  }, [router]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    ["/ProPage", "/StatsPage", "/HomePage"].forEach((r) => router.prefetch(r));
  }, [router]);

  const persistField = useCallback(
    async (patch: { name?: string; weightKg?: number; heightCm?: number }) => {
      if (!userData) return;
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const data = (await res.json()) as ApiProfile;
        setUserData(mapApiToLocal(data));
      } else {
        triggerToast("Não foi possível salvar.", "info");
      }
    },
    [userData, triggerToast],
  );

  const startEdit = useCallback(
    (field: NonNullable<EditableField>) => {
      if (!userData) return;
      if (field === "name") setDraft(userData.nome);
      else if (field === "weight") setDraft(userData.pesoKg > 0 ? String(userData.pesoKg) : "");
      else if (field === "height") setDraft(userData.alturaCm > 0 ? String(userData.alturaCm) : "");
      setEditingField(field);
    },
    [userData],
  );

  const cancelEdit = useCallback(() => setEditingField(null), []);

  const commitEdit = useCallback(async () => {
    if (!editingField || !userData) {
      setEditingField(null);
      return;
    }
    const trimmed = draft.trim();
    if (editingField === "name") {
      if (trimmed && trimmed !== userData.nome) {
        setUserData({ ...userData, nome: trimmed });
        await persistField({ name: trimmed });
        triggerToast("Nome atualizado");
      }
    } else if (editingField === "weight") {
      const n = parseFloat(trimmed.replace(",", "."));
      if (Number.isFinite(n) && n > 20 && n < 400 && n !== userData.pesoKg) {
        setUserData({ ...userData, pesoKg: n });
        await persistField({ weightKg: n });
        triggerToast("Peso atualizado");
      } else if (trimmed && (!Number.isFinite(n) || n <= 20 || n >= 400)) {
        triggerToast("Use um peso entre 20 e 400 kg.", "info");
      }
    } else if (editingField === "height") {
      const n = parseFloat(trimmed.replace(",", "."));
      const cm = Math.round(n);
      if (Number.isFinite(cm) && cm > 60 && cm < 250 && cm !== userData.alturaCm) {
        setUserData({ ...userData, alturaCm: cm });
        await persistField({ heightCm: cm });
        triggerToast("Altura atualizada");
      } else if (trimmed && (!Number.isFinite(cm) || cm <= 60 || cm >= 250)) {
        triggerToast("Use uma altura entre 60 e 250 cm.", "info");
      }
    }
    setEditingField(null);
  }, [editingField, draft, userData, persistField, triggerToast]);

  const imc = useMemo(() => {
    if (!userData || userData.pesoKg <= 0 || userData.alturaCm <= 0) return null;
    const meters = userData.alturaCm / 100;
    const value = userData.pesoKg / (meters * meters);
    if (!Number.isFinite(value)) return null;
    return value;
  }, [userData]);

  const syncHealthData = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      triggerToast("Dispositivo sincronizado");
    }, 1600);
  };

  if (loadState === "error") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-5 px-6 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <Info size={22} className="text-rose-400" />
        </div>
        <p className="text-sm text-zinc-400 text-center max-w-sm">{loadError}</p>
        <button
          type="button"
          onClick={() => void loadProfile()}
          className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase italic text-xs tracking-wider cursor-pointer transition-colors"
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  if (loadState === "loading" || !userData) {
    return <ProfileSkeleton />;
  }

  const isAtleta = userData.role === "atleta";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20 relative overflow-hidden antialiased font-sans">
      <div className="fixed top-[-12%] right-[-8%] w-md h-112 bg-orange-600/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-15%] left-[-10%] w-[24rem] h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <Toast toast={toast} />

      <header className="sticky top-0 z-40 bg-zinc-950/40 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-4 pl-16 lg:pl-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <UserIcon size={22} className="text-orange-500 shrink-0" />
          <h1 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter text-white truncate">
            Meu perfil
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-6 relative z-10">
        <IdentityCard
          userData={userData}
          isAtleta={isAtleta}
          editing={editingField === "name"}
          draft={draft}
          setDraft={setDraft}
          onStartEdit={() => startEdit("name")}
          onCommit={commitEdit}
          onCancel={cancelEdit}
          onAvatarChange={() => triggerToast("Em breve: foto personalizada", "info")}
        />

        {isAtleta ? (
          <PhysicalDataSection
            pesoKg={userData.pesoKg}
            alturaCm={userData.alturaCm}
            imc={imc}
            editingField={editingField}
            draft={draft}
            setDraft={setDraft}
            onStartEdit={startEdit}
            onCommit={commitEdit}
            onCancel={cancelEdit}
          />
        ) : (
          <CredentialSection cref={userData.cref} />
        )}

        <AccountSection
          isPro={isPro}
          isSyncing={isSyncing}
          onUpgrade={() => router.push("/ProPage")}
          onSync={syncHealthData}
        />
      </main>
    </div>
  );
}

function Toast({ toast }: { toast: { msg: string; tone: ToastTone } | null }) {
  return (
    <div className="fixed bottom-6 right-6 z-60 pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 16, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md border ${
              toast.tone === "success"
                ? "bg-emerald-600/15 border-emerald-500/30 text-emerald-100"
                : "bg-zinc-900/95 border-white/10 text-zinc-100"
            }`}
            role="status"
            aria-live="polite"
          >
            {toast.tone === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            ) : (
              <Info size={16} className="text-zinc-400 shrink-0" />
            )}
            <span className="text-[11px] font-black italic uppercase tracking-wider">
              {toast.msg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface IdentityCardProps {
  userData: LocalUser;
  isAtleta: boolean;
  editing: boolean;
  draft: string;
  setDraft: (v: string) => void;
  onStartEdit: () => void;
  onCommit: () => void;
  onCancel: () => void;
  onAvatarChange: () => void;
}

function IdentityCard({
  userData,
  isAtleta,
  editing,
  draft,
  setDraft,
  onStartEdit,
  onCommit,
  onCancel,
  onAvatarChange,
}: IdentityCardProps) {
  return (
    <section className="bg-zinc-900/40 border border-white/5 rounded-4xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-zinc-950 border border-white/10 overflow-hidden">
            <img src={userData.foto} alt="" className="w-full h-full object-cover" />
          </div>
          <label
            className="absolute -bottom-1.5 -right-1.5 bg-orange-600 hover:bg-orange-700 p-2 rounded-2xl border-4 border-zinc-950 text-white cursor-pointer transition-colors"
            aria-label="Alterar foto"
          >
            <Camera size={14} />
            <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
          </label>
        </div>

        <div className="flex-1 min-w-0 w-full text-center sm:text-left">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-1.5">
            Identidade
          </p>

          {editing ? (
            <InlineEditor
              value={draft}
              onChange={setDraft}
              onSave={onCommit}
              onCancel={onCancel}
              placeholder="Seu nome"
              maxLength={64}
              size="lg"
            />
          ) : (
            <button
              type="button"
              onClick={onStartEdit}
              className="group inline-flex items-center gap-2 mx-auto sm:mx-0 cursor-pointer text-left"
              aria-label="Editar nome"
            >
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-white leading-tight">
                {userData.nome}
              </h2>
              <Pencil
                size={14}
                className="text-zinc-600 group-hover:text-orange-500 transition-colors shrink-0"
              />
            </button>
          )}

          <p className="text-zinc-400 text-xs mt-2 flex items-center gap-2 justify-center sm:justify-start min-w-0">
            <Mail size={12} className="text-zinc-500 shrink-0" />
            <span className="truncate">{userData.email}</span>
          </p>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-2 justify-center sm:justify-start">
            <Calendar size={11} className="text-zinc-600 shrink-0" />
            Membro desde {userData.memberSinceLabel}
          </p>

          <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
            <Pill
              icon={ShieldCheck}
              label={isAtleta ? "Atleta" : "Personal trainer"}
              accent="orange"
            />
            {userData.experienceLabel && isAtleta && (
              <Pill icon={Trophy} label={userData.experienceLabel} />
            )}
            {isAtleta && userData.cityState && <Pill icon={MapPin} label={userData.cityState} />}
            {!isAtleta && userData.cref && <Pill icon={IdCard} label={`CREF ${userData.cref}`} />}
          </div>
        </div>
      </div>
    </section>
  );
}

interface PhysicalDataSectionProps {
  pesoKg: number;
  alturaCm: number;
  imc: number | null;
  editingField: EditableField;
  draft: string;
  setDraft: (v: string) => void;
  onStartEdit: (field: NonNullable<EditableField>) => void;
  onCommit: () => void;
  onCancel: () => void;
}

function PhysicalDataSection({
  pesoKg,
  alturaCm,
  imc,
  editingField,
  draft,
  setDraft,
  onStartEdit,
  onCommit,
  onCancel,
}: PhysicalDataSectionProps) {
  const imcInfo = imc != null ? imcCategory(imc) : null;

  return (
    <section className="bg-zinc-900/40 border border-white/5 rounded-4xl p-6 sm:p-8">
      <SectionHeader eyebrow="Dados físicos" title="Suas medidas" icon={Activity} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
        <EditableMetric
          label="Peso"
          unit="kg"
          icon={Weight}
          accentClass="text-orange-500"
          editing={editingField === "weight"}
          draft={draft}
          setDraft={setDraft}
          onStartEdit={() => onStartEdit("weight")}
          onCommit={onCommit}
          onCancel={onCancel}
          display={pesoKg > 0 ? pesoKg.toFixed(1) : "—"}
          step="0.1"
        />
        <EditableMetric
          label="Altura"
          unit="cm"
          icon={Ruler}
          accentClass="text-blue-400"
          editing={editingField === "height"}
          draft={draft}
          setDraft={setDraft}
          onStartEdit={() => onStartEdit("height")}
          onCommit={onCommit}
          onCancel={onCancel}
          display={alturaCm > 0 ? String(alturaCm) : "—"}
          step="1"
        />
        <MetricCard
          label="IMC"
          unit={imcInfo?.label ?? "Calculado"}
          unitClass={imcInfo?.tone ?? "text-zinc-600"}
          icon={Heart}
          accentClass="text-emerald-400"
          display={imc != null ? imc.toFixed(1) : "—"}
        />
      </div>

      <p className="mt-4 text-[10px] text-zinc-600 font-medium leading-relaxed">
        Toque em peso ou altura para atualizar. O IMC é recalculado automaticamente e serve apenas
        como referência.
      </p>
    </section>
  );
}
function CredentialSection({ cref }: { cref: string }) {
  return (
    <section className="bg-zinc-900/40 border border-white/5 rounded-4xl p-6 sm:p-8">
      <SectionHeader eyebrow="Credencial" title="Registro profissional" icon={IdCard} />
      <div className="mt-5 bg-zinc-950/60 border border-white/5 rounded-4xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-600/15 text-orange-500 flex items-center justify-center shrink-0">
          <IdCard size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">CREF</p>
          <p className="text-lg font-black italic uppercase text-white tracking-tight truncate">
            {cref || "—"}
          </p>
        </div>
      </div>
    </section>
  );
}

interface AccountSectionProps {
  isPro: boolean;
  isSyncing: boolean;
  onUpgrade: () => void;
  onSync: () => void;
}

function AccountSection({ isPro, isSyncing, onUpgrade, onSync }: AccountSectionProps) {
  return (
    <section className="bg-zinc-900/40 border border-white/5 rounded-4xl p-6 sm:p-8">
      <SectionHeader eyebrow="Conta" title="Plano e dispositivos" icon={Settings} />

      <div className="mt-6 space-y-3">
        <PlanRow isPro={isPro} onUpgrade={onUpgrade} />
        <SyncRow isSyncing={isSyncing} onSync={onSync} />
      </div>
    </section>
  );
}

function PlanRow({ isPro, onUpgrade }: { isPro: boolean; onUpgrade: () => void }) {
  return (
    <div
      className={`rounded-4xl border p-4 sm:p-5 flex items-center gap-4 transition-colors ${
        isPro
          ? "bg-orange-600/10 border-orange-500/30"
          : "bg-zinc-950/60 border-white/5 hover:border-white/10"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
          isPro ? "bg-orange-600 text-white" : "bg-orange-600/15 text-orange-500"
        }`}
      >
        <Crown size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">Plano</p>
        <p className="text-sm font-black italic uppercase text-white tracking-tight truncate">
          {isPro ? "Wegym Pro" : "Gratuito"}
        </p>
        <p className="text-[10px] text-zinc-500 mt-0.5 truncate">
          {isPro
            ? "Acesso completo a treinos com IA e análise biométrica."
            : "Faça upgrade para treinos com IA e análise avançada."}
        </p>
      </div>
      {!isPro && (
        <button
          type="button"
          onClick={onUpgrade}
          className="shrink-0 bg-orange-600 hover:bg-orange-700 text-white px-3 sm:px-4 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase italic tracking-wider cursor-pointer transition-colors"
        >
          Conhecer Pro
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

function SyncRow({ isSyncing, onSync }: { isSyncing: boolean; onSync: () => void }) {
  return (
    <button
      type="button"
      onClick={onSync}
      disabled={isSyncing}
      className="w-full rounded-4xl border border-white/5 bg-zinc-950/60 hover:border-white/10 p-4 sm:p-5 flex items-center gap-4 text-left cursor-pointer transition-colors disabled:cursor-wait disabled:opacity-80"
    >
      <div className="w-12 h-12 rounded-2xl bg-white/5 text-zinc-200 flex items-center justify-center shrink-0">
        {isSyncing ? (
          <Loader2 size={20} className="animate-spin text-orange-500" />
        ) : (
          <Smartphone size={20} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">
          Dispositivos
        </p>
        <p className="text-sm font-black italic uppercase text-white tracking-tight truncate">
          {isSyncing ? "Sincronizando…" : "Sincronizar agora"}
        </p>
        <p className="text-[10px] text-zinc-500 mt-0.5 truncate">Apple Health · Google Fit</p>
      </div>
      <ChevronRight size={16} className="text-zinc-600 shrink-0" />
    </button>
  );
}

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

function SectionHeader({ eyebrow, title, icon: Icon }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-1">
          {eyebrow}
        </p>
        <h2 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter text-white leading-tight">
          {title}
        </h2>
      </div>
      <Icon size={20} className="text-orange-500 opacity-50 shrink-0" />
    </div>
  );
}

interface PillProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  accent?: "neutral" | "orange";
}

function Pill({ icon: Icon, label, accent = "neutral" }: PillProps) {
  const cls =
    accent === "orange"
      ? "bg-orange-600/15 border-orange-500/30 text-orange-200"
      : "bg-white/5 border-white/10 text-zinc-300";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase italic tracking-wider ${cls}`}
    >
      <Icon size={11} className="opacity-80" />
      {label}
    </span>
  );
}

interface InlineEditorProps {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder?: string;
  maxLength?: number;
  size?: "md" | "lg";
  type?: "text" | "number";
  step?: string;
  suffix?: string;
}

function InlineEditor({
  value,
  onChange,
  onSave,
  onCancel,
  placeholder,
  maxLength,
  size = "md",
  type = "text",
  step,
  suffix,
}: InlineEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const inputClass =
    size === "lg"
      ? "text-2xl sm:text-3xl font-black italic uppercase tracking-tighter"
      : "text-2xl font-black italic";

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1 min-w-0">
        <input
          ref={inputRef}
          type={type}
          inputMode={type === "number" ? "decimal" : undefined}
          step={step}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSave();
            } else if (e.key === "Escape") {
              e.preventDefault();
              onCancel();
            }
          }}
          placeholder={placeholder}
          className={`bg-zinc-950/60 border border-orange-500/40 rounded-xl px-3 py-2 outline-none w-full text-white placeholder:text-zinc-600 focus:border-orange-500 ${inputClass} ${
            suffix ? "pr-10" : ""
          }`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            {suffix}
          </span>
        )}
      </div>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          onSave();
        }}
        aria-label="Salvar"
        className="p-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white cursor-pointer shrink-0 transition-colors"
      >
        <CheckCircle2 size={16} />
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          onCancel();
        }}
        aria-label="Cancelar"
        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 cursor-pointer shrink-0 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

interface EditableMetricProps {
  label: string;
  unit: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentClass: string;
  editing: boolean;
  draft: string;
  setDraft: (v: string) => void;
  onStartEdit: () => void;
  onCommit: () => void;
  onCancel: () => void;
  display: string;
  step: string;
}

function EditableMetric({
  label,
  unit,
  icon: Icon,
  accentClass,
  editing,
  draft,
  setDraft,
  onStartEdit,
  onCommit,
  onCancel,
  display,
  step,
}: EditableMetricProps) {
  return (
    <div className="bg-zinc-950/60 border border-white/5 rounded-3xl p-5 flex flex-col gap-3 hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon size={16} className={accentClass} />
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            {label}
          </span>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={onStartEdit}
            aria-label={`Editar ${label}`}
            className="p-1.5 rounded-lg text-zinc-600 hover:text-orange-500 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <Pencil size={12} />
          </button>
        )}
      </div>

      {editing ? (
        <InlineEditor
          value={draft}
          onChange={setDraft}
          onSave={onCommit}
          onCancel={onCancel}
          type="number"
          step={step}
          suffix={unit}
        />
      ) : (
        <button
          type="button"
          onClick={onStartEdit}
          className="text-left cursor-pointer"
          aria-label={`Editar ${label}`}
        >
          <p className="text-3xl font-black italic text-white leading-none">
            {display}
            {display !== "—" && (
              <span className="text-sm font-bold text-zinc-500 ml-1.5">{unit}</span>
            )}
          </p>
        </button>
      )}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  unit: string;
  unitClass?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentClass: string;
  display: string;
}

function MetricCard({ label, unit, unitClass, icon: Icon, accentClass, display }: MetricCardProps) {
  return (
    <div className="bg-zinc-950/60 border border-white/5 rounded-3xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Icon size={16} className={accentClass} />
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
          {label}
        </span>
      </div>
      <div>
        <p className="text-3xl font-black italic text-white leading-none">{display}</p>
        <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${unitClass}`}>
          {unit}
        </p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased pb-20">
      <header className="sticky top-0 z-40 bg-zinc-950/40 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-4 pl-16 lg:pl-6 flex items-center gap-3">
        <div className="h-5 w-5 rounded bg-zinc-800/60 animate-pulse" />
        <div className="h-5 w-32 rounded bg-zinc-800/60 animate-pulse" />
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        <div className="bg-zinc-900/40 border border-white/5 rounded-4xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-zinc-800/50 animate-pulse" />
          <div className="flex-1 space-y-3 w-full">
            <div className="h-3 w-24 bg-zinc-800/40 rounded animate-pulse" />
            <div className="h-8 w-2/3 bg-zinc-800/60 rounded-md animate-pulse" />
            <div className="h-3 w-1/2 bg-zinc-800/40 rounded animate-pulse" />
            <div className="h-3 w-1/3 bg-zinc-800/40 rounded animate-pulse" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-20 rounded-full bg-zinc-800/40 animate-pulse" />
              <div className="h-6 w-24 rounded-full bg-zinc-800/40 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 rounded-4xl p-6 sm:p-8 space-y-4">
          <div className="h-3 w-24 bg-zinc-800/40 rounded animate-pulse" />
          <div className="h-6 w-40 bg-zinc-800/60 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="h-28 rounded-3xl bg-zinc-800/30 animate-pulse" />
            <div className="h-28 rounded-3xl bg-zinc-800/30 animate-pulse" />
            <div className="h-28 rounded-3xl bg-zinc-800/30 animate-pulse" />
          </div>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 rounded-4xl p-6 sm:p-8 space-y-4">
          <div className="h-3 w-24 bg-zinc-800/40 rounded animate-pulse" />
          <div className="h-6 w-48 bg-zinc-800/60 rounded animate-pulse" />
          <div className="h-20 rounded-3xl bg-zinc-800/30 animate-pulse" />
          <div className="h-20 rounded-3xl bg-zinc-800/30 animate-pulse" />
        </div>
      </main>
    </div>
  );
}
