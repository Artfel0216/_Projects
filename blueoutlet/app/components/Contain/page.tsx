'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, Variants, Transition, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShoppingCart, CreditCard, ChevronLeft, ChevronRight, Tag, Ruler } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
}

const CAROUSEL_VARIANTS: Variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0, scale: 0.8 }),
  center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
  exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 300 : -300, opacity: 0, scale: 0.8 })
};

const TRANSITION_SPRING: Transition = {
  x: { type: "spring", stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 }
};

const ProductCard = ({ product, onAddToCart }: { product: ProductType; onAddToCart?: (p: ProductType, s: number) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [showSizeError, setShowSizeError] = useState(false);
  
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const glowBackground = useTransform(
    [smoothX, smoothY],
    ([x, y]) => `radial-gradient(450px circle at ${x}px ${y}px, rgba(255, 255, 255, 0.12), transparent 80%)`
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const images = product.images?.length > 0 ? product.images : ["/placeholder.png"];
  const displayPrice = `R$ ${Number(product.price).toFixed(2).replace('.', ',')}`;

  const sortedSizes = useMemo(() => {
    if (!product.sizes) return [];
    return [...product.sizes].sort((a, b) => a.size - b.size);
  }, [product.sizes]);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentImage((prev) => (prev + newDirection + images.length) % images.length);
  }, [images.length]);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => {
      if (prev) {
        setShowSizeError(false);
        setSelectedSize(null);
      }
      return !prev;
    });
  }, []);

  const handleAction = (e: React.MouseEvent, type: 'buy' | 'add') => {
    e.stopPropagation();
    if (!selectedSize) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 2000);
      return;
    }

    if (type === 'buy') {
      const query = new URLSearchParams({
        title: product.name,
        price: product.price.toString(),
        image: images[0],
        size: selectedSize.toString()
      }).toString();
      router.push(`/PaymentPage?${query}`);
    } else {
      if (onAddToCart) onAddToCart(product, selectedSize);
      const newItem = {
        id: `${product.id}-${selectedSize}`,
        name: product.name,
        variant: `Tamanho: ${selectedSize} | Marca: ${product.brand}`,
        price: Number(product.price),
        quantity: 1,
        image: images[0]
      };
      const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const index = cart.findIndex((item: any) => item.id === newItem.id);
      if (index >= 0) cart[index].quantity += 1;
      else cart.push(newItem);
      localStorage.setItem('cartItems', JSON.stringify(cart));
      router.push('/CarPage');
    }
  };

  return (
    <motion.article
      ref={cardRef}
      layout
      onMouseMove={handleMouseMove}
      onClick={toggleExpand}
      initial={{ opacity: 0, y: 30 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: isExpanded ? 1.02 : 1, 
        zIndex: isExpanded ? 50 : 1 
      }}
      className={`relative w-full group overflow-hidden rounded-[2.5rem] border border-white/10 flex flex-col md:flex-row transition-all duration-500 bg-neutral-900/40 backdrop-blur-2xl ${isExpanded ? 'md:col-span-2 xl:col-span-2 shadow-2xl' : 'cursor-pointer'}`}
    >
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: glowBackground }}
      />

      <div className="relative z-10 flex flex-col md:flex-row w-full">
        <figure className="w-full md:w-1/2 relative flex items-center justify-center bg-black/20 h-80 md:h-112 p-8 m-0">
          <AnimatePresence initial={false} custom={direction}>
            <motion.img
              key={currentImage}
              src={images[currentImage]}
              custom={direction}
              variants={CAROUSEL_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={TRANSITION_SPRING}
              className="absolute w-4/5 h-4/5 object-contain drop-shadow-2xl"
              alt={product.name}
            />
          </AnimatePresence>

          {isExpanded && images.length > 1 && (
            <div className="absolute inset-x-6 flex justify-between z-20 pointer-events-auto">
              <button onClick={(e) => { e.stopPropagation(); paginate(-1); }} className="p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-colors"><ChevronLeft size={20}/></button>
              <button onClick={(e) => { e.stopPropagation(); paginate(1); }} className="p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-colors"><ChevronRight size={20}/></button>
            </div>
          )}
        </figure>

        <section className="w-full md:w-1/2 p-10 flex flex-col justify-between text-white">
          <div className="space-y-6">
            <header className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                <Tag size={12} /> {product.brand}
              </div>
              <h1 className="text-4xl font-bold tracking-tighter">{product.name}</h1>
              <p className="text-3xl font-light text-white/90">{displayPrice}</p>
            </header>

            <p className={`text-gray-400 leading-relaxed font-light ${!isExpanded && 'line-clamp-2'}`}>
              {product.description}
            </p>

            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                    <Ruler size={14} /> Selecione o Tamanho
                    {showSizeError && <span className="text-red-500 ml-auto animate-bounce">Obrigatório</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sortedSizes.map((s) => (
                      <button
                        key={s.size}
                        disabled={s.stock === 0}
                        onClick={(e) => { e.stopPropagation(); setSelectedSize(s.size); setShowSizeError(false); }}
                        className={`w-14 h-14 rounded-2xl font-bold transition-all border-2 ${selectedSize === s.size ? 'bg-white text-black border-white shadow-xl' : 'bg-transparent border-white/10 hover:border-white/40 text-white'} ${s.stock === 0 ? 'opacity-10 cursor-not-allowed' : ''}`}
                      >
                        {s.size}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <footer className="flex flex-col gap-4 mt-10">
            <button onClick={(e) => handleAction(e, 'buy')} className="w-full py-5 rounded-[1.5rem] bg-white text-black font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-neutral-200 transition-colors">
              <CreditCard size={18} /> Comprar Agora
            </button>
            <button onClick={(e) => handleAction(e, 'add')} className="w-full py-5 rounded-[1.5rem] bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-white/10 transition-colors">
              <ShoppingCart size={18} /> Adicionar ao Carrinho
            </button>
          </footer>
        </section>
      </div>
    </motion.article>
  );
};

export default function ContainPage({ onAddToCart, items }: ContainProps) {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items?.length) {
      setProducts(items);
      setLoading(false);
    } else {
      fetch("/api/products").then(res => res.json()).then(data => {
        setProducts(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [items]);

  return (
    <section className="w-full max-w-7xl mx-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {loading ? (
          <div className="col-span-full py-40 text-center text-white/20 font-black uppercase tracking-[1em] animate-pulse">Carregando</div>
        ) : (
          products.map((p) => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />)
        )}
      </div>
    </section>
  );
}