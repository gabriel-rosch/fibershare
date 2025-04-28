import { NextResponse } from "next/server"
import { operatorService } from "@/lib/services/supabase/operator-service"

export async function GET(request: Request) {
  console.log("GET /api/operators - Recebendo requisição")

  try {
    // Obter parâmetros de consulta (para pesquisa e filtragem)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || undefined
    const role = searchParams.get("role") || undefined
    const status = searchParams.get("status") || undefined

    console.log("Parâmetros de busca:", { search, role, status })

    // Buscar operadores do Supabase
    // Se estiver usando SupabaseOperatorService.getOperators() estaticamente, substitua por:
    // Usar a instância singleton do serviço
    const operators = await operatorService.getOperators(search, role, status)

    console.log("Operadoras filtradas:", operators.length)

    return NextResponse.json(operators)
  } catch (error: any) {
    console.error("Erro ao buscar operadores:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  console.log("POST /api/operators - Recebendo requisição")

  try {
    const body = await request.json()

    // Validar dados mínimos
    if (!body.name || !body.email) {
      return NextResponse.json({ error: "Nome e email são obrigatórios" }, { status: 400 })
    }

    // Criar operador no Supabase
    const newOperator = await operatorService.createOperator({
      name: body.name,
      email: body.email,
      role: body.role,
      status: body.status,
      region: body.region,
      avatarUrl: body.avatarUrl,
    })

    console.log("Novo operador criado:", newOperator)

    return NextResponse.json(newOperator, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao criar operador:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
