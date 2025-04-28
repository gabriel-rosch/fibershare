import { NextResponse } from "next/server"
import { authService } from "@/lib/services/supabase/auth-service"

export async function POST(request: Request) {
  try {
    const { userId, newPassword } = await request.json()

    if (!userId || !newPassword) {
      return NextResponse.json({ error: "ID do usuário e nova senha são obrigatórios" }, { status: 400 })
    }

    // Validar a força da senha
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 8 caracteres" }, { status: 400 })
    }

    const { success, error } = await authService.updatePassword(userId, newPassword)

    if (!success) {
      throw error || new Error("Falha ao atualizar a senha")
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Erro ao processar primeiro acesso:", error)
    return NextResponse.json({ error: error.message || "Falha ao processar primeiro acesso" }, { status: 500 })
  }
}
