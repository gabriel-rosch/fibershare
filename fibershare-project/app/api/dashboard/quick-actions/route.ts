import { NextResponse } from "next/server"
import { dashboardService } from "@/lib/services/supabase/dashboard-service"

export async function GET() {
  try {
    const actions = await dashboardService.getQuickActions()
    return NextResponse.json(actions)
  } catch (error) {
    console.error("Erro na API de ações rápidas:", error)
    return NextResponse.json({ error: "Falha ao buscar ações rápidas" }, { status: 500 })
  }
}
