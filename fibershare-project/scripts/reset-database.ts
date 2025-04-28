import { createClient } from "@supabase/supabase-js"

async function resetDatabase() {
  console.log("Iniciando reset do banco de dados...")

  // Configurar cliente Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Variáveis de ambiente do Supabase não configuradas")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Lista de tabelas para limpar
    const tables = [
      "chat_messages",
      "chat_participants",
      "chat_conversations",
      "port_order_notes",
      "port_orders",
      "service_order_notes",
      "service_orders",
      "cto_ports",
      "ctos",
      "operators",
    ]

    // Limpar cada tabela
    for (const table of tables) {
      console.log(`Limpando tabela ${table}...`)
      const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000")

      if (error) {
        console.warn(`Erro ao limpar tabela ${table}: ${error.message}`)
      }
    }

    console.log("Reset do banco de dados concluído com sucesso!")
  } catch (error) {
    console.error("Erro durante o reset do banco de dados:", error)
  }
}

// Executar o script
resetDatabase()
  .then(() => {
    console.log("Script de reset concluído")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Erro no script de reset:", error)
    process.exit(1)
  })
