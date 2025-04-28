import { NextResponse } from "next/server"
import { portOrderService } from "@/lib/services/supabase/port-order-service"

export async function GET(request: Request) {
  console.log("GET /api/port-orders - Recebendo requisição")

  try {
    // Obter parâmetros de consulta (para pesquisa e filtragem)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as any
    const direction = searchParams.get("direction") as "incoming" | "outgoing" | "all" | undefined
    const ctoId = searchParams.get("ctoId") || undefined
    const search = searchParams.get("search") || undefined

    console.log("Parâmetros de busca:", { status, direction, ctoId, search })

    // Buscar ordens de porta do Supabase
    const orders = await portOrderService.getPortOrders(status, direction, ctoId, search)

    console.log("Ordens filtradas:", orders.length)

    return NextResponse.json(orders)
  } catch (error: any) {
    console.error("Erro ao buscar ordens de porta:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  console.log("POST /api/port-orders - Recebendo requisição")

  try {
    const body = await request.json()

    // Validar dados mínimos
    if (!body.ctoId || !body.portNumber || !body.ownerId) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 })
    }

    // Criar ordem de porta no Supabase
    const newOrder = await portOrderService.createPortOrder({
      cto_id: body.ctoId,
      port_number: body.portNumber,
      owner_id: body.ownerId,
      price: body.price || 45.0,
      installation_fee: body.installationFee || 100.0,
      note: body.note,
    })

    console.log("Nova ordem criada:", newOrder)

    return NextResponse.json(newOrder, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao criar ordem:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
