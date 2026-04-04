'use client';

import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, QrCode, Smartphone, Lock, CheckCircle, 
  Copy, Loader2, ShieldCheck, Zap, AlertCircle, XCircle 
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { initMercadoPago } from '@mercadopago/sdk-react';
import { toast } from 'sonner';

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || 'APP_USR-07b3b401-1b38-4bce-beac-1399cebd59b8', { locale: 'pt-BR' });

interface CartItem {
  id: string | number;
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        console.error("Erro ao decodificar itens", e);
        toast.error("Erro ao carregar itens do carrinho");
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
      toast.success("Código copiado com sucesso!");
      setTimeout(() => setCopied(false), 2000);
    }
  }, [pixData]);

  const maskCardNumber = (value: string) => value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
  const maskExpiry = (value: string) => value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substring(0, 5);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod !== 'pix') return;
    if (total <= 0) {
      toast.error("Valor da transação inválido");
      return;
    }

    setIsProcessing(true);
    setPixData(null);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionAmount: Number(total.toFixed(2)),
          email: 'cliente@teste.com',
          items: items.map(item => ({
            id: item.id,
            title: item.name,
            unit_price: item.price,
            quantity: item.quantity
          }))
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success && result.data?.point_of_interaction?.transaction_data) {
        const { qr_code_base64, qr_code } = result.data.point_of_interaction.transaction_data;
        setPixData({ qrCodeBase64: qr_code_base64, copiaECola: qr_code });
        toast.success("Pagamento PIX gerado!");
      } else {
        const errorMsg = result.error || 'Erro ao processar pagamento com o Mercado Pago';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      const msg = error.message || 'Falha na comunicação com o servidor';
      setErrorMessage(msg);
      toast.error(msg);
      console.error("Payment Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formattedTotal = useMemo(() => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)
  , [total]);

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-emerald-500/30 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
        
        <aside className="lg:col-span-5 p-8 sm:p-12 bg-white/2 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-between">
          <div className="space-y-10">
            <header>
              <h2 className="text-3xl font-black tracking-tighter italic uppercase text-white">Checkout.</h2>
              <div className="h-1 w-12 bg-emerald-500 mt-2 rounded-full" />
            </header>
            
            <div className="space-y-4 max-h-100 overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={`${item.id}-${idx}`} 
                  className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5"
                >
                  <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
                  <div className="flex flex-col justify-center gap-1">
                    <h4 className="font-bold text-xs text-white/90 truncate max-w-50">{item.name}</h4>
                    <p className="text-[9px] uppercase tracking-widest text-white/40">{item.variant}</p>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {item.quantity}x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Total</span>
              <span className="text-4xl font-black text-white tracking-tighter italic">{formattedTotal}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-500/50 text-[9px] font-bold uppercase tracking-widest">
              <ShieldCheck size={12} /> SSL 256-bit Encrypted
            </div>
          </div>
        </aside>

        <main className="lg:col-span-7 p-8 sm:p-12 bg-black/20">
          <div className="max-w-md mx-auto space-y-10">
            <nav className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
              {(['pix', 'credit', 'debit'] as const).map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => { setPaymentMethod(method); setPixData(null); setErrorMessage(null); }}
                  className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-2
                    ${paymentMethod === method ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-white/30 hover:text-white'}`}
                >
                  {method === 'pix' ? <QrCode size={18} /> : method === 'credit' ? <CreditCard size={18} /> : <Smartphone size={18} />}
                  {method}
                </button>
              ))}
            </nav>

            <AnimatePresence mode="wait">
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400"
                >
                  <XCircle size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handlePayment} className="space-y-6">
              {paymentMethod === 'pix' ? (
                <div className="space-y-6">
                  <div className={`flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-white/2 border-2 border-dashed transition-all min-h-80 
                    ${pixData ? 'border-emerald-500/40' : 'border-white/5'}`}>
                    {pixData ? (
                      <div className="w-full space-y-6 flex flex-col items-center animate-in zoom-in duration-500">
                        <div className="p-4 bg-white rounded-3xl">
                          <img src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="PIX QR" className="w-40 h-40" />
                        </div>
                        <div className="w-full space-y-2">
                          <button type="button" onClick={handleCopyPix} className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black transition-all
                            ${copied ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white hover:bg-white hover:text-black'}`}>
                            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                            {copied ? 'COPIADO' : 'COPIAR CÓDIGO PIX'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-4 text-white/20">
                        <QrCode size={48} strokeWidth={1} className="mx-auto" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">O QR Code aparecerá aqui</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 opacity-50 pointer-events-none grayscale">
                  <div className="p-6 rounded-4xl bg-amber-500/5 border border-amber-500/10 text-amber-500 text-center">
                    <AlertCircle size={24} className="mx-auto mb-2" />
                    <p className="text-[9px] font-black uppercase tracking-widest">Cartão em manutenção. Use PIX.</p>
                  </div>
                </div>
              )}

              {!pixData && (
                <button
                  type="submit"
                  disabled={isProcessing || paymentMethod !== 'pix'}
                  className="w-full py-6 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-20"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Lock size={16} />}
                  {isProcessing ? 'GERANDO...' : `PAGAR ${formattedTotal}`}
                </button>
              )}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}>
      <PaymentContent />
    </Suspense>
  );
}