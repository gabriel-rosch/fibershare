import { NextResponse } from "next/server"
import { userService } from "@/lib/services/supabase/user-service"
import { authService } from "@/lib/services/supabase/auth-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || undefined
    const role = searchParams.get("role") || undefined
    const status = searchParams.get("status") || undefined

    const users = await userService.getUsers(search, role, status)
    return NextResponse.json(users)
  } catch (error) {
    console.error("Erro na API de usuários:", error)
    return NextResponse.json({ error: "Falha ao buscar usuários" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Verificar se o email já está em uso
    const emailInUse = await authService.isEmailInUse(data.email)
    if (emailInUse) {
      return NextResponse.json({ error: "Email já está em uso" }, { status: 400 })
    }

    const newUser = await userService.createUser(data)
    return NextResponse.json(newUser)
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json({ error: error.message || "Falha ao criar usuário" }, { status: 500 })
  }
}
