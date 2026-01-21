"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Filter } from "lucide-react";
import LogoFreitasOutlet from "@/public/LogoFreitasOutlet.png";

// Tipos definidos para garantir a segurança dos props
// Em components/Header/page.tsx
export type StyleType = "Todos" | "Social" | "Casual" | "Esportivo";
export type CategoryType = "Masculino" | "Feminino" | "Kids";

interface HeaderProps {
  category: CategoryType;
  setCategory: (category: CategoryType) => void;
  setFilter: (style: StyleType) => void;
  glowColor: string;
}

export default function Header({ 
  category, 
  setCategory, 
  setFilter, 
  glowColor 
}: HeaderProps) {
  const [showFilter, setShowFilter] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative z-10">
        
        {/* Logo com brilho dinâmico */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          style={{
            filter: `drop-shadow(0 0 18px ${glowColor})`,
          }}
          className="relative w-24 h-10"
        >
          <Image
            src={LogoFreitasOutlet}
            alt="Freitas Outlet"
            fill
            className="object-contain"
          />
        </motion.div>

        {/* Seletor de Categoria */}
        <div className="flex gap-4">
          {(["Masculino", "Feminino", "Kids"] as CategoryType[]).map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full backdrop-blur-lg border transition ${
                category === cat
                  ? "bg-white text-black"
                  : "bg-white/5 border-white/20 hover:bg-white/20"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Botão de Filtro */}
        <motion.button
          whileHover={{ scale: 1.15, rotate: 6 }}
          onClick={() => setShowFilter(!showFilter)}
          className="p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20"
        >
          <Filter />
        </motion.button>
      </div>

      {/* Dropdown de Filtros */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute right-6 mt-4 w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 z-50"
          >
            <h3 className="font-semibold mb-4 text-white">Filtros</h3>
            <div className="space-y-3">
              {(["Todos", "Casual", "Social", "Esportivo"] as StyleType[]).map((style) => (
                <button
                  key={style}
                  onClick={() => {
                    setFilter(style);
                    setShowFilter(false); // Fecha o menu ao selecionar
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg text-white hover:bg-white/20 transition"
                >
                  {style}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}