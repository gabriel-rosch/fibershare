import { NextResponse } from "next/server"
import { SupabaseChatService } from "@/lib/services/supabase/chat-service"

// GET - Obter detalhes de uma conversa específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  console.log(`GET /api/chat/${params.id} - Recebendo requisição`)

  try {
    // Buscar conversa do Supabase
    const conversation = await SupabaseChatService.getConversation(params.id)

    return NextResponse.json(conversation)
  } catch (error: any) {
    console.error(`Erro ao buscar conversa ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Enviar uma mensagem para uma conversa
export async function POST(request: Request, { params }: { params: { id: string } }) {
  console.log(`POST /api/chat/${params.id} - Recebendo requisição`)

  try {
    const body = await request.json()

    // Validar dados mínimos
    if (!body.content) {
      return NextResponse.json({ error: "Conteúdo da mensagem é obrigatório" }, { status: 400 })
    }

    // Enviar mensagem no Supabase
    const newMessage = await SupabaseChatService.sendMessage(params.id, body.content)

    console.log(`Mensagem enviada para conversa ${params.id}:`, newMessage)

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error: any) {
    console.error(`Erro ao enviar mensagem para conversa ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Marcar mensagens como lidas
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  console.log(`PUT /api/chat/${params.id} - Recebendo requisição`)

  try {
    // Marcar mensagens como lidas no Supabase
    await SupabaseChatService.markMessagesAsRead(params.id)

    console.log(`Mensagens da conversa ${params.id} marcadas como lidas`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`Erro ao marcar mensagens como lidas na conversa ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
