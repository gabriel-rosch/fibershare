import { createClient } from "@supabase/supabase-js"

async function fixDevUser() {
  console.log("Verificando e corrigindo usuário de desenvolvimento...")

  // Configurar cliente Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Variáveis de ambiente do Supabase não configuradas")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Verificar se existem múltiplos usuários com o email admin@fibershare.com
    const { data: existingUsers, error: countError } = await supabase
      .from("operators")
      .select("*")
      .eq("email", "admin@fibershare.com")

    if (countError) {
      throw new Error(`Erro ao verificar usuários existentes: ${countError.message}`)
    }

    console.log(`Encontrados ${existingUsers?.length || 0} usuários com o email admin@fibershare.com`)

    // Se existirem múltiplos usuários, remover todos
    if (existingUsers && existingUsers.length > 0) {
      const { error: deleteError } = await supabase.from("operators").delete().eq("email", "admin@fibershare.com")

      if (deleteError) {
        throw new Error(`Erro ao remover usuários existentes: ${deleteError.message}`)
      }

      console.log(`Removidos ${existingUsers.length} usuários existentes`)
    }

    // Criar um novo usuário de desenvolvimento
    const { data: newUser, error: insertError } = await supabase
      .from("operators")
      .insert([
        {
          id: "00000000-0000-0000-0000-000000000000",
          name: "FiberShare",
          email: "admin@fibershare.com",
          role: "admin",
          status: "active",
          region: "Florianópolis",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    if (insertError) {
      throw new Error(`Erro ao inserir novo usuário: ${insertError.message}`)
    }

    console.log("Usuário de desenvolvimento criado com sucesso:", newUser)
    console.log("Agora você pode usar o login de desenvolvedor na aplicação.")
  } catch (error) {
    console.error("Erro durante a correção do usuário de desenvolvimento:", error)
  }
}

// Executar o script
fixDevUser()
  .then(() => {
    console.log("Script concluído")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Erro no script:", error)
    process.exit(1)
  })
