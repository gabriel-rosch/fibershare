import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📝 Recebendo dados de registro:', { 
      operatorName: body.operatorName,
      adminEmail: body.adminEmail 
    });
    
    // Validar dados básicos
    const requiredFields = [
      'operatorName',
      'operatorEmail',
      'adminName',
      'adminEmail',
      'adminPassword',
      'stripePriceId',
      'region',
      'description',
      'contactEmail',
      'contactPhone'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Campo ${field} é obrigatório` },
          { status: 400 }
        );
      }
    }

    // Fazer requisição para o backend Express
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    console.log('🔄 Enviando para backend:', backendUrl);
    
    const response = await fetch(`${backendUrl}/api/auth/register-operator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erro do backend:', data);
      return NextResponse.json(
        { error: data.message || data.error || 'Erro interno do servidor' },
        { status: response.status }
      );
    }

    console.log('✅ Sucesso do backend:', { 
      operatorId: data.operatorId,
      developmentMode: data.developmentMode 
    });

    // Se for modo de desenvolvimento ou não tiver URL de checkout
    if (data.developmentMode || !data.checkoutUrl) {
      return NextResponse.json({
        success: true,
        operatorId: data.operatorId,
        message: data.message || 'Operadora registrada com sucesso!',
        developmentMode: data.developmentMode,
        redirectTo: `/register-success?operatorId=${data.operatorId}&dev=${data.developmentMode ? 'true' : 'false'}`
      }, { status: 201 });
    }

    // Modo produção com Stripe
    return NextResponse.json({
      success: true,
      operatorId: data.operatorId,
      checkoutUrl: data.checkoutUrl
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Erro na API do frontend:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 