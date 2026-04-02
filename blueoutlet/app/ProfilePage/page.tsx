'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateProfile } from '../actions/profile';
import { useSession } from "next-auth/react";
import Image from "next/image";
import { 
  Camera, User, Loader2, MapPin, BadgeCheck, Phone, Mail, 
  ChevronRight, Save, X, Info
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(14, "Telefone inválido"),
  role: z.enum(["USER", "ADMIN"]).optional(),
  bio: z.string().max(160, "Bio muito longa").optional(),
  zip: z.string().min(9, "CEP incompleto"),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const maskCEP = (v: string) => v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").substring(0, 9);
const maskPhone = (v: string) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").substring(0, 15);

const InputField = React.memo(({ label, error, icon: Icon, className, ...props }: any) => (
  <div className={`flex flex-col gap-2 w-full group ${className}`}>
    <div className="flex justify-between items-center px-1">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 group-focus-within:text-purple-400 transition-colors">
        {label}
      </label>
      <AnimatePresence>
        {error && (
          <motion.span initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[10px] font-bold text-red-400 uppercase">
            {error.message}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
    <div className="relative">
      {Icon && <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-400 transition-colors" />}
      <input
        className={`w-full bg-white/3 border rounded-2xl py-4 text-sm font-medium transition-all duration-500 outline-none
          ${Icon ? 'pl-12 pr-4' : 'px-5'}
          ${error ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:bg-white/6 focus:ring-4 focus:ring-purple-500/5'}
          disabled:opacity-40 disabled:cursor-not-allowed text-white placeholder-white/10`}
        {...props}
      />
    </div>
  </div>
));
InputField.displayName = "InputField";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'personal' | 'address'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange"
  });

  const loadUserData = useCallback(() => {
    if (session?.user) {
      const userRole = (session.user as { role?: string }).role === "ADMIN" ? "ADMIN" : "USER";
      reset({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: "",
        zip: "",
        street: "",
        number: "",
        city: "",
        role: userRole,
        bio: ""
      });
    }
  }, [session, reset]);

  useEffect(() => { loadUserData(); }, [loadUserData]);

  const zipValue = watch("zip");
  useEffect(() => {
    const cleanZip = zipValue?.replace(/\D/g, "");
    if (cleanZip?.length === 8) {
      const controller = new AbortController();
      fetch(`https://viacep.com.br/ws/${cleanZip}/json/`, { signal: controller.signal })
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setValue("street", data.logradouro, { shouldValidate: true });
            setValue("city", data.localidade, { shouldValidate: true });
          }
        }).catch(() => {});
      return () => controller.abort();
    }
  }, [zipValue, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    const result = await updateProfile(data);
    if (result?.success) {
      setIsEditing(false);
    }
  };

  if (status === "loading") return (
    <div className="h-screen flex flex-col gap-4 items-center justify-center bg-[#050505]">
      <Loader2 className="animate-spin text-purple-500 w-8 h-8" strokeWidth={3} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Sincronizando Dados</span>
    </div>
  );

  if (!session) return <div className="h-screen flex items-center justify-center bg-black text-white/20 font-black uppercase tracking-widest">Acesso Negado</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden selection:bg-purple-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 blur-[140px] rounded-full" />
      </div>

      <motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto py-12 relative z-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="bg-white/2 border border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-10">
            <div className="relative">
              <div className="relative w-40 h-40 rounded-[2.5rem] overflow-hidden bg-white/5 border-2 border-white/10 group shadow-2xl">
                {session.user?.image ? (
                  <Image src={session.user.image} alt="Avatar" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="flex items-center justify-center h-full text-white/10"><User size={64} /></div>
                )}
                <AnimatePresence>
                  {isEditing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                      className="absolute inset-0 bg-purple-600/60 backdrop-blur-sm flex items-center justify-center cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}>
                      <Camera className="text-white w-10 h-10" strokeWidth={2.5} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
            </div>

            <div className="text-center md:text-left flex-1 space-y-6">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-4xl font-black tracking-tighter italic uppercase">{watch("name") || "Usuário"}</h1>
                  <BadgeCheck className="text-purple-400 w-7 h-7" fill="currentColor" />
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
                  <span>{watch("role")}</span>
                  <span className="w-1 h-1 bg-white/20 rounded-full" />
                  <span>ID: {(session.user as { id?: string })?.id?.slice(-8) || '---'}</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {isEditing ? (
                  <>
                    <button type="button" onClick={() => { setIsEditing(false); reset(); }} className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Cancelar</button>
                    <button type="submit" disabled={isSubmitting || !isDirty} className="px-8 py-4 rounded-2xl bg-purple-600 text-black font-black text-[10px] uppercase tracking-widest hover:bg-purple-400 transition-all flex items-center gap-2 shadow-[0_10px_30px_rgba(147,51,234,0.3)] disabled:opacity-50">
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} strokeWidth={3} />}
                      Salvar Dados
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => setIsEditing(true)} className="px-10 py-4 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-purple-400 transition-all shadow-xl">Editar Perfil</button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <aside className="md:col-span-4 space-y-2">
              {(['personal', 'address'] as const).map((tab) => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                  className={`w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all border font-black text-[10px] uppercase tracking-[0.2em]
                    ${activeTab === tab ? "bg-white/5 border-purple-500/30 text-white" : "bg-transparent border-transparent text-white/30 hover:text-white/60"}`}>
                  {tab === 'personal' ? 'Dados Pessoais' : 'Endereço Entrega'}
                  <ChevronRight size={16} className={`transition-transform ${activeTab === tab ? 'translate-x-1 text-purple-500' : 'opacity-0'}`} />
                </button>
              ))}
              <div className="mt-8 p-6 rounded-4xl bg-purple-500/5 border border-purple-500/10">
                <div className="flex items-center gap-3 text-purple-400 mb-3">
                  <Info size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Segurança</span>
                </div>
                <p className="text-[11px] text-white/30 leading-relaxed font-medium">Seus dados são protegidos por criptografia de ponta a ponta e nunca são compartilhados.</p>
              </div>
            </aside>

            <div className="md:col-span-8 bg-white/2 border border-white/10 rounded-[2.5rem] p-8 md:p-10">
              <AnimatePresence mode="wait">
                {activeTab === "personal" ? (
                  <motion.div key="personal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <InputField label="Nome Completo" icon={User} {...register("name")} disabled={!isEditing} error={errors.name} />
                    <InputField label="E-mail Principal" icon={Mail} {...register("email")} disabled={true} error={errors.email} className="opacity-60" />
                    <InputField label="Telefone de Contato" icon={Phone} {...register("phone")} disabled={!isEditing} error={errors.phone} 
                      onChange={(e: any) => setValue("phone", maskPhone(e.target.value), { shouldValidate: true })} placeholder="(00) 00000-0000" />
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Bio / Descrição</label>
                      <textarea {...register("bio")} disabled={!isEditing} placeholder="Conte um pouco sobre sua trajetória..."
                        className="w-full bg-white/3 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-white transition-all outline-none focus:border-purple-500/50 focus:bg-white/6 disabled:opacity-40 resize-none h-32" />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="CEP" icon={MapPin} {...register("zip")} disabled={!isEditing} error={errors.zip}
                      onChange={(e: any) => setValue("zip", maskCEP(e.target.value), { shouldValidate: true })} placeholder="00000-000" className="md:col-span-1" />
                    <InputField label="Cidade" {...register("city")} disabled={true} error={errors.city} className="opacity-60" />
                    <InputField label="Logradouro" {...register("street")} disabled={!isEditing} error={errors.street} className="md:col-span-2" />
                    <InputField label="Número" {...register("number")} disabled={!isEditing} error={errors.number} placeholder="Ex: 123" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </form>
      </motion.main>
    </div>
  );
}