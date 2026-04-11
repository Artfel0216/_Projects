"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Dumbbell, Mail, Lock, User, IdCard, MapPin, Search, ExternalLink } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    cep: '',
    city: '',
    state: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    router.prefetch('/TrainingPage');
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4").substring(0, 14);
    } else if (name === 'cep') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, "$1-$2").substring(0, 9);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    if (error) setError(null);
  };

  useEffect(() => {
    const cepDigits = formData.cep.replace(/\D/g, '');
    if (cepDigits.length === 8) {
      fetch(`https://viacep.com.br/ws/${cepDigits}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setFormData(prev => ({ ...prev, city: data.localidade, state: data.uf }));
          }
        })
        .catch(() => null);
    }
  }, [formData.cep]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      router.push('/TrainingPage');
    } catch (err) {
      setError("Falha na autenticação. Verifique os dados.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 sm:p-8 selection:bg-orange-500 selection:text-white relative overflow-hidden">
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] right-[-5%] w-125 h-125 bg-orange-600 rounded-full filter blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] left-[-5%] w-150 h-150 bg-zinc-700 rounded-full filter blur-[100px]"
      />

      <div className="w-full max-w-6xl bg-zinc-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-zinc-800">
        <div className="hidden md:flex md:w-1/3 bg-zinc-900 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          <div className="relative z-10">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center space-x-2 mb-8">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center rotate-3">
                <Dumbbell className="text-white w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tighter italic">WEGYM</h1>
            </motion.div>
            <h2 className="text-5xl font-black text-white mb-6 leading-none uppercase italic">Supere seus <br /><span className="text-orange-500 underline decoration-zinc-700">Limites</span>.</h2>
            <p className="text-zinc-400 text-lg leading-relaxed">Sua jornada para a melhor versão de si mesmo começa aqui.</p>
          </div>
        </div>

        <div className="w-full md:w-2/3 p-8 sm:p-12 relative flex items-center justify-center min-h-150">
          <div className="relative w-full max-w-2xl">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-xl text-center font-bold">
                {error}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <h3 className="text-4xl font-black text-white mb-2 italic">LOGIN</h3>
                  <p className="text-zinc-500 mb-8 font-medium">Pronto para o treino de hoje?</p>
                  <form className="space-y-4" onSubmit={handleAuth}>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center ml-1"><Mail className="w-3 h-3 mr-1" /> E-mail</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="seu@atleta.com" className="w-full px-4 py-4 rounded-xl border border-zinc-800 bg-zinc-800/50 text-white focus:border-orange-500 outline-none transition-all" required />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center"><Lock className="w-3 h-3 mr-1" /> Senha</label>
                        <button type="button" className="text-xs font-bold text-orange-500 hover:text-orange-400">Esqueceu?</button>
                      </div>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="w-full px-4 py-4 rounded-xl border border-zinc-800 bg-zinc-800/50 text-white focus:border-orange-500 outline-none transition-all" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <motion.button disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 text-black font-black py-4 rounded-xl shadow-lg uppercase italic tracking-tighter flex items-center justify-center">
                      {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Elabore seu Treino"}
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="signup" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <h3 className="text-4xl font-black text-white mb-2 italic uppercase">Cadastro</h3>
                  <p className="text-zinc-500 mb-8 font-medium">Preencha seus dados de atleta.</p>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAuth}>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase ml-1 flex items-center"><User className="w-3 h-3 mr-1" /> Nome Completo</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nome Completo" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-800/50 text-white focus:border-orange-500 outline-none transition-all" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-400 uppercase ml-1 flex items-center"><IdCard className="w-3 h-3 mr-1" /> CPF</label>
                      <input type="text" name="cpf" value={formData.cpf} onChange={handleInputChange} placeholder="000.000.000-00" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-800/50 text-white focus:border-orange-500 outline-none transition-all" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-400 uppercase ml-1 flex items-center"><Mail className="w-3 h-3 mr-1" /> E-mail</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="seu@atleta.com" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-800/50 text-white focus:border-orange-500 outline-none transition-all" required />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-xs font-bold text-zinc-400 uppercase flex items-center"><MapPin className="w-3 h-3 mr-1" /> CEP</label>
                        <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-orange-500 flex items-center hover:underline uppercase italic">Não sei meu CEP <ExternalLink className="w-2 h-2 ml-1" /></a>
                      </div>
                      <input type="text" name="cep" value={formData.cep} onChange={handleInputChange} placeholder="00000-000" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-800/50 text-white focus:border-orange-500 outline-none transition-all" required />
                    </div>
                    <div className="space-y-1 grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Cidade</label>
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Cidade" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-800/50 text-white focus:border-orange-500 outline-none transition-all" required />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-400 uppercase ml-1">UF</label>
                        <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="UF" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-800/50 text-white focus:border-orange-500 outline-none transition-all text-center" maxLength={2} required />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-400 uppercase ml-1 flex items-center"><Lock className="w-3 h-3 mr-1" /> Senha</label>
                      <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-800/50 text-white focus:border-orange-500 outline-none transition-all" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-400 uppercase ml-1 flex items-center"><Search className="w-3 h-3 mr-1" /> Confirmar</label>
                      <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-800/50 text-white focus:border-orange-500 outline-none transition-all" required />
                    </div>
                    <motion.button disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="md:col-span-2 w-full bg-white hover:bg-zinc-200 disabled:bg-zinc-700 text-black font-black py-4 rounded-xl shadow-lg uppercase italic mt-4 flex items-center justify-center">
                      {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-black" /> : "Finalizar Cadastro"}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center">
              <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="text-zinc-400 text-sm font-medium hover:text-white transition-colors">
                {isLogin ? "Não tem conta? " : "Já é membro? "}
                <span className="text-orange-500 font-bold underline decoration-zinc-800 italic">{isLogin ? "CRIAR PERFIL" : "FAZER LOGIN"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}