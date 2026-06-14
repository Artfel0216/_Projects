import { NextResponse } from 'next/server';
import { AppError } from './errors';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import { cache } from './cache';

const ONE_MINUTE = 60;
const FIVE_MINUTES = 300;

export function json<T>(data: T, status = 200, cacheMaxAge?: number) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (cacheMaxAge != null) {
    headers['Cache-Control'] = `private, max-age=${cacheMaxAge}, s-maxage=${cacheMaxAge * 2}, stale-while-revalidate=${cacheMaxAge * 4}`;
  } else {
    headers['Cache-Control'] = 'private, no-cache, no-store, must-revalidate';
  }

  return NextResponse.json(data, { status, headers });
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code, details: error.details },
      { status: error.statusCode },
    );
  }

  const prismaError = error as { code?: string };
  if (prismaError.code === 'P2002') {
    return NextResponse.json(
      { error: 'Registro duplicado', code: 'CONFLICT' },
      { status: 409 },
    );
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error('[API Error]', error instanceof Error ? error.message : error);
  }

  return NextResponse.json(
    { error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
    { status: 500 },
  );
}

export async function authenticate() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    const { UnauthorizedError } = await import('./errors');
    throw new UnauthorizedError();
  }
  return session;
}

export async function requireRole(allowedRoles: string[]) {
  const session = await authenticate();
  const role = (session.user as { role?: string }).role;
  if (!role || !allowedRoles.includes(role)) {
    const { ForbiddenError } = await import('./errors');
    throw new ForbiddenError(`Acesso permitido apenas para: ${allowedRoles.join(', ')}`);
  }
  return session;
}

export function getIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? '127.0.0.1';
}

export function staleTime(route: string): number {
  if (route.startsWith('/api/health')) return FIVE_MINUTES;
  if (route.startsWith('/api/user/profile')) return ONE_MINUTE;
  if (route.startsWith('/api/classes')) return 30;
  return 0;
}

export { cache };
