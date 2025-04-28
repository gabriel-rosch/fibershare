import { NextResponse } from "next/server"
import { SupabaseCTOService } from "@/lib/services/supabase/cto-service"
import { SupabaseOperatorService } from "@/lib/services/supabase/operator-service"

// GET - Listar todas as CTOs
export async function GET(request: Request) {
  console.log("GET /api/ctos - Recebendo requisição")

  try {
    // Obter parâmetros de consulta (para pesquisa e filtragem)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.toLowerCase()
    const minIdleness = searchParams.get("minIdleness") ? Number(searchParams.get("minIdleness")) : undefined
    const maxIdleness = searchParams.get("maxIdleness") ? Number(searchParams.get("maxIdleness")) : undefined
    const region = searchParams.get("region") || undefined

    console.log("Parâmetros de busca:", { search, minIdleness, maxIdleness, region })

    // Buscar CTOs do Supabase
    const ctos = await SupabaseCTOService.getCTOs(search || undefined, minIdleness, maxIdleness, region)

    console.log("CTOs filtradas:", ctos.length)

    return NextResponse.json(ctos)
  } catch (error: any) {
    console.error("Erro ao buscar CTOs:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Criar uma nova CTO
export async function POST(request: Request) {
  console.log("POST /api/ctos - Recebendo requisição")

  try {
    const body = await request.json()

    // Validar dados mínimos
    if (!body.name || !body.coordinates || !body.total_ports) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 })
    }

    // Obter o operador atual
    const currentOperator = await SupabaseOperatorService.getCurrentOperator()

    // Criar CTO no Supabase
    const newCTO = await SupabaseCTOService.createCTO({
      name: body.name,
      description: body.description || "",
      total_ports: body.total_ports,
      occupied_ports: body.occupied_ports || 0,
      coordinates: body.coordinates,
      owner_id: currentOperator.id,
      region: body.region,
    })

    console.log("Nova CTO criada:", newCTO)

    return NextResponse.json(newCTO, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao criar CTO:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
