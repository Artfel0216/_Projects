'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  MapPin, Navigation, Home, Hash, Building2,
  Map as MapIcon, ArrowRight, Loader2, CheckCircle2 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const addressSchema = z.object({
  cep: z.string().transform(v => v.replace(/\D/g, "")).pipe(z.string().length(8, "CEP deve ter 8 dígitos")),
  street: z.string().min(3, "Rua é obrigatória"),
  number: z.string().min(1, "Nº obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().length(2, "UF inválida").transform(v => v.toUpperCase()),
});

type AddressFormData = z.infer<typeof addressSchema>;

const maskCEP = (value: string) => {
  return value.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").substring(0, 9);
};

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ElementType;
  error?: { message?: string };
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, icon: Icon, error, className, ...props }, ref) => (
    <div className="space-y-2 w-full group">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
          {label}
        </label>
        <AnimatePresence mode="wait">
          {error?.message && (
            <motion.span 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -5 }} 
              className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider"
            >
              {error.message}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="relative">
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 z-10
          ${error ? 'text-emerald-500' : 'text-white/20 group-focus-within:text-emerald-400'}`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <input
          {...props}
          ref={ref}
          className={`w-full bg-white/3 border rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/10 outline-none transition-all duration-500
            ${error ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-white/20 focus:border-emerald-500/30 focus:bg-white/6 focus:ring-4 focus:ring-emerald-500/5'} 
            ${className}`}
        />
      </div>
    </div>
  )
);
InputField.displayName = "InputField";

export default function PageAddress() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    setFocus,
    formState: { errors, isSubmitting } 
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    mode: "onBlur"
  });

  const cepValue = watch("cep");

  const handleCEPChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCEP(e.target.value);
    setValue("cep", masked, { shouldValidate: true });
  }, [setValue]);

  useEffect(() => {
    const cleanCEP = cepValue?.replace(/\D/g, "");
    if (cleanCEP?.length === 8) {
      const fetchAddress = async () => {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
          const data = await res.json();
          if (!data.erro) {
            setValue("street", data.logradouro, { shouldValidate: true });
            setValue("neighborhood", data.bairro, { shouldValidate: true });
            setValue("city", data.localidade, { shouldValidate: true });
            setValue("state", data.uf, { shouldValidate: true });
            setFocus("number");
          }
        } catch (error) {
          console.error("Erro ao buscar CEP", error);
        }
      };
      fetchAddress();
    }
  }, [cepValue, setValue, setFocus]);

  const onSubmit = async (data: AddressFormData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep(2);
      setTimeout(() => router.push('/MenProductPage'), 2500);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="bg-white/2 border border-white/10 backdrop-blur-3xl rounded-[3rem] p-8 md:p-14 shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="form" 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
              >
                <header className="mb-12">
                  <motion.div 
                    initial={{ rotate: -10, scale: 0.9 }}
                    animate={{ rotate: 0, scale: 1 }}
                    className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-8"
                  >
                    <Navigation size={28} strokeWidth={2.5} />
                  </motion.div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 italic">LOGÍSTICA PRECISÃO.</h1>
                  <p className="text-white/40 leading-relaxed max-w-md font-medium">
                    Insira o destino para ativarmos o envio priorizado e os cálculos de entrega em tempo real.
                  </p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                    <div className="md:col-span-4">
                      <InputField 
                        label="CEP" 
                        icon={MapPin} 
                        error={errors.cep} 
                        {...register("cep")} 
                        onChange={handleCEPChange}
                        placeholder="00000-000" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <InputField 
                        label="UF" 
                        icon={MapIcon} 
                        error={errors.state} 
                        {...register("state")} 
                        placeholder="SP" 
                        maxLength={2} 
                      />
                    </div>
                    
                    <div className="md:col-span-6">
                      <InputField 
                        label="Logradouro" 
                        icon={Home} 
                        error={errors.street} 
                        {...register("street")} 
                        placeholder="Rua, Avenida ou Alameda" 
                      />
                    </div>

                    <div className="md:col-span-2">
                      <InputField 
                        label="Número" 
                        icon={Hash} 
                        error={errors.number} 
                        {...register("number")} 
                        placeholder="100" 
                      />
                    </div>
                    <div className="md:col-span-4">
                      <InputField 
                        label="Bairro" 
                        icon={Navigation} 
                        error={errors.neighborhood} 
                        {...register("neighborhood")} 
                        placeholder="Ex: Jardins" 
                      />
                    </div>
                    
                    <div className="md:col-span-6">
                      <InputField 
                        label="Cidade" 
                        icon={Building2} 
                        error={errors.city} 
                        {...register("city")} 
                        placeholder="Sua cidade" 
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(52, 211, 153, 1)" }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full mt-10 bg-white text-black py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all group shadow-2xl disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <> Confirmar Destino <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" strokeWidth={3} /> </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="success" 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="py-24 flex flex-col items-center text-center"
              >
                <div className="relative mb-10">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-emerald-500/40 rounded-full"
                  />
                  <div className="relative w-28 h-28 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400">
                    <CheckCircle2 size={56} strokeWidth={1.5} />
                  </div>
                </div>
                <h2 className="text-4xl font-black italic tracking-tighter mb-4">MAPA DEFINIDO.</h2>
                <p className="text-white/40 font-medium leading-relaxed">
                  Conexão segura estabelecida. <br/>
                  Sincronizando catálogo disponível para sua região...
                </p>
                <div className="mt-12 flex gap-2">
                  {[0, 1, 2].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                      className="w-2 h-2 bg-emerald-500 rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.footer 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.5 }}
          className="text-center mt-12 space-y-2"
        >
          <p className="text-white/20 text-[10px] font-black tracking-[0.4em] uppercase">
            Freitas Outlet Security Protocol © 2026
          </p>
          <div className="flex justify-center gap-6 text-[9px] text-white/10 font-bold uppercase tracking-widest">
            <span>SSL Encrypted</span>
            <span>Fast Shipping</span>
            <span>Premium Support</span>
          </div>
        </motion.footer>
      </motion.div>
    </div>
  );
}