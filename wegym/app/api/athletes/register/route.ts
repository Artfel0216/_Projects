import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DietaryRestriction } from '@prisma/client';
import { AthleteRegisterRequest } from '@/app/types/personal';

export const runtime = 'nodejs'; 
export const dynamic = 'force-dynamic';


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
      
      const existingUser = await tx.user.findFirst({
        where: { OR: [{ email }, { athlete: { cpf } }] },
        select: { id: true }
      });

      if (existingUser) {
        throw new Error('P2002'); 
      }

      
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
          age: Number(body.birthDate ? new Date().getFullYear() - new Date(body.birthDate).getFullYear() : 0),
          sex: body.sex,
          heightCm: Number(body.heightCm),
          weightKg: Number(body.weightKg),
          experienceLevel: body.experienceLevel,
          city: body.city,
          state: body.state,
          cep: body.cep,
          
          dietaryRestriction: (body.dietaryRestriction as DietaryRestriction) || DietaryRestriction.nenhuma,
          phone: body.phone || 'Não informado',
        },
        select: {
          id: true,
          name: true,
        },
      });
    }, {
      timeout: 4000, 
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error: any) {
  
    if (error.code === 'P2002' || error.message === 'P2002') {
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