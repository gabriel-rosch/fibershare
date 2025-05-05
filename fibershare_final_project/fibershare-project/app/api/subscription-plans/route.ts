import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Importa o singleton do Prisma

// Função que lida com requisições GET
export async function GET(request: Request) {
  try {
    // Primeiro, tentamos buscar os planos do backend Express
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/operators/subscription-plans`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
      
      // Se a requisição falhar, continuamos para a busca direta no banco
      console.warn("Não foi possível buscar planos do backend, tentando acesso direto ao banco...");
    } catch (backendError) {
      console.error("Erro ao conectar com o backend:", backendError);
    }

    try {
      // Busca todos os planos marcados como 'ativos' no banco de dados
      const plans = await prisma.subscriptionPlan.findMany({
        where: {
          active: true, // Filtra apenas planos que você marcou como ativos no seu sistema
        },
        orderBy: {
          // Opcional: Ordenar os planos (ex: por preço)
          price: "asc",
        },
        // Seleciona apenas os campos que o frontend precisa
        select: {
          id: true,            // ID interno do plano no seu DB
          name: true,          // Nome do plano (ex: Básico Mensal)
          description: true,   // Descrição
          stripePriceId: true, // ID do Preço no Stripe (essencial para o checkout)
          price: true,         // Valor numérico do preço
          currency: true,      // Moeda (ex: BRL)
          interval: true,      // Intervalo (month, year)
          intervalCount: true, // Contagem do intervalo (1 para mensal/anual)
          portsCapacity: true, // Capacidade de portas incluída no plano
        },
      });

      // Retorna os planos encontrados como JSON
      return NextResponse.json(plans);
    } catch (prismaError) {
      console.error("Erro ao buscar planos via Prisma:", prismaError);
      
      // Se também falhar o acesso direto ao banco, retornamos planos de exemplo
      // para desenvolvimento/fallback
      return NextResponse.json([
        {
          id: "1",
          name: "Plano Básico",
          description: "Ideal para pequenas operadoras",
          stripePriceId: "price_1234",
          price: 99.90,
          currency: "BRL",
          interval: "month",
          intervalCount: 1,
          portsCapacity: 100
        },
        {
          id: "2",
          name: "Plano Profissional",
          description: "Para operadoras em crescimento",
          stripePriceId: "price_5678",
          price: 199.90,
          currency: "BRL",
          interval: "month",
          intervalCount: 1,
          portsCapacity: 500
        },
        {
          id: "3",
          name: "Plano Enterprise",
          description: "Para grandes operadoras",
          stripePriceId: "price_9012",
          price: 499.90,
          currency: "BRL",
          interval: "month",
          intervalCount: 1,
          portsCapacity: 2000
        }
      ]);
    }
  } catch (error) {
    // Captura e loga erros durante a busca
    console.error("Erro geral ao buscar planos via API:", error);
    return NextResponse.json(
      { error: "Falha ao buscar planos de assinatura." },
      { status: 500 }
    );
  }
} 