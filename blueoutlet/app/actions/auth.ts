"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { SignJWT } from "jose";
import { z } from "zod";

const MAX_AGE = 60 * 60 * 24 * 7;
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "chave-secreta-de-fallback");

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

type ActionState = {
  error?: string;
  success?: boolean;
} | null;

async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

async function createSession(userId: string, userName: string) {
  const token = await encrypt({ userId, userName });
  const cookieStore = await cookies();

  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function registerAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: "Dados inválidos ou campos insuficientes." };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { error: "Este email já está em uso." };

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    await createSession(user.id, user.name || "Usuário");
  } catch (err) {
    console.error(err);
    return { error: "Erro interno ao processar cadastro." };
  }

  redirect("/PageAdress");
}

export async function loginAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Preencha todos os campos." };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    const isPasswordValid = user ? await bcrypt.compare(password, user.password!) : false;

    if (!user || !isPasswordValid) {
      return { error: "Credenciais inválidas." };
    }

    await createSession(user.id, user.name || "Usuário");
  } catch (error) {
    console.error(error);
    return { error: "Erro no servidor." };
  }

  redirect("/MenProductPage");
}