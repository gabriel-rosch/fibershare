import { type NextRequest, NextResponse } from "next/server"
import { serviceOrderService } from "@/lib/services/supabase/service-order-service"

export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros da query
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") as string | undefined
    const status = searchParams.get("status") as string | undefined
    const direction = searchParams.get("direction") as "incoming" | "outgoing" | "all" | undefined

    console.log(`GET /api/service-orders - Parâmetros: type=${type}, status=${status}, direction=${direction}`)

    // Buscar ordens de serviço do Supabase
    const orders = await serviceOrderService.getServiceOrders(type, status, direction)
    return NextResponse.json(orders)
  } catch (error: any) {
    console.error("Erro ao buscar ordens de serviço:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log(`POST /api/service-orders - Dados: ${JSON.stringify(data)}`)

    // Criar ordem de serviço no Supabase
    const newOrder = await serviceOrderService.createServiceOrder({
      type: data.type,
      title: data.title,
      description: data.description,
      target_id: data.targetId,
      initial_note: data.initialNote,
    })

    return NextResponse.json(newOrder)
  } catch (error: any) {
    console.error("Erro ao criar ordem de serviço:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
