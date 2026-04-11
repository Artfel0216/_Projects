"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { ChevronLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Carregamento dinâmico com SSR desativado para evitar o erro de Public Key no servidor
const CardPayment = dynamic(
  () => import('@mercadopago/sdk-react').then((mod) => mod.CardPayment),
  { 
    ssr: false,
    loading: () => <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
  }
);

export default function PaymentPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [mpInitialized, setMpInitialized] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const initMP = async () => {
      const { initMercadoPago } = await import('@mercadopago/sdk-react');
      const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

      if (publicKey && publicKey.length > 0) {
        initMercadoPago(publicKey);
        setMpInitialized(true);
      }
    };

    initMP();
    router.prefetch('/success');
  }, [router]);

  const initialization = useMemo(() => ({
    amount: 100,
    payer: { email: 'cliente@wegym.com' }
  }), []);

  const customization = useMemo(() => ({
    visual: { 
      theme: 'dark' as const,
      hideStatusScreen: true,
    },
    paymentMethods: { maxInstallments: 1 }
  }), []);

  const onSubmit = async (formData: any) => {
    console.log("Dados do formulário prontos:", formData);
    // O backend será integrado depois
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-sans">
      <header className="flex items-center justify-between mb-10">
        <button 
          onClick={() => router.back()} 
          className="p-2 bg-white/5 rounded-full active:scale-95 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-black italic uppercase tracking-tighter text-lg leading-none">Checkout</h1>
          <span className="text-[8px] text-zinc-500 uppercase tracking-[0.3em] mt-1 font-bold">Wegym Elite</span>
        </div>
        <ShieldCheck size={22} className="text-orange-500" />
      </header>

      <main className="max-w-md mx-auto">
        {/* Card de Resumo do Plano */}
        <div className="mb-6 p-6 bg-linear-to-br from-zinc-900 to-zinc-950 border border-white/5 rounded-[35px] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Plano Selecionado</p>
            <h2 className="text-xl font-black italic uppercase leading-none">Wegym Pro</h2>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black italic">R$ 100</p>
            <p className="text-[8px] text-zinc-500 font-bold uppercase">Pagamento único</p>
          </div>
        </div>

        {/* Container do Formulário de Cartão */}
        <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-[35px] shadow-2xl min-h-105 flex flex-col justify-center">
          {isClient && mpInitialized ? (
            <CardPayment
              initialization={initialization}
              customization={customization}
              onSubmit={onSubmit}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
              <div>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] italic">
                  Configurando Gateway...
                </p>
                <p className="text-[8px] text-zinc-700 font-bold uppercase mt-1">Ambiente Criptografado de Ponta a Ponta</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest opacity-50">
            Powered by Mercado Pago
          </p>
          <div className="flex gap-2 opacity-20 grayscale">
            <div className="w-8 h-5 bg-zinc-800 rounded-sm" />
            <div className="w-8 h-5 bg-zinc-800 rounded-sm" />
            <div className="w-8 h-5 bg-zinc-800 rounded-sm" />
          </div>
        </div>
      </main>
    </div>
  );
}