"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma"; 
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { z } from "zod";

const ProfileSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(8).max(20),
  role: z.nativeEnum(Role).optional(),
  bio: z.string().max(500).optional().nullable(),
  zip: z.string().min(5).max(15),
  street: z.string().min(1),
  number: z.string().min(1),
  city: z.string().min(1),
});

type ProfileData = z.infer<typeof ProfileSchema>;

export async function updateProfile(formData: ProfileData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: "Sessão expirada ou inválida." };
    }

    const validatedData = ProfileSchema.parse(formData);

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: validatedData.name,
        phone: validatedData.phone,
        role: validatedData.role,
        bio: validatedData.bio,
        address: {
          upsert: {
            create: {
              zip: validatedData.zip,
              street: validatedData.street,
              number: validatedData.number,
              city: validatedData.city,
            },
            update: {
              zip: validatedData.zip,
              street: validatedData.street,
              number: validatedData.number,
              city: validatedData.city,
            },
          },
        },
      },
    });

    revalidatePath("/ProfilePage");
    
    return { success: true };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Verifique os dados enviados." };
    }

    console.error("Critical Profile Update Error:", error);
    
    return { 
      success: false, 
      error: "Falha ao comunicar com o banco de dados." 
    };
  }
}