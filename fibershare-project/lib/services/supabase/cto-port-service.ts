import { createClient } from "@supabase/supabase-js"
import type { CTOPort, CTOPortStatus } from "@/lib/interfaces/service-interfaces"
import { authService } from "./auth-service"

export class SupabaseCTOPortService {
  private supabase: any

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    )
  }

  async getPortsByCTOId(ctoId: string): Promise<CTOPort[]> {
    // Obter o ID do operador atual
    const operatorId = await authService.getCurrentOperatorId()

    // Verificar se o usuário atual é um desenvolvedor
    const isDeveloper = await authService.isDeveloperUser()

    if (isDeveloper) {
      // Retornar dados mockados para desenvolvedores
      console.log("Usando dados mockados para portas de CTO")
      const { ctoPorts } = await import("@/lib/mock-data/cto-ports")
      return ctoPorts.filter((port) => port.ctoId === ctoId)
    }

    try {
      console.log(`Buscando portas da CTO ${ctoId} do Supabase`)

      // Primeiro, verificar se a CTO pertence à operadora do usuário atual
      if (operatorId) {
        const { data: ctoData, error: ctoError } = await this.supabase
          .from("ctos")
          .select("operator_id")
          .eq("id", ctoId)
          .single()

        if (ctoError || !ctoData || ctoData.operator_id !== operatorId) {
          throw new Error("Você não tem permissão para acessar as portas desta CTO")
        }
      }

      const { data, error } = await this.supabase
        .from("cto_ports")
        .select("*, operators(name)")
        .eq("cto_id", ctoId)
        .order("port_number")

      if (error) {
        console.error(`Erro ao buscar portas da CTO ${ctoId}:`, error)
        throw new Error(`Falha ao buscar portas: ${error.message}`)
      }

      return (data || []).map(this.mapPortFromDB)
    } catch (error) {
      console.error(`Erro ao buscar portas da CTO ${ctoId}:`, error)
      throw new Error(`Falha ao buscar portas: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async getPortById(id: string): Promise<CTOPort> {
    // Obter o ID do operador atual
    const operatorId = await authService.getCurrentOperatorId()

    // Verificar se o usuário atual é um desenvolvedor
    const isDeveloper = await authService.isDeveloperUser()

    if (isDeveloper) {
      // Retornar dados mockados para desenvolvedores
      const { ctoPorts } = await import("@/lib/mock-data/cto-ports")
      const port = ctoPorts.find((p) => p.id === id)
      if (!port) {
        throw new Error(`Porta não encontrada: ${id}`)
      }
      return port
    }

    try {
      // Buscar a porta
      const { data: portData, error: portError } = await this.supabase
        .from("cto_ports")
        .select("*, ctos(operator_id), operators(name)")
        .eq("id", id)
        .single()

      if (portError || !portData) {
        console.error(`Erro ao buscar porta ${id}:`, portError)
        throw new Error(`Porta não encontrada: ${id}`)
      }

      // Verificar se a porta pertence à operadora do usuário atual
      if (operatorId && portData.ctos && portData.ctos.operator_id !== operatorId) {
        throw new Error("Você não tem permissão para acessar esta porta")
      }

      return this.mapPortFromDB(portData)
    } catch (error) {
      console.error(`Erro ao buscar porta ${id}:`, error)
      throw new Error(`Falha ao buscar porta: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async updatePortStatus(id: string, status: CTOPortStatus, operatorId?: string): Promise<CTOPort> {
    // Obter o ID do operador atual
    const currentOperatorId = await authService.getCurrentOperatorId()

    // Verificar se o usuário atual é um desenvolvedor
    const isDeveloper = await authService.isDeveloperUser()

    if (isDeveloper) {
      // Simular atualização para desenvolvedores
      const { ctoPorts } = await import("@/lib/mock-data/cto-ports")
      const portIndex = ctoPorts.findIndex((p) => p.id === id)
      if (portIndex === -1) {
        throw new Error(`Porta não encontrada: ${id}`)
      }

      const updatedPort = {
        ...ctoPorts[portIndex],
        status,
        operatorId: operatorId || ctoPorts[portIndex].operatorId,
        updatedAt: new Date().toISOString(),
      }

      return updatedPort
    }

    try {
      // Buscar a porta para verificar permissões
      const { data: portData, error: portError } = await this.supabase
        .from("cto_ports")
        .select("*, ctos(operator_id)")
        .eq("id", id)
        .single()

      if (portError || !portData) {
        console.error(`Erro ao buscar porta ${id}:`, portError)
        throw new Error(`Porta não encontrada: ${id}`)
      }

      // Verificar se a porta pertence à operadora do usuário atual
      if (currentOperatorId && portData.ctos && portData.ctos.operator_id !== currentOperatorId) {
        throw new Error("Você não tem permissão para atualizar esta porta")
      }

      // Atualizar o status da porta
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      }

      // Se um operador foi especificado, atualize o campo operator_id
      if (operatorId) {
        updateData.operator_id = operatorId
      }

      const { data: updatedPort, error } = await this.supabase
        .from("cto_ports")
        .update(updateData)
        .eq("id", id)
        .select("*, operators(name)")
        .single()

      if (error) {
        console.error(`Erro ao atualizar status da porta ${id}:`, error)
        throw new Error(`Falha ao atualizar status: ${error.message}`)
      }

      return this.mapPortFromDB(updatedPort)
    } catch (error) {
      console.error(`Erro ao atualizar status da porta ${id}:`, error)
      throw new Error(`Falha ao atualizar status: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async reservePort(id: string, operatorId: string): Promise<CTOPort> {
    return this.updatePortStatus(id, "reserved", operatorId)
  }

  async releasePort(id: string): Promise<CTOPort> {
    return this.updatePortStatus(id, "available")
  }

  // Método auxiliar para mapear dados do banco para o formato da interface
  private mapPortFromDB(data: any): CTOPort {
    return {
      id: data.id,
      ctoId: data.cto_id,
      portNumber: data.port_number,
      status: data.status,
      price: data.price,
      currentTenantId: data.current_tenant_id,
      currentTenantName: data.current_tenant_name,
      operatorId: data.operator_id,
      operatorName: data.operators?.name,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      startDate: data.start_date,
      endDate: data.end_date,
      plan: data.plan,
      address: data.address,
    }
  }
}

// Exportar uma instância singleton para uso em toda a aplicação
export const ctoPortService = new SupabaseCTOPortService()
