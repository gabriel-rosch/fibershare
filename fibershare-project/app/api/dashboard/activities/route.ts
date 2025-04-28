import { NextResponse } from "next/server"
import { dashboardService } from "@/lib/services/supabase/dashboard-service"

export async function GET() {
  try {
    const activities = await dashboardService.getRecentActivities()
    return NextResponse.json(activities)
  } catch (error) {
    console.error("Erro na API de atividades recentes:", error)
    return NextResponse.json({ error: "Falha ao buscar atividades recentes" }, { status: 500 })
  }
}
