import { NextResponse } from "next/server"
import { dashboardService } from "@/lib/services/supabase/dashboard-service"

export async function GET() {
  try {
    const stats = await dashboardService.getDashboardStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Erro na API de estatísticas do dashboard:", error)
    return NextResponse.json({ error: "Falha ao buscar estatísticas do dashboard" }, { status: 500 })
  }
}
