import { NextResponse } from "next/server"
import { dashboardService } from "@/lib/services/supabase/dashboard-service"

export async function GET() {
  try {
    const summary = await dashboardService.getMarketplaceSummary()
    return NextResponse.json(summary)
  } catch (error) {
    console.error("Erro na API de resumo do marketplace:", error)
    return NextResponse.json({ error: "Falha ao buscar resumo do marketplace" }, { status: 500 })
  }
}
