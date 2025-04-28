// Este script pode ser executado manualmente para criar um usuário de desenvolvimento
// Execute com: npx ts-node scripts/create-dev-user.ts

import { createClient } from "@supabase/supabase-js"

async function createDevUser() {
  // Substitua com suas credenciais do Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Variáveis de ambiente do Supabase não configuradas")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Credenciais do usuário de desenvolvimento
  const email = "admin@fibershare.com"
  const password = "password123"
  const userData = {
    name: "Administrador",
    role: "admin",
  }

  try {
    // Verificar se o usuário já existe
    const { data: existingUser } = await supabase.from("auth.users").select("*").eq("email", email).single()

    if (existingUser) {
      console.log("Usuário de desenvolvimento já existe")
      return
    }

    // Criar o usuário
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      throw authError
    }

    if (authUser.user) {
      // Criar o perfil do usuário
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authUser.user.id,
        ...userData,
      })

      if (profileError) {
        throw profileError
      }

      console.log("Usuário de desenvolvimento criado com sucesso:", email)
    }
  } catch (error) {
    console.error("Erro ao criar usuário de desenvolvimento:", error)
  }
}

createDevUser()
