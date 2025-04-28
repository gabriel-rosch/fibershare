import { NextResponse } from "next/server"
import { portOrderService } from "@/lib/services/supabase/port-order-service"

// GET - Obter detalhes de uma ordem de porta específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  console.log(`GET /api/port-orders/${params.id} - Recebendo requisição`)

  try {
    // Buscar ordem de porta do Supabase
    const order = await portOrderService.getPortOrderById(params.id)

    return NextResponse.json(order)
  } catch (error: any) {
    console.error(`Erro ao buscar ordem de porta ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Atualizar uma ordem de porta existente
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  console.log(`PUT /api/port-orders/${params.id} - Recebendo requisição`)

  try {
    const body = await request.json()

    // Atualizar ordem de porta no Supabase
    const updatedOrder = await portOrderService.updatePortOrder(params.id, {
      status: body.status,
      contract_signed_by_requester: body.contractSignedByRequester,
      contract_signed_by_owner: body.contractSignedByOwner,
      scheduled_date: body.scheduledDate,
      completed_date: body.completedDate,
      note: body.note,
    })

    console.log(`Ordem de porta ${params.id} atualizada:`, updatedOrder)

    return NextResponse.json(updatedOrder)
  } catch (error: any) {
    console.error(`Erro ao atualizar ordem de porta ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Adicionar uma nota a uma ordem de porta
export async function POST(request: Request, { params }: { params: { id: string } }) {
  console.log(`POST /api/port-orders/${params.id} - Recebendo requisição`)

  try {
    const body = await request.json()

    // Validar dados mínimos
    if (!body.note) {
      return NextResponse.json({ error: "Nota é obrigatória" }, { status: 400 })
    }

    // Adicionar nota à ordem de porta no Supabase
    const newNote = await portOrderService.addNoteToOrder(params.id, body.note)

    console.log(`Nota adicionada à ordem de porta ${params.id}:`, newNote)

    return NextResponse.json(newNote, { status: 201 })
  } catch (error: any) {
    console.error(`Erro ao adicionar nota à ordem de porta ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
