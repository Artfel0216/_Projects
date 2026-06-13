import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import type { AthleteRegisterRequest } from '@/app/types/personal';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body: AthleteRegisterRequest = await req.json();

    if (!body.email || !body.cpf || !body.name) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 422 }
      );
    }

    const email = body.email.toLowerCase().trim();
    const cpf = body.cpf.replace(/\D/g, '');

    const result = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: { OR: [{ email }, { athlete: { cpf } }] },
        select: { id: true }
      });

      if (existingUser) {
        throw new Error('P2002');
      }

      const tempPassword = crypto.randomUUID().slice(0, 12) + 'Aa1!';
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: 'atleta',
        },
        select: { id: true },
      });

      return {
        athlete: await tx.athlete.create({
          data: {
            userId: user.id,
            name: body.name.trim(),
            cpf,
            age: Number(body.birthDate ? new Date().getFullYear() - new Date(body.birthDate).getFullYear() : 0),
            sex: body.sex,
            heightCm: Number(body.heightCm),
            weightKg: Number(body.weightKg),
            experienceLevel: body.experienceLevel,
            city: body.city,
            state: body.state,
            cep: body.cep,
          },
          select: { id: true, name: true },
        }),
        tempPassword,
      };
    }, {
      timeout: 4000,
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === 'P2002' || err.message === 'P2002') {
      return NextResponse.json(
        { error: 'Email ou CPF já cadastrado' },
        { status: 409 }
      );
    }

    console.error("Erro no registro de atleta:", error);
    return NextResponse.json(
      { error: 'Erro ao criar atleta' },
      { status: 500 }
    );
  }
}
