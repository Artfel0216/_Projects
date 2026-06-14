import { NextResponse } from 'next/server';
import { chatService } from '@/lib/services/chat.service';
import { authenticate, handleError } from '@/lib/api-utils';
import { chatSchema } from '@/lib/validation';
import { ValidationError } from '@/lib/errors';

export const runtime = 'nodejs';

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    await authenticate();

    const body = await request.json();
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Mensagem inválida', parsed.error.issues);
    }

    const result = await chatService.generateWorkout(
      parsed.data.message,
      parsed.data.level ?? 'Iniciante',
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}
