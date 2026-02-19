'use client';

import React, { useState, useCallback, KeyboardEvent } from 'react';
import { motion, AnimatePresence, Variants, Transition } from 'framer-motion';
import { ShoppingCart, CreditCard, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

// 1. Definição do Tipo do Produto (Igual ao que vem do seeds/pai)
export type ProductType = {
  id: number;
  name: string;
  slug: string;
  brand: string;
  price: number;
  description: string;
  imagePath: string;
  bgColor: string;
};

// 2. Atualização da Interface das Props recebidas
interface ContainProps {
  onAddToCart?: () => void;
  products: ProductType[];
}

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

const ProductCard = ({ product, onAddToCart }: { product: ProductType; onAddToCart?: () => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [direction, setDirection] = useState(0);
  const router = useRouter();

  const images = [product.imagePath, product.imagePath, product.imagePath]; 
  const displayPrice = `R$ ${product.price.toFixed(2).replace('.', ',')}`;

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
      title: product.name,
      price: product.price.toString(),
      image: images[0]
    }).toString();

    router.push(`/PaymentPage?${queryParams}`);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }} // Ajustei levemente scale inicial para grid
      animate={{
        opacity: 1,
        y: 0,
        scale: isExpanded ? 1.05 : 1, // Ajuste sutil para não sobrepor demais no grid
        zIndex: isExpanded ? 50 : 1
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
      aria-label={`Ver detalhes do produto ${product.name}`}
      className={`relative w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-colors outline-none focus:ring-2 focus:ring-white/50 ${!isExpanded ? 'cursor-pointer hover:bg-white/5' : ''}`}
    >
      <div className={`flex flex-col md:flex-row w-full ${!isExpanded ? 'pointer-events-none' : ''}`}>
        
        <figure className="w-full md:w-1/2 h-80 md:h-96 relative flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 m-0">
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
                src={images[currentImage]}
                custom={direction}
                variants={CAROUSEL_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={TRANSITION_SPRING}
                className="absolute w-full h-full object-contain rounded-2xl shadow-lg" // Mudei cover para contain para ver o produto inteiro
                alt={`${product.name} - Vista ${currentImage + 1}`}
              />
            </AnimatePresence>
          </div>

          <div className="absolute bottom-6 flex gap-2 z-10" role="tablist">
            {images.map((_, idx) => (
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

        <section className="w-full md:w-1/2 p-6 flex flex-col justify-between text-white">
          <header className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-semibold uppercase tracking-wider text-gray-300 w-fit"
            >
              <Tag size={12} />
              {product.brand}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
            >
              {product.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-light text-emerald-400"
            >
              {displayPrice}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-300 text-sm leading-relaxed line-clamp-3"
            >
              {product.description}
            </motion.p>
          </header>

          <footer className="flex flex-col gap-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBuyNow} 
              className="w-full py-3 px-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center gap-3 font-semibold text-white transition-all shadow-lg hover:shadow-white/10 group focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <CreditCard className="group-hover:text-emerald-300 transition-colors" size={20} />
              Comprar Agora
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart?.();
              }}
              className="w-full py-3 px-6 rounded-xl bg-black/40 backdrop-blur-md border border-white/5 flex items-center justify-center gap-3 font-semibold text-gray-300 transition-all shadow-lg group active:border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <ShoppingCart className="group-hover:text-blue-400 transition-colors" size={20} />
              Adicionar ao Carrinho
            </motion.button>
          </footer>
        </section>
      </div>
    </motion.article>
  );
};

// 4. Componente Principal que itera sobre a lista (Ajustado aqui!)
export default function ContainPage({ onAddToCart, products = [] }: ContainProps) {
  return (
    <section className="w-full max-w-7xl mx-auto p-4">
      {/* Grid para acomodar os cards (3 por fileira em telas grandes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product) => (
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