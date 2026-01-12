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
  Sun,
  Moon,
} from "lucide-react";

import outeltFundo from "@/public/outeltFundo.jpg";

type UserType = {
  name: string;
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();

  /* 🔄 ESTADOS */
  const [isRegister, setIsRegister] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [form, setForm] = useState<UserType>({
    name: "",
    email: "",
    password: "",
  });

  /* 🌗 TEMA */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    theme === "dark"
      ? root.classList.add("dark")
      : root.classList.remove("dark");

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  /* 📦 LOCAL STORAGE */
  const getUsers = (): UserType[] =>
    JSON.parse(localStorage.getItem("users") || "[]");

  const saveUsers = (users: UserType[]) =>
    localStorage.setItem("users", JSON.stringify(users));

  /* 📝 REGISTRO */
 const handleRegister = () => {
  // 🚨 validação
  if (
    !form.name.trim() ||
    !form.email.trim() ||
    !form.password.trim()
  ) {
    alert("⚠️ Preencha todos os campos para criar a conta!");
    return;
  }

  const users = getUsers();

  const userExists = users.some(
    (user) => user.email === form.email
  );

  if (userExists) {
    alert("❌ Este email já está cadastrado!");
    return;
  }

  saveUsers([...users, form]);
  alert("✅ Conta criada com sucesso!");

  setIsRegister(false);
  setForm({ name: "", email: "", password: "" });
};

  /* 🔐 LOGIN */
 const handleLogin = () => {
  // 🚨 validação
  if (!form.email.trim() || !form.password.trim()) {
    alert("⚠️ Preencha email e senha para continuar!");
    return;
  }

  const users = getUsers();

  const validUser = users.find(
    (user) =>
      user.email === form.email &&
      user.password === form.password
  );

  if (!validUser) {
    alert("❌ Email ou senha inválidos!");
    return;
  }

  localStorage.setItem("loggedUser", JSON.stringify(validUser));
  alert("✅ Login realizado com sucesso!");

  // ✅ rota correta (App Router)
  router.push("/AdressPage");
};


  /* 🎨 CLASSES */
  const inputClass = `
    w-full p-3 pl-10 rounded-lg
    bg-white dark:bg-zinc-900
    text-black dark:text-white
    placeholder:text-gray-500 dark:placeholder:text-gray-300
    border border-gray-300 dark:border-zinc-700
    focus:outline-none focus:ring-2 focus:ring-blue-600
    transition-colors
  `;

  const iconClass =
    "absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-white";

  return (
    <main className="flex h-screen w-full bg-white dark:bg-zinc-900 transition-colors">
      
      {/* 🌗 BOTÃO DE TEMA */}
      <button
        onClick={toggleTheme}
        aria-label="Alternar tema"
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-zinc-200 dark:bg-zinc-800"
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* 🖼️ IMAGEM LATERAL */}
      <aside className="relative w-1/2 hidden md:block">
        <Image
          src={outeltFundo}
          alt="Imagem de fundo decorativa"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-[#0a1f44]/80" />
      </aside>

      {/* 📋 FORMULÁRIO */}
      <section className="w-full md:w-1/2 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!isRegister ? (
            <motion.section
              key="login"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full max-w-md p-8"
            >
              <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <LogIn /> Login
                </h1>
              </header>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <Mail className={iconClass} />
                  <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    className={inputClass}
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
                    value={form.password}
                    className={inputClass}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={handleLogin}
                  className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition"
                >
                  Entrar
                </button>
              </form>

              <p className="mt-6 text-center text-gray-600 dark:text-gray-300">
                Não tem conta?{" "}
                <button
                  onClick={() => setIsRegister(true)}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Criar conta
                </button>
              </p>
            </motion.section>
          ) : (
            <motion.section
              key="register"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="w-full max-w-md p-8"
            >
              <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <UserPlus /> Registro
                </h1>
              </header>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <User className={iconClass} />
                  <input
                    placeholder="Nome"
                    value={form.name}
                    className={inputClass}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </div>

                <div className="relative">
                  <Mail className={iconClass} />
                  <input
                    placeholder="Email"
                    value={form.email}
                    className={inputClass}
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
                    value={form.password}
                    className={inputClass}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRegister}
                  className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition"
                >
                  Registrar
                </button>

                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="w-full py-3 rounded-lg border flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                >
                  <LogIn size={18} />
                  Voltar para login
                </button>
              </form>
            </motion.section>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
