import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rotas que não precisam de autenticação
const publicRoutes = ["/", "/login", "/register", "/api/auth"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar se a rota é pública
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Verificar se o usuário está autenticado
  const authCookie = request.cookies.get("auth-storage")

  // Se não houver cookie de autenticação
  if (!authCookie) {
    // Redirecionar para a página de login
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Verificar se o cookie contém um usuário válido
  try {
    const authData = JSON.parse(authCookie.value)

    // Se não houver usuário no cookie ou se o usuário não estiver autenticado
    if (!authData.state.user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Se for um usuário de desenvolvimento, permitir o acesso
    if (authData.state.user.isDevelopmentUser) {
      return NextResponse.next()
    }

    // Verificar se o usuário tem um operadorId associado
    if (!authData.state.user.operatorId) {
      // Se o usuário não estiver associado a uma operadora e não estiver tentando acessar a página de perfil
      if (!pathname.startsWith("/profile")) {
        return NextResponse.redirect(new URL("/profile", request.url))
      }
    }

    // Para usuários normais, verificar se há token do Supabase
    // Isso seria feito verificando outro cookie específico do Supabase
    const supabaseAuthCookie = request.cookies.get("sb-auth-token")
    if (!supabaseAuthCookie) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  } catch (error) {
    // Se houver erro ao analisar o cookie, redirecionar para o login
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

// Configurar o middleware para ser executado em todas as rotas
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
