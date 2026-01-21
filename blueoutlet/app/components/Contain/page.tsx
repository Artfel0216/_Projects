import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, CreditCard, ChevronLeft, ChevronRight, Tag } from 'lucide-react';

export default function ContainPage() {
    // Estado para controlar se o card está expandido ou pequeno
    const [isExpanded, setIsExpanded] = useState(false);

    const product = {
        title: "Sony WH-1000XM5",
        brand: "Sony",
        price: "R$ 2.499,00",
        images: [
            "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1000&auto=format&fit=crop"
        ]
    };

    const [currentImage, setCurrentImage] = useState(0);
    const [direction, setDirection] = useState(0);

    const paginate = (newDirection) => {
        setDirection(newDirection);
        setCurrentImage((prev) => {
            let nextIndex = prev + newDirection;
            if (nextIndex < 0) nextIndex = product.images.length - 1;
            if (nextIndex >= product.images.length) nextIndex = 0;
            return nextIndex;
        });
    };

    const variants = {
        enter: (direction) => ({
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
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0,
            scale: 0.8
        })
    };

    return (
        // Alteração aqui: Removido min-h-screen e o bg-gradient
        <div className="w-full flex items-center justify-center p-4">
            <motion.div 
                // Toggle do estado ao clicar no card
                onClick={() => setIsExpanded(!isExpanded)}
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
                // FIX: Substituí bg-white/10 por style={{ backgroundColor }} para evitar erro de oklab
                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                className={`relative w-full max-w-4xl backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-colors ${!isExpanded ? 'cursor-pointer hover:bg-white/5' : ''}`}
            >
                {/* Bloqueia cliques internos quando está pequeno */}
                <div className={`flex flex-col md:flex-row w-full ${!isExpanded ? 'pointer-events-none' : ''}`}>
                    <div className="w-full md:w-1/2 h-[400px] md:h-[500px] relative flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
                        <button 
                            onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                            className="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-110"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
                            <AnimatePresence initial={false} custom={direction}>
                                <motion.img
                                    key={currentImage}
                                    src={product.images[currentImage]}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        x: { type: "spring", stiffness: 300, damping: 30 },
                                        opacity: { duration: 0.2 }
                                    }}
                                    className="absolute w-full h-full object-cover rounded-2xl shadow-lg"
                                    alt="Product"
                                />
                            </AnimatePresence>
                        </div>

                        <button 
                            onClick={(e) => { e.stopPropagation(); paginate(1); }}
                            className="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-110"
                        >
                            <ChevronRight size={24} />
                        </button>
                        
                        <div className="absolute bottom-6 flex gap-2 z-10">
                            {product.images.map((_, idx) => (
                                <div 
                                    key={idx} 
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentImage ? 'bg-white w-6' : 'bg-white/40'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 p-8 flex flex-col justify-between text-white">
                        <div className="space-y-4">
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
                                className="text-4xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
                            >
                                {product.title}
                            </motion.h1>

                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-3xl font-light text-emerald-400"
                            >
                                {product.price}
                            </motion.div>

                            <motion.p 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                transition={{ delay: 0.5 }}
                                className="text-gray-300 text-sm leading-relaxed"
                            >
                                Experimente a melhor qualidade de som com cancelamento de ruído líder da indústria. Design leve, conforto luxuoso e bateria de longa duração.
                            </motion.p>
                        </div>

                        <div className="flex flex-col gap-3 mt-8">
                            <motion.button
                                // FIX: Cores explícitas em RGBA para evitar conflito com animação
                                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                                whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full py-4 px-6 rounded-xl backdrop-blur-md border border-white/20 flex items-center justify-center gap-3 font-semibold text-white transition-all shadow-lg hover:shadow-white/10 group"
                            >
                                <CreditCard className="group-hover:text-emerald-300 transition-colors" />
                                Comprar Agora
                            </motion.button>

                            <motion.button
                                // FIX: Cores explícitas em RGBA
                                style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
                                whileHover={{ scale: 1.02, backgroundColor: "rgba(0, 0, 0, 0.6)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full py-4 px-6 rounded-xl backdrop-blur-md border border-white/5 flex items-center justify-center gap-3 font-semibold text-gray-300 transition-all shadow-lg group"
                            >
                                <ShoppingCart className="group-hover:text-blue-400 transition-colors" />
                                Adicionar ao Carrinho
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}