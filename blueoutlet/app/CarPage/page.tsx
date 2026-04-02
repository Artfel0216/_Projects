'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Truck, Tag, ShieldCheck, MapPin, AlertTriangle, CreditCard, QrCode } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface CartItem {
  id: number;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
}

interface CepData {
  logradouro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

const formatCep = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .substring(0, 9);
};

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingZip, setShippingZip] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [cepData, setCepData] = useState<CepData | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discountValue, setDiscountValue] = useState(0);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const suggestedProducts = [
    { id: 101, name: "Meias Performance Crew", price: 49.90, image: "https://images.unsplash.com/photo-1582719188393-bb71ca45dbb9?q=80&w=400&auto=format&fit=crop" },
    { id: 102, name: "Boné Snapback Premium", price: 129.00, image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=400&auto=format&fit=crop" },
    { id: 103, name: "Cinto de Couro Italiano", price: 199.90, image: "https://images.unsplash.com/photo-1624222247344-550fb80ffb8d?q=80&w=400&auto=format&fit=crop" },
  ];

  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Erro ao carregar carrinho");
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cartItems]);
  const shipping = useMemo(() => (subtotal > 400 || subtotal === 0) ? 0 : 25.00, [subtotal]);
  const total = useMemo(() => Math.max(0, subtotal + shipping - discountValue), [subtotal, shipping, discountValue]);
  const freeShippingThreshold = 400;
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const updateQuantity = (id: number, type: 'increase' | 'decrease') => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = type === 'increase' ? item.quantity + 1 : item.quantity - 1;
        return { ...item, quantity: Math.max(1, newQuantity) };
      }
      return item;
    }));
  };

  const confirmRemoveItem = () => {
    if (itemToDelete === null) return;
    setCartItems(prev => prev.filter(item => item.id !== itemToDelete));
    toast.success('Produto removido');
    setItemToDelete(null);
  };

  const calculateShipping = async () => {
    const rawCep = shippingZip.replace(/\D/g, '');
    if (rawCep.length !== 8) {
      toast.error('CEP incompleto');
      return;
    }
    setIsCalculatingShipping(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
      const data = await res.json();
      if (data.erro) throw new Error();
      setCepData(data);
      toast.success('Frete calculado');
    } catch {
      toast.error('CEP não encontrado');
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const applyDiscount = () => {
    if (!discountCode.trim()) return;
    setIsApplyingDiscount(true);
    setTimeout(() => {
      if (discountCode.toUpperCase() === 'PRO10') {
        setDiscountValue(subtotal * 0.10);
        toast.success('Cupom aplicado!');
      } else {
        setDiscountValue(0);
        toast.error('Cupom inválido');
      }
      setIsApplyingDiscount(false);
    }, 600);
  };

  const handleFinishPurchase = () => {
    if (cartItems.length === 0) return;
    const cartData = encodeURIComponent(JSON.stringify(cartItems));
    router.push(`/PaymentPage?items=${cartData}&total=${total.toFixed(2)}`);
  };

  if (!isLoaded) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black text-white font-sans selection:bg-white selection:text-black">
      <Toaster position="top-right" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid #333' } }} />
      
      {itemToDelete !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-60 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-4 text-red-500">
              <AlertTriangle size={32} />
              <h3 className="text-xl font-bold">Remover item?</h3>
            </div>
            <p className="text-gray-400 text-sm">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-4">
              <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">Sair</button>
              <button onClick={confirmRemoveItem} className="flex-1 py-3 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition-all">Excluir</button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Cart</h1>
          <div className="bg-white/5 border border-white/10 px-5 py-2 rounded-full text-xs font-bold tracking-widest text-gray-400">
            {cartItems.length} MODELOS
          </div>
        </header>

        {cartItems.length === 0 ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
            <ShoppingBag size={80} className="text-gray-800" />
            <h2 className="text-3xl font-bold text-gray-400">Vazio.</h2>
            <button onClick={() => router.push('/MenProductPage')} className="px-10 py-4 bg-white text-black font-black uppercase tracking-tighter rounded-full hover:scale-105 transition-transform">Shop Now</button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-3">
                  <span>Frete Grátis</span>
                  <span>{freeShippingProgress >= 100 ? 'Ativado' : `Faltam R$ ${(freeShippingThreshold - subtotal).toFixed(2)}`}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-700 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ width: `${freeShippingProgress}%` }} />
                </div>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="group bg-white/3 border border-white/5 p-4 md:p-6 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/6 transition-all">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-black rounded-2xl overflow-hidden shrink-0 border border-white/5">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg md:text-xl tracking-tight leading-none mb-2">{item.name}</h3>
                      <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full text-gray-400">{item.variant}</span>
                    </div>
                    <div className="flex flex-col items-end gap-4">
                      <button onClick={() => setItemToDelete(item.id)} className="text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                      <div className="flex items-center bg-black rounded-full border border-white/10 p-1">
                        <button onClick={() => updateQuantity(item.id, 'decrease')} disabled={item.quantity <= 1} className="p-1.5 hover:text-white text-gray-500 disabled:opacity-20"><Minus size={14} /></button>
                        <span className="w-8 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 'increase')} className="p-1.5 hover:text-white text-gray-500"><Plus size={14} /></button>
                      </div>
                      <span className="font-black text-lg tabular-nums">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-gray-500">Upgrade your kit</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {suggestedProducts.map(p => (
                    <div key={p.id} className="group relative bg-black/40 p-4 rounded-3xl border border-white/5 hover:border-white/20 transition-all">
                      <img src={p.image} className="w-full h-24 object-cover rounded-xl mb-3 grayscale group-hover:grayscale-0 opacity-50 group-hover:opacity-100 transition-all" alt={p.name} />
                      <h4 className="text-[10px] font-bold uppercase mb-2 truncate">{p.name}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black">R$ {p.price.toFixed(2)}</span>
                        <button onClick={() => setCartItems(prev => [...prev, {...p, variant: 'Único', quantity: 1}])} className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform"><Plus size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="sticky top-8 bg-white text-black rounded-[3rem] p-8 md:p-10 shadow-2xl">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8">Summary</h2>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-gray-500"><Truck size={12} /> Shipping</label>
                    <div className="flex gap-2">
                      <input type="text" value={shippingZip} onChange={(e) => setShippingZip(formatCep(e.target.value))} placeholder="00000-000" className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-black outline-none" />
                      <button onClick={calculateShipping} disabled={isCalculatingShipping} className="px-4 bg-black text-white rounded-xl text-[10px] font-bold uppercase">{isCalculatingShipping ? '...' : 'Ok'}</button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-gray-500"><Tag size={12} /> Discount</label>
                    <div className="flex gap-2">
                      <input type="text" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="CODE" className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-black outline-none uppercase" />
                      <button onClick={applyDiscount} disabled={isApplyingDiscount} className="px-4 bg-gray-200 rounded-xl text-[10px] font-bold uppercase">{isApplyingDiscount ? '...' : 'Apply'}</button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-black/5 space-y-3 font-bold text-sm">
                    <div className="flex justify-between"><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
                    {discountValue > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>- R$ {discountValue.toFixed(2)}</span></div>}
                    <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `R$ ${shipping.toFixed(2)}`}</span></div>
                  </div>

                  <div className="pt-6 border-t border-black/10">
                    <div className="flex justify-between items-baseline mb-8">
                      <span className="text-xs font-black uppercase">Total</span>
                      <span className="text-4xl font-black tracking-tighter">R$ {total.toFixed(2)}</span>
                    </div>

                    <button onClick={handleFinishPurchase} className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-900 transition-all group">
                      Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="mt-8 flex flex-col items-center gap-4">
                      <div className="flex gap-4 opacity-30 grayscale">
                        <CreditCard size={20} /> <QrCode size={20} /> <ShieldCheck size={20} />
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Secure encrypted transaction</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}