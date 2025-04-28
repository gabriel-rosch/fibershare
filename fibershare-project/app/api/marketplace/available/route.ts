import { NextResponse } from "next/server"
import { availablePorts } from "@/lib/mock-data/marketplace"

export async function GET(request: Request) {
  // Simular um pequeno atraso para imitar uma API real
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Obter parâmetros de consulta (para pesquisa e filtragem)
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")?.toLowerCase()

  let result = availablePorts

  // Filtrar resultados se houver um termo de pesquisa
  if (search) {
    result = availablePorts.filter(
      (port) =>
        port.location.toLowerCase().includes(search) ||
        port.provider.toLowerCase().includes(search) ||
        port.technology.toLowerCase().includes(search),
    )
  }

  return NextResponse.json(result)
}
