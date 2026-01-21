"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  useScroll,
} from "framer-motion";
import { useState, useRef } from "react";
import LogoFreitasOutlet from "@/public/LogoFreitasOutlet.png";
import Contain from "@/app/components/Contain/page";

// --- CORREÇÃO AQUI ---
// Adicionamos { CategoryType, StyleType } para importar os tipos junto com o componente
import Header, { CategoryType, StyleType } from "../components/Header/page"; 

const glowColors: Record<CategoryType, string> = {
  Masculino: "rgba(0,180,255,0.45)",
  Feminino: "rgba(255,0,150,0.45)",
  Kids: "rgba(255,200,0,0.45)",
};

const shoes = [
  { id: 1, name: "Oxford Clássico", brand: "Ferracini", price: 399.9, style: "Social", image: "/shoes/oxford.jpg" },
  { id: 2, name: "Loafer Premium", brand: "Democrata", price: 349.9, style: "Casual", image: "/shoes/loafer.jpg" },
  { id: 3, name: "Sneaker Minimal", brand: "Nike", price: 299.9, style: "Esportivo", image: "/shoes/sneaker.jpg" },
];

export default function MenProductPage() {
  // Agora o TypeScript reconhece StyleType e CategoryType
  const [filter, setFilter] = useState<StyleType>("Todos");
  const [category, setCategory] = useState<CategoryType>("Masculino");
  
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const bgRotate = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const glowX = useTransform(mouseX, [-300, 300], ["30%", "70%"]);
  const glowY = useTransform(mouseY, [-300, 300], ["30%", "70%"]);

  const filteredShoes = shoes.filter(
    (shoe) => filter === "Todos" || shoe.style === filter
  );

  return (
    <section
      ref={containerRef}
      onMouseMove={(e) => {
        mouseX.set(e.clientX - window.innerWidth / 2);
        mouseY.set(e.clientY - window.innerHeight / 2);
      }}
      className="relative min-h-screen bg-black text-white overflow-x-hidden"
    >
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

      <Header 
        category={category}
        setCategory={setCategory}
        setFilter={setFilter}
        glowColor={glowColors[category]}
      />

      <main className="relative z-10 w-full flex items-center justify-center pt-[85vh] pb-20">
        <Contain />
      </main>
    </section>
  );
}