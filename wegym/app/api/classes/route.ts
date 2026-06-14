import { prisma } from '@/lib/prisma';
import { authenticate, handleError, json, cache } from '@/lib/api-utils';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await authenticate();
    const userRole = (session.user as { role?: string }).role;
    const userId = session.user.id;

    const cacheKey = `classes:${userId}:${userRole}`;

    const classes = await cache.getOrSet(
      cacheKey,
      () =>
        prisma.weeklyClass.findMany({
          where: userRole === 'personal'
            ? { athlete: { personal: { userId } } }
            : { athlete: { userId } },
          orderBy: { date: 'asc' },
          select: {
            id: true,
            day: true,
            date: true,
            time: true,
            type: true,
            status: true,
            athlete: { select: { id: true, name: true } },
          },
        }),
      30,
    );

    return json(classes, 200, 30);
  } catch (error) {
    return handleError(error);
  }
}
