"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, LogIn, UserPlus, ArrowRight, Eye, EyeOff } from "lucide-react";
import outeltFundo from "@/public/outeltFundo.jpg";
import LogoFreitasOutlet from "@/public/LogoFreitasOutlet.png";
import { loginAction, registerAction } from "@/app/actions/auth";

type UserType = {
  name: string;
  email: string;
  password: string;
};

const INPUT_STYLES =
  "w-full p-3 pl-10 pr-10 rounded-xl bg-white/5 text-white placeholder:text-gray-400 border border-white/10 focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-white/30 transition-all duration-300";
const ICON_STYLES = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-300 peer-focus:text-white";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UserType>({
    name: "",
    email: "",
    password: "",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!formData.email || !formData.password || (isRegister && !formData.name)) {
        throw new Error("Preencha todos os campos obrigatórios.");
      }

      const fd = new FormData();
      fd.append("email", formData.email);
      fd.append("password", formData.password);
      if (isRegister) fd.append("name", formData.name);

      const action = isRegister ? registerAction : loginAction;
      const response = await action(null, fd);

      if (response?.error) {
        setError(response.error);
      } else {
        router.push(isRegister ? "/PageAdress" : "/MenProductPage");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError(null);
  };

  return (
    <main className="flex h-screen w-full bg-neutral-950 overflow-hidden">
      
      <aside className="relative hidden md:block md:w-1/2 lg:w-2/3">
        <Image
          src={outeltFundo}
          alt="Interior da loja"
          fill
          priority
          className="object-cover opacity-50"
          sizes="(max-width: 768px) 0vw, 50vw"
        />
        <div className="absolute inset-0 bg-linear-to-r from-neutral-950/20 via-neutral-950/60 to-neutral-950" />
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute bottom-10 left-10 text-white z-10 max-w-md"
        >
          <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Estilo e Qualidade</h2>
          <p className="text-lg text-gray-300 drop-shadow-md">
            Descubra as melhores tendências com preços exclusivos.
          </p>
        </motion.div>
      </aside>

      <section className="w-full md:w-1/2 lg:w-1/3 flex items-center justify-center p-6 relative z-10 overflow-hidden">
        
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-sm p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative z-10"
        >
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <div className="relative w-48 h-20">
              <Image
                src={LogoFreitasOutlet}
                alt="Logo"
                fill
                className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                priority
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              {isRegister ? <UserPlus className="text-emerald-400" /> : <LogIn className="text-emerald-400" />}
              {isRegister ? "Criar Conta" : "Bem-vindo de volta"}
            </h1>
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                role="alert"
                className="mb-4 p-3 rounded-xl bg-red-500/20 backdrop-blur-md border border-red-500/50 text-red-200 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4 relative">
            <AnimatePresence>
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="relative overflow-hidden"
                >
                  <label htmlFor="name" className="sr-only">Nome Completo</label>
                  <input
                    id="name"
                    type="text"
                    required={isRegister}
                    placeholder="Nome Completo"
                    className={`peer ${INPUT_STYLES}`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <User className={ICON_STYLES} size={20} />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={itemVariants} className="relative">
              <label htmlFor="email" className="sr-only">E-mail</label>
              <input
                id="email"
                type="email"
                required
                placeholder="seu@email.com"
                className={`peer ${INPUT_STYLES}`}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Mail className={ICON_STYLES} size={20} />
            </motion.div>

            <motion.div variants={itemVariants} className="relative">
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className={`peer ${INPUT_STYLES}`}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <Lock className={ICON_STYLES} size={20} />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </motion.div>

            {!isRegister && (
              <motion.div variants={itemVariants} className="flex justify-end mt-1">
                <button type="button" className="text-xs text-gray-400 hover:text-white transition-colors">
                  Esqueceu a senha?
                </button>
              </motion.div>
            )}

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:opacity-70 mt-6 flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegister ? "Registrar" : "Entrar"}
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>
          </form>

          <motion.div variants={itemVariants} className="mt-8 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-gray-300 hover:text-white hover:underline text-sm transition-all"
            >
              {isRegister
                ? "Já possui uma conta? Fazer Login"
                : "Ainda não tem conta? Cadastre-se"}
            </button>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}