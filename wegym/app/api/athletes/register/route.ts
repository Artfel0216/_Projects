import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs'; 
export const dynamic = 'force-dynamic';

interface AthleteRegisterRequest {
  email: string;
  name: string;
  cpf: string;
  age: string | number;
  sex: 'masculino' | 'feminino' | 'outro';
  heightCm: string | number;
  weightKg: string | number;
  experienceLevel: 'iniciante' | 'intermediario' | 'avancado';
  dietaryRestriction: 'nenhuma' | 'vegetariano' | 'vegano' | 'lactose' | 'alergia';
  city: string;
  state: string;
  cep: string;
  phone: string;
}

export async function POST(req: Request) {
  try {
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
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: 'hash_provisorio',
          role: 'atleta',
        },
        select: { id: true },
      });

      return tx.athlete.create({
        data: {
          userId: user.id,
          name: body.name.trim(),
          cpf,
          age: Number(body.age),
          sex: body.sex,
          heightCm: Number(body.heightCm),
          weightKg: Number(body.weightKg),
          experienceLevel: body.experienceLevel,
          dietaryRestriction: body.dietaryRestriction,
          city: body.city,
          state: body.state,
          cep: body.cep,
        },
        select: {
          id: true,
          name: true,
        },
      });
    }, {
      timeout: 8000, 
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email ou CPF já cadastrado' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar atleta' },
      { status: 500 }
    );
  }
}