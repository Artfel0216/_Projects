'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateProfile } from '../actions/profile';
import { useSession } from "next-auth/react";
import Image from "next/image";
import { 
  Camera, User, Mail, Phone, MapPin, Save, 
  Package, CreditCard, Edit3, Loader2, LucideIcon 
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(3, "Mínimo de 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(14, "Telefone incompleto"),
  role: z.string().optional(),
  bio: z.string().max(160, "Máximo 160 caracteres").optional(),
  zip: z.string().min(9, "CEP incompleto"),
  street: z.string().min(1, "Rua obrigatória"),
  number: z.string().min(1, "Nº obrigatório"),
  city: z.string().min(1, "Cidade obrigatória"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const maskCEP = (value: string) => {
  return value.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").substring(0, 9);
};

const maskPhone = (value: string) => {
  return value.replace(/\D/g, "").replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").substring(0, 15);
};

const InputField = React.forwardRef(({ label, icon: Icon, error, disabled, ...props }: any, ref: any) => (
  <div className="group space-y-2 w-full">
    <div className="flex justify-between items-center ml-1">
      <label className="text-xs font-medium text-white/40 uppercase tracking-wider">{label}</label>
      {error && <span className="text-[10px] text-red-400 font-medium animate-pulse">{error.message}</span>}
    </div>
    <div className="relative">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${error ? 'text-red-400' : 'text-white/30 group-focus-within:text-white'}`}>
        <Icon size={18} />
      </div>
      <input
        {...props}
        ref={ref}
        disabled={disabled}
        className={`w-full bg-white/3 border rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-white/20 transition-all duration-300 focus:outline-none 
          ${disabled ? "border-transparent opacity-60 cursor-not-allowed" : 
            error ? "border-red-500/50 bg-red-500/5" : "border-white/8 hover:border-white/20 focus:border-white/30 focus:bg-white/5"}`}
      />
    </div>
  </div>
));
InputField.displayName = "InputField";

const TabButton = ({ active, label, onClick, icon: Icon }: { active: boolean; label: string; onClick: () => void; icon: LucideIcon }) => (
  <button 
    type="button"
    onClick={onClick}
    className={`relative px-6 py-4 flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${active ? "text-white" : "text-white/40 hover:text-white/70"}`}
  >
    <Icon size={16} />
    <span className="hidden md:inline">{label}</span>
    {active && (
      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
    )}
  </button>
);

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'personal' | 'address' | 'orders'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      zip: "",
      street: "",
      number: "",
      city: "",
      role: "",
      bio: ""
    }
  });

  useEffect(() => {
    if (session?.user) {
      reset({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: "",
        zip: "",
        street: "",
        number: "",
        city: "",
        role: "Cliente",
        bio: ""
      });
    }
  }, [session, reset]);

  const zipValue = watch("zip");

  useEffect(() => {
    const cepNumbers = zipValue?.replace(/\D/g, "");
    if (cepNumbers?.length === 8) {
      fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setValue("street", data.logradouro);
            setValue("city", data.localidade);
          }
        })
        .catch(console.error);
    }
  }, [zipValue, setValue]);

  const onSubmit = async(data: ProfileFormData) => {
    try {

      const result = await updateProfile(data);

      if(result?.success) {
        setIsEditing(false);
        alert("Perfil Salvo com sucesso!");
      } else {
        alert(result?.error);
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (status === "loading") {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#050505]">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black relative overflow-x-hidden p-4">
      <div className="fixed top-[-20%] left-[-10%] w-[150%] h-[150%] bg-white/2 rounded-full blur-[120px] pointer-events-none" />

      <motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-5xl mx-auto py-12 md:py-20">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white/2 border border-white/8 backdrop-blur-2xl rounded-3xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full p-1 border border-white/10 bg-black overflow-hidden shadow-2xl relative">
                  {session?.user?.image ? (
                    <Image src={session.user.image} alt="Avatar" fill className="object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center rounded-full text-white/20">
                      <User size={40} />
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-white text-black rounded-full shadow-lg hover:scale-110 transition-transform z-20">
                  <Camera size={16} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">{watch("name") || "Usuário"}</h1>
                    <p className="text-white/50 flex items-center justify-center md:justify-start gap-2 mt-1"><Mail size={14} /> {watch("email")}</p>
                  </div>
                  <button 
                    type={isEditing ? "submit" : "button"}
                    onClick={() => !isEditing && setIsEditing(true)}
                    disabled={isSubmitting}
                    className={`px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all ${isEditing ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : isEditing ? <Save size={16} /> : <Edit3 size={16} />}
                    {isEditing ? "Salvar Alterações" : "Editar Perfil"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <nav className="lg:w-64">
              <div className="bg-white/2 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl flex lg:flex-col">
                <TabButton active={activeTab === 'personal'} label="Dados Pessoais" icon={User} onClick={() => setActiveTab('personal')} />
                <TabButton active={activeTab === 'address'} label="Endereço" icon={MapPin} onClick={() => setActiveTab('address')} />
                <TabButton active={activeTab === 'orders'} label="Pedidos" icon={Package} onClick={() => setActiveTab('orders')} />
              </div>
            </nav>

            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                  className="bg-white/2 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm min-h-100"
                >
                  {activeTab === 'personal' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField label="Nome Completo" icon={User} disabled={!isEditing} error={errors.name} {...register("name")} />
                      <InputField label="Cargo / Tipo" icon={CreditCard} disabled={!isEditing} error={errors.role} {...register("role")} />
                      <InputField label="E-mail" icon={Mail} disabled={true} error={errors.email} {...register("email")} />
                      <InputField label="Telefone" icon={Phone} disabled={!isEditing} error={errors.phone} {...register("phone", { onChange: (e) => setValue("phone", maskPhone(e.target.value)) })} />
                      <div className="md:col-span-2">
                        <InputField label="Bio" icon={Edit3} disabled={!isEditing} error={errors.bio} {...register("bio")} />
                      </div>
                    </div>
                  )}

                  {activeTab === 'address' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <InputField label="CEP" icon={MapPin} disabled={!isEditing} error={errors.zip} {...register("zip", { onChange: (e) => setValue("zip", maskCEP(e.target.value)) })} />
                      </div>
                      <div className="md:col-span-2">
                        <InputField label="Rua / Avenida" icon={MapPin} disabled={!isEditing} error={errors.street} {...register("street")} />
                      </div>
                      <InputField label="Número" icon={MapPin} disabled={!isEditing} error={errors.number} {...register("number")} />
                      <InputField label="Cidade" icon={MapPin} disabled={true} error={errors.city} {...register("city")} />
                    </div>
                  )}

                  {activeTab === 'orders' && (
                    <div className="flex flex-col items-center justify-center py-20 text-white/20">
                      <Package size={48} className="mb-4 opacity-20" />
                      <p>Nenhum pedido encontrado.</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </form>
      </motion.main>
    </div>
  );
}