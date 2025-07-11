import { NextResponse } from 'next/server';

// Função que lida com requisições GET
export async function GET(request: Request) {
  try {
    // Buscar os planos do backend Express
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    console.log('Tentando conectar com backend:', backendUrl);
    
    const response = await fetch(`${backendUrl}/api/operators/subscription-plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Adicionar timeout
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Planos obtidos do backend:', data.length);
      return NextResponse.json(data);
    }
    
    console.error('Backend retornou erro:', response.status, response.statusText);
    throw new Error(`Backend retornou erro: ${response.status}`);
    
  } catch (error) {
    console.error("Erro ao conectar com o backend:", error);
    
    // Retornar planos de fallback em caso de erro
    const fallbackPlans = [
      {
        id: "1",
        name: "Plano Básico",
        description: "Ideal para pequenas operadoras",
        stripePriceId: "price_basic_monthly",
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
        stripePriceId: "price_pro_monthly",
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
        stripePriceId: "price_enterprise_monthly",
        price: 499.90,
        currency: "BRL",
        interval: "month",
        intervalCount: 1,
        portsCapacity: 2000
      }
    ];
    
    console.log('Usando planos de fallback');
    return NextResponse.json(fallbackPlans);
  }
} 