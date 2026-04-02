import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get("user_session");
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/login";
  
  const protectedRoutes = ["/PageAdress", "/MenProductPage", "/dashboard"];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && session) {
    const homeUrl = new URL("/MenProductPage", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/PageAdress/:path*",
    "/MenProductPage/:path*",
    "/login",
  ],
};