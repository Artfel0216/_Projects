'use server';

import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma"; 
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: any) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return { success: false, error: "Usuário não autenticado" };
  }

  try {
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        bio: formData.bio,
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

    revalidatePath("/profile"); 
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    return { success: false, error: "Erro ao atualizar os dados no banco." };
  }
}