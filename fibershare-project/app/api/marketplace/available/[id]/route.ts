import { NextResponse } from "next/server"
import { availablePorts } from "@/lib/mock-data/marketplace"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Simular um pequeno atraso para imitar uma API real
  await new Promise((resolve) => setTimeout(resolve, 200))

  const port = availablePorts.find((p) => p.id === params.id)

  if (!port) {
    return NextResponse.json({ error: "Port not found" }, { status: 404 })
  }

  return NextResponse.json(port)
}
