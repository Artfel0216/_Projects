import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. ROTAS PROTEGIDAS (Exigem que o usuário esteja LOGADO)
const PRIVATE_ROUTES = [
  '/PersonalPage',
  '/TrainingPage',
  '/StatsPage',
  '/ProPage',
  '/ProfilePage',
  '/PaymentPage'
];

// 2. ROTAS DE AUTENTICAÇÃO (Públicas, mas se o usuário JÁ estiver logado, ele é mandado para o Dashboard)
const AUTH_ROUTES = [
  '/LoginPage', // Ajuste aqui caso sua página de login tenha outro nome (ex: /login)
  '/RegisterPage' // Cadastro fica aqui para que visitantes consigam criar conta!
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 3. RECUPERA O COOKIE DE AUTENTICAÇÃO
  const token = request.cookies.get('wegym.token')?.value;

  // 4. REGRA 1: Bloqueio de Acesso Direto sem Login
  const isPrivateRoute = PRIVATE_ROUTES.some(route => pathname.startsWith(route));
  
  if (isPrivateRoute && !token) {
    // Redireciona para a página de login (ajuste a rota '/LoginPage' se necessário)
    const loginUrl = new URL('/LoginPage', request.url);
    
    // Salva a página que ele tentou invadir para redirecionar de volta após o login
    loginUrl.searchParams.set('callbackUrl', pathname); 
    
    return NextResponse.redirect(loginUrl);
  }

  // 5. REGRA 2: Evita tela de Login/Cadastro para quem já está logado
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  if (isAuthRoute && token) {
    // Se já está logado, manda direto para a página principal do painel
    return NextResponse.redirect(new URL('/PersonalPage', request.url));
  }

  return NextResponse.next();
}

// 6. MATCHER DE PERFORMANCE (Ignora arquivos do sistema e imagens)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\..*$).*)',
  ],
};