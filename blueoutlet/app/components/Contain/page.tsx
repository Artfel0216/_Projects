'use client';

import React, { useState, useCallback, KeyboardEvent, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Variants, Transition } from 'framer-motion';
import { ShoppingCart, CreditCard, ChevronLeft, ChevronRight, Tag, Ruler } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type ProductType = {
  id: number;
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

  const images = product.images?.length > 0 ? product.images : ["/placeholder.png"];
  const displayPrice = `R$ ${product.price.toFixed(2).replace('.', ',')}`;

  const sortedSizes = useMemo(() => {
    if (!product.sizes) return [];
    return [...product.sizes].sort((a, b) => a.size - b.size);
  }, [product.sizes]);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentImage((prev) => {
      let nextIndex = prev + newDirection;
      if (nextIndex < 0) nextIndex = images.length - 1;
      if (nextIndex >= images.length) nextIndex = 0;
      return nextIndex;
    });
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

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpand();
    }
  }, [toggleExpand]);

  const validateAndProceed = (callback: () => void) => {
    if (!selectedSize) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 2000);
      return;
    }
    callback();
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    validateAndProceed(() => {
      const queryParams = new URLSearchParams({
        title: product.name,
        price: product.price.toString(),
        image: images[0],
        size: selectedSize!.toString()
      }).toString();

      router.push(`/PaymentPage?${queryParams}`);
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    validateAndProceed(() => {
      onAddToCart?.(product, selectedSize!);
    });
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: isExpanded ? 1.12 : 1, zIndex: isExpanded ? 50 : 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 250, damping: 25 }}
      onClick={toggleExpand}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
      className={`relative w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl overflow-hidden flex flex-col md:flex-row transition-all duration-300 outline-none focus:ring-2 focus:ring-white/50 ${isExpanded ? 'shadow-[0_20px_60px_rgba(0,0,0,0.8)] ring-1 ring-white/30' : 'shadow-2xl cursor-pointer hover:bg-white/5'}`}
    >
      <div className={`flex flex-col md:flex-row w-full ${!isExpanded ? 'pointer-events-none' : ''}`}>

        <figure className={`w-full md:w-1/2 relative flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 m-0 transition-all duration-500 ${isExpanded ? 'h-96 md:h-140' : 'h-80 md:h-96'}`}>
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl group">
            
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
                className="absolute w-full h-full object-contain rounded-2xl shadow-lg"
                alt={product.name}
              />
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                  className={`absolute left-2 z-10 p-2 rounded-full bg-black/40 border border-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:scale-110 ${!isExpanded ? 'opacity-0' : 'opacity-100'}`}
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); paginate(1); }}
                  className={`absolute right-2 z-10 p-2 rounded-full bg-black/40 border border-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:scale-110 ${!isExpanded ? 'opacity-0' : 'opacity-100'}`}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </figure>

        <section className="w-full md:w-1/2 p-6 flex flex-col justify-between text-white">
          <header className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-semibold uppercase tracking-wider text-gray-300 w-fit">
              <Tag size={12} />
              {product.brand}
            </div>

            <h1 className={`font-bold leading-tight bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400 transition-all duration-300 ${isExpanded ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
              {product.name}
            </h1>

            <p className={`font-light text-emerald-400 transition-all duration-300 ${isExpanded ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
              {displayPrice}
            </p>

            <p className={`text-gray-300 leading-relaxed transition-all duration-300 ${isExpanded ? 'text-base' : 'text-sm line-clamp-3'}`}>
              {product.description}
            </p>

            <AnimatePresence>
              {isExpanded && sortedSizes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ 
                    opacity: 1, 
                    height: 'auto', 
                    marginTop: 16,
                    x: showSizeError ? [-10, 10, -10, 10, 0] : 0 
                  }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`overflow-hidden rounded-2xl p-4 transition-colors duration-300 ${showSizeError ? 'bg-red-500/10 border border-red-500/30' : 'bg-black/20 border border-white/5'}`}
                >
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-300">
                    <Ruler size={16} />
                    <span>Selecione o Tamanho:</span>
                    {showSizeError && <span className="text-red-400 text-xs ml-auto">Obrigatório</span>}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {sortedSizes.map((s) => {
                      const isOutOfStock = s.stock === 0;
                      const isSelected = selectedSize === s.size;
                      
                      return (
                        <motion.button
                          key={s.size}
                          whileHover={!isOutOfStock ? { scale: 1.05 } : {}}
                          whileTap={!isOutOfStock ? { scale: 0.95 } : {}}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isOutOfStock) {
                              setSelectedSize(s.size);
                              setShowSizeError(false);
                            }
                          }}
                          disabled={isOutOfStock}
                          className={`
                            relative w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300
                            backdrop-blur-md border overflow-hidden
                            ${isSelected 
                              ? 'bg-white/90 border-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105' 
                              : isOutOfStock 
                                ? 'bg-black/40 border-white/5 text-gray-600 cursor-not-allowed opacity-60' 
                                : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/40 shadow-lg'}
                          `}
                        >
                          {s.size}
                          {isOutOfStock && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-px bg-red-500/50 rotate-45"></div>
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          <footer className="flex flex-col gap-3 mt-6">
            <button
              onClick={handleBuyNow}
              className="w-full py-3 px-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center gap-3 font-semibold text-white transition-all shadow-lg hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <CreditCard size={20} />
              Comprar Agora
            </button>

            <button
              onClick={handleAddToCart}
              className="w-full py-3 px-6 rounded-xl bg-black/40 backdrop-blur-md border border-white/5 flex items-center justify-center gap-3 font-semibold text-gray-300 transition-all shadow-lg hover:bg-black/60 hover:text-white"
            >
              <ShoppingCart size={20} />
              Adicionar ao Carrinho
            </button>
          </footer>
        </section>
      </div>
    </motion.article>
  );
};

export default function ContainPage({ onAddToCart }: ContainProps) {
  const [products, setProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    }

    loadProducts();
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {products.length === 0 && (
          <p className="text-white text-center col-span-full">
            Carregando produtos...
          </p>
        )}

        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
}