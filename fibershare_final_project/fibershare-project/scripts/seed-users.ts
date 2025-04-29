import { createClient } from "@supabase/supabase-js"

async function seedUsers() {
  console.log("Iniciando seed de usuários...")

  // Inicializar cliente Supabase
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")

  // Verificar se já existem usuários
  const { data: existingUsers, error: checkError } = await supabase.from("users").select("id").limit(1)

  if (checkError) {
    console.error("Erro ao verificar usuários existentes:", checkError)
    return
  }

  if (existingUsers && existingUsers.length > 0) {
    console.log("Usuários já existem. Pulando seed de usuários.")
    return
  }

  // Dados de exemplo para usuários
  const users = [
    {
      name: "John Doe",
      email: "john@example.com",
      role: "admin",
      status: "active",
      created_at: "2025-01-15",
      last_login: "2025-04-18",
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      role: "manager",
      status: "active",
      created_at: "2025-02-10",
      last_login: "2025-04-19",
    },
    {
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "technician",
      status: "active",
      created_at: "2025-02-22",
      last_login: "2025-04-15",
    },
    {
      name: "Alice Brown",
      email: "alice@example.com",
      role: "viewer",
      status: "inactive",
      created_at: "2025-03-05",
    },
    {
      name: "Carlos Mendes",
      email: "carlos@example.com",
      role: "manager",
      status: "active",
      created_at: "2025-03-12",
      last_login: "2025-04-17",
    },
    {
      name: "Maria Silva",
      email: "maria@example.com",
      role: "technician",
      status: "active",
      created_at: "2025-03-18",
      last_login: "2025-04-16",
    },
    {
      name: "David Lee",
      email: "david@example.com",
      role: "viewer",
      status: "inactive",
      created_at: "2025-03-25",
    },
  ]

  // Inserir usuários
  const { error: insertError } = await supabase.from("users").insert(users)

  if (insertError) {
    console.error("Erro ao inserir usuários:", insertError)
    return
  }

  console.log(`${users.length} usuários inseridos com sucesso`)
}

export { seedUsers }
