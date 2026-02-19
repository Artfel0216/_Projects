"use client";

import { useState, useRef, useCallback, MouseEvent, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  useScroll,
} from "framer-motion";
import LogoFreitasOutlet from "@/public/LogoFreitasOutlet.png";
import Contain from "@/app/components/Contain/page";
import Header, { CategoryType, StyleType } from "../components/Header/page";

const GLOW_COLORS: Record<CategoryType, string> = {
  Masculino: "rgba(0,180,255,0.45)",
  Feminino: "rgba(255,0,150,0.45)",
  Kids: "rgba(255,200,0,0.45)",
};

export default function MenProductPage() {
  const [filter, setFilter] = useState<StyleType>("Todos");
  const [category, setCategory] = useState<CategoryType>("Masculino");
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();

        const formattedProducts = data.map((product: any) => ({
          id: product.id,
          name: product.name,
          brand: product.name.split(" ")[0],
          price: product.price,
          description: product.description,
          imagePath: product.imagePath.replace("/public", ""),
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    }

    fetchProducts();
  }, []);

  const displayedProducts = products.filter((p) => {
    if (filter === "Todos") return true;
    return p.name.toLowerCase().includes(filter.toLowerCase());
  });

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

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    },
    [mouseX, mouseY]
  );

  const handleAddToCart = useCallback(() => {
    setCartCount((prev) => prev + 1);
  }, []);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-black text-white overflow-x-hidden"
    >
      <motion.div
        style={{ scale: bgScale, rotate: bgRotate, opacity: bgOpacity }}
        className="fixed inset-0 flex items-center justify-center pointer-events-none z-0"
      >
        <motion.div
          className="relative w-130 h-130"
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            style={{
              background: `radial-gradient(circle at ${glowX} ${glowY}, ${GLOW_COLORS[category]}, transparent 60%)`,
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
        glowColor={GLOW_COLORS[category]}
        cartCount={cartCount}
      />

      <main className="relative z-10 w-full flex items-center justify-center pt-[85vh] pb-20">
        <Contain
          products={displayedProducts}
          onAddToCart={handleAddToCart}
        />
      </main>
    </section>
  );
}
