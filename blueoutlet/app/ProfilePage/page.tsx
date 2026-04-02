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
  Camera, User, Loader2, MapPin, BadgeCheck, Phone, Mail
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(3, "Mínimo de 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(14, "Telefone incompleto"),
  role: z.string().optional(),
  bio: z.string().max(160, "Máximo de 160 caracteres").optional(),
  zip: z.string().min(9, "CEP incompleto"),
  street: z.string().min(1, "Rua obrigatória"),
  number: z.string().min(1, "Número obrigatório"),
  city: z.string().min(1, "Cidade obrigatória"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const maskCEP = (value: string) =>
  value.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").substring(0, 9);

const maskPhone = (value: string) =>
  value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .substring(0, 15);

const InputField = ({ label, error, icon: Icon, ...props }: any) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-sm font-medium text-white/70 ml-1">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
          <Icon size={18} />
        </div>
      )}
      <input
        className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed ${Icon ? 'pl-10' : ''}`}
        {...props}
      />
    </div>
    {error && <span className="text-xs text-red-400 ml-1">{error.message}</span>}
  </div>
);

export default function ProfilePage() {
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState<'personal' | 'address'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "", email: "", phone: "", zip: "", street: "", number: "", city: "", role: "", bio: ""
    }
  });

  useEffect(() => {
    if (session?.user) {
      reset({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: "", zip: "", street: "", number: "", city: "", role: "Cliente", bio: ""
      });
    }
  }, [session, reset]);

  const zipValue = watch("zip");

  useEffect(() => {
    const cep = zipValue?.replace(/\D/g, "");

    if (cep?.length === 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
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

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const result = await updateProfile(data);
      if (result?.success) {
        setIsEditing(false);
        alert("Perfil salvo com sucesso!");
      } else {
        alert(result?.error || "Erro ao salvar o perfil.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-purple-500 w-10 h-10" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white/70">
        Você precisa estar logado para acessar esta página.
      </div>
    );
  }

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 relative overflow-hidden font-sans">
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <motion.main
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto py-12 relative z-10"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          <div className="bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative group">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-white/5 border-4 border-white/10 shadow-lg">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="Avatar"
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white/30">
                    <User size={48} />
                  </div>
                )}
                
                <AnimatePresence>
                  {isEditing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer transition-colors hover:bg-black/60"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="text-white/80 w-8 h-8" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-3xl font-bold tracking-tight">
                  {watch("name") || session.user?.name || "Usuário"}
                </h1>
                <BadgeCheck className="text-purple-400 w-6 h-6" />
              </div>
              <p className="text-white/50 text-sm mb-4">
                {watch("role") || "Membro"} • {watch("email") || session.user?.email}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        reset();
                      }}
                      className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2 text-sm font-medium disabled:opacity-70"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Salvar Alterações
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-black hover:bg-gray-200 px-6 py-2 rounded-full transition-colors text-sm font-medium shadow-lg shadow-white/10"
                  >
                    Editar Perfil
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/2 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl flex gap-2 max-w-fit mx-auto md:mx-0">
            {(['personal', 'address'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab ? "text-white" : "text-white/50 hover:text-white/80"
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-white/10 border border-white/5 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {tab === 'personal' ? 'Dados Pessoais' : 'Endereço'}
              </button>
            ))}
          </div>

          <div className="bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 min-h-80">
            <AnimatePresence mode="wait">
              
              {activeTab === "personal" && (
                <motion.div
                  key="personal"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <InputField 
                    label="Nome Completo"
                    icon={User}
                    {...register("name")} 
                    disabled={!isEditing} 
                    error={errors.name}
                  />
                  <InputField 
                    label="E-mail"
                    icon={Mail}
                    {...register("email")} 
                    disabled={true}
                    error={errors.email}
                  />
                  <InputField 
                    label="Telefone"
                    icon={Phone}
                    {...register("phone")} 
                    disabled={!isEditing}
                    error={errors.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue("phone", maskPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                  />
                  <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-white/70 ml-1">Biografia</label>
                    <textarea
                      {...register("bio")}
                      disabled={!isEditing}
                      placeholder="Fale um pouco sobre você..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 resize-none h-24"
                    />
                    {errors.bio && <span className="text-xs text-red-400 ml-1">{errors.bio.message}</span>}
                  </div>
                </motion.div>
              )}

              {activeTab === "address" && (
                <motion.div
                  key="address"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="grid grid-cols-1 md:grid-cols-12 gap-6"
                >
                  <div className="col-span-1 md:col-span-4">
                    <InputField 
                      label="CEP"
                      icon={MapPin}
                      {...register("zip")} 
                      disabled={!isEditing}
                      error={errors.zip}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue("zip", maskCEP(e.target.value))}
                      placeholder="00000-000"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-8">
                    <InputField 
                      label="Logradouro / Rua"
                      {...register("street")} 
                      disabled={!isEditing}
                      error={errors.street}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-4">
                    <InputField 
                      label="Número"
                      {...register("number")} 
                      disabled={!isEditing}
                      error={errors.number}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-8">
                    <InputField 
                      label="Cidade"
                      {...register("city")} 
                      disabled={!isEditing || true}
                      error={errors.city}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </form>
      </motion.main>
    </div>
  );
}