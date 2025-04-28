import { createClient } from "@supabase/supabase-js"

// Configuração do cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTable(tableName: string) {
  try {
    const { data, error, count } = await supabase.from(tableName).select("*", { count: "exact" })

    if (error) throw error

    console.log(`✅ Tabela ${tableName}: ${count} registros`)
    return { success: true, count }
  } catch (error) {
    console.error(`❌ Erro ao verificar tabela ${tableName}:`, error)
    return { success: false, error }
  }
}

async function checkDatabase() {
  console.log("🔍 Verificando status do banco de dados...")

  // Verificar conexão com o Supabase
  try {
    const { data, error } = await supabase.from("operators").select("count")
    if (error) throw error
    console.log("✅ Conexão com o Supabase estabelecida com sucesso!")
  } catch (error) {
    console.error("❌ Erro ao conectar com o Supabase:", error)
    console.error("⚠️ Verifique suas variáveis de ambiente e conexão com o banco de dados.")
    process.exit(1)
  }

  // Lista de tabelas para verificar
  const tables = [
    "operators",
    "ctos",
    "cto_ports",
    "service_orders",
    "service_order_notes",
    "port_orders",
    "port_order_notes",
    "chat_conversations",
    "chat_participants",
    "chat_messages",
    "users",
  ]

  const results = {}

  for (const table of tables) {
    const result = await checkTable(table)
    results[table] = result
  }

  console.log("\n📊 Resumo do status do banco de dados:")
  for (const [table, result] of Object.entries(results)) {
    if (result.success) {
      console.log(`- ${table}: ${result.count} registros`)
    } else {
      console.log(`- ${table}: ERRO`)
    }
  }

  console.log("\n🔧 Se alguma tabela estiver vazia ou com erro, execute:")
  console.log("  npm run seed:all")
  console.log("\n🔄 Para reiniciar completamente o banco de dados, execute:")
  console.log("  npm run reset-db && npm run init-db && npm run seed:all")
}

// Executar a função principal
checkDatabase().catch((error) => {
  console.error("❌ Erro durante a verificação do banco de dados:", error)
  process.exit(1)
})
