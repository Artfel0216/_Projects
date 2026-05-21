// src/components/LeftPanel.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell } from 'lucide-react';

export const LeftPanel = React.memo(() => (
  <div className="hidden md:flex md:w-1/3 bg-zinc-900 p-12 flex-col justify-between relative overflow-hidden">
    {/* Grid de Pontos de Fundo */}
    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,#fff_1px,transparent_1px)] bg-size-[30px_30px]" />
    
    <div className="relative z-10">
      {/* Logo Area */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="flex items-center space-x-2 mb-8"
      >
        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center rotate-3">
          <Dumbbell className="text-white w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tighter italic">WEGYM</h1>
      </motion.div>
      
      {/* Conteúdo Principal */}
      <h2 className="text-5xl font-black text-white mb-6 leading-none uppercase italic">
        Supere seus <br />
        <span className="text-orange-500 underline decoration-zinc-700">Limites</span>.
      </h2>
      <p className="text-zinc-400 text-lg leading-relaxed">
        Sua jornada para a melhor versão de si mesmo começa aqui.
      </p>
    </div>
  </div>
));

LeftPanel.displayName = 'LeftPanel';