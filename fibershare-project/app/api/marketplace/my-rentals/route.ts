import { NextResponse } from "next/server"
import { myRentals } from "@/lib/mock-data/marketplace"

export async function GET() {
  // Simular um pequeno atraso para imitar uma API real
  await new Promise((resolve) => setTimeout(resolve, 200))

  return NextResponse.json(myRentals)
}
