'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  MapPin, Navigation, Home, Hash, Building2,
  Map as MapIcon, ArrowRight, Loader2, CheckCircle2 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const addressSchema = z.object({
  cep: z.string().min(9, "CEP incompleto"),
  street: z.string().min(3, "Rua é obrigatória"),
  number: z.string().min(1, "Nº obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().length(2, "UF inválida"),
});

type AddressFormData = z.infer<typeof addressSchema>;

const maskCEP = (value: string) => {
  return value.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").substring(0, 9);
};

const InputField = React.forwardRef(({ label, icon: Icon, error, ...props }: any, ref: any) => (
  <div className="space-y-1.5 w-full group">
    <div className="flex justify-between items-center px-1">
      <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{label}</label>
      <AnimatePresence>
        {error && (
          <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[10px] text-emerald-400 font-medium">
            {error.message}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
    <div className="relative">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${error ? 'text-emerald-500' : 'text-white/20 group-focus-within:text-white'}`}>
        <Icon size={18} />
      </div>
      <input
        {...props}
        ref={ref}
        className={`w-full bg-white/3 border rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/10 outline-none transition-all duration-500
          ${error ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-white/20 focus:border-white/30 focus:bg-white/6 focus:ring-4 focus:ring-white/2'}`}
      />
    </div>
  </div>
));
InputField.displayName = "InputField";

export default function PageAddress() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema)
  });

  const cepValue = watch("cep");

  useEffect(() => {
    const cep = cepValue?.replace(/\D/g, "");
    if (cep?.length === 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setValue("street", data.logradouro);
            setValue("neighborhood", data.bairro);
            setValue("city", data.localidade);
            setValue("state", data.uf);
          }
        });
    }
  }, [cepValue, setValue]);

  const onSubmit = async (data: AddressFormData) => {
    console.log("Endereço salvo:", data);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStep(2);
    setTimeout(() => router.push('/MenProductPage'), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="bg-white/2 border border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
          
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <header className="mb-10 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6">
                    <Navigation size={24} />
                  </div>
                  <h1 className="text-4xl font-black tracking-tight mb-3">Onde entregamos?</h1>
                  <p className="text-white/40 leading-relaxed">Quase lá! Precisamos do seu endereço para calcular o frete e prazos de entrega exclusivos.</p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="CEP" icon={MapPin} error={errors.cep} {...register("cep", { onChange: (e) => setValue("cep", maskCEP(e.target.value)) })} placeholder="00000-000" />
                    <InputField label="Estado (UF)" icon={MapIcon} error={errors.state} {...register("state")} placeholder="Ex: SP" maxLength={2} />
                    
                    <div className="md:col-span-2">
                      <InputField label="Logradouro" icon={Home} error={errors.street} {...register("street")} placeholder="Nome da rua ou avenida" />
                    </div>

                    <InputField label="Número" icon={Hash} error={errors.number} {...register("number")} placeholder="123" />
                    <InputField label="Bairro" icon={Navigation} error={errors.neighborhood} {...register("neighborhood")} placeholder="Seu bairro" />
                    
                    <div className="md:col-span-2">
                      <InputField label="Cidade" icon={Building2} error={errors.city} {...register("city")} placeholder="Nome da cidade" />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full mt-8 bg-white text-black py-5 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all group shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <> Finalizar Cadastro <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /> </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="success" 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="py-20 flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mb-8 animate-bounce">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-bold mb-4">Tudo pronto!</h2>
                <p className="text-white/40">Seu endereço foi salvo com sucesso. <br/> Redirecionando para a loja...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <p className="text-center mt-8 text-white/20 text-xs font-medium tracking-widest uppercase">
          Freitas Outlet © 2026 • Secure Checkout
        </p>
      </motion.div>
    </div>
  );
}