"use client";

import { useState, useRef, useCallback, MouseEvent } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  useScroll,
} from "framer-motion";
import LogoFreitasOutlet from "@/public/LogoFreitasOutlet.png";
import Contain from "../components/Contain/page";
import Header, { CategoryType, StyleType } from "../components/Header/page";

const GLOW_COLORS: Record<CategoryType, string> = {
  Masculino: "rgba(0,180,255,0.45)",
  Feminino: "rgba(236, 72, 153, 0.6)",
  Kids: "rgba(59, 130, 246, 0.6)",
};

export default function KidsPage() {
  const [category, setCategory] = useState<CategoryType>("Kids");
  const [filter, setFilter] = useState<StyleType>("Todos");
  const [cartCount, setCartCount] = useState(0);

  const containerRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const bgRotate = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  const glowX = useTransform(mouseX, [-300, 300], ["30%", "70%"]);
  const glowY = useTransform(mouseY, [-300, 300], ["30%", "70%"]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLElement>) => {
    mouseX.set(e.clientX - window.innerWidth / 2);
    mouseY.set(e.clientY - window.innerHeight / 2);
  }, [mouseX, mouseY]);

  const handleAddToCart = useCallback(() => {
    setCartCount((prev) => prev + 1);
  }, []);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-black text-white overflow-x-hidden selection:bg-blue-500 selection:text-white"
    >
      <motion.div
        style={{ scale: bgScale, rotate: bgRotate, opacity: bgOpacity }}
        className="fixed inset-0 flex items-center justify-center pointer-events-none z-0"
      >
        <motion.div
          className="relative"
          style={{ width: '500px', height: '500px' }}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            style={{
              background: `radial-gradient(circle at ${glowX} ${glowY}, ${GLOW_COLORS["Kids"]}, transparent 60%)`,
            }}
            className="absolute inset-0 blur-3xl opacity-80"
          />

          <div className="absolute inset-0 rounded-full backdrop-blur-3xl bg-blue-500/10 border border-blue-500/30 shadow-[0_0_100px_rgba(59,130,246,0.2)]" />

          <div className="relative w-full h-full p-12 flex items-center justify-center">
            <Image
              src={LogoFreitasOutlet}
              alt="Freitas Outlet"
              fill
              className="object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]"
              priority
            />
            
            <div className="absolute inset-0 rounded-full bg-blue-500/10 mix-blend-overlay pointer-events-none" />
          </div>
        </motion.div>
      </motion.div>

      <Header
        category={category}
        setCategory={setCategory}
        setFilter={setFilter}
        glowColor={GLOW_COLORS["Kids"]}
        cartCount={cartCount}
      />

      <main className="relative z-10 w-full flex items-center justify-center pt-[85vh] pb-20">
        <Contain onAddToCart={handleAddToCart} />
      </main>
    </section>
  );
}