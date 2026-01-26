"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, LogIn, UserPlus, ArrowRight } from "lucide-react";
import outeltFundo from "@/public/outeltFundo.jpg";
import LogoFreitasOutlet from "@/public/LogoFreitasOutlet.png";

type UserType = {
  name: string;
  email: string;
  password: string;
};

const INPUT_STYLES = "w-full p-3 pl-10 rounded-xl bg-white/90 text-black placeholder:text-gray-500 border border-black/10 focus:outline-none focus:ring-2 focus:ring-white/50 transition duration-200";
const ICON_STYLES = "absolute left-3 top-1/2 -translate-y-1/2 text-black/70";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserType>({
    name: "",
    email: "",
    password: "",
  });

  const getStoredUsers = (): UserType[] => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("users") || "[]");
  };

  const saveUserSession = (user: { name: string; email: string }) => {
    localStorage.setItem("loggedUser", JSON.stringify(user));
  };

  const performLogin = (users: UserType[]) => {
    const existingUser = users.find((u) => u.email === formData.email);

    if (!existingUser) {
      throw new Error("Usuário não encontrado. Verifique seu email.");
    }

    if (existingUser.password !== formData.password) {
      throw new Error("Senha incorreta.");
    }

    saveUserSession({ name: existingUser.name, email: existingUser.email });
    alert("Login realizado com sucesso!");
   
    router.push("/MenProductPage");
  };

  const performRegister = (users: UserType[]) => {
    const userExists = users.find((u) => u.email === formData.email);

    if (userExists) {
      throw new Error("Este email já possui cadastro. Tente fazer login.");
    }

    const newUser: UserType = { ...formData };
    localStorage.setItem("users", JSON.stringify([...users, newUser]));
    saveUserSession({ name: newUser.name, email: newUser.email });
    
    alert("Conta criada com sucesso!");
 
    router.push("/AdressPage");
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.email || !formData.password || (isRegister && !formData.name)) {
        throw new Error("Preencha todos os campos obrigatórios.");
      }

      const storedUsers = getStoredUsers();

      if (isRegister) {
        performRegister(storedUsers);
      } else {
        performLogin(storedUsers);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  }

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setFormData({ name: "", email: "", password: "" });
  };

  return (
    <main className="flex h-screen w-full bg-neutral-900 overflow-hidden">
      <aside className="relative hidden md:block md:w-1/2 lg:w-2/3">
        <Image
          src={outeltFundo}
          alt="Interior da loja Freitas Outlet"
          fill
          priority
          className="object-cover opacity-60"
          sizes="(max-width: 768px) 0vw, 50vw"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black via-black/40 to-transparent" />
        
        <div className="absolute bottom-10 left-10 text-white z-10 max-w-md">
          <h2 className="text-4xl font-bold mb-4">Estilo e Qualidade</h2>
          <p className="text-lg text-gray-200">
            Descubra as melhores tendências com preços exclusivos. Faça parte do nosso clube de vantagens.
          </p>
        </div>
      </aside>

      <section className="w-full md:w-1/2 lg:w-1/3 flex items-center justify-center p-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={isRegister ? "register" : "login"}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full max-w-sm"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-8 md:justify-start"
            >
              <div className="relative w-48 h-24">
                <Image
                  src={LogoFreitasOutlet}
                  alt="Logo Freitas Outlet"
                  fill
                  className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  priority
                />
              </div>
            </motion.div>

            <div className="mb-8 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-3">
                {isRegister ? <UserPlus className="w-8 h-8" /> : <LogIn className="w-8 h-8" />}
                {isRegister ? "Criar Conta" : "Bem-vindo de volta"}
              </h1>
              <p className="text-gray-400">
                {isRegister ? "Preencha seus dados para começar." : "Insira suas credenciais para acessar."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="relative group">
                  <label htmlFor="name" className="sr-only">Nome Completo</label>
                  <User className={ICON_STYLES} size={20} />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="Nome Completo"
                    className={INPUT_STYLES}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              )}

              <div className="relative group">
                <label htmlFor="email" className="sr-only">Endereço de Email</label>
                <Mail className={ICON_STYLES} size={20} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  className={INPUT_STYLES}
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="relative group">
                <label htmlFor="password" className="sr-only">Senha</label>
                <Lock className={ICON_STYLES} size={20} />
                <input
                  id="password"
                  type="password"
                  name="password"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  placeholder="••••••••"
                  className={INPUT_STYLES}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-100 focus:ring-4 focus:ring-white/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? (
                  <span className="animate-pulse">Processando...</span>
                ) : (
                  <>
                    {isRegister ? "Registrar" : "Entrar"}
                    <ArrowRight size={20} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                {isRegister ? "Já possui uma conta?" : "Ainda não tem uma conta?"}{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-white font-medium hover:underline underline-offset-4 ml-1 focus:outline-none focus:text-gray-200 transition-colors"
                >
                  {isRegister ? "Fazer Login" : "Cadastre-se"}
                </button>
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    </main>
  );
}