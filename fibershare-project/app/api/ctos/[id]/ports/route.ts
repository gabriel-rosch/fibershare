import { NextResponse } from "next/server"
import { SupabaseCTOPortService } from "@/lib/services/supabase/cto-port-service"
import { authService } from "@/lib/services/supabase/auth-service"

// GET - Obter todas as portas de uma CTO específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  console.log(`GET /api/ctos/${params.id}/ports - Recebendo requisição`)

  try {
    // Verificar autenticação
    const currentOperatorId = await authService.getCurrentOperatorId()
    if (!currentOperatorId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar portas da CTO do Supabase
    const ports = await SupabaseCTOPortService.getPortsByCTO(params.id)

    return NextResponse.json(ports)
  } catch (error: any) {
    console.error(`Erro ao buscar portas da CTO ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
