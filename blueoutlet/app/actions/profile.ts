'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma"; 
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

type ProfileData = {
  name: string;
  phone: string;
  role?: string;
  bio?: string;
  zip: string;
  street: string;
  number: string;
  city: string;
};

export async function updateProfile(formData: ProfileData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // 🔒 valida role antes de salvar
    const validRole = formData.role && Object.values(Role).includes(formData.role as Role)
      ? (formData.role as Role)
      : undefined;

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: formData.name,
        phone: formData.phone,
        role: validRole,
        bio: formData.bio || null,

        address: {
          upsert: {
            create: {
              zip: formData.zip,
              street: formData.street,
              number: formData.number,
              city: formData.city,
            },
            update: {
              zip: formData.zip,
              street: formData.street,
              number: formData.number,
              city: formData.city,
            },
          },
        },
      },
    });

    revalidatePath("/ProfilePage"); 

    return { success: true };

  } catch (error) {
    console.error("Erro ao salvar perfil:", error);

    return {
      success: false,
      error: "Erro ao atualizar os dados no banco.",
    };
  }
}