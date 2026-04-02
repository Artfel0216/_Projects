import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/session';
import { z } from 'zod';
import { Role } from '@prisma/client';

const UpdateUserSchema = z.object({
  user: z.object({
    name: z.string().min(2).max(100),
    phone: z.string().min(8).max(20),
    role: z.nativeEnum(Role).optional(),
    bio: z.string().max(500).nullable().optional(),
  }),
  address: z.object({
    street: z.string().min(1),
    number: z.string().min(1),
    complement: z.string().nullable().optional(),
    city: z.string().min(1),
    state: z.string().length(2),
    zip: z.string().min(5).max(15),
  }),
});

export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const json = await request.json();
    const result = UpdateUserSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Dados inválidos', 
        details: result.error.format() 
      }, { status: 400 });
    }

    const { user, address } = result.data;

    const updatedUser = await prisma.user.update({
      where: { id: String(session.id) },
      data: {
        name: user.name,
        phone: user.phone,
        role: user.role,
        bio: user.bio,
        address: {
          upsert: {
            create: {
              street: address.street,
              number: address.number,
              complement: address.complement,
              city: address.city,
              state: address.state,
              zip: address.zip,
            },
            update: {
              street: address.street,
              number: address.number,
              complement: address.complement,
              city: address.city,
              state: address.state,
              zip: address.zip,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        bio: true,
        address: true,
      }
    });

    return NextResponse.json({ 
      message: 'Perfil atualizado com sucesso!', 
      user: updatedUser
    });

  } catch (error) {
    console.error('SERVER_UPDATE_PROFILE_ERROR:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar a solicitação' },
      { status: 500 }
    );
  }
}