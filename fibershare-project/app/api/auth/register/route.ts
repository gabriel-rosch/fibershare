import { NextResponse } from "next/server"
import { authService } from "@/lib/services/supabase/auth-service"
import { operatorService } from "@/lib/services/supabase/operator-service"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Verificar se o email já está em uso
    const emailInUse = await authService.isEmailInUse(data.email)
    if (emailInUse) {
      return NextResponse.json({ error: "Email já está em uso" }, { status: 400 })
    }

    // Verificar se a operadora existe
    try {
      await operatorService.getOperatorById(data.operatorId)
    } catch (error) {
      return NextResponse.json({ error: "Operadora não encontrada" }, { status: 400 })
    }

    // Registrar o usuário
    const { user, error } = await authService.registerUser({
      email: data.email,
      password: data.password,
      name: data.name,
      operatorId: data.operatorId,
      role: data.role || "viewer", // Papel padrão
    })

    if (error) {
      console.error("Erro ao registrar usuário:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error: any) {
    console.error("Erro na API de registro:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
