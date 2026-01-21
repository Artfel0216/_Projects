"use client";

import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useScroll,
} from "framer-motion";
import { useState, useRef } from "react";
import LogoFreitasOutlet from "@/public/LogoFreitasOutlet.png";
import Contain from "@/app/components/Contain/page";

import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

type StyleType = "Todos" | "Social" | "Casual" | "Esportivo";
type CategoryType = "Masculino" | "Feminino" | "Kids";

const glowColors: Record<CategoryType, string> = {
  Masculino: "rgba(0,180,255,0.45)",
  Feminino: "rgba(255,0,150,0.45)",
  Kids: "rgba(255,200,0,0.45)",
};

const shoes = [
  {
    id: 1,
    name: "Oxford Clássico",
    brand: "Ferracini",
    price: 399.9,
    style: "Social",
    image: "/shoes/oxford.jpg",
  },
  {
    id: 2,
    name: "Loafer Premium",
    brand: "Democrata",
    price: 349.9,
    style: "Casual",
    image: "/shoes/loafer.jpg",
  },
  {
    id: 3,
    name: "Sneaker Minimal",
    brand: "Nike",
    price: 299.9,
    style: "Esportivo",
    image: "/shoes/sneaker.jpg",
  },
];

export default function MenProductPage() {
  const [filter, setFilter] = useState<StyleType>("Todos");
  const [category, setCategory] = useState<CategoryType>("Masculino");
  const [showFilter, setShowFilter] = useState(false);
  const [index, setIndex] = useState(0);
  const [votes, setVotes] = useState<number[]>(shoes.map(() => 0));

  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const bgRotate = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]); // Adicionei para o logo suavizar ao descer

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const glowX = useTransform(mouseX, [-300, 300], ["30%", "70%"]);
  const glowY = useTransform(mouseY, [-300, 300], ["30%", "70%"]);

  const filteredShoes = shoes.filter(
    (shoe) => filter === "Todos" || shoe.style === filter
  );

  function vote(i: number) {
    const updated = [...votes];
    updated[i]++;
    setVotes(updated);
  }

  return (
    <section
      ref={containerRef}
      onMouseMove={(e) => {
        mouseX.set(e.clientX - window.innerWidth / 2);
        mouseY.set(e.clientY - window.innerHeight / 2);
      }}
      className="relative min-h-screen bg-black text-white overflow-x-hidden"
    >
      {/* Background Fixo */}
      <motion.div
        style={{ scale: bgScale, rotate: bgRotate, opacity: bgOpacity }}
        className="fixed inset-0 flex items-center justify-center pointer-events-none z-0"
      >
        <motion.div
          className="relative w-[520px] h-[520px]"
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            style={{
              background: `radial-gradient(circle at ${glowX} ${glowY}, ${glowColors[category]}, transparent 60%)`,
            }}
            className="absolute inset-0 blur-3xl"
          />

          <div className="absolute inset-0 rounded-full backdrop-blur-2xl bg-white/5 shadow-[inset_0_0_60px_rgba(255,255,255,0.15)]" />

          <Image
            src={LogoFreitasOutlet}
            alt="Freitas Outlet"
            fill
            className="object-contain"
          />
        </motion.div>
      </motion.div>

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative z-10">
          <motion.div
            whileHover={{ scale: 1.1 }}
            style={{
              filter: `drop-shadow(0 0 18px ${glowColors[category]})`,
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

          <div className="flex gap-4">
            {(["Masculino", "Feminino", "Kids"] as CategoryType[]).map(
              (cat) => (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full backdrop-blur-lg border transition
                  ${
                    category === cat
                      ? "bg-white text-black"
                      : "bg-white/5 border-white/20 hover:bg-white/20"
                  }`}
                >
                  {cat}
                </motion.button>
              )
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.15, rotate: 6 }}
            onClick={() => setShowFilter(!showFilter)}
            className="p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20"
          >
            <Filter />
          </motion.button>
        </div>

        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute right-6 mt-4 w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 z-50"
            >
              <h3 className="font-semibold mb-4">Filtros</h3>
              <div className="space-y-3">
                {["Todos", "Casual", "Social", "Esportivo"].map((style) => (
                  <button
                    key={style}
                    onClick={() => setFilter(style as StyleType)}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/20 transition"
                  >
                    {style}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Alteração Principal Aqui: Adicionado pt-[85vh] para empurrar o conteúdo para baixo */}
      <main className="relative z-10 w-full flex items-center justify-center pt-[85vh] pb-20">
        <Contain />
      </main>
    </section>
  );
}