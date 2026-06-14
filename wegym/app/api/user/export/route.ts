import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        athlete: true,
        personal: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const data = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        termsAcceptedAt: user.termsAcceptedAt,
        privacyAcceptedAt: user.privacyAcceptedAt,
        dataConsentAt: user.dataConsentAt,
        createdAt: user.createdAt,
      },
      ...(user.athlete && {
        athlete: {
          name: user.athlete.name,
          cpf: user.athlete.cpf,
          cep: user.athlete.cep,
          city: user.athlete.city,
          state: user.athlete.state,
          age: user.athlete.age,
          sex: user.athlete.sex,
          heightCm: user.athlete.heightCm,
          weightKg: user.athlete.weightKg,
          experienceLevel: user.athlete.experienceLevel,
          injury: user.athlete.injury,
          healthIssues: user.athlete.healthIssues,
          medications: user.athlete.medications,
        },
      }),
      ...(user.personal && {
        personal: {
          name: user.personal.name,
          cref: user.personal.cref,
        },
      }),
    };

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Erro ao exportar dados' }, { status: 500 });
  }
}
