"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Utensils, X, Zap, Clock3, Dumbbell, User, Plus, Activity } from "lucide-react";

type DietFormData = {
  favoriteFoods: string;
  avoidFoods: string;
  objective: string;
  dietaryRestriction: string;
  dietaryAllergy: string;
  healthIssues: string;
  medications: string;
  freeMealDay: string;
  freeMealSlot: string;
};

type DietMeal = {
  time: string;
  title: string;
  foods: string;
  prep: string;
};

type GeneratedDietPlan = {
  objectiveLabel: string;
  notes: string[];
  meals: DietMeal[];
};

type WeeklyDietDay = {
  day: string;
  plan: GeneratedDietPlan | null;
};

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function DietPage() {
  const router = useRouter();
  const [showAIDietModal, setShowAIDietModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(new Date().getDay());
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyDietDay[]>(
    WEEK_DAYS.map((day) => ({ day, plan: null }))
  );
  const [formData, setFormData] = useState<DietFormData>({
    favoriteFoods: "",
    avoidFoods: "",
    objective: "",
    dietaryRestriction: "",
    dietaryAllergy: "",
    healthIssues: "",
    medications: "",
    freeMealDay: "",
    freeMealSlot: "",
  });

  const inputClass = useMemo(
    () => "w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950/70 text-white focus:border-orange-500 outline-none transition-all text-sm",
    []
  );
  const textareaClass = useMemo(() => `${inputClass} resize-none`, [inputClass]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const currentDayPlan = useMemo(() => weeklyPlans[activeDay]?.plan ?? null, [weeklyPlans, activeDay]);

  const handleGenerateDiet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective: formData.objective,
          favoriteFoods: formData.favoriteFoods,
          avoidFoods: formData.avoidFoods,
          dietaryRestriction: formData.dietaryRestriction,
          dietaryAllergy: formData.dietaryAllergy,
          healthIssues: formData.healthIssues,
          medications: formData.medications,
          freeMealDay: formData.freeMealDay,
          freeMealSlot: formData.freeMealSlot,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Não foi possível gerar dieta com IA.";
        try {
          const errorData = await response.json();
          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Mantém mensagem padrão se a resposta não for JSON válido.
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const generatedWeek = data?.week;
      if (!generatedWeek || typeof generatedWeek !== "object") {
        throw new Error("Resposta da IA inválida.");
      }

      setWeeklyPlans(
        WEEK_DAYS.map((day) => ({
          day,
          plan: generatedWeek[day] ?? null,
        }))
      );
      setActiveDay(1);
      setShowAIDietModal(false);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Não foi possível gerar o plano com IA agora. Tente novamente.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 relative overflow-hidden antialiased font-sans">
      <div className="fixed top-[-5%] right-[-5%] w-80 h-80 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-50 bg-zinc-950/40 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
            <Dumbbell className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black italic tracking-tighter text-white">WEGYM</span>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setShowAIDietModal(true)} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center space-x-2 cursor-pointer">
            <Plus size={14} className="text-orange-500" />
            <span className="text-[10px] font-black uppercase italic text-zinc-300">Dieta IA</span>
          </button>
          <Link href="/DietPage" className="bg-orange-600 border border-orange-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase italic text-white">
            Dieta
          </Link>
          <Link href="/TrainingPage" className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase italic text-zinc-300 hover:border-orange-500 transition-colors">
            Treinos
          </Link>
          <button onClick={() => router.push('/ProfilePage')} title="Ir para perfil" className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:border-orange-500 transition-colors cursor-pointer">
            <User size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8">
        <div className="flex space-x-3 overflow-x-auto pb-6 mb-8 no-scrollbar">
          {weeklyPlans.map((plan, index) => (
            <button
              key={plan.day}
              onClick={() => setActiveDay(index)}
              className={`shrink-0 px-6 py-3 rounded-2xl font-black text-xs uppercase italic border transition-all cursor-pointer hover:border-orange-500 ${activeDay === index ? "bg-orange-600 border-orange-400 text-white" : "bg-zinc-900/50 border-white/5 text-zinc-500"}`}
            >
              {plan.day}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <aside className="space-y-6">
            <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase italic text-zinc-400">Dieta do Dia</p>
                <Utensils className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-sm text-zinc-300">
                {currentDayPlan ? `Objetivo atual: ${currentDayPlan.objectiveLabel}` : "Ainda não existe um plano para este dia."}
              </p>
              <button
                onClick={() => setShowAIDietModal(true)}
                className="w-full px-6 py-4 bg-orange-600 rounded-2xl shadow-2xl shadow-orange-600/40 border border-orange-400/50 hover:bg-orange-700 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-white font-black uppercase italic text-sm">Gerar dieta com ia</span>
                  <Zap className="text-white w-5 h-5" />
                </div>
              </button>
            </div>

            {currentDayPlan && (
              <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 space-y-2">
                <p className="text-xs font-black uppercase italic text-zinc-400">Observações da IA</p>
                {currentDayPlan.notes.map((note, index) => (
                  <p key={index} className="text-xs text-zinc-300 leading-relaxed">- {note}</p>
                ))}
              </div>
            )}
          </aside>

          <section className="lg:col-span-2 space-y-4">
            <div className="bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden">
              <div className="p-5 border-b border-white/5 flex justify-between items-center">
                <h2 className="font-black italic uppercase text-white leading-tight">
                  {weeklyPlans[activeDay].day} - {currentDayPlan ? currentDayPlan.objectiveLabel : "Plano não gerado"}
                </h2>
                <Activity size={20} className="text-orange-500 opacity-30" />
              </div>
              <div className="divide-y divide-white/5">
                {currentDayPlan ? (
                  currentDayPlan.meals.map((meal, index) => (
                    <div key={index} className="p-5 space-y-3">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h3 className="text-sm font-black uppercase italic text-white tracking-wide">{meal.title}</h3>
                        <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2">
                          <Clock3 className="w-4 h-4 text-orange-400" />
                          <span className="text-xs font-bold text-orange-300">{meal.time}</span>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-200 leading-relaxed"><span className="text-zinc-400 font-semibold">Refeição:</span> {meal.foods}</p>
                      <p className="text-sm text-zinc-200 leading-relaxed"><span className="text-zinc-400 font-semibold">Modo de preparo:</span> {meal.prep}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-16 text-center text-zinc-600 font-black uppercase italic text-xs">
                    Sem dieta para este dia. Gere um plano com IA.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <AnimatePresence>
        {showAIDietModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              className="w-full max-w-2xl max-h-[90vh] bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-orange-600/5">
                <h2 className="text-base font-black uppercase italic text-white">Gerar Dieta com IA</h2>
                <button onClick={() => setShowAIDietModal(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleGenerateDiet} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 text-left text-[11px] font-black uppercase tracking-wide text-orange-400 pt-1">
                    Preferências alimentares
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-[11px] text-zinc-400 font-bold uppercase">
                      Alimentos que você gosta <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="favoriteFoods"
                      value={formData.favoriteFoods}
                      onChange={handleInputChange}
                      className={textareaClass}
                      rows={2}
                      placeholder="Ex: frango, arroz, ovos, batata-doce..."
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-1 text-[11px] text-zinc-400 font-bold uppercase">Alimentos que quer evitar</label>
                    <textarea
                      name="avoidFoods"
                      value={formData.avoidFoods}
                      onChange={handleInputChange}
                      className={textareaClass}
                      rows={2}
                      placeholder="Ex: frituras, lactose, açúcar..."
                    />
                  </div>

                  <div className="md:col-span-2 text-left text-[11px] font-black uppercase tracking-wide text-orange-400 pt-1">
                    Objetivo e restrições
                  </div>
                  <div>
                    <label className="block mb-1 text-[11px] text-zinc-400 font-bold uppercase">
                      Objetivo <span className="text-red-500">*</span>
                    </label>
                    <select name="objective" value={formData.objective} onChange={handleInputChange} className={inputClass} required>
                      <option value="" disabled>Selecione...</option>
                      <option value="emagrecimento">Emagrecimento</option>
                      <option value="hipertrofia">Hipertrofia</option>
                      <option value="manutencao">Manutenção</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px] text-zinc-400 font-bold uppercase">Restrição alimentar</label>
                    <input name="dietaryRestriction" value={formData.dietaryRestriction} onChange={handleInputChange} className={inputClass} placeholder="Ex: vegetariano" />
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px] text-zinc-400 font-bold uppercase">Alergias</label>
                    <input name="dietaryAllergy" value={formData.dietaryAllergy} onChange={handleInputChange} className={inputClass} placeholder="Ex: amendoim" />
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px] text-zinc-400 font-bold uppercase">Problemas de saúde</label>
                    <input name="healthIssues" value={formData.healthIssues} onChange={handleInputChange} className={inputClass} placeholder="Ex: hipertensão" />
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px] text-zinc-400 font-bold uppercase">Medicações em uso</label>
                    <input name="medications" value={formData.medications} onChange={handleInputChange} className={inputClass} placeholder="Ex: metformina" />
                  </div>

                  <div className="md:col-span-2 text-left text-[11px] font-black uppercase tracking-wide text-orange-400 pt-1">
                    Refeição livre (opcional)
                  </div>
                  <div>
                    <label className="block mb-1 text-[11px] text-zinc-400 font-bold uppercase">Dia da refeição livre</label>
                    <select name="freeMealDay" value={formData.freeMealDay} onChange={handleInputChange} className={inputClass}>
                      <option value="">Nenhum</option>
                      {WEEK_DAYS.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-[11px] text-zinc-400 font-bold uppercase">Refeição/horário livre</label>
                    <select name="freeMealSlot" value={formData.freeMealSlot} onChange={handleInputChange} className={inputClass}>
                      <option value="">Nenhum</option>
                      <option value="Café da manhã">Café da manhã (07:00)</option>
                      <option value="Lanche da manhã">Lanche da manhã (10:00)</option>
                      <option value="Almoço">Almoço (13:00)</option>
                      <option value="Lanche da tarde">Lanche da tarde (16:30)</option>
                      <option value="Jantar">Jantar (20:00)</option>
                      <option value="Ceia">Ceia (22:30)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 rounded-xl bg-white text-black font-black uppercase italic text-xs hover:bg-orange-500 hover:text-white transition-colors disabled:bg-zinc-700 disabled:text-zinc-400 cursor-pointer"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Gerar plano de dieta"}
                    </button>
                  </div>
                </form>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
