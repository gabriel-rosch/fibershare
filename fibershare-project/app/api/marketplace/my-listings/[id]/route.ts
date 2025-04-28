import { NextResponse } from "next/server"
import { myListings } from "@/lib/mock-data/marketplace"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Simular um pequeno atraso para imitar uma API real
  await new Promise((resolve) => setTimeout(resolve, 200))

  const listing = myListings.find((l) => l.id === params.id)

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 })
  }

  return NextResponse.json(listing)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  // Simular um pequeno atraso para imitar uma API real
  await new Promise((resolve) => setTimeout(resolve, 300))

  try {
    const body = await request.json()

    // Em um backend real, você atualizaria o registro no banco de dados
    // Aqui, apenas simulamos uma resposta bem-sucedida

    return NextResponse.json({
      id: params.id,
      ...body,
      updated: true,
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  // Simular um pequeno atraso para imitar uma API real
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Em um backend real, você excluiria o registro do banco de dados
  // Aqui, apenas simulamos uma resposta bem-sucedida

  return NextResponse.json({
    id: params.id,
    deleted: true,
  })
}
