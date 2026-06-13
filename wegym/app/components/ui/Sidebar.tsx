"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  User,
  LogOut,
  Dumbbell,
  BarChart3,
  Crown,
  Home,
  LayoutGrid,
  ChevronRight,
  CalendarDays,
  Users,
  UserPlus,
} from "lucide-react";
import { MODALITY_OPTIONS } from "../../constants/modalities";

const STORAGE_KEY = "wegym-sidebar-collapsed";

export type SidebarState = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  hydrated: boolean;
};

export const SidebarContext = React.createContext<SidebarState | null>(null);

export function useSidebar(): SidebarState {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) {
    return { collapsed: false, setCollapsed: () => {}, hydrated: false };
  }
  return ctx;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "1") setCollapsedState(true);
    } catch {}
    setHydrated(true);
  }, []);

  const setCollapsed = useCallback((v: boolean) => {
    setCollapsedState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
    } catch {}
  }, []);

  const value = React.useMemo<SidebarState>(
    () => ({ collapsed, setCollapsed, hydrated }),
    [collapsed, setCollapsed, hydrated],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

type SidebarProps = {
  mobile?: boolean;
  onClose?: () => void;
};

export function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const { collapsed, setCollapsed, hydrated } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const role = (session?.user as { role?: string } | undefined)?.role;
  const isPersonal = role === "personal";

  const activeModality = searchParams.get("modality") ?? "gym";
  const personalView = searchParams.get("view") ?? "home";
  const isOnTraining = pathname === "/TrainingPage";
  const isOnProfile = pathname === "/ProfilePage";
  const isOnStats = pathname === "/StatsPage";
  const isOnPro = pathname === "/ProPage";
  const isOnHome = pathname === "/HomePage";
  const isOnPersonal = pathname === "/PersonalPage";
  const isOnPersonalHome = isOnPersonal && personalView === "home";
  const isOnPersonalStudents = isOnPersonal && personalView === "students";
  const isOnPersonalCreate = isOnPersonal && personalView === "create";


  const effectiveCollapsed = hydrated ? collapsed : false;
  const showLabels = mobile ? true : !effectiveCollapsed;
  const widthClass = mobile
    ? "w-72"
    : effectiveCollapsed
      ? "w-[72px]"
      : "w-64";

  const [modalitiesOpen, setModalitiesOpen] = useState(false);
  const [flyoutPos, setFlyoutPos] = useState<{
    top: number;
    left: number;
    maxHeight: number;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateFlyoutPos = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const margin = 4;
    const viewportH = window.innerHeight;
    const maxHeight = Math.max(240, viewportH - rect.top - 16);
    setFlyoutPos({
      top: rect.top,
      left: rect.right + margin,
      maxHeight,
    });
  }, []);

  const openModalities = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    updateFlyoutPos();
    setModalitiesOpen(true);
  }, [updateFlyoutPos]);

  const scheduleClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setModalitiesOpen(false), 180);
  }, []);

  const toggleModalities = useCallback(() => {
    if (modalitiesOpen) {
      setModalitiesOpen(false);
    } else {
      openModalities();
    }
  }, [modalitiesOpen, openModalities]);

  useEffect(() => {
    if (!modalitiesOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalitiesOpen(false);
    };
    const onWindow = () => setModalitiesOpen(false);
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        flyoutRef.current &&
        !flyoutRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setModalitiesOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onWindow, true);
    window.addEventListener("resize", onWindow);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onWindow, true);
      window.removeEventListener("resize", onWindow);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [modalitiesOpen]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleSelectModality = (id: string) => {
    const params = new URLSearchParams();
    params.set("modality", id);
    router.push(`/TrainingPage?${params.toString()}`);
    setModalitiesOpen(false);
    if (mobile && onClose) onClose();
  };

  const handleGoProfile = () => {
    router.push("/ProfilePage");
    if (mobile && onClose) onClose();
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    if (mobile && onClose) onClose();
  };

  const handleLogout = async () => {
    if (mobile && onClose) onClose();
    await signOut({ callbackUrl: "/" });
  };

  return (
    <aside
      className={`flex flex-col h-full bg-zinc-950/95 border-r border-white/5 backdrop-blur-xl ${widthClass} transition-[width] duration-200 ease-out`}
    >
      <div
        className={`px-3 py-4 border-b border-white/5 ${
          showLabels
            ? "flex items-center justify-between gap-3"
            : "flex flex-col items-center gap-3"
        }`}
      >
        {showLabels ? (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center shrink-0">
              <Dumbbell className="text-white w-5 h-5" />
            </div>
            <span className="text-base font-black italic tracking-tighter text-white truncate">
              WEGYM
            </span>
          </div>
        ) : (
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/20">
            <Dumbbell className="text-white w-5 h-5" />
          </div>
        )}

        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300 cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCollapsed(!effectiveCollapsed)}
            aria-label={effectiveCollapsed ? "Expandir menu" : "Recolher menu"}
            title={effectiveCollapsed ? "Expandir menu" : "Recolher menu"}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300 cursor-pointer shrink-0"
          >
            {effectiveCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 custom-scrollbar">
        {status === "loading" ? (
          <SidebarSkeleton showLabels={showLabels} />
        ) : isPersonal ? (
          <>
            <NavItem
              icon={CalendarDays}
              label="Agenda"
              showLabels={showLabels}
              active={isOnPersonalHome}
              onClick={() => handleNavigate("/PersonalPage?view=home")}
            />
            <NavItem
              icon={Users}
              label="Meus Alunos"
              showLabels={showLabels}
              active={isOnPersonalStudents}
              onClick={() => handleNavigate("/PersonalPage?view=students")}
            />
            <NavItem
              icon={UserPlus}
              label="Adicionar Aluno"
              showLabels={showLabels}
              active={isOnPersonalCreate}
              onClick={() => handleNavigate("/PersonalPage?view=create")}
            />
          </>
        ) : (
          <>
            <NavItem
              icon={Home}
              label="Início"
              showLabels={showLabels}
              active={isOnHome}
              onClick={() => handleNavigate("/HomePage")}
            />

            <div className="h-px bg-white/5 my-2 mx-1" />

            <button
              ref={triggerRef}
              type="button"
              onClick={toggleModalities}
              onMouseEnter={mobile ? undefined : openModalities}
              onMouseLeave={mobile ? undefined : scheduleClose}
              onFocus={mobile ? undefined : openModalities}
              aria-haspopup="menu"
              aria-expanded={modalitiesOpen}
              title={!showLabels ? "Modalidades" : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                isOnTraining
                  ? "bg-orange-600/20 text-white border border-orange-500/30"
                  : "text-zinc-300 hover:bg-white/5 border border-transparent"
              } ${showLabels ? "" : "justify-center"}`}
            >
              <LayoutGrid
                size={18}
                className={`shrink-0 ${
                  isOnTraining ? "text-orange-500" : "text-zinc-500"
                }`}
              />
              {showLabels && (
                <>
                  <span className="text-[11px] font-black uppercase italic truncate flex-1">
                    Modalidades
                  </span>
                  <ChevronRight
                    size={14}
                    className={`text-zinc-500 shrink-0 transition-transform ${
                      mobile && modalitiesOpen ? "rotate-90" : ""
                    }`}
                  />
                </>
              )}
            </button>

            {mobile && modalitiesOpen && (
              <div className="mt-1 ml-3 pl-3 border-l border-white/10 space-y-1">
                {MODALITY_OPTIONS.map((m) => {
                  const Icon = m.Icon;
                  const isActive = isOnTraining && activeModality === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectModality(m.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                        isActive
                          ? "bg-orange-600/20 text-white"
                          : "text-zinc-300 hover:bg-white/5"
                      }`}
                    >
                      <Icon
                        size={16}
                        className={`shrink-0 ${
                          isActive ? "text-orange-500" : "text-zinc-500"
                        }`}
                      />
                      <span className="text-[10px] font-black uppercase italic truncate">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <NavItem
              icon={BarChart3}
              label="Estatísticas"
              showLabels={showLabels}
              active={isOnStats}
              onClick={() => handleNavigate("/StatsPage")}
            />
          </>
        )}

        {status !== "loading" && (
          <>
            <div className="h-px bg-white/5 my-2 mx-1" />

            <NavItem
              icon={Crown}
              label="Wegym Pro"
              showLabels={showLabels}
              active={isOnPro}
              onClick={() => handleNavigate("/ProPage")}
            />
            <NavItem
              icon={User}
              label="Meu Perfil"
              showLabels={showLabels}
              active={isOnProfile}
              onClick={handleGoProfile}
            />
          </>
        )}
      </div>

      <ModalitiesFlyout
        open={!mobile && !isPersonal && modalitiesOpen}
        position={flyoutPos}
        flyoutRef={flyoutRef}
        activeModality={activeModality}
        isOnTraining={isOnTraining}
        onSelect={handleSelectModality}
        onMouseEnter={openModalities}
        onMouseLeave={scheduleClose}
      />

      <div className="border-t border-white/5 p-2">
        <button
          type="button"
          onClick={handleLogout}
          title={!showLabels ? "Sair da Conta" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-300 hover:bg-red-500/10 hover:text-red-400 transition-colors text-left cursor-pointer border border-transparent ${
            showLabels ? "" : "justify-center"
          }`}
        >
          <LogOut size={18} className="shrink-0 text-red-400/80" />
          {showLabels && (
            <span className="text-[11px] font-black uppercase italic truncate">
              Sair da Conta
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

type NavItemProps = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  showLabels: boolean;
  active: boolean;
  onClick: () => void;
};

function NavItem({ icon: Icon, label, showLabels, active, onClick }: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={!showLabels ? label : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
        active
          ? "bg-orange-600/20 text-white border border-orange-500/30"
          : "text-zinc-300 hover:bg-white/5 border border-transparent"
      } ${showLabels ? "" : "justify-center"}`}
    >
      <Icon
        size={18}
        className={`shrink-0 ${active ? "text-orange-500" : "text-zinc-500"}`}
      />
      {showLabels && (
        <span className="text-[11px] font-black uppercase italic truncate">
          {label}
        </span>
      )}
    </button>
  );
}

