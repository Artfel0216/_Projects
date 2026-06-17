import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError, withRateLimit, getIP } from '@/lib/api-utils';
import { forgotPasswordSchema } from '@/lib/validation';
import { ValidationError } from '@/lib/errors';
import { sendEmail, buildResetEmail } from '@/lib/email';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const rateLimitResponse = await withRateLimit(req, `forgot-password:${getIP(req)}`);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Email inválido', parsed.error.issues);
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Se o email existir, você receberá um link de redefinição.' },
      );
    }

    const resetToken = crypto.randomUUID();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires: resetExpires,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    const { text, html } = buildResetEmail(resetUrl);

    await sendEmail({ to: parsed.data.email, subject: 'Redefinição de senha - WEGYM', text, html });

    return NextResponse.json(
      { message: 'Se o email existir, você receberá um link de redefinição.' },
    );
  } catch (error) {
    return handleError(error);
  }
}
