'use client';

import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, QrCode, Smartphone, Lock, CheckCircle, 
  Copy, Loader2, ShieldCheck, Zap, AlertCircle 
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { initMercadoPago } from '@mercadopago/sdk-react';

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || 'APP_USR-07b3b401-1b38-4bce-beac-1399cebd59b8', { locale: 'pt-BR' });

interface CartItem {
  id: number;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
}

type PaymentMethod = 'pix' | 'credit' | 'debit';

const PaymentContent = () => {
  const searchParams = useSearchParams();
  
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixData, setPixData] = useState<{ qrCodeBase64: string; copiaECola: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [cardData, setCardData] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: ''
  });

  useEffect(() => {
    const itemsParam = searchParams.get('items');
    const totalParam = searchParams.get('total');

    if (itemsParam) {
      try {
        const decodedItems = JSON.parse(decodeURIComponent(itemsParam));
        setItems(Array.isArray(decodedItems) ? decodedItems : []);
      } catch (e) {
        console.error("Malformed cart items", e);
      }
    }

    if (totalParam) {
      const parsedTotal = parseFloat(totalParam);
      setTotal(isNaN(parsedTotal) ? 0 : parsedTotal);
    }
  }, [searchParams]);

  const handleCopyPix = useCallback(() => {
    if (pixData?.copiaECola) {
      navigator.clipboard.writeText(pixData.copiaECola);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [pixData]);

  const maskCardNumber = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
  };

  const maskExpiry = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substring(0, 5);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod !== 'pix') return;

    setIsProcessing(true);
    setPixData(null);

    try {
      const response = await fetch('/api/pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionAmount: total,
          email: 'cliente@teste.com',
          items: items 
        }),
      });

      const result = await response.json();
      
      if (result.success && result.data?.point_of_interaction?.transaction_data) {
        const { qr_code_base64, qr_code } = result.data.point_of_interaction.transaction_data;
        setPixData({ qrCodeBase64: qr_code_base64, copiaECola: qr_code });
      } else {
        throw new Error('Payment generation failed');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formattedTotal = useMemo(() => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)
  , [total]);

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-emerald-500/30 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-0 bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
        
        <aside className="lg:col-span-5 p-8 sm:p-12 bg-white/2 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-between">
          <div>
            <header className="mb-10">
              <h2 className="text-3xl font-black tracking-tighter italic uppercase text-white">Checkout.</h2>
              <div className="h-1 w-12 bg-emerald-500 mt-2 rounded-full" />
            </header>
            
            <div className="space-y-4 max-h-100 overflow-y-auto pr-4 scrollbar-hide">
              {items.map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={`${item.id}-${idx}`} 
                  className="group flex gap-4 p-4 rounded-2xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="flex flex-col justify-between py-1 overflow-hidden">
                    <div>
                      <h4 className="font-bold text-sm truncate text-white/90">{item.name}</h4>
                      <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{item.variant}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/10 text-white/60">x{item.quantity}</span>
                      <span className="font-mono text-sm font-bold text-emerald-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Total a pagar</span>
              <span className="text-4xl font-black text-white tracking-tighter italic">
                {formattedTotal}
              </span>
            </div>
            <div className="flex items-center gap-2 text-emerald-500/60 text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck size={14} /> Transação Criptografada End-to-End
            </div>
          </div>
        </aside>

        <main className="lg:col-span-7 p-8 sm:p-12 relative bg-black/40">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-8 text-white flex items-center gap-3">
              Forma de Pagamento
              <span className="h-px flex-1 bg-white/5" />
            </h3>

            <nav className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5 mb-10">
              {(['pix', 'credit', 'debit'] as const).map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => { setPaymentMethod(method); setPixData(null); }}
                  className={`flex-1 flex flex-col items-center justify-center py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${paymentMethod === method 
                      ? 'bg-emerald-500 text-black shadow-[0_10px_20px_rgba(16,185,129,0.2)]' 
                      : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  {method === 'pix' && <QrCode size={18} className="mb-1.5" strokeWidth={2.5} />}
                  {method === 'credit' && <CreditCard size={18} className="mb-1.5" strokeWidth={2.5} />}
                  {method === 'debit' && <Smartphone size={18} className="mb-1.5" strokeWidth={2.5} />}
                  {method === 'credit' ? 'Crédito' : method === 'debit' ? 'Débito' : 'Pix'}
                </button>
              ))}
            </nav>

            <form onSubmit={handlePayment} className="space-y-6">
              {paymentMethod === 'pix' ? (
                <div className="relative group">
                  <div className={`flex flex-col items-center justify-center p-10 rounded-4xl bg-white/2 border border-dashed border-white/10 transition-all min-h-80 ${pixData ? 'border-emerald-500/50 bg-emerald-500/2' : ''}`}>
                    {pixData ? (
                      <div className="w-full space-y-6 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                        <div className="relative p-3 bg-white rounded-3xl shadow-2xl overflow-hidden">
                          <img src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="QR Code" className="w-48 h-48" />
                          <div className="absolute inset-0 border-[6px] border-black/5 rounded-3xl pointer-events-none" />
                        </div>
                        <div className="w-full space-y-3">
                          <p className="text-center text-[10px] font-bold text-white/40 uppercase tracking-widest">Copia e Cola</p>
                          <div className="group/copy flex items-center bg-black border border-white/10 p-2 rounded-xl transition-colors hover:border-emerald-500/50">
                            <input readOnly value={pixData.copiaECola} className="bg-transparent flex-1 text-[10px] text-white/60 font-mono outline-none px-3 truncate" />
                            <button type="button" onClick={handleCopyPix} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black transition-all ${copied ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white hover:bg-white'}`}>
                              {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                              {copied ? 'PRONTO' : 'COPIAR'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-4 opacity-40 group-hover:opacity-100 transition-opacity">
                        <div className="inline-flex p-5 rounded-full bg-white/5 mb-2">
                          <QrCode size={48} strokeWidth={1} />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">O QR Code será <br/> gerado instantaneamente</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                      <Zap size={14} fill="currentColor" /> Instantâneo
                    </div>
                    <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest">
                      <AlertCircle size={14} /> Validade: 30 min
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Titular do Cartão</label>
                    <input type="text" value={cardData.name} onChange={e => setCardData({...cardData, name: e.target.value.toUpperCase()})} placeholder="NOME COMO NO CARTÃO" className="w-full bg-white/3 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold placeholder-white/10 focus:border-white focus:bg-white/6 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Número</label>
                    <div className="relative">
                      <input type="text" value={cardData.number} onChange={e => setCardData({...cardData, number: maskCardNumber(e.target.value)})} placeholder="0000 0000 0000 0000" className="w-full bg-white/3 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold placeholder-white/10 focus:border-white focus:bg-white/6 outline-none transition-all" />
                      <CreditCard className="absolute right-5 top-1/2 -translate-y-1/2 text-white/10" size={20} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Expiração</label>
                      <input type="text" value={cardData.expiry} onChange={e => setCardData({...cardData, expiry: maskExpiry(e.target.value)})} placeholder="MM/AA" className="w-full bg-white/3 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-center outline-none transition-all focus:border-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">CVC</label>
                      <input type="password" maxLength={4} value={cardData.cvv} onChange={e => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '')})} placeholder="***" className="w-full bg-white/3 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-center outline-none transition-all focus:border-white" />
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200/60 text-[10px] font-bold uppercase tracking-wider text-center">
                    Pagamento via cartão temporariamente em manutenção
                  </div>
                </div>
              )}

              {!pixData && (
                <button
                  type="submit"
                  disabled={isProcessing || items.length === 0 || (paymentMethod !== 'pix')}
                  className="group relative w-full mt-6 py-6 bg-white disabled:bg-white/5 disabled:text-white/20 text-black rounded-3xl font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Lock size={16} strokeWidth={3} />}
                    {isProcessing ? 'PROCESSANDO' : `FINALIZAR ${formattedTotal}`}
                  </span>
                  <div className="absolute inset-0 bg-emerald-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              )}

              <footer className="pt-8 flex flex-col items-center gap-4">
                <div className="flex gap-4 opacity-20 grayscale brightness-200">
                  <img src="https://logodownload.org/wp-content/uploads/2014/07/visa-logo-1.png" className="h-4 object-contain" alt="Visa" />
                  <img src="https://logodownload.org/wp-content/uploads/2014/07/mastercard-logo-7.png" className="h-5 object-contain" alt="Mastercard" />
                  <img src="https://logodownload.org/wp-content/uploads/2015/03/pix-logo-1.png" className="h-4 object-contain" alt="Pix" />
                </div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] flex items-center gap-2">
                  <Lock size={10} /> Mercado Pago Gateway
                </p>
              </footer>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
        <span className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Sincronizando Segurança</span>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}