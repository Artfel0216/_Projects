"use client";

import { useState, useRef, useCallback, MouseEvent, useMemo } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  useScroll,
  useSpring,
} from "framer-motion";
import LogoFreitasOutlet from "@/public/LogoFreitasOutlet.png";
import Contain from "../components/Contain/page";
import Header, { CategoryType, StyleType } from "../components/Header/page";

const GLOW_COLORS: Record<CategoryType, string> = {
  Masculino: "rgba(0, 180, 255, 0.45)",
  Feminino: "rgba(236, 72, 153, 0.6)",
  Kids: "rgba(255, 200, 0, 0.45)",
};

const SPRING_CONFIG = { damping: 30, stiffness: 200, mass: 0.5 };

export default function WomanPage() {
  const [category, setCategory] = useState<CategoryType>("Feminino");
  const [filter, setFilter] = useState<StyleType>("Todos");
  const [cartCount, setCartCount] = useState(0);

  const containerRef = useRef<HTMLElement>(null);
  
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  
  const mouseX = useSpring(rawMouseX, SPRING_CONFIG);
  const mouseY = useSpring(rawMouseY, SPRING_CONFIG);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const bgRotate = useTransform(scrollYProgress, [0, 1], [0, 5]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.4, 0.8], [1, 0.4, 0.1]);

  const glowX = useTransform(mouseX, [-500, 500], ["20%", "80%"]);
  const glowY = useTransform(mouseY, [-500, 500], ["20%", "80%"]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLElement>) => {
    const { innerWidth, innerHeight } = window;
    rawMouseX.set(e.clientX - innerWidth / 2);
    rawMouseY.set(e.clientY - innerHeight / 2);
  }, [rawMouseX, rawMouseY]);

  const handleAddToCart = useCallback(() => {
    setCartCount((prev) => prev + 1);
  }, []);

  const activeGlowColor = useMemo(() => GLOW_COLORS[category], [category]);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[200vh] bg-black text-white overflow-x-hidden selection:bg-pink-500/50"
    >
      <motion.div
        style={{ 
          scale: bgScale, 
          rotate: bgRotate, 
          opacity: bgOpacity,
          willChange: "transform, opacity" 
        }}
        className="fixed inset-0 flex items-center justify-center pointer-events-none z-0"
      >
        <motion.div
          className="relative w-75 h-75 md:w-125 md:h-125"
          animate={{ y: [0, -20, 0] }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <motion.div
            style={{
              background: useTransform(
                [glowX, glowY],
                ([x, y]) => `radial-gradient(circle at ${x} ${y}, ${activeGlowColor}, transparent 70%)`
              ),
            }}
            className="absolute -inset-25 blur-[80px] opacity-70"
          />

          <div className="absolute inset-0 rounded-full backdrop-blur-[120px] bg-pink-500/5 border border-pink-500/20 shadow-[0_0_120px_rgba(236,72,153,0.15)]" />

          <div className="relative w-full h-full p-8 md:p-16 flex items-center justify-center">
            <Image
              src={LogoFreitasOutlet}
              alt="Freitas Outlet Logo"
              fill
              sizes="(max-width: 768px) 300px, 500px"
              className="object-contain drop-shadow-[0_0_40px_rgba(236,72,153,0.4)] transition-all duration-700"
              priority
            />
            <div className="absolute inset-0 rounded-full bg-linear-to-tr from-pink-500/10 to-transparent mix-blend-overlay" />
          </div>
        </motion.div>
      </motion.div>

      <Header
        category={category}
        setCategory={setCategory}
        setFilter={setFilter}
        glowColor={activeGlowColor}
        cartCount={cartCount}
      />

      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 pt-[90vh] pb-32">
        <Contain 
          items={[]} 
          category={category}
          filter={filter}
          onAddToCart={handleAddToCart} 
        />
      </main>

      <footer className="relative z-10 w-full py-10 border-t border-white/5 bg-black/50 backdrop-blur-md flex justify-center items-center">
        <p className="text-white/20 text-xs tracking-[0.3em] uppercase">
          Freitas Outlet &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </section>
  );
}