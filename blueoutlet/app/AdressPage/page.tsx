"use client";

import { motion } from "framer-motion";
import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation"; // 1. Importação adicionada
import {
  User,
  MapPin,
  Phone,
  Hash,
  Building2,
  Landmark,
} from "lucide-react";

/* ================= TYPES ================= */
type AddressForm = {
  name: string;
  cpf: string;
  cep: string;
  street: string;
  number: string;
  phone: string;
  city: string;
  state: string;
};

/* ================= COMPONENT ================= */
export default function AddressPage() {
  const router = useRouter(); // 2. Inicialização do Router
  
  const [form, setForm] = useState<AddressForm>({
    name: "",
    cpf: "",
    cep: "",
    street: "",
    number: "",
    phone: "",
    city: "",
    state: "",
  });

  const [errors, setErrors] = useState<Partial<AddressForm>>({});

  /* ================= HANDLERS ================= */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Partial<AddressForm> = {};

    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.cpf.trim()) newErrors.cpf = "CPF é obrigatório";
    if (!form.phone.trim()) newErrors.phone = "Telefone é obrigatório";
    if (!form.street.trim()) newErrors.street = "Logradouro é obrigatório";
    if (!form.city.trim()) newErrors.city = "Cidade é obrigatória";
    if (!form.state.trim()) newErrors.state = "Estado é obrigatório";

    if (!form.cep.trim()) {
      newErrors.cep = "CEP é obrigatório";
    } else if (!/^\d{8}$/.test(form.cep)) {
      newErrors.cep = "CEP inválido (8 números)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Salva no LocalStorage
    localStorage.setItem("address", JSON.stringify(form));
    
    // Feedback visual (opcional)
    // alert("Endereço salvo com sucesso!");

    // 3. Redirecionamento para a página de produtos masculinos
    router.push("/MenProductPage");
  };

  /* ================= STYLES ================= */
  const inputBase = (hasError?: boolean) => `
    w-full rounded-xl border
    ${hasError ? "border-red-500" : "border-white/20"}
    bg-white/10 backdrop-blur-md
    px-4 py-3 pl-11
    text-white placeholder:text-white/60
    focus:outline-none focus:ring-2
    ${hasError ? "focus:ring-red-500" : "focus:ring-white/40"}
    transition-all duration-300
  `;

  const iconStyle =
    "absolute left-4 top-1/2 -translate-y-1/2 text-white/80";

  /* ================= JSX ================= */
  return (
    <main className="min-h-screen flex items-center justify-center bg-black px-4">
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="
          w-full max-w-2xl
          rounded-3xl
          border border-white/20
          bg-white/10
          backdrop-blur-xl
          shadow-2xl
          p-8 md:p-10
          text-white
        "
      >
        {/* HEADER */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Endereço</h1>
          <p className="text-white/70">
            Preencha seus dados com segurança
          </p>
        </header>

        {/* FORM */}
        <form onSubmit={handleSubmit} noValidate>
          <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nome */}
            <div className="relative md:col-span-2">
              <User className={iconStyle} />
              <input
                name="name"
                placeholder="Nome completo"
                className={inputBase(!!errors.name)}
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && (
                <span className="text-sm text-red-400">{errors.name}</span>
              )}
            </div>

            {/* CPF */}
            <div className="relative">
              <Landmark className={iconStyle} />
              <input
                name="cpf"
                placeholder="CPF"
                className={inputBase(!!errors.cpf)}
                value={form.cpf}
                onChange={handleChange}
              />
              {errors.cpf && (
                <span className="text-sm text-red-400">{errors.cpf}</span>
              )}
            </div>

            {/* Telefone */}
            <div className="relative">
              <Phone className={iconStyle} />
              <input
                name="phone"
                placeholder="Telefone"
                className={inputBase(!!errors.phone)}
                value={form.phone}
                onChange={handleChange}
              />
              {errors.phone && (
                <span className="text-sm text-red-400">{errors.phone}</span>
              )}
            </div>

            {/* CEP */}
            <div className="relative flex flex-col">
              <div className="relative">
                <MapPin className={iconStyle} />
                <input
                  name="cep"
                  placeholder="CEP"
                  className={inputBase(!!errors.cep)}
                  value={form.cep}
                  onChange={handleChange}
                />
              </div>
              {errors.cep && (
                <span className="text-sm text-red-400">{errors.cep}</span>
              )}
              <a
                href="https://buscacepinter.correios.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-sm text-white/70 hover:underline"
              >
                Não sei meu CEP
              </a>
            </div>

            {/* Número */}
            <div className="relative">
              <Hash className={iconStyle} />
              <input
                name="number"
                placeholder="Número (opcional)"
                className={inputBase()}
                value={form.number}
                onChange={handleChange}
              />
            </div>

            {/* Logradouro */}
            <div className="relative md:col-span-2">
              <Building2 className={iconStyle} />
              <input
                name="street"
                placeholder="Logradouro"
                className={inputBase(!!errors.street)}
                value={form.street}
                onChange={handleChange}
              />
              {errors.street && (
                <span className="text-sm text-red-400">
                  {errors.street}
                </span>
              )}
            </div>

            {/* Cidade */}
            <input
              name="city"
              placeholder="Cidade"
              className={inputBase(!!errors.city)}
              value={form.city}
              onChange={handleChange}
            />

            {/* Estado */}
            <input
              name="state"
              placeholder="Estado"
              className={inputBase(!!errors.state)}
              value={form.state}
              onChange={handleChange}
            />
          </fieldset>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="
              mt-8 w-full rounded-xl
              bg-white text-black
              py-4 font-semibold
              hover:bg-gray-200
              transition-all
            "
          >
            Salvar endereço e Continuar
          </motion.button>
        </form>
      </motion.section>
    </main>
  );
}