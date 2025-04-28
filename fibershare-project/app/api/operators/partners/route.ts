import { NextResponse } from "next/server"
import { operatorService } from "@/lib/services/supabase/operator-service"
import { operators } from "@/lib/mock-data/operators"
import { authService } from "@/lib/services/supabase/auth-service"

export async function GET() {
  try {
    // Verificar se é um usuário desenvolvedor
    const isDeveloper = await authService.isDeveloperUser()

    // Se for desenvolvedor, retornar dados mockados
    if (isDeveloper) {
      // Simula um pequeno atraso de rede
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Seleciona algumas operadoras como parceiros (exceto a primeira, que geralmente é a atual)
      const partners = [
        operators[1], // Operadora ABC
        operators[3], // Operadora GHI
        operators[5] || operators[2], // Fallback caso não exista o índice 5
      ].filter(Boolean) // Remove undefined se houver

      return NextResponse.json(partners)
    }

    // Se não for desenvolvedor, buscar do Supabase
    const partners = await operatorService.getPartners()
    return NextResponse.json(partners)
  } catch (error) {
    console.error("Erro ao buscar parceiros:", error)
    return NextResponse.json({ error: "Falha ao buscar parceiros" }, { status: 500 })
  }
}
