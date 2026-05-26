import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROTAS_PUBLICAS = new Set(['/LoginPage', '/RegisterPage']);

// Mudamos para export default, o Next.js aceita independente de ser middleware ou proxy
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Filtro de arquivos estáticos e APIs (Essencial para performance)
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Rota Raiz (Home) - Libera direto se o seu app tiver uma landing page pública
  if (pathname === '/') {
    return NextResponse.next();
  }

  // 3. Checagem dos Cookies de Sessão do NextAuth / Auth.js
  const cookies = request.cookies;
  const estaLogado = 
    cookies.has('next-auth.session-token') || 
    cookies.has('__Secure-next-auth.session-token') ||
    cookies.has('authjs.session-token') ||
    cookies.has('__Secure-authjs.session-token');

  const ehPaginaPublica = ROTAS_PUBLICAS.has(pathname);

  // CASO 1: Não está logado e tenta acessar página privada -> Vai para o Login
  if (!estaLogado && !ehPaginaPublica) {
    return NextResponse.redirect(new URL('/LoginPage', request.url));
  }

  // CASO 2: Já ESTÁ logado e tenta ir para Login/Register -> Vai para a Home ou Dashboard
  if (estaLogado && ehPaginaPublica) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};