import { z } from 'zod';

export const emailSchema = z.string().email('Email inválido').transform(v => v.toLowerCase().trim());

export const passwordSchema = z.string().min(6, 'Senha deve ter no mínimo 6 caracteres');

export const cpfSchema = z.string().transform(v => v.replace(/\D/g, '')).pipe(
  z.string().length(11, 'CPF deve ter 11 dígitos'),
);

export const cepSchema = z.string().min(8, 'CEP inválido').max(9);

export const nameSchema = z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(255).transform(v => v.trim());

export const ufSchema = z.string().length(2, 'UF deve ter 2 caracteres').toUpperCase();

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token obrigatório'),
  password: passwordSchema,
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userType: z.enum(['atleta', 'personal'], { message: 'Tipo de usuário inválido' }),
  name: nameSchema,
  cpf: cpfSchema.optional(),
  cep: cepSchema.optional(),
  city: z.string().max(100).optional(),
  state: ufSchema.optional(),
  age: z.coerce.number().int().min(12, 'Idade mínima: 12 anos').max(120).optional(),
  sex: z.enum(['masculino', 'feminino', 'outro']).optional(),
  height: z.coerce.number().min(50).max(250).optional(),
  weight: z.coerce.number().min(20).max(400).optional(),
  experienceLevel: z.enum(['iniciante', 'intermediario', 'avancado']).optional(),
  injury: z.string().nullable().optional(),
  healthIssues: z.string().nullable().optional(),
  medications: z.string().nullable().optional(),
  cref: z.string().optional(),
  termsAccepted: z.literal(true, { message: 'Você precisa aceitar os Termos de Uso' }),
  privacyAccepted: z.literal(true, { message: 'Você precisa aceitar a Política de Privacidade' }),
});

export const athleteRegisterSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  cpf: cpfSchema,
  birthDate: z.string().optional(),
  sex: z.enum(['masculino', 'feminino', 'outro']),
  heightCm: z.coerce.number().min(50).max(250),
  weightKg: z.coerce.number().min(20).max(400),
  experienceLevel: z.enum(['iniciante', 'intermediario', 'avancado']),
  cep: z.string().min(8).max(9),
  city: z.string().max(100),
  state: ufSchema,
});

export const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  weightKg: z.coerce.number().min(20).max(400).optional(),
  heightCm: z.coerce.number().int().min(50).max(250).optional(),
});

export const paymentSchema = z.object({
  transaction_amount: z.number().positive('Valor deve ser positivo'),
  token: z.string().min(1, 'Token de pagamento obrigatório'),
  installments: z.number().int().min(1).max(12),
  payment_method_id: z.string().min(1),
  issuer_id: z.number().int().positive().optional(),
  payer: z.object({
    email: z.string().email('Email do pagador inválido'),
  }),
});

export const chatSchema = z.object({
  message: z.string().min(1, 'Mensagem vazia').max(2000, 'Mensagem muito longa'),
  level: z.enum(['Iniciante', 'Intermediário', 'Avançado']).optional(),
});

export type RegisterInput = z.input<typeof registerSchema>;
export type AthleteRegisterInput = z.input<typeof athleteRegisterSchema>;
export type ProfileUpdateInput = z.input<typeof profileUpdateSchema>;
export type PaymentInput = z.input<typeof paymentSchema>;
export type ChatInput = z.input<typeof chatSchema>;
