import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROTAS_PUBLICAS = new Set(['/LoginPage', '/RegisterPage']);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  if (pathname === '/') {
    return NextResponse.next();
  }

  const cookies = request.cookies;
  const estaLogado = 
    cookies.has('next-auth.session-token') || 
    cookies.has('__Secure-next-auth.session-token') ||
    cookies.has('authjs.session-token') ||
    cookies.has('__Secure-authjs.session-token');

  const ehPaginaPublica = ROTAS_PUBLICAS.has(pathname);

  if (!estaLogado && !ehPaginaPublica) {
    return NextResponse.redirect(new URL('/LoginPage', request.url));
  }

  if (estaLogado && ehPaginaPublica) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};