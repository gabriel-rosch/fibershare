import { NextResponse } from "next/server"
import { SupabaseCTOService } from "@/lib/services/supabase/cto-service"
import { SupabaseCTOPortService } from "@/lib/services/supabase/cto-port-service"

// GET - Obter detalhes de uma CTO específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  console.log(`GET /api/ctos/${params.id} - Recebendo requisição`)

  try {
    // Buscar CTO do Supabase
    const cto = await SupabaseCTOService.getCTOById(params.id)

    // Buscar portas da CTO
    const ports = await SupabaseCTOPortService.getPortsByCTO(params.id)

    // Adicionar portas à resposta
    const response = {
      ...cto,
      ports,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error(`Erro ao buscar CTO ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Atualizar uma CTO existente
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  console.log(`PUT /api/ctos/${params.id} - Recebendo requisição`)

  try {
    const body = await request.json()

    // Atualizar CTO no Supabase
    const updatedCTO = await SupabaseCTOService.updateCTO(params.id, {
      name: body.name,
      description: body.description,
      total_ports: body.total_ports,
      occupied_ports: body.occupied_ports,
      coordinates: body.coordinates,
      owner_id: body.owner_id,
      region: body.region,
      status: body.status,
    })

    console.log(`CTO ${params.id} atualizada:`, updatedCTO)

    return NextResponse.json(updatedCTO)
  } catch (error: any) {
    console.error(`Erro ao atualizar CTO ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Excluir uma CTO
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  console.log(`DELETE /api/ctos/${params.id} - Recebendo requisição`)

  try {
    // Excluir CTO do Supabase
    const result = await SupabaseCTOService.deleteCTO(params.id)

    console.log(`CTO ${params.id} excluída`)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error(`Erro ao excluir CTO ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
