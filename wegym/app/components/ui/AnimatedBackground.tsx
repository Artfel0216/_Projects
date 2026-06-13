// src/components/ui/AnimatedBackground.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedBackground = React.memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <motion.div
      animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.1, 0.2, 0.1] }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-10%] right-[-5%] w-[125vw] md:w-125 h-[125vw] md:h-125 bg-orange-600 rounded-full filter blur-[120px]"
    />
    
    <motion.div
      animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], opacity: [0.05, 0.15, 0.05] }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-[-10%] left-[-5%] w-[150vw] md:w-150 h-[150vw] md:h-150 bg-zinc-700 rounded-full filter blur-[100px]"
    />
  </div>
));

AnimatedBackground.displayName = 'AnimatedBackground';