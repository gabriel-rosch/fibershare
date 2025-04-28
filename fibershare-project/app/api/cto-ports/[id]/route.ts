import { NextResponse } from "next/server"
import { SupabaseCTOPortService } from "@/lib/services/supabase/cto-port-service"
// Alterar esta linha para importar a instância em vez da classe
import { authService } from "@/lib/services/supabase/auth-service"

// GET - Obter detalhes de uma porta específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  console.log(`GET /api/cto-ports/${params.id} - Recebendo requisição`)

  try {
    // Verificar autenticação
    // Alterar para usar a instância authService
    const currentOperatorId = await authService.getCurrentOperatorId()
    if (!currentOperatorId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar porta do Supabase
    const port = await SupabaseCTOPortService.getPortById(params.id)

    return NextResponse.json(port)
  } catch (error: any) {
    console.error(`Erro ao buscar porta ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Atualizar o preço de uma porta
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  console.log(`PATCH /api/cto-ports/${params.id} - Recebendo requisição`)

  try {
    // Verificar autenticação
    // Alterar para usar a instância authService
    const currentOperatorId = await authService.getCurrentOperatorId()
    if (!currentOperatorId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()

    // Validar o preço
    if (body.price === undefined || body.price === null) {
      return NextResponse.json({ error: "Preço é obrigatório" }, { status: 400 })
    }

    const price = Number(body.price)
    if (isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Preço inválido" }, { status: 400 })
    }

    // Atualizar o preço da porta
    const updatedPort = await SupabaseCTOPortService.updatePortPrice(params.id, price)

    return NextResponse.json(updatedPort)
  } catch (error: any) {
    console.error(`Erro ao atualizar preço da porta ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Atualizar o status de uma porta (reservar, disponibilizar, etc.)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  console.log(`PUT /api/cto-ports/${params.id} - Recebendo requisição`)

  try {
    // Verificar autenticação
    // Alterar para usar a instância authService
    const currentOperatorId = await authService.getCurrentOperatorId()
    if (!currentOperatorId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()

    // Validar o status
    if (!body.status) {
      return NextResponse.json({ error: "Status é obrigatório" }, { status: 400 })
    }

    const validStatuses = ["available", "reserved", "occupied", "maintenance"]
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 })
    }

    // Atualizar o status da porta
    const updatedPort = await SupabaseCTOPortService.updatePortStatus(params.id, body.status)

    return NextResponse.json(updatedPort)
  } catch (error: any) {
    console.error(`Erro ao atualizar status da porta ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
