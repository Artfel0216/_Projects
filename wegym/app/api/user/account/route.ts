import { NextResponse } from 'next/server';
import { userService } from '@/lib/services/user.service';
import { authenticate, handleError, cache } from '@/lib/api-utils';

export const runtime = 'nodejs';

export async function DELETE() {
  try {
    const session = await authenticate();

    await cache.del(`profile:${session.user.id}`);
    await cache.delPattern(`classes:${session.user.id}:*`);

    const result = await userService.deleteAccount(session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}
