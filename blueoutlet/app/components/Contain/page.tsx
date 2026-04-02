'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, Variants, Transition, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShoppingCart, CreditCard, ChevronLeft, ChevronRight, Tag, Ruler, Loader2, Info } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export type ProductType = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  description: string;
  images: string[];
  category?: string;
  gender?: string;
  sizes?: { size: number; stock: number }[];
};

interface ContainProps {
  items?: ProductType[];
  onAddToCart?: (product: ProductType, size: number) => void;
  category?: string;
  filter?: string;
}

const CAROUSEL_VARIANTS: Variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0, scale: 0.9, filter: 'blur(10px)' }),
  center: { zIndex: 1, x: 0, opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 80 : -80, opacity: 0, scale: 0.9, filter: 'blur(10px)' })
};

const SPRING_TRANSITION: Transition = {
  x: { type: "spring", stiffness: 300, damping: 30 },
  opacity: { duration: 0.3 }
};

const ProductCard = React.memo(({ product, onAddToCart }: { product: ProductType; onAddToCart?: (p: ProductType, s: number) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [showSizeError, setShowSizeError] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname(); 
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const themeColor = useMemo(() => {
    if (pathname.includes('/Womanpage')) return { raw: '236, 72, 153', border: 'border-pink-500/10 hover:border-pink-500/40', accent: 'text-pink-400', glow: 'rgba(236, 72, 153, 0.15)' };
    if (pathname.includes('/Kidspage')) return { raw: '59, 130, 246', border: 'border-blue-500/10 hover:border-blue-500/40', accent: 'text-blue-400', glow: 'rgba(59, 130, 246, 0.15)' };
    return { raw: '16, 185, 129', border: 'border-emerald-500/10 hover:border-emerald-500/40', accent: 'text-emerald-400', glow: 'rgba(16, 185, 129, 0.15)' };
  }, [pathname]);

  const glowBackground = useTransform(
    [smoothX, smoothY],
    ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, ${themeColor.glow}, transparent 80%)`
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    }
  }, [mouseX, mouseY]);

  const images = useMemo(() => product.images?.length > 0 ? product.images : ["/placeholder.png"], [product.images]);
  const displayPrice = useMemo(() => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price), [product.price]);

  const sortedSizes = useMemo(() => 
    [...(product.sizes || [])].sort((a, b) => a.size - b.size), 
  [product.sizes]);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentImage((prev) => (prev + newDirection + images.length) % images.length);
  }, [images.length]);

  const handleAction = useCallback((e: React.MouseEvent, type: 'buy' | 'add') => {
    e.stopPropagation();
    if (!selectedSize) {
      setShowSizeError(true);
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const itemKey = `${product.id}-${selectedSize}`;
    const existing = cart.find((i: any) => i.id === itemKey);
    
    if (existing) existing.quantity += 1;
    else cart.push({
      id: itemKey,
      name: product.name,
      variant: `Tamanho: ${selectedSize} | Marca: ${product.brand}`,
      price: Number(product.price),
      quantity: 1,
      image: images[0]
    });
    
    localStorage.setItem('cartItems', JSON.stringify(cart));

    if (type === 'buy') {
      const params = new URLSearchParams({
        title: product.name,
        price: product.price.toString(),
        image: images[0],
        size: selectedSize.toString()
      });
      router.push(`/PaymentPage?${params.toString()}`);
    } else {
      if (onAddToCart) onAddToCart(product, selectedSize);
      router.push('/CarPage');
    }
  }, [product, selectedSize, images, onAddToCart, router]);

  return (
    <motion.article
      ref={cardRef}
      layout
      onMouseMove={handleMouseMove}
      onClick={() => setIsExpanded(!isExpanded)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        zIndex: isExpanded ? 50 : 1 
      }}
      className={`relative w-full group overflow-hidden rounded-[2.5rem] border flex flex-col transition-all duration-500 bg-white/2 backdrop-blur-3xl ${themeColor.border} ${isExpanded ? 'md:col-span-2 xl:col-span-2 shadow-2xl' : 'cursor-pointer hover:bg-white/4'}`}
    >
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ background: glowBackground }}
      />

      <div className={`relative z-10 flex flex-col ${isExpanded ? 'md:flex-row' : ''} w-full h-full`}>
        <figure className={`relative flex items-center justify-center bg-black/20 overflow-hidden transition-all duration-700 ${isExpanded ? 'w-full md:w-1/2 min-h-100' : 'w-full aspect-square'}`}>
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.img
              key={currentImage}
              src={images[currentImage]}
              custom={direction}
              variants={CAROUSEL_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={SPRING_TRANSITION}
              className="absolute w-[80%] h-[80%] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
              alt={product.name}
            />
          </AnimatePresence>

          {isExpanded && images.length > 1 && (
            <div className="absolute inset-x-6 flex justify-between z-20 pointer-events-none">
              <button onClick={(e) => { e.stopPropagation(); paginate(-1); }} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-all pointer-events-auto active:scale-90"><ChevronLeft size={20}/></button>
              <button onClick={(e) => { e.stopPropagation(); paginate(1); }} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-all pointer-events-auto active:scale-90"><ChevronRight size={20}/></button>
            </div>
          )}
          
          <div className="absolute bottom-6 flex gap-1.5">
            {images.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-500 ${currentImage === i ? 'w-6 bg-white' : 'w-1.5 bg-white/10'}`} />
            ))}
          </div>
        </figure>

        <section className={`p-8 md:p-10 flex flex-col justify-between ${isExpanded ? 'w-full md:w-1/2' : 'w-full'}`}>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] ${themeColor.accent}`}>
                <Tag size={10} strokeWidth={3} /> {product.brand}
              </div>
              <h1 className={`${isExpanded ? 'text-4xl md:text-5xl' : 'text-2xl'} font-black tracking-tighter leading-tight text-white uppercase italic`}>{product.name}</h1>
              <p className={`${isExpanded ? 'text-3xl' : 'text-xl'} font-medium tracking-tight text-white/50`}>{displayPrice}</p>
            </div>

            <p className={`text-neutral-400 text-sm leading-relaxed font-medium transition-all duration-500 ${!isExpanded ? 'line-clamp-2 opacity-40 text-xs' : ''}`}>
              {product.description}
            </p>

            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="pt-6 border-t border-white/5 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2"><Ruler size={12} /> Seletor de Tamanho</span>
                    {showSizeError && <span className="text-pink-500 text-[9px] font-black uppercase animate-bounce">Selecione um tamanho</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sortedSizes.map((s) => (
                      <button
                        key={s.size}
                        disabled={s.stock === 0}
                        onClick={(e) => { e.stopPropagation(); setSelectedSize(s.size); setShowSizeError(false); }}
                        className={`w-12 h-12 rounded-xl font-black transition-all border text-[11px] flex items-center justify-center ${selectedSize === s.size ? 'bg-white text-black border-white shadow-lg scale-105' : 'bg-white/5 border-white/5 hover:border-white/20 text-white'} ${s.stock === 0 ? 'opacity-10 cursor-not-allowed line-through' : 'active:scale-90'}`}
                      >
                        {s.size}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <footer className={`flex flex-col sm:flex-row gap-3 ${isExpanded ? 'mt-10' : 'mt-6'}`}>
            <button onClick={(e) => handleAction(e, 'buy')} className="flex-1 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-neutral-200 active:scale-95 transition-all shadow-lg">
              <CreditCard size={16} strokeWidth={2.5} /> Comprar
            </button>
            <button onClick={(e) => handleAction(e, 'add')} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all">
              <ShoppingCart size={16} strokeWidth={2.5} /> Carrinho
            </button>
          </footer>
        </section>
      </div>
    </motion.article>
  );
});

ProductCard.displayName = "ProductCard";

export default function ContainPage({ onAddToCart, items, category, filter }: ContainProps) {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items?.length) {
      setProducts(items);
      setLoading(false);
    } else {
      setLoading(true);
      fetch("/api/products")
        .then(res => res.ok ? res.json() : [])
        .then(data => setProducts(data))
        .catch(() => setProducts([]))
        .finally(() => setLoading(false));
    }
  }, [items]);

  return (
    <main className="w-full max-w-350 mx-auto px-6">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="h-[50vh] flex flex-col items-center justify-center gap-6 text-white/10"
          >
            <Loader2 className="animate-spin" size={32} strokeWidth={3} />
            <span className="font-black uppercase tracking-[0.5em] text-[10px]">Carregando Catálogo</span>
          </motion.div>
        ) : products.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[50vh] flex flex-col items-center justify-center text-center gap-4"
          >
            <div className="p-6 rounded-full bg-white/5 border border-white/10 text-white/20">
              <Info size={40} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter italic">Nenhum produto encontrado</h3>
            <p className="text-white/30 text-xs font-medium max-w-xs">Tente ajustar seus filtros ou verifique novamente mais tarde.</p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}