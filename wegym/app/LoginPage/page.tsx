"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Loader2, Dumbbell, Mail, Lock, User, IdCard, MapPin, ExternalLink, ChevronDown, Heart, Salad, Activity, CheckCircle2 } from 'lucide-react';

const EXPERIENCE_OPTIONS = [
  { value: 'iniciante', label: '🥉 Iniciante', sub: 'Menos de 1 ano' },
  { value: 'intermediario', label: '🥈 Intermediário', sub: '1 a 3 anos' },
  { value: 'avancado', label: '🥇 Avançado', sub: 'Mais de 3 anos' },
];

const DIETARY_OPTIONS = [
  { value: 'nenhuma', label: '🍽️ Nenhuma' },
  { value: 'vegetariano', label: '🥗 Vegetariano' },
  { value: 'vegano', label: '🌱 Vegano' },
  { value: 'lactose', label: '🥛 Intolerância à lactose' },
  { value: 'alergia', label: '⚠️ Alergias' },
];

const AnimatedBackground = React.memo(() => (
  <>
    <motion.div
      animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.1, 0.2, 0.1] }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-10%] right-[-5%] w-[125vw] md:w-125 h-[125vw] md:h-125 bg-orange-600 rounded-full filter blur-[120px]"
    />
    <motion.div
      animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], opacity: [0.05, 0.15, 0.05] }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-[-10%] left-[-5%] w-[150vw] md:w-150 h-[150vw] md:h-150 bg-zinc-700 rounded-full filter blur-[100px]"
    />
  </>
));
AnimatedBackground.displayName = 'AnimatedBackground';

