"use client";

import { motion } from "framer-motion";
import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  MapPin, 
  Hash, 
  Building2, 
  Calendar, 
  Landmark, 
  ArrowRight,
  AlertCircle
} from "lucide-react";

type AddressForm = {
  fullName: string;
  birthDate: string;
  cpf: string;
  cep: string;
  street: string;
  number: string;
  city: string;
  state: string;
};

export default function AddressPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>({
    fullName: "",
    birthDate: "",
    cpf: "",
    cep: "",
    street: "",
    number: "",
    city: "",
    state: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const requiredFields: (keyof AddressForm)[] = [
      "fullName", "birthDate", "cpf", "cep", "street", "city", "state"
    ];

    const hasEmptyFields = requiredFields.some(field => !form[field].trim());

    if (hasEmptyFields) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    localStorage.setItem("address", JSON.stringify(form));
    router.push("/MenProductPage");
  };

  const inputStyles = (isErrorField?: boolean) => `
    w-full rounded-xl border ${isErrorField ? 'border-red-500/50' : 'border-white/10'} 
    bg-white/5 px-4 py-3 pl-11 text-white placeholder:text-white/40 
    focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 hover:bg-white/10
  `;

  const iconStyles = "absolute left-4 top-1/2 -translate-y-1/2 text-white/50";

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-neutral-950 p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8 md:p-12 shadow-2xl"
      >
        <header className="mb-8">
          <h1 className="text-3xl font-light tracking-tight text-white mb-2">
            Finalize seu <span className="font-bold">Cadastro</span>
          </h1>
          <p className="text-white/50 text-sm">Dados de entrega e identificação.</p>
        </header>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-500 text-sm flex items-center gap-3"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="relative md:col-span-2">
              <User className={iconStyles} size={18} />
              <input
                name="fullName"
                placeholder="Nome Completo"
                className={inputStyles()}
                value={form.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <Landmark className={iconStyles} size={18} />
              <input
                name="cpf"
                placeholder="CPF"
                className={inputStyles()}
                value={form.cpf}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <Calendar className={iconStyles} size={18} />
              <input
                name="birthDate"
                type="date"
                className={`${inputStyles()} appearance-none`}
                value={form.birthDate}
                onChange={handleChange}
              />
            </div>

            <div className="relative flex flex-col gap-2">
              <div className="relative">
                <MapPin className={iconStyles} size={18} />
                <input
                  name="cep"
                  placeholder="CEP"
                  className={inputStyles()}
                  value={form.cep}
                  onChange={handleChange}
                />
              </div>
              <a 
                href="https://buscacepinter.correios.com.br/app/endereco/index.php" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-white/40 hover:text-white underline transition-colors inline-block ml-1"
              >
                Não sei meu CEP
              </a>
            </div>

            <div className="relative">
              <Hash className={iconStyles} size={18} />
              <input
                name="number"
                placeholder="Nº da Residência (Opcional)"
                className={inputStyles()}
                value={form.number}
                onChange={handleChange}
              />
            </div>

            <div className="relative md:col-span-2">
              <Building2 className={iconStyles} size={18} />
              <input
                name="street"
                placeholder="Logradouro"
                className={inputStyles()}
                value={form.street}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <input
                name="city"
                placeholder="Cidade"
                className={inputStyles().replace('pl-11', 'pl-4')}
                value={form.city}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <input
                name="state"
                placeholder="Estado (UF)"
                className={inputStyles().replace('pl-11', 'pl-4')}
                value={form.state}
                onChange={handleChange}
                maxLength={2}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: "#fff" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full mt-8 flex items-center justify-center gap-2 bg-white text-black py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all"
          >
            Confirmar Endereço
            <ArrowRight size={18} />
          </motion.button>
        </form>
      </motion.section>
    </main>
  );
}