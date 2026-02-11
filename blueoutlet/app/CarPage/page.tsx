'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Truck, Tag, ShieldCheck } from 'lucide-react';

export default function CarPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Headphone Noise Cancelling Pro",
      variant: "Cor: Matte Black",
      price: 250.00,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60"
    },
    {
      id: 2,
      name: "Smartwatch Series 5",
      variant: "Pulseira: Silicone Preto",
      price: 120.00,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60"
    }
  ]);

  const [shippingZip, setShippingZip] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const updateQuantity = (id: number, type: 'increase' | 'decrease') => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = type === 'increase' ? item.quantity + 1 : item.quantity - 1;
        return { ...item, quantity: newQuantity < 1 ? 1 : newQuantity };
      }
      return item;
    }));
  };

  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleFinishPurchase = () => {
    const cartData = encodeURIComponent(JSON.stringify(cartItems));
    const totalPrice = (cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0) + (subtotal > 400 ? 0 : 25.00)).toFixed(2);
    
    router.push(`/PaymentPage?items=${cartData}&total=${totalPrice}`);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 400 ? 0 : 25.00;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black font-sans text-white p-4 md:p-8">
      <div className={`max-w-7xl mx-auto transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        
        <header className="mb-8 flex items-center justify-between animate-slide-down">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Seu Carrinho</h1>
          <div className="text-gray-400 flex items-center gap-2">
            <ShoppingBag size={20} />
            <span>{cartItems.reduce((acc, item) => acc + item.quantity, 0)} itens</span>
          </div>
        </header>

        {cartItems.length === 0 ? (
          <div className="w-full h-96 bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl flex flex-col items-center justify-center animate-fade-in">
            <ShoppingBag size={64} className="text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-300">Seu carrinho está vazio</h2>
            <button 
              onClick={() => router.push('/MenProductPage')}
              className="mt-6 px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Voltar às compras
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            <div className="w-full lg:w-2/3 space-y-6">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-6 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-800 shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110"
                      />
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg font-bold text-white">{item.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{item.variant}</p>
                    </div>

                    <div className="flex items-center bg-black/30 rounded-lg border border-white/10 p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, 'decrease')}
                        className="p-2 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 'increase')}
                        className="p-2 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="hidden sm:block text-right min-w-25">
                      <div className="text-xl font-bold">R$ {(item.price * item.quantity).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">R$ {item.price.toFixed(2)} un</div>
                    </div>

                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-1/3">
              <div className="sticky top-8 space-y-4">
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <h2 className="text-xl font-bold mb-6">Resumo do Pedido</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase text-gray-500 font-bold tracking-wider flex items-center gap-2">
                        <Truck size={14} /> Calcular Frete
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="00000-000" 
                          value={shippingZip}
                          onChange={(e) => setShippingZip(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/50 transition-colors"
                        />
                        <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors">
                          OK
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase text-gray-500 font-bold tracking-wider flex items-center gap-2">
                        <Tag size={14} /> Cupom de Desconto
                      </label>
                      <input 
                        type="text" 
                        placeholder="CÓDIGO" 
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span>R$ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Frete</span>
                      <span>{shipping === 0 ? <span className="text-white font-bold">GRÁTIS</span> : `R$ ${shipping.toFixed(2)}`}</span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 mt-4 pt-4 mb-6">
                    <div className="flex justify-between items-end">
                      <span className="text-lg font-medium text-gray-300">Total</span>
                      <span className="text-3xl font-bold text-white">R$ {total.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 text-right mt-1">em até 10x de R$ {(total/10).toFixed(2)} sem juros</p>
                  </div>

                  <button 
                    onClick={handleFinishPurchase}
                    className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-white/5 group"
                  >
                    FINALIZAR COMPRA
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
                    <ShieldCheck size={14} /> Compra Segura e Garantida
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-slide-down {
          animation: slideDown 0.6s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}