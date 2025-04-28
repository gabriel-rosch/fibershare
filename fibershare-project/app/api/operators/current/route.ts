import { NextResponse } from "next/server"
import { operatorService } from "@/lib/services/supabase/operator-service"

export async function GET() {
  console.log("GET /api/operators/current - Recebendo requisição")

  try {
    // Usar a instância singleton do serviço em vez de chamar o método estaticamente
    const currentOperator = await operatorService.getCurrentOperator()

    return NextResponse.json(currentOperator)
  } catch (error: any) {
    console.error("Erro ao buscar operador atual:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
