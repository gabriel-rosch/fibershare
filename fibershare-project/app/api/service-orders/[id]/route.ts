import { type NextRequest, NextResponse } from "next/server"
import { serviceOrderService } from "@/lib/services/supabase/service-order-service"
import type { ServiceOrderStatus } from "@/lib/interfaces/service-interfaces"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log(`GET /api/service-orders/${id}`)

    const order = await serviceOrderService.getServiceOrderById(id)
    return NextResponse.json(order)
  } catch (error: any) {
    console.error(`Erro ao buscar ordem de serviço ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()
    console.log(`PATCH /api/service-orders/${id} - Dados:`, data)

    const status = data.status as ServiceOrderStatus
    const note = data.note as string | undefined

    const updatedOrder = await serviceOrderService.updateServiceOrder(id, status, note)
    return NextResponse.json(updatedOrder)
  } catch (error: any) {
    console.error(`Erro ao atualizar ordem de serviço ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
