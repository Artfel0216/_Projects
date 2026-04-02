"use client";

import { useState, useRef, useCallback, MouseEvent, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  useScroll,
  AnimatePresence,
} from "framer-motion";
import { ShoppingBag, PackageSearch, AlertTriangle, RotateCcw } from "lucide-react"; 
import LogoFreitasOutlet from "@/public/LogoFreitasOutlet.png";
import Contain from "@/app/components/Contain/page";
import Header, { CategoryType, StyleType } from "../components/Header/page";

// 1. Tipagem correta para os Produtos
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
  Masculino: "rgba(0,180,255,0.35)",
  Feminino: "rgba(255,0,150,0.35)",
  Kids: "rgba(255,200,0,0.35)",
};

export default function MenProductPage() {
  const [filter, setFilter] = useState<StyleType>("Todos");
  const [category, setCategory] = useState<CategoryType>("Masculino");
  const [cartCount, setCartCount] = useState(0);
  
  // Estados de dados
  const [products, setProducts] = useState<Product[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Fetch com AbortController e tratamento de erros
  const fetchProducts = useCallback(async () => {
    const controller = new AbortController();
    
    try {
      setIsInitialLoading(true);
      setError(null);
      const response = await fetch("/api/products", { signal: controller.signal });
      
      if (!response.ok) throw new Error("Falha ao carregar os produtos");
      
      const data = await response.json();

      const formattedProducts: Product[] = data.map((product: any) => ({
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
        gender: product.gender
      }));

      setProducts(formattedProducts);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Erro ao buscar produtos:", err);
        setError("Não foi possível carregar o catálogo. Tente novamente mais tarde.");
      }
    } finally {
      setIsInitialLoading(false);
    }

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const cleanup = fetchProducts();
    // Resolve a promessa do cleanup para não causar problemas no unmount
    cleanup.then(abortFn => abortFn); 
  }, [fetchProducts]);

  // 3. Memoização do filtro para evitar cálculos desnecessários
  const displayedProducts = useMemo(() => {
    if (filter === "Todos") return products;
    const searchStr = filter.toLowerCase();
    
    return products.filter((p) => 
      p.name.toLowerCase().includes(searchStr) || 
      p.brand?.toLowerCase().includes(searchStr)
    );
  }, [products, filter]);

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
      className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-blue-500/30"
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
        activeFilter={filter}
        setFilter={setFilter}
        glowColor={GLOW_COLORS[category]}
        cartCount={cartCount}
      />

      <main className="relative z-10 w-full pt-[40vh] md:pt-[70vh] pb-32 px-4 md:px-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Estado de Carregamento */}
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
          
          /* Estado de Erro */
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-red-500/5 rounded-[3rem] border border-red-500/20 backdrop-blur-md"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-400">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Oops! Algo deu errado.</h3>
              <p className="text-white/60 mt-2 mb-6 text-center max-w-md">{error}</p>
              <button 
                onClick={fetchProducts}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-200 transition-colors"
              >
                <RotateCcw size={16} /> Tentar Novamente
              </button>
            </motion.div>

          /* Estado de Sucesso (Com Produtos) */
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

          /* Estado Vazio (Filtro não encontrou nada) */
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-40 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-md"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-white/40">
                <PackageSearch size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white">Nenhum produto encontrado</h3>
              <p className="text-white/60 mt-2 text-center">Tente ajustar seus filtros para "{filter}" ou veja todo o catálogo.</p>
              <button 
                onClick={() => setFilter("Todos")}
                className="mt-8 px-8 py-3 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-all"
              >
                Ver todos os produtos
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Botão de Carrinho Flutuante */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div 
            initial={{ scale: 0, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50 p-4 bg-white rounded-full shadow-2xl shadow-white/20 text-black flex items-center gap-2 cursor-pointer hover:scale-110 transition-transform"
          >
            <ShoppingBag size={20} />
            <span className="font-bold text-sm">{cartCount}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}