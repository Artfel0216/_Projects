// src/app/login/hooks/useLoginForm.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react'; 

export function useLoginForm() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<'atleta' | 'personal'>('atleta');
  const [isVerifyingCref, setIsVerifyingCref] = useState(false);
  const [crefVerified, setCrefVerified] = useState(false);

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

  const verifyCref = useCallback(async () => {
    setIsVerifyingCref(true);
    setError(null);
    
    setTimeout(() => {
      setIsVerifyingCref(false);
      const crefRegex = /^\d{6}-[A-Z]\/[A-Z]{2}$/;
      
      if (crefRegex.test(formData.cref)) {
        setCrefVerified(true);
      } else {
        setError("errors.invalidCref");
        setCrefVerified(false);
      }
    }, 1000);
  }, [formData.cref]);

  const handleAuth = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      return setError("errors.passwordMismatch");
    }

    if (!isLogin && userType === 'personal' && !crefVerified) {
      return setError("errors.crefRequired");
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

          router.push(role === 'personal' ? '/personal' : '/home');
        }
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, userType })
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "errors.registrationFailed");
          setIsLoading(false);
          return;
        }

        setIsLogin(true);
        setIsLoading(false);
        setCrefVerified(false);
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch {
      setError("errors.connectionFailed");
      setIsLoading(false);
    }
  }, [isLogin, formData, userType, crefVerified, router]);

  return {
    isLogin, setIsLogin,
    showPassword, setShowPassword,
    isLoading, error,
    userType, setUserType,
    isVerifyingCref, crefVerified,
    formData, handleInputChange,
    verifyCref, handleAuth
  };
}