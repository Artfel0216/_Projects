"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Mail,
  Lock,
  User,
  LogIn,
  UserPlus,
} from "lucide-react";

import outeltFundo from "@/public/outeltFundo.jpg";

type UserType = {
  name: string;
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState<UserType>({
    name: "",
    email: "",
    password: "",
  });

  /* 🔐 Verifica login */
  useEffect(() => {
    const loggedUser = localStorage.getItem("loggedUser");
    if (loggedUser) router.replace("/");
  }, [router]);

  /* 🎨 CLASSES MONO PREMIUM */
  const inputClass = `
    w-full p-3 pl-10 rounded-xl
    bg-white/90
    text-black
    placeholder:text-gray-500
    border border-black/10
    focus:outline-none focus:ring-2 focus:ring-black
    transition
  `;

  const iconClass =
    "absolute left-3 top-1/2 -translate-y-1/2 text-black";

  return (
    <main className="flex h-screen w-full bg-white">
      {/* 🖼️ IMAGEM COM OVERLAY */}
      <aside className="relative w-1/2 hidden md:block">
        <Image
          src={outeltFundo}
          alt="Imagem decorativa"
          fill
          priority
          className="object-cover grayscale"
        />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      </aside>

      {/* 🧊 GLASS CARD */}
      <section className="w-full md:w-1/2 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.section
            key={isRegister ? "register" : "login"}
            initial={{ opacity: 0, scale: 0.96, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, filter: "blur(12px)" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            whileHover={{
              rotateX: 6,
              rotateY: -6,
              scale: 1.03,
            }}
            style={{ perspective: 1200 }}
            className="
              w-full max-w-md p-10 rounded-3xl
              bg-black/60 text-white
              backdrop-blur-2xl
              border border-white/10
              shadow-[0_30px_80px_rgba(0,0,0,0.5)]
              transform-gpu
            "
          >
            <h1 className="text-3xl font-semibold flex gap-2 mb-8">
              {isRegister ? <UserPlus /> : <LogIn />}
              {isRegister ? "Registro" : "Login"}
            </h1>

            <div className="space-y-4">
              {isRegister && (
                <div className="relative">
                  <User className={iconClass} />
                  <input
                    placeholder="Nome"
                    className={inputClass}
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="relative">
                <Mail className={iconClass} />
                <input
                  placeholder="Email"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>

              <div className="relative">
                <Lock className={iconClass} />
                <input
                  type="password"
                  placeholder="Senha"
                  className={inputClass}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>

              <button
                className="
                  w-full py-3 rounded-xl
                  bg-white text-black font-semibold
                  hover:bg-gray-200 transition
                "
              >
                {isRegister ? "Registrar" : "Entrar"}
              </button>

              <p className="text-center text-sm text-white/80">
                {isRegister ? "Já tem conta?" : "Não tem conta?"}{" "}
                <button
                  onClick={() => setIsRegister(!isRegister)}
                  className="underline font-medium"
                >
                  {isRegister ? "Entrar" : "Criar conta"}
                </button>
              </p>
            </div>
          </motion.section>
        </AnimatePresence>
      </section>
    </main>
  );
}
