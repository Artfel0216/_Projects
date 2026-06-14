import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    await prisma.user.update({
      where: { id: userId },
      data: {
        email: `${userId}@deleted.wegym`,
        passwordHash: '',
        role: 'atleta',
        termsAcceptedAt: null,
        privacyAcceptedAt: null,
        dataConsentAt: null,
        markedForDeletionAt: null,
        anonymizedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir conta' }, { status: 500 });
  }
}
