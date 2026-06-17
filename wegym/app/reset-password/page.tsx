"use client";

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error || 'Erro ao redefinir senha.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Falha de conexão.');
    } finally {
      setIsLoading(false);
    }
  }, [token, password, confirmPassword]);

  if (!token) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900/50 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full border border-zinc-800 text-center">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white mb-2">Link inválido</h1>
          <p className="text-zinc-400 text-sm mb-6">Este link de redefinição é inválido ou expirou.</p>
          <button onClick={() => router.push('/login')} className="text-orange-500 font-bold underline hover:text-orange-400 cursor-pointer">
            Voltar ao login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900/50 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full border border-zinc-800 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white mb-2">Senha redefinida!</h1>
          <p className="text-zinc-400 text-sm mb-6">Sua senha foi alterada com sucesso.</p>
          <button onClick={() => router.push('/login')} className="bg-orange-600 hover:bg-orange-700 text-white font-black px-6 py-3 rounded-xl cursor-pointer transition-colors">
            Fazer login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/50 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full border border-zinc-800">
        <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="text-white w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-white text-center mb-2">Redefinir senha</h1>
        <p className="text-zinc-400 text-sm text-center mb-6">Digite sua nova senha.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Nova senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-800/50 text-white focus:border-orange-500 outline-none transition-all mt-1"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Confirmar senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-800/50 text-white focus:border-orange-500 outline-none transition-all mt-1"
              required
            />
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-xl text-center font-bold">
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-700 text-white font-black py-4 rounded-xl flex items-center justify-center cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Redefinir senha'}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => router.push('/login')} className="text-zinc-400 text-sm hover:text-white transition-colors cursor-pointer">
            Voltar ao login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
