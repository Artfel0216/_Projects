import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/session';

export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session || !session.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { user, address } = body;

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
            }
          }
        }
      },
      include: { address: true }
    });

    const { password, ...safeUser } = updatedUser;

    return NextResponse.json({ 
      message: 'Perfil atualizado com sucesso!', 
      user: safeUser
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);

    return NextResponse.json(
      { error: 'Erro ao salvar os dados' },
      { status: 500 }
    );
  }
}