const LeftPanel = React.memo(() => (
  <div className="hidden md:flex md:w-1/3 bg-zinc-900 p-12 flex-col justify-between relative overflow-hidden">
    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,#fff_1px,transparent_1px)] bg-size-[30px_30px]"></div>
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
));
LeftPanel.displayName = 'LeftPanel';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [userType, setUserType] = useState<'atleta' | 'personal'>('atleta');
  const [isVerifyingCref, setIsVerifyingCref] = useState<boolean>(false);
  const [crefVerified, setCrefVerified] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: '', email: '', cpf: '', cep: '', city: '', state: '', password: '', confirmPassword: '',
    age: '', height: '', weight: '', sex: '', experienceLevel: '', dietaryRestriction: '',
    dietaryAllergy: '', injury: '', healthIssues: '', medications: '', cref: '',
  });

  useEffect(() => {
    router.prefetch('/TrainingPage');
  }, [router]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4").substring(0, 14);
    } else if (name === 'cep') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, "$1-$2").substring(0, 9);
    } else if (name === 'cref') {
      formattedValue = value.toUpperCase();
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    if (error) setError(null);
  }, [error]);

  useEffect(() => {
    const cepDigits = formData.cep.replace(/\D/g, '');
    if (cepDigits.length === 8) {
      if (formData.city && formData.state) return; 

      fetch(`https://viacep.com.br/ws/${cepDigits}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setFormData(prev => ({ ...prev, city: data.localidade, state: data.uf }));
          }
        })
        .catch(() => null);
    }
  }, [formData.cep, formData.city, formData.state]);

  const verifyCref = useCallback(async () => {
    setIsVerifyingCref(true);
    setError(null);
    
    setTimeout(() => {
      setIsVerifyingCref(false);
      const crefRegex = /^\d{6}-[A-Z]\/[A-Z]{2}$/;
      
      if (crefRegex.test(formData.cref)) {
        setCrefVerified(true);
      } else {
        setError("CREF inválido ou inativo. Formato esperado: 000000-G/UF");
        setCrefVerified(false);
      }
    }, 1000);
  }, [formData.cref]);

  const handleAuth = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      return setError("As senhas não coincidem.");
    }

    if (!isLogin && userType === 'personal' && !crefVerified) {
      return setError("Valide o CREF antes de continuar.");
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const res = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (res?.error) {
          setError(res.error);
          setIsLoading(false);
        } else {
          router.push('/TrainingPage');
        }
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, userType })
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Erro no cadastro.");
          setIsLoading(false);
          return;
        }

        setIsLogin(true);
        setIsLoading(false);
        setCrefVerified(false);
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch {
      setError("Falha de conexão.");
      setIsLoading(false);
    }
  }, [isLogin, formData, userType, crefVerified, router]);

  const inputClass = "w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-800/50 text-white focus:border-orange-500 outline-none transition-all";
  const labelClass = "text-xs font-bold text-zinc-400 uppercase ml-1 flex items-center gap-1";
  const selectClass = "w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-800/50 text-white focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer";
  const textareaClass = "w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-800/50 text-white focus:border-orange-500 outline-none transition-all resize-none";
  const sectionTitleClass = "md:col-span-2 text-xs font-black text-orange-500 uppercase tracking-widest pt-2 pb-1 border-b border-zinc-800 flex items-center gap-2";

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 sm:p-8 selection:bg-orange-500 selection:text-white relative overflow-hidden">
      <AnimatedBackground />

      <div className="w-full max-w-6xl bg-zinc-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-zinc-800 my-auto max-h-fit">
        <LeftPanel />

        <div className="w-full md:w-2/3 p-8 sm:p-12 relative flex items-start justify-center max-h-[85vh] overflow-y-auto">
          <div className="relative w-full max-w-2xl">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <h3 className="text-4xl font-black text-white mb-2 italic">LOGIN</h3>
                  <p className="text-zinc-500 mb-8 font-medium">Pronto para o treino de hoje?</p>
                  <form className="space-y-4" onSubmit={handleAuth}>
                    <div className="space-y-1">
                      <label className={labelClass}><Mail className="w-3 h-3" /> E-mail <span className="text-red-500">*</span></label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="seu@email.com" className={inputClass} required />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center px-1">
                        <label className={labelClass}><Lock className="w-3 h-3" /> Senha <span className="text-red-500">*</span></label>
                        <button type="button" className="text-xs font-bold text-orange-500 hover:text-orange-400 cursor-pointer">Esqueci minha senha</button>
                      </div>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className={inputClass} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <motion.button disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 text-black font-black py-4 rounded-xl shadow-lg uppercase italic tracking-tighter flex items-center justify-center cursor-pointer">
                      {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Entrar no Wegym"}
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="signup" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <h3 className="text-4xl font-black text-white mb-2 italic uppercase">Cadastro</h3>
                  <p className="text-zinc-500 mb-6 font-medium">Preencha seus dados para criar sua conta.</p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                      type="button"
                      onClick={() => { setUserType('atleta'); setError(null); }}
                      className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                        userType === 'atleta'
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                          : 'border-zinc-800 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      <Dumbbell className="w-4 h-4" /> Atleta
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUserType('personal'); setError(null); }}
                      className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                        userType === 'personal'
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                          : 'border-zinc-800 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      <IdCard className="w-4 h-4" /> Personal
                    </button>
                  </div>

                  <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAuth}>
                    
                    {userType === 'atleta' && (
                      <>
                        <p className={sectionTitleClass}><User className="w-3.5 h-3.5" /> Dados Pessoais</p>

                        <div className="space-y-1 md:col-span-2">
                          <label className={labelClass}><User className="w-3 h-3" /> Nome Completo <span className="text-red-500">*</span></label>
                          <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nome Completo" className={inputClass} required />
                        </div>

                        <div className="space-y-1">
                          <label className={labelClass}><IdCard className="w-3 h-3" /> CPF <span className="text-red-500">*</span></label>
                          <input type="text" name="cpf" value={formData.cpf} onChange={handleInputChange} placeholder="000.000.000-00" className={inputClass} required />
                        </div>

                        <div className="space-y-1">
                          <label className={labelClass}><Mail className="w-3 h-3" /> E-mail <span className="text-red-500">*</span></label>
                          <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="seu@email.com" className={inputClass} required />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center px-1">
                            <label className={labelClass}><MapPin className="w-3 h-3" /> CEP <span className="text-red-500">*</span></label>
                            <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-orange-500 flex items-center hover:underline uppercase italic">Não sei meu CEP <ExternalLink className="w-2 h-2 ml-1" /></a>
                          </div>
                          <input type="text" name="cep" value={formData.cep} onChange={handleInputChange} placeholder="00000-000" className={inputClass} required />
                        </div>

                        <div className="space-y-1 grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className={labelClass}>Cidade <span className="text-red-500">*</span></label>
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Cidade" className={inputClass} required />
                          </div>
                          <div>
                            <label className={labelClass}>UF <span className="text-red-500">*</span></label>
                            <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="UF" className={inputClass + " text-center"} maxLength={2} required />
                          </div>
                        </div>

                        <p className={sectionTitleClass}><Activity className="w-3.5 h-3.5" /> Informações Físicas</p>

                        <div className="space-y-1">
                          <label className={labelClass}>Idade <span className="text-red-500">*</span></label>
                          <input type="number" name="age" value={formData.age} onChange={handleInputChange} placeholder="Ex: 25" min={10} max={100} className={inputClass} required />
                        </div>

                        <div className="space-y-1">
                          <label className={labelClass}>Sexo <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <select name="sex" value={formData.sex} onChange={handleInputChange} className={selectClass} aria-label="Sexo" required>
                              <option value="" disabled>Selecione...</option>
                              <option value="masculino">Masculino</option>
                              <option value="feminino">Feminino</option>
                              <option value="outro">Outro / Prefiro não informar</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className={labelClass}>Altura (cm) <span className="text-red-500">*</span></label>
                          <input type="number" name="height" value={formData.height} onChange={handleInputChange} placeholder="Ex: 175" min={100} max={250} className={inputClass} required />
                        </div>

                        <div className="space-y-1">
                          <label className={labelClass}>Peso (kg) <span className="text-red-500">*</span></label>
                          <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} placeholder="Ex: 70" min={30} max={300} className={inputClass} required />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className={labelClass}><Dumbbell className="w-3 h-3" /> Nível de Experiência <span className="text-red-500">*</span></label>
                          <div className="grid grid-cols-3 gap-2">
                            {EXPERIENCE_OPTIONS.map(opt => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, experienceLevel: opt.value }))}
                                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                                  formData.experienceLevel === opt.value
                                    ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                                    : 'border-zinc-800 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                                }`}
                              >
                                <span className="text-sm font-black">{opt.label}</span>
                                <span className="text-[10px] mt-0.5 opacity-70">{opt.sub}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <p className={sectionTitleClass}><Salad className="w-3.5 h-3.5" /> Restrições Alimentares</p>

                        <div className="space-y-1 md:col-span-2">
                          <label className={labelClass}>Tipo de Restrição <span className="text-red-500">*</span></label>
                          <div className="grid grid-cols-2 gap-2">
                            {DIETARY_OPTIONS.map(opt => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, dietaryRestriction: opt.value, dietaryAllergy: opt.value !== 'alergia' ? '' : prev.dietaryAllergy }))}
                                className={`py-2.5 px-3 rounded-xl border text-sm font-bold text-left transition-all cursor-pointer ${
                                  formData.dietaryRestriction === opt.value
                                    ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                                    : 'border-zinc-800 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <AnimatePresence>
                          {formData.dietaryRestriction === 'alergia' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-1 md:col-span-2 overflow-hidden"
                            >
                              <label className={labelClass}>Descreva suas alergias</label>
                              <input
                                type="text"
                                name="dietaryAllergy"
                                value={formData.dietaryAllergy}
                                onChange={handleInputChange}
                                placeholder="Ex: amendoim, frutos do mar, glúten..."
                                className={inputClass}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <p className={sectionTitleClass}><Heart className="w-3.5 h-3.5" /> Saúde</p>

                        <div className="space-y-1 md:col-span-2">
                          <label className={labelClass}>Possui alguma lesão?</label>
                          <textarea
                            name="injury"
                            value={formData.injury}
                            onChange={handleInputChange}
                            placeholder="Descreva suas lesões, se houver. Ex: lesão no ombro direito, tendinite..."
                            rows={2}
                            className={textareaClass}
                          />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className={labelClass}>Problemas de saúde?</label>
                          <textarea
                            name="healthIssues"
                            value={formData.healthIssues}
                            onChange={handleInputChange}
                            placeholder="Ex: problema no joelho, hérnia de disco, hipertensão..."
                            rows={2}
                            className={textareaClass}
                          />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className={labelClass}>Faz uso de medicamentos?</label>
                          <input
                            type="text"
                            name="medications"
                            value={formData.medications}
                            onChange={handleInputChange}
                            placeholder="Ex: losartana, metformina, antiinflamatório..."
                            className={inputClass}
                          />
                        </div>
                      </>
                    )}

                    {userType === 'personal' && (
                      <div className="md:col-span-2 space-y-4">
                        {!crefVerified ? (
                          <div className="space-y-4 bg-zinc-800/20 p-6 rounded-2xl border border-zinc-800">
                            <p className="text-zinc-400 text-sm mb-2 font-medium">
                              Para atuar como Personal Trainer no WEGYM, é obrigatório validar seu registro no Conselho Regional de Educação Física.
                            </p>
                            <div className="space-y-1">
                              <label className={labelClass}><IdCard className="w-3 h-3" /> Número do CREF <span className="text-red-500">*</span></label>
                              <input 
                                type="text" 
                                name="cref" 
                                value={formData.cref} 
                                onChange={handleInputChange} 
                                placeholder="Ex: 123456-G/SP" 
                                className={inputClass} 
                                required 
                              />
                            </div>
                            <motion.button
                              type="button"
                              onClick={verifyCref}
                              disabled={isVerifyingCref || formData.cref.length < 5}
                              className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 border border-zinc-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                            >
                              {isVerifyingCref ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verificar e Validar CREF"}
                            </motion.button>
                          </div>
                        ) : (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center gap-3">
                              <CheckCircle2 className="w-5 h-5 shrink-0" />
                              <span className="text-sm font-bold">CREF verificado com sucesso! Finalize seu cadastro abaixo.</span>
                            </div>
                            
                            <p className={sectionTitleClass}><User className="w-3.5 h-3.5" /> Dados Pessoais do Personal</p>
                            
                            <div className="space-y-1">
                              <label className={labelClass}><User className="w-3 h-3" /> Nome Completo <span className="text-red-500">*</span></label>
                              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nome Completo" className={inputClass} required />
                            </div>

                            <div className="space-y-1">
                              <label className={labelClass}><Mail className="w-3 h-3" /> E-mail <span className="text-red-500">*</span></label>
                              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="seu@email.com" className={inputClass} required />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {(userType === 'atleta' || (userType === 'personal' && crefVerified)) && (
                      <>
                        <p className={sectionTitleClass}><Lock className="w-3.5 h-3.5" /> Segurança</p>

                        <div className="space-y-1">
                          <label className={labelClass}><Lock className="w-3 h-3" /> Senha <span className="text-red-500">*</span></label>
                          <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className={inputClass} required />
                        </div>

                        <div className="space-y-1">
                          <label className={labelClass}><Lock className="w-3 h-3" /> Confirmar Senha <span className="text-red-500">*</span></label>
                          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••" className={inputClass} required />
                        </div>
                      </>
                    )}

                    {!isLogin && error && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-xl text-center font-bold">
                        {error}
                      </motion.div>
                    )}

                    {(userType === 'atleta' || (userType === 'personal' && crefVerified)) && (
                      <motion.button
                        disabled={isLoading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="md:col-span-2 w-full bg-white hover:bg-zinc-200 disabled:bg-zinc-700 text-black font-black py-4 rounded-xl shadow-lg uppercase italic mt-4 flex items-center justify-center cursor-pointer"
                      >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-black" /> : "Finalizar Cadastro"}
                      </motion.button>
                    )}
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center">
              <button onClick={() => { setIsLogin(!isLogin); setError(null); setCrefVerified(false); }} className="text-zinc-400 text-sm font-medium hover:text-white transition-colors cursor-pointer">
                {isLogin ? "Não tem conta? " : "Já é membro? "}
                <span className="text-orange-500 font-bold underline decoration-zinc-800 italic cursor-pointer">{isLogin ? "CRIAR PERFIL" : "FAZER LOGIN"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}