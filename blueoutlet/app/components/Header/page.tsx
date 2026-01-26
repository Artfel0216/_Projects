"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Filter, ShoppingCart, User } from "lucide-react";
import LogoFreitasOutlet from "@/public/LogoFreitasOutlet.png";

export type StyleType = "Todos" | "Social" | "Casual" | "Esportivo";
export type CategoryType = "Masculino" | "Feminino" | "Kids";

interface HeaderProps {
  category: CategoryType;
  setCategory: (category: CategoryType) => void;
  setFilter: (style: StyleType) => void;
  glowColor: string;
  cartCount: number;
}

const CATEGORIES: CategoryType[] = ["Masculino", "Feminino", "Kids"];
const STYLES: StyleType[] = ["Todos", "Casual", "Social", "Esportivo"];

const ROUTES: Partial<Record<CategoryType, string>> = {
  Feminino: "/WomanPage",
  Masculino: "/MenProductPage",
  Kids: "/KidsPage",
};

export default function Header({
  category,
  setCategory,
  setFilter,
  glowColor,
  cartCount,
}: HeaderProps) {
  const router = useRouter();
  const [showFilter, setShowFilter] = useState(false);
  const cartControls = useAnimation();

  useEffect(() => {
    if (cartCount > 0) {
      cartControls.start({
        scale: [1, 1.2, 1],
        rotate: [0, -10, 10, -5, 5, 0],
        transition: { duration: 0.5 },
      });
    }
  }, [cartCount, cartControls]);

  const handleCategoryChange = useCallback((selectedCategory: CategoryType) => {
    setCategory(selectedCategory);
    
    const route = ROUTES[selectedCategory];
    if (route) {
      router.push(route);
    }
  }, [router, setCategory]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{ filter: `drop-shadow(0 0 15px ${glowColor})` }}
            className="relative w-28 h-12 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Image
              src={LogoFreitasOutlet}
              alt="Freitas Outlet"
              fill
              className="object-contain"
            />
          </motion.div>

          <nav className="hidden md:flex gap-1 bg-white/5 p-1 rounded-full border border-white/10">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryChange(cat)}
                className={`relative px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  category === cat
                    ? "bg-white text-black shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowFilter(!showFilter)}
            className={`p-2.5 rounded-full border transition-all ${
              showFilter
                ? "bg-white text-black border-white"
                : "bg-transparent text-white border-white/20"
            }`}
          >
            <Filter size={20} />
          </motion.button>

          <div className="w-px h-6 bg-white/20 mx-1" />

          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push("/ProfilePage")} 
            className="p-2.5 rounded-full text-white border border-transparent hover:border-white/20 transition-colors"
          >
            <User size={20} />
          </motion.button>

          <motion.button
            animate={cartControls}
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push("/CarPage")}
            className="p-2.5 rounded-full text-white border border-transparent hover:border-white/20 transition-colors relative"
          >
            <ShoppingCart size={20} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute top-0 right-0 w-5 h-5 bg-white text-black text-[10px] font-bold flex items-center justify-center rounded-full border border-black shadow-sm"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-6 mt-2 w-64 bg-[#0a0a0a] border border-white/20 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                Filtrar por Estilo
              </h3>
              <div className="space-y-1">
                {STYLES.map((style) => (
                  <motion.button
                    key={style}
                    whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.1)" }}
                    onClick={() => {
                      setFilter(style);
                      setShowFilter(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white transition-colors group"
                  >
                    <span>{style}</span>
                    <span className="opacity-0 group-hover:opacity-100 text-white text-xs">
                      →
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}