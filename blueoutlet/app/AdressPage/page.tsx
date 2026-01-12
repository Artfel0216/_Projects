"use client";

import { motion } from "framer-motion";
import { useState, ChangeEvent, FormEvent } from "react";
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
      newErrors.cep = "CEP inválido (use 8 números)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    localStorage.setItem("address", JSON.stringify(form));
    alert("Endereço salvo com sucesso!");
  };

  /* ================= STYLES ================= */
  const inputBase = (hasError?: boolean) => `
    w-full rounded-xl border
    ${hasError ? "border-red-500" : "border-blue-100"}
    bg-white px-4 py-3 pl-11
    text-gray-700 placeholder:text-gray-400
    focus:outline-none focus:ring-2
    ${hasError ? "focus:ring-red-500" : "focus:ring-blue-600"}
    transition-all duration-300
  `;

  const iconStyle =
    "absolute left-4 top-1/2 -translate-y-1/2 text-blue-600";

  /* ================= JSX ================= */
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 px-4">
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 md:p-10"
      >
        {/* HEADER */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-700">Endereço</h1>
          <p className="text-gray-500">Preencha seus dados com segurança</p>
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
                <span className="text-sm text-red-600">{errors.name}</span>
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
                <span className="text-sm text-red-600">{errors.cpf}</span>
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
                <span className="text-sm text-red-600">{errors.phone}</span>
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
                <span className="text-sm text-red-600">{errors.cep}</span>
              )}
              <a
                href="https://buscacepinter.correios.com.br/"
                target="_blank"
                className="mt-1 text-sm text-blue-600 hover:underline"
              >
                Não sei meu CEP?
              </a>
            </div>

            {/* Número (opcional) */}
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
                <span className="text-sm text-red-600">{errors.street}</span>
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
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="mt-8 w-full rounded-xl bg-blue-700 py-4 font-semibold text-white hover:bg-blue-800"
          >
            Salvar endereço
          </motion.button>
        </form>
      </motion.section>
    </main>
  );
}
