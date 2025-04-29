import { createClient } from "@supabase/supabase-js"

async function seedDashboardData() {
  console.log("Iniciando seed de dados do dashboard...")

  // Inicializar cliente Supabase
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")

  // Verificar se já existem dados de dashboard
  const { data: existingData, error: checkError } = await supabase.from("dashboard_stats").select("id").limit(1)

  if (checkError) {
    console.error("Erro ao verificar dados de dashboard existentes:", checkError)
    return
  }

  if (existingData && existingData.length > 0) {
    console.log("Dados de dashboard já existem. Pulando seed.")
    return
  }

  // Dados de estatísticas do dashboard
  const dashboardStats = [
    {
      id: "my-ports",
      title: "Minhas Portas",
      value: "1.248",
      icon: "Network",
      color: "text-blue-500",
      description: "Total de portas em sua rede",
    },
    {
      id: "rented-ports",
      title: "Portas Alugadas",
      value: "386",
      icon: "Share2",
      color: "text-green-500",
      description: "Portas que você aluga de outros provedores",
    },
    {
      id: "network-idleness",
      title: "Ociosidade da Rede",
      value: "18%",
      icon: "Percent",
      color: "text-yellow-500",
      description: "Porcentagem de portas não utilizadas",
    },
    {
      id: "renting-out",
      title: "Estou Alugando",
      value: "237",
      icon: "DollarSign",
      color: "text-[#FF6B00]",
      description: "Portas que você aluga para outros provedores",
    },
  ]

  // Inserir estatísticas
  const { error: statsError } = await supabase.from("dashboard_stats").insert(dashboardStats)

  if (statsError) {
    console.error("Erro ao inserir estatísticas do dashboard:", statsError)
    return
  }

  console.log("Estatísticas do dashboard inseridas com sucesso")

  // Dados de atividades recentes
  const recentActivities = [
    {
      action: "Aluguel de porta",
      details: "Operadora XYZ alugou 12 portas na região Sul",
      date: new Date().toISOString(),
      type: "rental",
    },
    {
      action: "Nova disponibilidade",
      details: "25 novas portas disponíveis em São Paulo",
      date: new Date().toISOString(),
      type: "availability",
    },
    {
      action: "Contrato finalizado",
      details: "Contrato #4582 com Operadora ABC encerrado",
      date: new Date(Date.now() - 86400000).toISOString(), // Ontem
      type: "contract",
    },
    {
      action: "Solicitação de aluguel",
      details: "Operadora DEF solicitou 30 portas na região Norte",
      date: new Date(Date.now() - 86400000).toISOString(), // Ontem
      type: "request",
    },
    {
      action: "Atualização de preço",
      details: "Novos preços para portas na região Sudeste",
      date: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
      type: "price",
    },
  ]

  // Inserir atividades recentes
  const { error: activitiesError } = await supabase.from("dashboard_activities").insert(recentActivities)

  if (activitiesError) {
    console.error("Erro ao inserir atividades recentes:", activitiesError)
    return
  }

  console.log("Atividades recentes inseridas com sucesso")

  // Dados de resumo do marketplace
  const marketplaceSummary = {
    total_rented: 28450.0,
    total_received: 42680.0,
    period_balance: 14230.0,
    updated_at: new Date().toISOString(),
  }

  // Inserir resumo do marketplace
  const { error: summaryError } = await supabase.from("marketplace_summary").insert(marketplaceSummary)

  if (summaryError) {
    console.error("Erro ao inserir resumo do marketplace:", summaryError)
    return
  }

  console.log("Resumo do marketplace inserido com sucesso")
}

export { seedDashboardData }
