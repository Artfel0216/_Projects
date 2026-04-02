import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = "user_session";
const LOGIN_ROUTE = "/login";
const DEFAULT_AUTH_REDIRECT = "/MenProductPage";

const PROTECTED_ROUTES = [
  "/PageAdress",
  "/MenProductPage",
  "/dashboard",
  "/profile",
  "/checkout"
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  const isAuthPage = pathname === LOGIN_ROUTE;

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL(LOGIN_ROUTE, request.url);
    redirectUrl.searchParams.set("callbackUrl", encodeURIComponent(`${pathname}${search}`));
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL(DEFAULT_AUTH_REDIRECT, request.url));
  }

  const response = NextResponse.next();

  if (session) {
    response.headers.set('x-middleware-cache', 'no-cache');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public|assets).*)',
  ],
};