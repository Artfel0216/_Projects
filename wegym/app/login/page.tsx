"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getSession, signIn, useSession } from 'next-auth/react';
import { Eye, EyeOff, Loader2, Dumbbell, Mail, Lock, User, IdCard, MapPin, ExternalLink, ChevronDown, Heart, Activity, CheckCircle2 } from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { EXPERIENCE_OPTIONS } from '@/constants/options';
import { LeftPanel } from '@/components/ui/LeftPanel';
import { maskCEP, maskCPF } from '@/utils/masks';
import { useTranslations } from '@/lib/i18n/hook';



export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      router.replace(
        session.user.role === "personal" ? "/personal" : "/home"
      );
    }
  }, [status, session, router]);

  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [userType, setUserType] = useState<'atleta' | 'personal'>('atleta');
  const [isVerifyingCref, setIsVerifyingCref] = useState<boolean>(false);
  const [crefVerified, setCrefVerified] = useState<boolean>(false);

  const { t } = useTranslations();

  const [formData, setFormData] = useState({
    name: '', email: '', cpf: '', cep: '', city: '', state: '', password: '', confirmPassword: '',
    age: '', height: '', weight: '', sex: '', experienceLevel: '',
    injury: '', healthIssues: '', medications: '', cref: '',
  });


useEffect(() => {
  router.prefetch('/home');
  router.prefetch('/personal');
}, [router]);

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



const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  let formattedValue = value;

  if (name === 'cpf') formattedValue = maskCPF(value);
  if (name === 'cep') formattedValue = maskCEP(value);
  if (name === 'cref') formattedValue = value.toUpperCase();

  setFormData(prev => ({ ...prev, [name]: formattedValue }));
  if (error) setError(null);
}, [error]);



const verifyCref = useCallback(async () => {
  setIsVerifyingCref(true);
  setError(null);
  setCrefVerified(false);

  try {
    const res = await fetch("/api/cref/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cref: formData.cref }),
    });

    const data = await res.json();

    if (data.valid) {
      setCrefVerified(true);
    } else {
      const msg = data.errors?.[0] || t('errors.invalidCref');
      setError(msg);
      setCrefVerified(false);
    }
  } catch {
    setError(t('errors.crefValidationFailed'));
    setCrefVerified(false);
  } finally {
    setIsVerifyingCref(false);
  }
}, [formData.cref]);

