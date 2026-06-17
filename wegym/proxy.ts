import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { locales, defaultLocale, COOKIE_NAME } from '@/lib/i18n/config';

const PUBLIC_ROUTES = new Set(['/', '/login', '/register']);

const SESSION_COOKIES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  'authjs.session-token',
  '__Secure-authjs.session-token',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for static and API - pass through immediately
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // --- i18n: detect locale from cookie or Accept-Language ---
  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value;
  let response: NextResponse | undefined;

  if (!cookieLocale || !locales.includes(cookieLocale as typeof locales[number])) {
    const acceptLanguage = request.headers.get('accept-language') || '';
    const headers = { 'accept-language': acceptLanguage };
    const languages = new Negotiator({ headers }).languages();
    const detectedLocale = match(languages, [...locales], defaultLocale);
    response = NextResponse.next();
    response.cookies.set(COOKIE_NAME, detectedLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  // --- Page authentication ---
  const hasSession = SESSION_COOKIES.some(name => request.cookies.has(name));
  const isPublic = PUBLIC_ROUTES.has(pathname);

  if (!hasSession && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isPublic && pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response ?? NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)'],
};
