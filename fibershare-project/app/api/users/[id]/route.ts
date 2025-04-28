import { NextResponse } from "next/server"
import { userService } from "@/lib/services/supabase/user-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await userService.getUserById(params.id)
    return NextResponse.json(user)
  } catch (error) {
    console.error(`Erro ao buscar usuário ${params.id}:`, error)
    return NextResponse.json({ error: "Falha ao buscar usuário" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const updatedUser = await userService.updateUser(params.id, data)
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error(`Erro ao atualizar usuário ${params.id}:`, error)
    return NextResponse.json({ error: "Falha ao atualizar usuário" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const result = await userService.deleteUser(params.id)
    return NextResponse.json(result)
  } catch (error) {
    console.error(`Erro ao excluir usuário ${params.id}:`, error)
    return NextResponse.json({ error: "Falha ao excluir usuário" }, { status: 500 })
  }
}
