import { NextResponse } from "next/server"
import { myListings } from "@/lib/mock-data/marketplace"

export async function GET() {
  // Simular um pequeno atraso para imitar uma API real
  await new Promise((resolve) => setTimeout(resolve, 250))

  return NextResponse.json(myListings)
}

export async function POST(request: Request) {
  // Simular um pequeno atraso para imitar uma API real
  await new Promise((resolve) => setTimeout(resolve, 300))

  try {
    const body = await request.json()

    // Em um backend real, você criaria um novo registro no banco de dados
    // Aqui, apenas simulamos uma resposta bem-sucedida com um ID gerado

    const newId = `${Date.now()}`

    return NextResponse.json(
      {
        id: newId,
        ...body,
        created: true,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
