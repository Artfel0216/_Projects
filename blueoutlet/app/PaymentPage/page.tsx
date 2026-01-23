'use client';

import React, { useState } from 'react';
import { CreditCard, QrCode, Smartphone, Minus, Plus, Lock, CheckCircle } from 'lucide-react';

export default function PaymentPage() {
  const [product] = useState({
    id: 1,
    name: "Headphone Noise Cancelling Pro",
    description: "Experiência sonora imersiva com cancelamento de ruído ativo e 30h de bateria.",
    brand: "SoundTech",
    price: 250.00,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60"
  });

  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [isAnimating, setIsAnimating] = useState(false);

  const total = product.price * quantity;

  const handleQuantityChange = (type: string) => {
    if (type === 'decrease' && quantity > 1) {
      setQuantity(q => q - 1);
    } else if (type === 'increase') {
      setQuantity(q => q + 1);
    }
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnimating(true);
    setTimeout(() => {
      alert(`Pagamento de R$ ${total.toFixed(2)} processado via ${paymentMethod.toUpperCase()}!`);
      setIsAnimating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-5xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in-up">
        
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-between bg-black/40">
          <div>
            <span className="bg-white/10 text-gray-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-white/10">
              {product.brand}
            </span>
            <h2 className="text-3xl font-bold mt-4 mb-2">{product.name}</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {product.description}
            </p>
            
            <div className="relative group w-full h-64 rounded-2xl overflow-hidden mb-6 border border-white/10">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110 grayscale"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="text-gray-300">Quantidade</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleQuantityChange('decrease')}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  <Minus size={18} />
                </button>
                <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange('increase')}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-end pt-4 border-t border-white/10">
              <span className="text-lg text-gray-400">Total a pagar</span>
              <div className="text-right">
                <span className="text-sm text-gray-500 line-through mr-2">
                  R$ {(product.price * quantity * 1.2).toFixed(2)}
                </span>
                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  R$ {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 bg-black/20 relative">
          <h3 className="text-2xl font-semibold mb-6">Dados de Pagamento</h3>

          <div className="grid grid-cols-3 gap-2 mb-8 p-1 bg-black/40 rounded-xl border border-white/5">
            {['credit', 'debit', 'pix'].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`
                  flex flex-col items-center justify-center py-3 rounded-lg text-sm font-medium transition-all duration-300
                  ${paymentMethod === method 
                    ? 'bg-white text-black shadow-lg scale-105' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
                `}
              >
                {method === 'pix' && <QrCode size={20} className="mb-1" />}
                {method === 'credit' && <CreditCard size={20} className="mb-1" />}
                {method === 'debit' && <Smartphone size={20} className="mb-1" />}
                {method === 'credit' ? 'Crédito' : method === 'debit' ? 'Débito' : 'Pix'}
              </button>
            ))}
          </div>

          <form onSubmit={handlePayment} className="space-y-5">
            
            {paymentMethod === 'pix' ? (
              <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-2xl border border-white/10 animate-fade-in">
                <QrCode size={120} className="text-white mb-4" />
                <p className="text-center text-gray-300 mb-4 text-sm">Escaneie o QR Code ou copie a chave abaixo.</p>
                <div className="w-full flex bg-black/30 p-2 rounded-lg border border-white/10">
                  <input readOnly value="00020126580014BR.GOV.BCB.PIX..." className="bg-transparent w-full text-xs text-gray-400 outline-none px-2" />
                  <button type="button" className="text-white text-xs font-bold hover:text-gray-300">COPIAR</button>
                </div>
                <div className="mt-4 flex items-center gap-2 text-white text-sm">
                   <CheckCircle size={16} /> Aprovação imediata
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-xs uppercase text-gray-500 tracking-wider">Nome no Cartão</label>
                  <input type="text" placeholder="SEU NOME COMPLETO" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all" required />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs uppercase text-gray-500 tracking-wider">Número do Cartão</label>
                  <div className="relative">
                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all" required />
                    <CreditCard className="absolute right-4 top-3 text-gray-500" size={20} />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2 space-y-2">
                    <label className="text-xs uppercase text-gray-500 tracking-wider">Validade</label>
                    <input type="text" placeholder="MM/AA" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all" required />
                  </div>
                  <div className="w-1/2 space-y-2">
                    <label className="text-xs uppercase text-gray-500 tracking-wider">CVV</label>
                    <input type="text" placeholder="123" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all" required />
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className={`
                w-full mt-8 py-4 bg-white text-black rounded-xl font-bold text-lg shadow-lg 
                hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2
                ${isAnimating ? 'opacity-75 cursor-wait' : ''}
              `}
            >
              {isAnimating ? 'Processando...' : (
                <>
                  <Lock size={18} /> Pagar R$ {total.toFixed(2)}
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              <Lock size={10} className="inline mr-1" />
              Pagamento 100% seguro e criptografado.
            </p>
          </form>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}