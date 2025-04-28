import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { operatorService } from '@/lib/services/supabase/operator-service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Criar cliente Supabase
    const supabase = createRouteHandlerClient({ cookies })

    // Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: 'Erro ao criar usuário: ' + authError.message },
        { status: 400 }
      )
    }

    // Criar operador associado
    const operatorData = {
      name,
      email,
      role: 'operator',
      status: 'active',
    }

    const operator = await operatorService.createOperator(operatorData)

    return NextResponse.json({
      user: authData.user,
      operator
    })

  } catch (error) {
    console.error('Erro no cadastro:', error)
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    )
  }
} 