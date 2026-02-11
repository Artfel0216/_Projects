"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, LogIn, UserPlus, ArrowRight } from "lucide-react";
import outeltFundo from "@/public/outeltFundo.jpg";
import LogoFreitasOutlet from "@/public/LogoFreitasOutlet.png";
import { loginAction, registerAction } from "@/app/actions/auth";

type UserType = {
  name: string;
  email: string;
  password: string;
};

const INPUT_STYLES =
  "w-full p-3 pl-10 rounded-xl bg-white/90 text-black placeholder:text-gray-500 border border-black/10 focus:outline-none focus:ring-2 focus:ring-white/50 transition duration-200";
const ICON_STYLES =
  "absolute left-3 top-1/2 -translate-y-1/2 text-black/70";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
        if (isRegister) {
          router.push("/PageAdress");
        } else {
          router.push("/MenProductPage");
        }
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  }

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError(null);
    setFormData({ name: "", email: "", password: "" });
  };

  return (
    <main className="flex h-screen w-full bg-neutral-900 overflow-hidden">
      <aside className="relative hidden md:block md:w-1/2 lg:w-2/3">
        <Image
          src={outeltFundo}
          alt="Interior da loja"
          fill
          priority
          className="object-cover opacity-60"
          sizes="(max-width: 768px) 0vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        <div className="absolute bottom-10 left-10 text-white z-10 max-w-md">
          <h2 className="text-4xl font-bold mb-4">Estilo e Qualidade</h2>
          <p className="text-lg text-gray-200">
            Descubra as melhores tendências com preços exclusivos.
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
            className="w-full max-w-sm"
          >
            <div className="flex justify-center mb-8 md:justify-start">
              <div className="relative w-48 h-24">
                <Image
                  src={LogoFreitasOutlet}
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="mb-8 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                {isRegister ? <UserPlus /> : <LogIn />}
                {isRegister ? "Criar Conta" : "Bem-vindo"}
              </h1>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="relative">
                  <User className={ICON_STYLES} size={20} />
                  <input
                    type="text"
                    placeholder="Nome Completo"
                    className={INPUT_STYLES}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              )}

              <div className="relative">
                <Mail className={ICON_STYLES} size={20} />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className={INPUT_STYLES}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="relative">
                <Lock className={ICON_STYLES} size={20} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className={INPUT_STYLES}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-white text-black font-bold hover:bg-gray-100 disabled:opacity-70 mt-6 flex items-center justify-center gap-2 transition-colors"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    {isRegister ? "Registrar" : "Entrar"}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={toggleMode}
                className="text-white hover:underline text-sm transition-all"
              >
                {isRegister
                  ? "Já possui uma conta? Fazer Login"
                  : "Ainda não tem conta? Cadastre-se"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    </main>
  );
}