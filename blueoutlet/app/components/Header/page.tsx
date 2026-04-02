"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useAnimation, Variants } from "framer-motion";
import { Filter, ShoppingCart, User, Menu, X, Check } from "lucide-react";
import LogoFreitasOutlet from "@/public/LogoFreitasOutlet.png";

export type StyleType = "Todos" | "Social" | "Casual" | "Esportivo";
export type CategoryType = "Masculino" | "Feminino" | "Kids";

interface HeaderProps {
  category: CategoryType;
  setCategory: (category: CategoryType) => void;
  activeFilter?: StyleType;
  setFilter: (style: StyleType) => void;
  glowColor: string;
  cartCount: number;
}

const CATEGORIES: CategoryType[] = ["Masculino", "Feminino", "Kids"];
const STYLES: StyleType[] = ["Todos", "Casual", "Social", "Esportivo"];

const ROUTES: Record<CategoryType, string> = {
  Feminino: "/WomanPage",
  Masculino: "/MenProductPage",
  Kids: "/KidsPage",
};

const DROPDOWN_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.95, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.15 } }
};

export default function Header({
  category,
  setCategory,
  activeFilter = "Todos",
  setFilter,
  glowColor,
  cartCount,
}: HeaderProps) {
  const router = useRouter();
  const [showFilter, setShowFilter] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const filterRef = useRef<HTMLDivElement>(null);
  const cartControls = useAnimation();

  const activeGlow = useMemo(() => ({
    filter: `drop-shadow(0 0 20px ${glowColor}66)`
  }), [glowColor]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (cartCount > 0) {
      cartControls.start({
        scale: [1, 1.3, 0.95, 1.05, 1],
        rotate: [0, -15, 15, -10, 0],
        transition: { duration: 0.6, ease: "easeOut" },
      });
    }
  }, [cartCount, cartControls]);

  const handleCategoryChange = useCallback((selectedCategory: CategoryType) => {
    setCategory(selectedCategory);
    setIsMobileMenuOpen(false);
    router.push(ROUTES[selectedCategory]);
  }, [router, setCategory]);

  return (
    <header className="sticky top-0 z-100 w-full border-b border-white/5 bg-black/40 backdrop-blur-2xl transition-colors duration-500">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4 lg:gap-10">
          <button 
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white transition-all hover:bg-white/10 active:scale-90 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            style={activeGlow}
            className="relative h-10 w-24 cursor-pointer md:h-12 md:w-32"
            onClick={() => router.push("/")}
          >
            <Image
              src={LogoFreitasOutlet}
              alt="Freitas Outlet"
              fill
              className="object-contain"
              priority
              quality={100}
            />
          </motion.div>

          <nav className="hidden items-center gap-1 rounded-2xl border border-white/5 bg-black/20 p-1.5 md:flex">
            {CATEGORIES.map((cat) => {
              const isActive = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`relative flex items-center px-6 py-2 text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${
                    isActive ? "text-black" : "text-white/40 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-bg"
                      className="absolute inset-0 rounded-xl bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10">{cat}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="relative" ref={filterRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilter(!showFilter)}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300 ${
                showFilter 
                  ? "border-white bg-white text-black" 
                  : "border-white/10 bg-white/5 text-white hover:border-white/20"
              }`}
            >
              <Filter size={18} strokeWidth={showFilter ? 2.5 : 2} />
            </motion.button>

            <AnimatePresence>
              {showFilter && (
                <motion.div
                  variants={DROPDOWN_VARIANTS}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 top-[calc(100%+12px)] w-60 overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
                >
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Coleção</p>
                  </div>
                  <div className="space-y-1">
                    {STYLES.map((style) => {
                      const isActive = activeFilter === style;
                      return (
                        <button
                          key={style}
                          onClick={() => { setFilter(style); setShowFilter(false); }}
                          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                            isActive ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/3 hover:text-white"
                          }`}
                        >
                          {style}
                          {isActive && <motion.div layoutId="check-icon"><Check size={16} className="text-white" /></motion.div>}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mx-1 hidden h-6 w-px bg-white/10 md:block" />

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/ProfilePage")}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-all"
          >
            <User size={18} />
          </motion.button>

          <motion.button
            animate={cartControls}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/CarPage")}
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-all"
          >
            <ShoppingCart size={18} />
            <AnimatePresence mode="popLayout">
              {cartCount > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-black shadow-xl"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5 bg-black/60 md:hidden"
          >
            <div className="grid grid-cols-1 gap-1 p-4">
              {CATEGORIES.map((cat) => {
                const isActive = category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`rounded-2xl px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
                      isActive ? "bg-white text-black" : "bg-white/5 text-white/50"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}