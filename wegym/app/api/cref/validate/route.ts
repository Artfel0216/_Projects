import { NextResponse } from 'next/server';
import { validateCref } from '@/lib/cref';
import { handleError } from '@/lib/api-utils';
import { ValidationError, ConflictError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cref } = body;
    const validation = validateCref(cref);

    if (!validation.valid) {
      throw new ValidationError(
        validation.errors[0] ?? 'CREF inválido.',
        { cref: validation.cref, errors: validation.errors },
      );
    }

    const existingTrainer = await prisma.personalTrainer.findUnique({
      where: { cref: validation.cref },
      select: { id: true },
    });

    if (existingTrainer) {
      throw new ConflictError('Este CREF já está cadastrado em nossa plataforma.');
    }

    return NextResponse.json({
      valid: true,
      cref: validation.cref,
      normalizedCref: validation.normalizedCref,
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ConflictError) {
      return handleError(error);
    }
    return NextResponse.json(
      { valid: false, errors: ['Erro interno ao validar CREF. Tente novamente.'] },
      { status: 500 },
    );
  }
}
