import { createClient } from "@supabase/supabase-js"

export interface DashboardStat {
  id: string
  title: string
  value: string
  icon: string
  color: string
  description: string
}

export interface Activity {
  id: string
  action: string
  details: string
  date: string
  type: string
}

export interface QuickAction {
  id: string
  title: string
  icon: string
}

export interface MarketplaceSummary {
  totalRented: string
  totalReceived: string
  periodBalance: string
}

export class SupabaseDashboardService {
  private supabase: any

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    )
  }

  async getDashboardStats(): Promise<DashboardStat[]> {
    try {
      // Buscar dados reais do Supabase
      const { data: ctoData, error: ctoError } = await this.supabase.from("cto_ports").select("*")

      if (ctoError) throw ctoError

      // Calcular estatísticas com base nos dados reais
      const totalPorts = ctoData?.length || 0
      const rentedPorts = ctoData?.filter((port) => port.status === "rented")?.length || 0
      const availablePorts = ctoData?.filter((port) => port.status === "available")?.length || 0
      const rentingOut = ctoData?.filter((port) => port.status === "rented_out")?.length || 0

      // Calcular ociosidade
      const idlePercentage = totalPorts > 0 ? Math.round((availablePorts / totalPorts) * 100) : 0

      // Retornar estatísticas formatadas
      return [
        {
          id: "my-ports",
          title: "Minhas Portas",
          value: totalPorts.toString(),
          icon: "Network",
          color: "text-blue-500",
          description: "Total de portas em sua rede",
        },
        {
          id: "rented-ports",
          title: "Portas Alugadas",
          value: rentedPorts.toString(),
          icon: "Share2",
          color: "text-green-500",
          description: "Portas que você aluga de outros provedores",
        },
        {
          id: "network-idleness",
          title: "Ociosidade da Rede",
          value: `${idlePercentage}%`,
          icon: "Percent",
          color: "text-yellow-500",
          description: "Porcentagem de portas não utilizadas",
        },
        {
          id: "renting-out",
          title: "Estou Alugando",
          value: rentingOut.toString(),
          icon: "DollarSign",
          color: "text-[#FF6B00]",
          description: "Portas que você aluga para outros provedores",
        },
      ]
    } catch (error) {
      console.error("Erro ao buscar estatísticas do dashboard:", error)
      throw error
    }
  }

  async getRecentActivities(): Promise<Activity[]> {
    try {
      // Buscar atividades recentes do Supabase
      // Combinando dados de ordens de serviço e ordens de porta para criar um feed de atividades
      const { data: portOrders, error: portOrdersError } = await this.supabase
        .from("port_orders")
        .select(`
          id,
          status,
          created_at,
          updated_at,
          requester:requester_id(name),
          owner:owner_id(name),
          cto:cto_id(name)
        `)
        .order("updated_at", { ascending: false })
        .limit(5)

      if (portOrdersError) throw portOrdersError

      // Transformar os dados em atividades
      const activities: Activity[] = (portOrders || []).map((order, index) => {
        let action = "Aluguel de porta"
        let details = `${order.requester?.name} solicitou aluguel de porta em ${order.cto?.name}`
        let type = "rental"

        // Ajustar com base no status
        if (order.status === "completed") {
          action = "Contrato finalizado"
          details = `Contrato com ${order.requester?.name} para ${order.cto?.name} concluído`
          type = "contract"
        } else if (order.status === "pending_approval") {
          action = "Solicitação de aluguel"
          details = `${order.requester?.name} solicitou aluguel em ${order.cto?.name}`
          type = "request"
        }

        // Formatar data
        const date = new Date(order.updated_at)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        let dateStr = ""
        if (date.toDateString() === today.toDateString()) {
          dateStr = `Hoje, ${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
        } else if (date.toDateString() === yesterday.toDateString()) {
          dateStr = `Ontem, ${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
        } else {
          dateStr = date.toLocaleDateString("pt-BR")
        }

        return {
          id: order.id,
          action,
          details,
          date: dateStr,
          type,
        }
      })

      return activities
    } catch (error) {
      console.error("Erro ao buscar atividades recentes:", error)
      throw error
    }
  }

  async getQuickActions(): Promise<QuickAction[]> {
    // Estas são ações estáticas, não precisam vir do banco
    return [
      { id: "1", title: "Disponibilizar Portas", icon: "Network" },
      { id: "2", title: "Buscar Portas", icon: "Share2" },
      { id: "3", title: "Gerenciar Contratos", icon: "DollarSign" },
      { id: "4", title: "Relatório de Utilização", icon: "BarChart3" },
    ]
  }

  async getMarketplaceSummary(): Promise<MarketplaceSummary> {
    try {
      // Buscar dados de ordens de porta para calcular o resumo
      const { data: portOrders, error: portOrdersError } = await this.supabase.from("port_orders").select("*")

      if (portOrdersError) throw portOrdersError

      // Calcular valores com base nos dados reais
      let totalRented = 0
      let totalReceived = 0

      portOrders?.forEach((order) => {
        if (order.requester_id === "op-007") {
          // Assumindo que op-007 é o ID do usuário atual
          totalRented += order.price || 0
        }
        if (order.owner_id === "op-007") {
          totalReceived += order.price || 0
        }
      })

      // Calcular saldo
      const periodBalance = totalReceived - totalRented

      // Formatar valores como moeda
      const formatter = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      })

      return {
        totalRented: formatter.format(totalRented),
        totalReceived: formatter.format(totalReceived),
        periodBalance: formatter.format(periodBalance),
      }
    } catch (error) {
      console.error("Erro ao buscar resumo do marketplace:", error)
      throw error
    }
  }
}

// Exportar uma instância singleton para uso em toda a aplicação
export const dashboardService = new SupabaseDashboardService()
