import { userService } from '@/lib/services/user.service';
import { authenticate, handleError, json, cache } from '@/lib/api-utils';
import { profileUpdateSchema } from '@/lib/validation';
import { ValidationError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await authenticate();
    const cacheKey = `profile:${session.user.id}`;

    const profile = await cache.getOrSet(
      cacheKey,
      () => userService.getProfile(session.user.id),
      60,
    );

    return json(profile, 200, 60);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await authenticate();

    const body = await req.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Dados inválidos', parsed.error.issues);
    }

    const result = await userService.updateProfile(session.user.id, parsed.data);

    // Invalidate profile cache
    await cache.del(`profile:${session.user.id}`);

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
