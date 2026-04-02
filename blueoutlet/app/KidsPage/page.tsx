"use client";

import { useState, useRef, useCallback, MouseEvent, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  useScroll,
  AnimatePresence,
  useSpring,
} from "framer-motion";
import { ShoppingBag, PackageSearch, AlertTriangle, RotateCcw } from "lucide-react";
import LogoFreitasOutlet from "@/public/LogoFreitasOutlet.png";
import Contain from "@/app/components/Contain/page";
import Header, { CategoryType, StyleType } from "../components/Header/page";

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  description: string;
  images: string[];
  sizes: { size: number; stock: number }[];
  category: string;
  gender: string;
}

const GLOW_COLORS: Record<CategoryType, string> = {
  Masculino: "rgba(0, 180, 255, 0.35)",
  Feminino: "rgba(236, 72, 153, 0.45)",
  Kids: "rgba(59, 130, 246, 0.5)",
};

export default function KidsPage() {
  const [filter, setFilter] = useState<StyleType>("Todos");
  const [category, setCategory] = useState<CategoryType>("Kids");
  const [cartCount, setCartCount] = useState(0);

  const [products, setProducts] = useState<Product[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsInitialLoading(true);
      setError(null);
      const response = await fetch("/api/products", { signal });

      if (!response.ok) throw new Error("Falha ao carregar os produtos");

      const data = await response.json();

      const formattedProducts: Product[] = data
        .filter((p: any) => p.gender?.toLowerCase() === "kids" || p.category?.toLowerCase() === "kids")
        .map((product: any) => ({
          id: String(product.id),
          name: product.name,
          slug: product.slug,
          brand: product.brand || "Freitas Outlet",
          price: product.price,
          description: product.description,
          images: product.images?.length > 0 ? product.images : ["/placeholder.png"],
          sizes: Array.isArray(product.sizes)
            ? product.sizes.map((s: any) =>
                typeof s === "object" && s !== null
                  ? { size: Number(s.size), stock: Number(s.stock ?? 0) }
                  : { size: Number(s), stock: 1 }
              )
            : [],
          category: product.category,
          gender: product.gender,
        }));

      setProducts(formattedProducts);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError("Não foi possível carregar o catálogo infantil. Tente novamente.");
      }
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [fetchProducts]);

  const displayedProducts = useMemo(() => {
    if (filter === "Todos") return products;
    const searchStr = filter.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchStr) ||
        p.brand?.toLowerCase().includes(searchStr) ||
        p.description?.toLowerCase().includes(searchStr)
    );
  }, [products, filter]);

  const containerRef = useRef<HTMLElement>(null);
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 100 };
  const mouseX = useSpring(rawMouseX, springConfig);
  const mouseY = useSpring(rawMouseY, springConfig);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const bgScale = useTransform(scrollYProgress, [0, 0.8], [1, 1.15]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.2]);
  const logoY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const bgBlur = useTransform(scrollYProgress, [0, 0.4], [0, 10]);

  const glowX = useTransform(mouseX, [-500, 500], ["20%", "80%"]);
  const glowY = useTransform(mouseY, [-500, 500], ["20%", "80%"]);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      rawMouseX.set(e.clientX - window.innerWidth / 2);
      rawMouseY.set(e.clientY - window.innerHeight / 2);
    },
    [rawMouseX, rawMouseY]
  );

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-blue-500/30"
    >
      <motion.div
        style={{ scale: bgScale, opacity: bgOpacity, filter: useTransform(bgBlur, (v) => `blur(${v}px)`) }}
        className="fixed inset-0 flex items-center justify-center pointer-events-none z-0"
      >
        <div className="relative w-125 h-125 md:w-200 md:h-200">
          <motion.div
            style={{
              background: useTransform(
                [glowX, glowY],
                ([x, y]) => `radial-gradient(circle at ${x} ${y}, ${GLOW_COLORS[category]}, transparent 70%)`
              ),
            }}
            className="absolute inset-0 blur-[120px] transition-colors duration-1000 opacity-60"
          />
          <motion.div
            style={{ y: logoY }}
            className="relative w-full h-full flex items-center justify-center p-20"
          >
            <Image
              src={LogoFreitasOutlet}
              alt="Freitas Outlet"
              className="object-contain opacity-10 grayscale brightness-150 scale-125"
              priority
            />
          </motion.div>
        </div>
      </motion.div>

      <Header
        category={category}
        setCategory={setCategory}
        activeFilter={filter}
        setFilter={setFilter}
        glowColor={GLOW_COLORS[category]}
        cartCount={cartCount}
      />

      <main className="relative z-10 w-full pt-[45vh] md:pt-[75vh] pb-32 px-4 md:px-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {isInitialLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-3/4 rounded-[2.5rem] bg-white/5 animate-pulse border border-white/5"
                />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 bg-red-500/5 rounded-[3.5rem] border border-red-500/10 backdrop-blur-xl"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-400">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black tracking-tight">Ops! Erro no Catálogo</h3>
              <p className="text-white/50 mt-3 mb-8 text-center max-w-sm font-medium">
                {error}
              </p>
              <button
                onClick={() => fetchProducts()}
                className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95 shadow-xl"
              >
                <RotateCcw size={16} /> Tentar Novamente
              </button>
            </motion.div>
          ) : displayedProducts.length > 0 ? (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <Contain
                items={displayedProducts}
                onAddToCart={() => setCartCount((prev) => prev + 1)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-44 bg-white/5 rounded-[3.5rem] border border-white/10 backdrop-blur-xl"
            >
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 text-white/20">
                <PackageSearch size={48} />
              </div>
              <h3 className="text-3xl font-black tracking-tight">Nada por aqui</h3>
              <p className="text-white/40 mt-3 text-center font-medium">
                Não encontramos produtos para "{filter}".
              </p>
              <button
                onClick={() => setFilter("Todos")}
                className="mt-10 px-10 py-4 bg-white/10 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
              >
                Limpar Filtros
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence mode="popLayout">
        {cartCount > 0 && (
          <motion.div
            initial={{ scale: 0, y: 100, filter: "blur(10px)" }}
            animate={{ scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ scale: 0, y: 100, filter: "blur(10px)" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-10 right-10 z-50 p-5 bg-white rounded-3xl shadow-[0_20px_50px_rgba(255,255,255,0.2)] text-black flex items-center gap-3 cursor-pointer transition-shadow"
          >
            <div className="relative">
              <ShoppingBag size={24} strokeWidth={2.5} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
            </div>
            <span className="font-black text-lg">{cartCount}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 w-full h-40 bg-linear-to-t from-black to-transparent pointer-events-none z-20" />
    </section>
  );
}