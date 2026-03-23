'use client';

import { useState, useRef, useCallback, MouseEvent, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  useScroll,
  AnimatePresence,
} from "framer-motion";
import { ShoppingBag, PackageSearch, Loader2 } from "lucide-react"; 
import LogoFreitasOutlet from "@/public/LogoFreitasOutlet.png";
import Contain from "@/app/components/Contain/page";
import Header, { CategoryType, StyleType } from "../components/Header/page";

const GLOW_COLORS: Record<CategoryType, string> = {
  Masculino: "rgba(0,180,255,0.35)",
  Feminino: "rgba(255,0,150,0.35)",
  Kids: "rgba(255,200,0,0.35)",
};

export default function MenProductPage() {
  const [filter, setFilter] = useState<StyleType>("Todos");
  const [category, setCategory] = useState<CategoryType>("Masculino");
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsInitialLoading(true);
        const response = await fetch("/api/products");
        const data = await response.json();

        const formattedProducts = data.map((product: any) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          brand: product.brand,
          price: product.price,
          description: product.description,
          images: product.images?.length > 0 ? product.images : ["/placeholder.png"],
          sizes: product.sizes || [],
          category: product.category,
          gender: product.gender
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setIsInitialLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const displayedProducts = products.filter((p) => {
    if (filter === "Todos") return true;
    const searchStr = filter.toLowerCase();
    return (
      p.name.toLowerCase().includes(searchStr) || 
      p.brand?.toLowerCase().includes(searchStr)
    );
  });

  const containerRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const bgScale = useTransform(scrollYProgress, [0, 0.8], [1, 1.1]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.2]);
  const logoY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const glowX = useTransform(mouseX, [-500, 500], ["20%", "80%"]);
  const glowY = useTransform(mouseY, [-500, 500], ["20%", "80%"]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = e;
    mouseX.set(clientX - window.innerWidth / 2);
    mouseY.set(clientY - window.innerHeight / 2);
  }, [mouseX, mouseY]);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-emerald-500/30"
    >
      <motion.div
        style={{ scale: bgScale, opacity: bgOpacity }}
        className="fixed inset-0 flex items-center justify-center pointer-events-none z-0"
      >
        <div className="relative w-96 h-96 md:w-150 md:h-150">
          <motion.div
            style={{
              background: `radial-gradient(circle at ${glowX} ${glowY}, ${GLOW_COLORS[category]}, transparent 70%)`,
            }}
            className="absolute inset-0 blur-[100px] transition-colors duration-1000"
          />
          <motion.div 
            style={{ y: logoY }}
            className="relative w-full h-full flex items-center justify-center"
          >
             <Image
              src={LogoFreitasOutlet}
              alt="Freitas Outlet"
              className="object-contain opacity-20 grayscale brightness-200"
              priority
            />
          </motion.div>
        </div>
      </motion.div>

      <Header
        category={category}
        setCategory={setCategory}
        setFilter={setFilter}
        glowColor={GLOW_COLORS[category]}
        cartCount={cartCount}
      />

      <main className="relative z-10 w-full pt-[70vh] pb-32 px-4 md:px-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {isInitialLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-3/4 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
              ))}
            </motion.div>
          ) : displayedProducts.length > 0 ? (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Contain
                items={displayedProducts}
                onAddToCart={() => setCartCount(prev => prev + 1)}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-40 bg-white/2 rounded-[3rem] border border-white/5 backdrop-blur-md"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-white/20">
                <PackageSearch size={40} />
              </div>
              <h3 className="text-2xl font-bold">Nenhum produto encontrado</h3>
              <p className="text-white/40 mt-2">Tente ajustar seus filtros ou buscar por outro termo.</p>
              <button 
                onClick={() => setFilter("Todos")}
                className="mt-8 px-6 py-2 bg-white text-black rounded-full font-bold text-sm hover:bg-emerald-400 transition-colors"
              >
                Ver todos os produtos
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div 
            initial={{ scale: 0, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50 p-4 bg-emerald-500 rounded-full shadow-2xl shadow-emerald-500/40 text-black flex items-center gap-2 cursor-pointer hover:scale-110 transition-transform"
          >
            <ShoppingBag size={20} />
            <span className="font-bold text-sm">{cartCount}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}