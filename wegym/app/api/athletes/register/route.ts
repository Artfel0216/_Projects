import { NextResponse } from 'next/server';
import { athleteService } from '@/lib/services/athlete.service';
import { requireRole, handleError, cache } from '@/lib/api-utils';
import { athleteRegisterSchema } from '@/lib/validation';
import { ValidationError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const session = await requireRole(['personal']);

    const body = await req.json();
    const parsed = athleteRegisterSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Dados inválidos', parsed.error.issues);
    }

    const result = await athleteService.register(parsed.data, session.user.id);

    // Invalidate athlete list cache
    await cache.delPattern('athletes:list:*');

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
