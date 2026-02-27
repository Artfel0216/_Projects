'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Camera, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Package, 
  CreditCard,
  Edit3,
  CheckCircle2,
  X,
  Loader2 
} from 'lucide-react';

interface UserData {
  name: string;
  email: string;
  phone: string;
  role: string;
  bio: string;
  avatar: string | null;
}

interface AddressData {
  street: string;
  number: string;
  city: string;
  state: string;
  zip: string;
  complement: string;
}


const InputField = ({ 
  label, 
  value, 
  onChange, 
  icon: Icon, 
  placeholder,
  type = "text",
  disabled = false
}: { 
  label: string; 
  value: string; 
  onChange: (e: ChangeEvent<HTMLInputElement>) => void; 
  icon: any; 
  placeholder: string;
  type?: string;
  disabled?: boolean;
}) => (
  <div className="group space-y-2">
    <label className="text-xs font-medium text-white/40 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors duration-300">
        <Icon size={18} />
      </div>
      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-white/3 border rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-white/20 transition-all duration-300 focus:outline-none 
          ${disabled 
            ? "border-transparent opacity-60 cursor-not-allowed" 
            : "border-white/8 hover:border-white/20 focus:border-white/30 focus:bg-white/5"}`}
      />
    </div>
  </div>
);

const TabButton = ({ active, label, onClick, icon: Icon }: { active: boolean; label: string; onClick: () => void; icon: any }) => (
  <button 
    onClick={onClick}
    className={`relative px-6 py-4 flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${active ? "text-white" : "text-white/40 hover:text-white/70"}`}
  >
    <Icon size={16} />
    <span>{label}</span>
    {active && (
      <motion.div 
        layoutId="activeTab"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
      />
    )}
  </button>
);

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'personal' | 'address' | 'orders'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<UserData>({
    name: "",
    email: "",
    phone: "",
    role: "",
    bio: "",
    avatar: null
  });

  const [address, setAddress] = useState<AddressData>({
    street: "",
    number: "",
    city: "",
    state: "",
    zip: "",
    complement: ""
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          if (data.user) setUser(prev => ({ ...prev, ...data.user }));
          if (data.address) setAddress(prev => ({ ...prev, ...data.address }));
        }
      } catch (error) {
        console.error("Erro ao carregar os dados:", error);
      }
    };
    
    loadUserData();
  }, []);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUser(prev => ({ ...prev, avatar: base64String }));
        setIsEditing(true); 
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUser(prev => ({ ...prev, avatar: null }));
    setIsEditing(true);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user, address }),
      });
      
      if (response.ok) {
        setIsEditing(false); 
      } else {
        console.error("Erro ao salvar os dados no servidor");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black relative overflow-x-hidden">
      
      <div className="fixed top-[-20%] left-[-10%] w-[150%] h-[150%] bg-white/2 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[125%] h-[125%] bg-white/2 rounded-full blur-[100px] pointer-events-none" />

      <motion.main 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20"
      >
        
        <div className="relative bg-white/2 border border-white/8 backdrop-blur-2xl rounded-3xl p-8 md:p-10 mb-8 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent opacity-50" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 border border-white/10 bg-black relative z-10 overflow-hidden shadow-2xl">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center rounded-full text-white/20">
                    <User size={48} />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                  <button 
                    onClick={triggerFileInput}
                    className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
                    title="Alterar foto"
                  >
                    <Camera size={20} />
                  </button>
                  {user.avatar && (
                    <button 
                      onClick={removeImage}
                      className="p-2.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20"
                      title="Remover foto"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>
              
              <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl scale-110 -z-10 group-hover:bg-white/10 transition-colors duration-500" />
            </div>

            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-1">{user.name || "Usuário"}</h1>
                  <p className="text-white/50 text-sm font-light tracking-wide flex items-center justify-center md:justify-start gap-2">
                    <Mail size={14} /> {user.email || "email@exemplo.com"}
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSaving}
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className={`
                    px-6 py-2 rounded-full text-sm font-medium border flex items-center gap-2 transition-all duration-300
                    ${isEditing 
                      ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:bg-gray-100" 
                      : "bg-white/5 text-white border-white/10 hover:bg-white/10"}
                    ${isSaving ? "opacity-70 cursor-wait" : ""}
                  `}
                >
                  {isSaving ? (
                    <> <Loader2 size={16} className="animate-spin" /> Salvando... </>
                  ) : isEditing ? (
                    <> <Save size={16} /> Salvar Alterações </>
                  ) : (
                    <> <Edit3 size={16} /> Editar Perfil </>
                  )}
                </motion.button>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                 <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                    <CheckCircle2 size={12} /> Cliente Verificado
                 </span>
                 <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-medium flex items-center gap-1.5">
                    <Package size={12} /> 0 Pedidos Realizados
                 </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          <nav className="lg:w-64 shrink-0">
            <div className="sticky top-24 bg-white/2 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl flex lg:flex-col overflow-x-auto lg:overflow-visible">
              <TabButton 
                active={activeTab === 'personal'} 
                label="Dados Pessoais" 
                icon={User} 
                onClick={() => setActiveTab('personal')} 
              />
              <TabButton 
                active={activeTab === 'address'} 
                label="Endereço de Entrega" 
                icon={MapPin} 
                onClick={() => setActiveTab('address')} 
              />
              <TabButton 
                active={activeTab === 'orders'} 
                label="Meus Pedidos" 
                icon={Package} 
                onClick={() => setActiveTab('orders')} 
              />
              
              <div className="hidden lg:block h-px bg-white/10 mx-4 my-2" />
              
              <button 
                onClick={() => {
                  window.location.reload();
                }}
                className="hidden lg:flex w-full px-6 py-4 items-center gap-2 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-colors"
              >
                 <X size={16} /> Sair da conta
              </button>
            </div>
          </nav>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              
              {activeTab === 'personal' && (
                <motion.div 
                  key="personal"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="bg-white/2 border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                    <div className="mb-6 pb-6 border-b border-white/5">
                      <h2 className="text-xl font-semibold text-white">Informações Pessoais</h2>
                      <p className="text-white/40 text-sm mt-1">Gerencie seus dados de identificação e contato.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField 
                        label="Nome Completo"
                        icon={User}
                        value={user.name}
                        onChange={(e) => setUser({...user, name: e.target.value})}
                        placeholder="Seu nome"
                        disabled={!isEditing}
                      />
                      <InputField 
                        label="Cargo / Profissão"
                        icon={CreditCard}
                        value={user.role}
                        onChange={(e) => setUser({...user, role: e.target.value})}
                        placeholder="Ex: Designer"
                        disabled={!isEditing}
                      />
                      <InputField 
                        label="E-mail"
                        icon={Mail}
                        type="email"
                        value={user.email}
                        onChange={(e) => setUser({...user, email: e.target.value})}
                        placeholder="seu@email.com"
                        disabled={!isEditing}
                      />
                      <InputField 
                        label="Telefone / Celular"
                        icon={Phone}
                        value={user.phone}
                        onChange={(e) => setUser({...user, phone: e.target.value})}
                        placeholder="(00) 00000-0000"
                        disabled={!isEditing}
                      />
                      <div className="md:col-span-2">
                        <InputField 
                          label="Bio / Sobre"
                          icon={Edit3}
                          value={user.bio}
                          onChange={(e) => setUser({...user, bio: e.target.value})}
                          placeholder="Um pouco sobre você..."
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'address' && (
                <motion.div 
                  key="address"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="bg-white/2 border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                    <div className="mb-6 pb-6 border-b border-white/5">
                      <h2 className="text-xl font-semibold text-white">Endereço de Entrega</h2>
                      <p className="text-white/40 text-sm mt-1">Utilizado para calcular frete e entregas.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <InputField 
                          label="Rua / Avenida"
                          icon={MapPin}
                          value={address.street}
                          onChange={(e) => setAddress({...address, street: e.target.value})}
                          placeholder="Nome da rua"
                          disabled={!isEditing}
                        />
                      </div>
                      <InputField 
                        label="Número"
                        icon={MapPin}
                        value={address.number}
                        onChange={(e) => setAddress({...address, number: e.target.value})}
                        placeholder="123"
                        disabled={!isEditing}
                      />
                      <InputField 
                        label="Complemento"
                        icon={MapPin}
                        value={address.complement}
                        onChange={(e) => setAddress({...address, complement: e.target.value})}
                        placeholder="Apto, Bloco..."
                        disabled={!isEditing}
                      />
                      <InputField 
                        label="Cidade"
                        icon={MapPin}
                        value={address.city}
                        onChange={(e) => setAddress({...address, city: e.target.value})}
                        placeholder="Cidade"
                        disabled={!isEditing}
                      />
                       <InputField 
                        label="Estado (UF)"
                        icon={MapPin}
                        value={address.state}
                        onChange={(e) => setAddress({...address, state: e.target.value})}
                        placeholder="SP"
                        disabled={!isEditing}
                      />
                      <InputField 
                        label="CEP"
                        icon={MapPin}
                        value={address.zip}
                        onChange={(e) => setAddress({...address, zip: e.target.value})}
                        placeholder="00000-000"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div 
                  key="orders"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col items-center justify-center py-20 text-white/30 space-y-4 bg-white/2 border border-white/5 rounded-2xl"
                >
                  <Package size={48} className="opacity-50" />
                  <p>Histórico de pedidos em desenvolvimento.</p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </motion.main>
    </div>
  );
}