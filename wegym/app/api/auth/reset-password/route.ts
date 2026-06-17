import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError, withRateLimit, getIP } from '@/lib/api-utils';
import { resetPasswordSchema } from '@/lib/validation';
import { ValidationError, NotFoundError } from '@/lib/errors';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const rateLimitResponse = await withRateLimit(req, `reset-password:${getIP(req)}`);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Dados inválidos', parsed.error.issues);
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: parsed.data.token,
        resetTokenExpires: { gt: new Date() },
      },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundError('Token de redefinição inválido ou expirado');
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return NextResponse.json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    return handleError(error);
  }
}
