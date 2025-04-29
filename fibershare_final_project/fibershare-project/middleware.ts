import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Verificar se o usuário está autenticado
  const token = request.cookies.get('authToken')?.value;
  const isPublicPath = request.nextUrl.pathname === '/login' || 
                      request.nextUrl.pathname === '/register';

  // Se não estiver autenticado e não estiver em uma página de autenticação, redirecionar para login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se estiver autenticado e estiver em uma página de autenticação, redirecionar para dashboard
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configurar quais rotas devem passar pelo middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/login',
    '/register'
  ],
};
