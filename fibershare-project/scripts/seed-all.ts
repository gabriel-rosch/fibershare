import { createClient } from "@supabase/supabase-js"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

// Configuração do cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

async function runScript(scriptName: string): Promise<void> {
  console.log(`\n🌱 Executando script: ${scriptName}...`)
  try {
    const { stdout, stderr } = await execAsync(`ts-node --transpile-only scripts/${scriptName}.ts`)
    if (stdout) console.log(stdout)
    if (stderr) console.error(stderr)
    console.log(`✅ Script ${scriptName} concluído com sucesso!`)
  } catch (error) {
    console.error(`❌ Erro ao executar o script ${scriptName}:`, error)
  }
}

async function seedAll() {
  console.log("🚀 Iniciando processo de seed completo do banco de dados...")

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

  // Executar scripts na ordem correta
  const scripts = [
    "seed-database", // Script principal
    "seed-users", // Seed de usuários
    "seed-dashboard", // Seed de dados do dashboard
    "seed-port-orders", // Seed de ordens de porta
    "fix-dev-user", // Garantir que o usuário de desenvolvimento esteja correto
  ]

  for (const script of scripts) {
    await runScript(script)
  }

  console.log("\n🎉 Processo de seed completo finalizado com sucesso!")
  console.log("📊 O banco de dados foi populado com todos os dados necessários.")
  console.log("🔍 Você pode verificar os dados no painel do Supabase.")
}

// Executar a função principal
seedAll().catch((error) => {
  console.error("❌ Erro durante o processo de seed:", error)
  process.exit(1)
})
