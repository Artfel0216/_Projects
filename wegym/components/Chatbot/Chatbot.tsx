"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Dumbbell, Sparkles, Trophy, ChevronRight, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from '@/lib/i18n/hook';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  load: string;
}

export default function Chatbot() {
  const { t } = useTranslations();
  const [message, setMessage] = useState("");
  const [level, setLevel] = useState("Iniciante");
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<{ goal: string; exercises: Exercise[] } | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleSend = async () => {
    if (!message.trim()) return;

    setLoading(true);
    const userMsg = message;
    setMessage("");
    setChatHistory((prev) => [...prev, { role: "user", text: userMsg }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, level }),
      });

      const data = await res.json();
      setChatHistory((prev) => [...prev, { role: "ai", text: data.text }]);
      
      if (data.workoutGenerated) {
        setWorkout(data.workoutData);
      }
    } catch (error) {
      console.error("Erro ao chamar API", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-175 w-full max-w-2xl mx-auto bg-[#0f0f0f] border border-orange-500/20 rounded-3xl shadow-2xl overflow-hidden font-sans">
      
      {/* Header Moderno */}
      <div className="bg-linear-to-r from-black via-[#1a1a1a] to-black p-5 border-b border-orange-500/30 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-lg shadow-[0_0_15px_rgba(249,115,22,0.4)]">
            <Dumbbell size={22} className="text-black" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg tracking-tight">{t('chatbot.title')}</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">{t('chatbot.systemActive')}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <select 
            className="bg-[#222] text-orange-500 text-xs font-bold rounded-full px-4 py-2 outline-none border border-orange-500/20 appearance-none cursor-pointer hover:bg-orange-500 hover:text-black transition-all"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="Iniciante">{t('chatbot.beginner')}</option>
            <option value="Intermediário">{t('chatbot.intermediate')}</option>
            <option value="Avançado">{t('chatbot.advanced')}</option>
          </select>
        </div>
      </div>

      {/* Área de Chat */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar">
        <AnimatePresence>
          {chatHistory.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10"
            >
              <Sparkles className="mx-auto text-orange-500 mb-4" size={40} />
              <h3 className="text-white font-semibold italic text-xl">{t('chatbot.emptyTitle')}</h3>
              <p className="text-gray-500 text-sm mt-2">{t('chatbot.emptyDescription')}</p>
            </motion.div>
          )}

          {chatHistory.map((chat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: chat.role === "user" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                chat.role === "user" 
                  ? "bg-orange-500 text-black font-bold rounded-tr-none shadow-[0_4px_15px_rgba(249,115,22,0.2)]" 
                  : "bg-[#1a1a1a] text-gray-200 border border-white/5 rounded-tl-none shadow-xl"
              }`}>
                {chat.text}
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-[#1a1a1a] p-4 rounded-2xl rounded-tl-none border border-white/5 flex gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </motion.div>
          )}

          {/* Card de Treino Ultra Moderno */}
          {workout && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-linear-to-br from-orange-500/20 to-transparent pointer-events-none" />
              <div className="bg-[#1a1a1a] border border-orange-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Trophy className="text-orange-500" size={24} />
                    <h3 className="font-black text-white italic text-xl tracking-tighter uppercase">{workout.goal}</h3>
                  </div>
                  <Activity className="text-orange-500/50 animate-pulse" />
                </div>
                
                <div className="grid gap-3">
                  {workout.exercises.map((ex, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ x: 5, backgroundColor: "#252525" }}
                      className="bg-[#222]/50 p-4 rounded-xl border border-white/5 flex justify-between items-center transition-colors group"
                    >
                      <div>
                        <p className="text-orange-500 font-bold text-sm uppercase tracking-wide">{ex.name}</p>
                        <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase">{t('chatbot.load')} {ex.load}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-black text-lg">{ex.sets}<span className="text-orange-500 text-xs mx-1 font-normal uppercase">{t('chatbot.times')}</span>{ex.reps}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input de Mensagem */}
      <div className="p-6 bg-black border-t border-orange-500/20">
        <div className="relative flex items-center gap-3 bg-[#1a1a1a] p-2 rounded-2xl border border-white/10 focus-within:border-orange-500/50 transition-all">
          <input
            type="text"
            className="flex-1 bg-transparent text-white text-sm px-4 py-2 outline-none placeholder:text-gray-600"
            placeholder={t('chatbot.inputPlaceholder')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            className="bg-orange-500 text-black p-3 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-orange-500/50 transition-all"
          >
            <Send size={18} strokeWidth={3} />
          </motion.button>
        </div>
        <p className="text-[9px] text-gray-600 mt-3 text-center uppercase tracking-[0.2em]">{t('chatbot.footer')}</p>
      </div>

    </div>
  );
}