const handleAuth = useCallback(async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  if (!isLogin && formData.password !== formData.confirmPassword) {
    return setError(t('errors.passwordMismatch'));
  }

  if (!isLogin && !termsAccepted) {
    return setError(t('errors.termsRequired'));
  }

  if (!isLogin && !privacyAccepted) {
    return setError(t('errors.privacyRequired'));
  }

  if (!isLogin && userType === 'personal' && !crefVerified) {
    return setError(t('errors.crefRequired'));
  }

  setIsLoading(true);

  try {
    if (isLogin) {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email.trim(),
        password: formData.password,
      });

      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        const session = await getSession();
        const role = (session?.user as { role?: string } | undefined)?.role;

        if (role === 'personal') {
          router.push('/personal');
        } else {
          router.push('/home');
        }
      }
    } else {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userType, termsAccepted, privacyAccepted })
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t('errors.registrationFailed'));
        setIsLoading(false);
        return;
      }

      setIsLogin(true);
      setIsLoading(false);
      setCrefVerified(false);
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    }
  } catch {
    setError(t('errors.connectionFailed'));
    setIsLoading(false);
  }
}, [isLogin, formData, userType, crefVerified, router]);

  const inputClass = "w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-800/50 text-white focus:border-orange-500 outline-none transition-all";
  const labelClass = "text-xs font-bold text-zinc-400 uppercase ml-1 flex items-center gap-1";
  const selectClass = "w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-800/50 text-white focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer";
  const textareaClass = "w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-800/50 text-white focus:border-orange-500 outline-none transition-all resize-none";
  const sectionTitleClass = "md:col-span-2 text-xs font-black text-orange-500 uppercase tracking-widest pt-2 pb-1 border-b border-zinc-800 flex items-center gap-2";

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-t-orange-600 border-zinc-800 rounded-full animate-spin" />
      </div>
    );
  }

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
                  <h3 className="text-4xl font-black text-white mb-2 italic">{t('login.title')}</h3>
                  <p className="text-zinc-500 mb-8 font-medium">{t('login.subtitle')}</p>
                  <form className="space-y-4" onSubmit={handleAuth}>
                    <div className="space-y-1">
                      <label className={labelClass}><Mail className="w-3 h-3" /> {t('login.emailLabel')} <span className="text-red-500">*</span></label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder={t('login.emailPlaceholder')} className={inputClass} required />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center px-1">
                        <label className={labelClass}><Lock className="w-3 h-3" /> {t('login.passwordLabel')} <span className="text-red-500">*</span></label>
                        <button type="button" className="text-xs font-bold text-orange-500 hover:text-orange-400 cursor-pointer">{t('login.forgotPassword')}</button>
                      </div>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className={inputClass} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <motion.button disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 text-black font-black py-4 rounded-xl shadow-lg uppercase italic tracking-tighter flex items-center justify-center cursor-pointer disabled:cursor-not-allowed">
                      {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : t('login.signIn')}
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="signup" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <h3 className="text-4xl font-black text-white mb-2 italic uppercase">{t('register.title')}</h3>
                  <p className="text-zinc-500 mb-6 font-medium">{t('register.subtitle')}</p>

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
                      <Dumbbell className="w-4 h-4" /> {t('register.userTypeAthlete')}
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
                      <IdCard className="w-4 h-4" /> {t('register.userTypePersonal')}
                    </button>
                  </div>

                  <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAuth}>
                    
                    {userType === 'atleta' && (
                      <>
                        <p className={sectionTitleClass}><User className="w-3.5 h-3.5" /> {t('register.personalData')}</p>

                        <div className="space-y-1 md:col-span-2">
                          <label className={labelClass}><User className="w-3 h-3" /> {t('register.fullName')} <span className="text-red-500">*</span></label>
                          <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder={t('register.fullName')} className={inputClass} required />
                        </div>

                        <div className="space-y-1">
                          <label className={labelClass}><IdCard className="w-3 h-3" /> {t('register.cpf')} <span className="text-red-500">*</span></label>
                          <input type="text" name="cpf" value={formData.cpf} onChange={handleInputChange} placeholder={t('register.cpfPlaceholder')} className={inputClass} required />
                        </div>

                        <div className="space-y-1">
                          <label className={labelClass}><Mail className="w-3 h-3" /> {t('register.emailLabel')} <span className="text-red-500">*</span></label>
                          <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder={t('login.emailPlaceholder')} className={inputClass} required />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center px-1">
                            <label className={labelClass}><MapPin className="w-3 h-3" /> {t('register.zipCode')} <span className="text-red-500">*</span></label>
                            <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-orange-500 flex items-center hover:underline uppercase italic cursor-pointer">{t('register.dontKnowZip')} <ExternalLink className="w-2 h-2 ml-1" /></a>
                          </div>
                          <input type="text" name="cep" value={formData.cep} onChange={handleInputChange} placeholder={t('register.zipPlaceholder')} className={inputClass} required />
                        </div>

                        <div className="space-y-1 grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className={labelClass}>{t('register.city')} <span className="text-red-500">*</span></label>
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder={t('register.city')} className={inputClass} required />
                          </div>
                          <div>
                            <label className={labelClass}>{t('register.state')} <span className="text-red-500">*</span></label>
                            <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder={t('register.state')} className={inputClass + " text-center"} maxLength={2} required />
                          </div>
                        </div>

                        <p className={sectionTitleClass}><Activity className="w-3.5 h-3.5" /> {t('register.physicalInfo')}</p>

                        <div className="space-y-1">
                          <label className={labelClass}>{t('register.age')} <span className="text-red-500">*</span></label>
                          <input type="number" name="age" value={formData.age} onChange={handleInputChange} placeholder={t('register.agePlaceholder')} min={10} max={100} className={inputClass} required />
                        </div>

                        <div className="space-y-1">
                          <label className={labelClass}>{t('register.gender')} <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <select name="sex" value={formData.sex} onChange={handleInputChange} className={selectClass} aria-label={t('register.gender')} required>
                              <option value="" disabled>{t('register.selectDefault')}</option>
                              <option value="masculino">{t('register.genderMale')}</option>
                              <option value="feminino">{t('register.genderFemale')}</option>
                              <option value="outro">{t('register.genderOther')}</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className={labelClass}>{t('register.height')} <span className="text-red-500">*</span></label>
                          <input type="number" name="height" value={formData.height} onChange={handleInputChange} placeholder={t('register.heightPlaceholder')} min={100} max={250} className={inputClass} required />
                        </div>

                        <div className="space-y-1">
                          <label className={labelClass}>{t('register.weight')} <span className="text-red-500">*</span></label>
                          <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} placeholder={t('register.weightPlaceholder')} min={30} max={300} className={inputClass} required />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className={labelClass}><Dumbbell className="w-3 h-3" /> {t('register.experienceLevel')} <span className="text-red-500">*</span></label>
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

                        <p className={sectionTitleClass}><Heart className="w-3.5 h-3.5" /> {t('register.health')}</p>

                        <div className="space-y-1 md:col-span-2">
                          <label className={labelClass}>{t('register.injury')}</label>
                          <textarea
                            name="injury"
                            value={formData.injury}
                            onChange={handleInputChange}
                            placeholder={t('register.injuryPlaceholder')}
                            rows={2}
                            className={textareaClass}
                          />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className={labelClass}>{t('register.healthIssues')}</label>
                          <textarea
                            name="healthIssues"
                            value={formData.healthIssues}
                            onChange={handleInputChange}
                            placeholder={t('register.healthIssuesPlaceholder')}
                            rows={2}
                            className={textareaClass}
                          />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className={labelClass}>{t('register.medications')}</label>
                          <input
                            type="text"
                            name="medications"
                            value={formData.medications}
                            onChange={handleInputChange}
                            placeholder={t('register.medicationsPlaceholder')}
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
                              {t('register.crefDescription')}
                            </p>
                            <div className="space-y-1">
                              <label className={labelClass}><IdCard className="w-3 h-3" /> {t('register.crefNumber')} <span className="text-red-500">*</span></label>
                              <input 
                                type="text" 
                                name="cref" 
                                value={formData.cref} 
                                onChange={handleInputChange} 
                                placeholder={t('register.crefPlaceholder')} 
                                className={inputClass} 
                                required 
                              />
                            </div>
                            <motion.button
                              type="button"
                              onClick={verifyCref}
                              disabled={isVerifyingCref || formData.cref.length < 5}
                              className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 border border-zinc-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                            >
                              {isVerifyingCref ? <Loader2 className="w-5 h-5 animate-spin" /> : t('register.verifyCref')}
                            </motion.button>
                          </div>
                        ) : (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center gap-3">
                              <CheckCircle2 className="w-5 h-5 shrink-0" />
                              <span className="text-sm font-bold">{t('register.crefVerified')}</span>
                            </div>
                            
                            <p className={sectionTitleClass}><User className="w-3.5 h-3.5" /> {t('register.personalDataTitle')}</p>
                            
                            <div className="space-y-1">
                              <label className={labelClass}><User className="w-3 h-3" /> {t('register.fullName')} <span className="text-red-500">*</span></label>
                              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder={t('register.fullName')} className={inputClass} required />
                            </div>

                            <div className="space-y-1">
<label className={labelClass}><Mail className="w-3 h-3" /> {t('login.emailLabel')} <span className="text-red-500">*</span></label>
                              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder={t('login.emailPlaceholder')} className={inputClass} required />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {(userType === 'atleta' || (userType === 'personal' && crefVerified)) && (
                      <>
                        <p className={sectionTitleClass}><Lock className="w-3.5 h-3.5" /> {t('register.security')}</p>

                        <div className="space-y-1">
                        <label className={labelClass}><Lock className="w-3 h-3" /> {t('login.passwordLabel')} <span className="text-red-500">*</span></label>
                          <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className={inputClass} required />
                        </div>

                        <div className="space-y-1">
                          <label className={labelClass}><Lock className="w-3 h-3" /> {t('register.confirmPassword')} <span className="text-red-500">*</span></label>
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
                      <>
                        <div className="md:col-span-2 space-y-3 pt-2 border-t border-zinc-800">
                          <p className={sectionTitleClass}>{t('register.privacy')}</p>
                          <label className="flex items-start gap-3 cursor-pointer text-left">
                            <input
                              type="checkbox"
                              checked={termsAccepted}
                              onChange={(e) => setTermsAccepted(e.target.checked)}
                              className="mt-1 rounded border-zinc-600 accent-orange-500"
                              required
                            />
                            <span className="text-xs text-zinc-400 leading-relaxed">
                              Aceito os{' '}
                              <a href="/TermsPage" target="_blank" className="text-orange-500 underline hover:text-orange-400">
{t('register.termsOfUse')}
                              </a>{' '}
                              e autorizo o tratamento dos meus dados conforme a{' '}
                              <a href="/privacy" target="_blank" className="text-orange-500 underline hover:text-orange-400">
{t('register.privacyPolicy')}
                              </a>{' '}
                              (LGPD). <span className="text-red-500">*</span>
                            </span>
                          </label>
                          <label className="flex items-start gap-3 cursor-pointer text-left">
                            <input
                              type="checkbox"
                              checked={privacyAccepted}
                              onChange={(e) => setPrivacyAccepted(e.target.checked)}
                              className="mt-1 rounded border-zinc-600 accent-orange-500"
                              required
                            />
                            <span className="text-xs text-zinc-400 leading-relaxed">
{t('register.emailConsent')}
                            </span>
                          </label>
                        </div>
                        <motion.button
                          disabled={isLoading}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="md:col-span-2 w-full bg-white hover:bg-zinc-200 disabled:bg-zinc-700 text-black font-black py-4 rounded-xl shadow-lg uppercase italic mt-4 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                        >
                          {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-black" /> : t('register.submit')}
                        </motion.button>
                      </>
                    )}
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center">
              <button onClick={() => { setIsLogin(!isLogin); setError(null); setCrefVerified(false); }} className="text-zinc-400 text-sm font-medium hover:text-white transition-colors cursor-pointer">
                {isLogin ? t('register.noAccount') : t('register.alreadyMember')}
                <span className="text-orange-500 font-bold underline decoration-zinc-800 italic cursor-pointer">{isLogin ? t('register.createProfile') : t('login.doLogin')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}