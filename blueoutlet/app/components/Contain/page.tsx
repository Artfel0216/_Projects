'use client';

import React, { useState, useCallback, KeyboardEvent } from 'react';
import { motion, AnimatePresence, Variants, Transition } from 'framer-motion';
import { ShoppingCart, CreditCard, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ContainProps {
  onAddToCart?: () => void;
}

const PRODUCT_DATA = {
  id: "sony-wh1000xm5",
  title: "Sony WH-1000XM5",
  brand: "Sony",
  price: 2499.00,
  displayPrice: "R$ 2.499,00",
  description: "Experimente a melhor qualidade de som com cancelamento de ruído líder da indústria. Design leve, conforto luxuoso e bateria de longa duração.",
  images: [
    "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1000&auto=format&fit=crop"
  ]
};

const CAROUSEL_VARIANTS: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.8
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.8
  })
};

const TRANSITION_SPRING: Transition = {
  x: { type: "spring", stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 }
};

export default function ContainPage({ onAddToCart }: ContainProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [direction, setDirection] = useState(0);
  
  const router = useRouter();

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentImage((prev) => {
      let nextIndex = prev + newDirection;
      if (nextIndex < 0) nextIndex = PRODUCT_DATA.images.length - 1;
      if (nextIndex >= PRODUCT_DATA.images.length) nextIndex = 0;
      return nextIndex;
    });
  }, []);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpand();
    }
  }, [toggleExpand]);

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const queryParams = new URLSearchParams({
      title: PRODUCT_DATA.title,
      price: PRODUCT_DATA.price.toString(),
      image: PRODUCT_DATA.images[0]
    }).toString();

    router.push(`/PaymentPage?${queryParams}`);
  };

  return (
    <section className="w-full flex items-center justify-center p-4">
      <motion.article
        layout
        initial={{ opacity: 0, y: 50, scale: 0.5 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: isExpanded ? 1 : 0.5
        }}
        transition={{
          duration: 0.8,
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
        onClick={toggleExpand}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        aria-label={`Ver detalhes do produto ${PRODUCT_DATA.title}`}
        className={`relative w-full max-w-4xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-colors outline-none focus:ring-2 focus:ring-white/50 ${!isExpanded ? 'cursor-pointer hover:bg-white/5' : ''}`}
      >
        <div className={`flex flex-col md:flex-row w-full ${!isExpanded ? 'pointer-events-none' : ''}`}>
          
          <figure className="w-full md:w-1/2 h-100 md:h-125 relative flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 m-0">
            <nav className="absolute inset-x-4 z-10 flex justify-between pointer-events-none">
              <button
                onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                className="pointer-events-auto p-2 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Imagem anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); paginate(1); }}
                className="pointer-events-auto p-2 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Próxima imagem"
              >
                <ChevronRight size={24} />
              </button>
            </nav>

            <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
              <AnimatePresence initial={false} custom={direction}>
                <motion.img
                  key={currentImage}
                  src={PRODUCT_DATA.images[currentImage]}
                  custom={direction}
                  variants={CAROUSEL_VARIANTS}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={TRANSITION_SPRING}
                  className="absolute w-full h-full object-cover rounded-2xl shadow-lg"
                  alt={`${PRODUCT_DATA.title} - Vista ${currentImage + 1}`}
                />
              </AnimatePresence>
            </div>

            <div className="absolute bottom-6 flex gap-2 z-10" role="tablist">
              {PRODUCT_DATA.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentImage(idx); }}
                  role="tab"
                  aria-selected={idx === currentImage}
                  aria-label={`Selecionar imagem ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-white ${idx === currentImage ? 'bg-white w-6' : 'bg-white/40 w-2'}`}
                />
              ))}
            </div>
          </figure>

          <section className="w-full md:w-1/2 p-8 flex flex-col justify-between text-white">
            <header className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-semibold uppercase tracking-wider text-gray-300 w-fit"
              >
                <Tag size={12} />
                {PRODUCT_DATA.brand}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
              >
                {PRODUCT_DATA.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-light text-emerald-400"
              >
                {PRODUCT_DATA.displayPrice}
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-300 text-sm leading-relaxed"
              >
                {PRODUCT_DATA.description}
              </motion.p>
            </header>

            <footer className="flex flex-col gap-3 mt-8">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow} 
                className="w-full py-4 px-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center gap-3 font-semibold text-white transition-all shadow-lg hover:shadow-white/10 group focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <CreditCard className="group-hover:text-emerald-300 transition-colors" />
                Comprar Agora
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(0, 0, 0, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart?.();
                }}
                className="w-full py-4 px-6 rounded-xl bg-black/40 backdrop-blur-md border border-white/5 flex items-center justify-center gap-3 font-semibold text-gray-300 transition-all shadow-lg group active:border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <ShoppingCart className="group-hover:text-blue-400 transition-colors" />
                Adicionar ao Carrinho
              </motion.button>
            </footer>
          </section>
        </div>
      </motion.article>
    </section>
  );
}