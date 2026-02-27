import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/app/lib/prisma';

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('user_session');
  
  if (!sessionCookie) return null;
  
  try {
    return JSON.parse(sessionCookie.value);
  } catch (error) {
    return null;
  }
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { address: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const { password, address, ...safeUserData } = user;

    return NextResponse.json({ 
      user: safeUserData, 
      address: address || {} 
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session || !session.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { user, address } = body;

    const updatedUser = await prisma.user.update({
      where: { id: session.id }, 
      data: {
        name: user.name,
        phone: user.phone,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
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

    const { password, address: updatedAddress, ...safeUser } = updatedUser;

    return NextResponse.json({ 
      message: 'Perfil atualizado com sucesso!', 
      user: safeUser,
      address: updatedAddress
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json({ error: 'Erro ao salvar os dados' }, { status: 500 });
  }
}