function SidebarSkeleton({ showLabels }: { showLabels: boolean }) {
  return (
    <div className="space-y-2">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
            showLabels ? "" : "justify-center"
          }`}
        >
          <div className="w-4.5 h-4.5 rounded bg-zinc-800/60 animate-pulse shrink-0" />
          {showLabels && (
            <div className="h-3 flex-1 rounded bg-zinc-800/40 animate-pulse" />
          )}
        </div>
      ))}
    </div>
  );
}

type ModalitiesFlyoutProps = {
  open: boolean;
  position: { top: number; left: number; maxHeight: number } | null;
  flyoutRef: React.RefObject<HTMLDivElement | null>;
  activeModality: string;
  isOnTraining: boolean;
  onSelect: (id: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

function ModalitiesFlyout({
  open,
  position,
  flyoutRef,
  activeModality,
  isOnTraining,
  onSelect,
  onMouseEnter,
  onMouseLeave,
}: ModalitiesFlyoutProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && position && (
        <motion.div
          ref={flyoutRef}
          key="modalities-flyout"
          initial={{ opacity: 0, x: -8, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -6, scale: 0.98 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            maxHeight: position.maxHeight,
            zIndex: 60,
          }}
          className="w-90 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 p-3 flex flex-col overflow-y-auto"
          role="menu"
          aria-label="Modalidades de treino"
        >
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 px-2 mb-2">
            Modalidades
          </p>
          <div className="grid grid-cols-2 gap-1">
            {MODALITY_OPTIONS.map((m) => {
              const Icon = m.Icon;
              const isActive = isOnTraining && activeModality === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="menuitem"
                  onClick={() => onSelect(m.id)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-left cursor-pointer transition-colors group border ${
                    isActive
                      ? "bg-orange-600/20 text-white border-orange-500/30"
                      : "text-zinc-300 hover:bg-white/5 border-transparent"
                  }`}
                >
                  <Icon
                    size={16}
                    className={`shrink-0 ${
                      isActive
                        ? "text-orange-500"
                        : "text-zinc-500 group-hover:text-zinc-200"
                    }`}
                  />
                  <span className="text-[10px] font-black uppercase italic truncate">
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function SidebarMobileTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Abrir menu lateral"
      className="lg:hidden fixed top-3 left-3 z-40 w-10 h-10 rounded-xl bg-zinc-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-zinc-200 shadow-lg cursor-pointer"
    >
      <Menu size={18} />
    </button>
  );
}

export function SidebarMobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="lg:hidden fixed inset-y-0 left-0 z-50"
          >
            <Sidebar mobile onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
