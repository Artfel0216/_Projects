import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = new Set(['/', '/LoginPage', '/RegisterPage']);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isAuthenticated =
    request.cookies.has('next-auth.session-token') ||
    request.cookies.has('__Secure-next-auth.session-token') ||
    request.cookies.has('authjs.session-token') ||
    request.cookies.has('__Secure-authjs.session-token');

  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/LoginPage', request.url));
  }

  if (isAuthenticated && isPublicRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
