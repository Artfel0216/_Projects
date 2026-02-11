"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import prisma from "@/app/lib/prisma";

const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

// Definição do tipo de retorno para o useActionState
type ActionState = {
  error?: string;
  success?: boolean;
} | null;

async function createSession(userId: number, userName: string) {
  const cookieStore = await cookies();
  
  cookieStore.set("user_session", JSON.stringify({ id: userId, name: userName }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function registerAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Preencha todos os campos." };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Este email já está cadastrado." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    await createSession(user.id, user.name);

  } catch (err) {
    console.error("Erro no registro:", err);
    return { error: "Erro ao criar conta. Tente novamente." };
  }

  // CUIDADO: O nome da pasta deve ser exato. Corrigi para AddressPage (inglês correto)
  // Se a sua pasta for "AdressPage", mude de volta.
  redirect("/AddressPage"); 
}

export async function loginAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Preencha email e senha." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Se usuário não existe OU senha não bate
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return { error: "Email ou senha incorretos." };
    }

    await createSession(user.id, user.name);

  } catch (error) {
    console.error("Erro no login:", error);
    return { error: "Ocorreu um erro no servidor." };
  }

  redirect("/MenProductPage");
}