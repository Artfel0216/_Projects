'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Mail, Lock, User, LogIn, UserPlus, ArrowRight, 
  Eye, EyeOff, Facebook, Chrome, Loader2, AlertCircle 
} from "lucide-react";

import outeltFundo from "@/public/outeltFundo.jpg";
import LogoFreitasOutlet from "@/public/LogoFreitasOutlet.png";
import { loginAction, registerAction } from "@/app/actions/auth";
import { signIn } from "next-auth/react";

const authSchema = z.object({
  name: z.string().min(3, "Nome muito curto").optional(),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});

type AuthFormData = z.infer<typeof authSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema)
  });

  const passwordValue = watch("password", "");

  const handleGoogleLogin = () => {
  signIn("google", { callbackUrl: "/MenProductPage" });
};

const handleFacebookLogin = () => {
  signIn("facebook", { callbackUrl: "/MenProductPage" });
};

  const onSubmit = async (data: AuthFormData) => {
    setServerError(null);
    const fd = new FormData();
    fd.append("email", data.email);
    fd.append("password", data.password);
    if (isRegister && data.name) fd.append("name", data.name);

    const action = isRegister ? registerAction : loginAction;
    const response = await action(null, fd);

    if (response?.error) {
      setServerError(response.error);
    } else {
      router.push(isRegister ? "/PageAdress" : "/MenProductPage");
    }
  };

  return (
    <main className="flex h-screen w-full bg-[#050505] overflow-hidden">
      <aside className="relative hidden lg:block lg:w-2/3">
        <Image src={outeltFundo} alt="Background" fill priority className="object-cover opacity-40 scale-105" />
        <div className="absolute inset-0 bg-linear-to-r from-black via-transparent to-[#050505]" />
        <motion.div 
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}
          className="absolute bottom-20 left-20 z-10 max-w-lg"
        >
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 inline-block">
            New Collection 2026
          </span>
          <h2 className="text-6xl font-black text-white mb-6 leading-tight">Elevando seu <br/> lifestyle.</h2>
          <p className="text-xl text-white/50 leading-relaxed">Acesse sua conta para conferir as novidades da Freitas Outlet.</p>
        </motion.div>
      </aside>

      <section className="w-full lg:w-1/3 flex items-center justify-center p-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-sm z-10">
          <div className="flex justify-center mb-12">
             <Image src={LogoFreitasOutlet} alt="Logo" width={180} height={60} className="object-contain" priority />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {isRegister ? "Crie sua conta" : "Acesse sua conta"}
            </h1>
            <p className="text-white/40 mt-2 text-sm">Preencha seus dados para continuar.</p>
          </div>

          <AnimatePresence mode="wait">
            {serverError && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3"
              >
                <AlertCircle size={16} /> {serverError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isRegister && (
              <motion.div variants={itemVariants}>
                <div className="relative group">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.name ? 'text-red-400' : 'text-white/20 group-focus-within:text-emerald-400'}`} size={18} />
                  <input {...register("name")} placeholder="Nome Completo" 
                    className={`w-full bg-white/5 border rounded-xl py-3.5 pl-12 pr-4 text-white outline-none transition-all ${errors.name ? 'border-red-500/50' : 'border-white/10 focus:border-emerald-500/50 focus:bg-white/10'}`} />
                </div>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-400' : 'text-white/20 group-focus-within:text-emerald-400'}`} size={18} />
                <input {...register("email")} placeholder="seu@email.com" 
                  className={`w-full bg-white/5 border rounded-xl py-3.5 pl-12 pr-4 text-white outline-none transition-all ${errors.email ? 'border-red-500/50' : 'border-white/10 focus:border-emerald-500/50 focus:bg-white/10'}`} />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-red-400' : 'text-white/20 group-focus-within:text-emerald-400'}`} size={18} />
                <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="Sua senha" 
                  className={`w-full bg-white/5 border rounded-xl py-3.5 pl-12 pr-12 text-white outline-none transition-all ${errors.password ? 'border-red-500/50' : 'border-white/10 focus:border-emerald-500/50 focus:bg-white/10'}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.button variants={itemVariants} disabled={isSubmitting} type="submit"
              className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : (
                <> {isRegister ? "Criar conta agora" : "Entrar na plataforma"} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /> </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 flex items-center gap-4 text-white/10">
            <div className="h-px flex-1 bg-current" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">ou continue com</span>
            <div className="h-px flex-1 bg-current" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-xs font-medium"
            >
              <Chrome size={16} /> Google
            </button>
            <button 
              type="button"
              onClick={handleFacebookLogin}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-xs font-medium"
            >
              <Facebook size={16} className="text-[#1877F2]" /> Facebook
            </button>
          </div>

          <motion.p variants={itemVariants} className="mt-10 text-center text-sm text-white/40">
            {isRegister ? "Já tem uma conta?" : "Ainda não tem conta?"} {" "}
            <button onClick={() => setIsRegister(!isRegister)} className="text-white font-bold hover:text-emerald-400 transition-colors underline-offset-4 hover:underline">
              {isRegister ? "Fazer Login" : "Criar conta gratuita"}
            </button>
          </motion.p>
        </motion.div>
      </section>
    </main>
  );
}