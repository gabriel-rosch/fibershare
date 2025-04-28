import { NextResponse } from "next/server"
import { SupabaseChatService } from "@/lib/services/supabase/chat-service"

export async function GET(request: Request) {
  console.log("GET /api/chat - Recebendo requisição")

  try {
    // Buscar conversas do Supabase
    const conversations = await SupabaseChatService.getConversations()

    return NextResponse.json(conversations)
  } catch (error: any) {
    console.error("Erro ao buscar conversas:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  console.log("POST /api/chat - Recebendo requisição")

  try {
    const body = await request.json()

    // Validar dados mínimos
    if (!body.participantIds || !Array.isArray(body.participantIds) || body.participantIds.length === 0) {
      return NextResponse.json({ error: "Participantes são obrigatórios" }, { status: 400 })
    }

    // Criar conversa no Supabase
    const newConversation = await SupabaseChatService.createConversation(body.participantIds)

    console.log("Nova conversa criada:", newConversation)

    return NextResponse.json(newConversation, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao criar conversa:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
