import { supabase } from "@/lib/services/supabase/supabase-client"
import type { CTOPort, CTOPortStatus } from "@/lib/interfaces/service-interfaces"

class CTOPortService {
  async getPortsByCTOId(ctoId: string): Promise<{ ports: CTOPort[], occupiedCount: number }> {
    try {
      console.log(`Buscando portas da CTO ${ctoId} do Supabase`)

      const { data, error } = await supabase
        .from("cto_ports")
        .select("*")
        .eq("cto_id", ctoId)
        .order("port_number")

      if (error) {
        console.error(`Erro ao buscar portas da CTO ${ctoId}:`, error)
        throw new Error(`Falha ao buscar portas: ${error.message}`)
      }

      const ports = (data || []).map(port => this.mapPortFromDB(port))
      const occupiedCount = ports.filter(port => 
        port.status === "occupied" || port.status === "reserved"
      ).length

      return {
        ports,
        occupiedCount
      }
    } catch (error) {
      console.error(`Erro ao buscar portas da CTO ${ctoId}:`, error)
      throw error
    }
  }

  async getPortById(id: string): Promise<CTOPort> {
    try {
      const { data, error } = await supabase
        .from("cto_ports")
        .select("*")
        .eq("id", id)
        .single()

      if (error || !data) {
        throw new Error(`Porta não encontrada: ${id}`)
      }

      return this.mapPortFromDB(data)
    } catch (error) {
      console.error(`Erro ao buscar porta ${id}:`, error)
      throw error
    }
  }

  async updatePortStatus(id: string, status: string): Promise<CTOPort> {
    try {
      const { data, error } = await supabase
        .from("cto_ports")
        .update({ status })
        .eq("id", id)
        .select()
        .single()

      if (error || !data) {
        throw new Error(`Erro ao atualizar status da porta: ${id}`)
      }

      return this.mapPortFromDB(data)
    } catch (error) {
      console.error(`Erro ao atualizar status da porta ${id}:`, error)
      throw error
    }
  }

  async updatePortPrice(id: string, price: number): Promise<CTOPort> {
    try {
      const { data, error } = await supabase
        .from("cto_ports")
        .update({ price })
        .eq("id", id)
        .select()
        .single()

      if (error || !data) {
        throw new Error(`Erro ao atualizar preço da porta: ${id}`)
      }

      return this.mapPortFromDB(data)
    } catch (error) {
      console.error(`Erro ao atualizar preço da porta ${id}:`, error)
      throw error
    }
  }

  async reservePort(id: string): Promise<CTOPort> {
    try {
      // Primeiro, obter a porta e sua CTO
      const { data: port, error: portError } = await supabase
        .from("cto_ports")
        .select("*, cto:cto_id(*)")
        .eq("id", id)
        .single()

      if (portError || !port) {
        throw new Error(`Porta não encontrada: ${id}`)
      }

      // Atualizar status da porta
      const { data: updatedPort, error: portUpdateError } = await supabase
        .from("cto_ports")
        .update({ 
          status: 'reserved',
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single()

      if (portUpdateError) {
        throw new Error(`Erro ao atualizar status da porta: ${portUpdateError.message}`)
      }

      // Atualizar contador da CTO
      const { error: ctoUpdateError } = await supabase
        .from("ctos")
        .update({ 
          occupied_ports: port.cto.occupied_ports + 1,
          updated_at: new Date().toISOString()
        })
        .eq("id", port.cto_id)

      if (ctoUpdateError) {
        throw new Error(`Erro ao atualizar CTO: ${ctoUpdateError.message}`)
      }

      return this.mapPortFromDB(updatedPort)
    } catch (error) {
      console.error(`Erro ao reservar porta ${id}:`, error)
      throw error
    }
  }

  async releasePort(id: string): Promise<CTOPort> {
    try {
      // Primeiro, obter a porta e sua CTO
      const { data: port, error: portError } = await supabase
        .from("cto_ports")
        .select("*, cto:cto_id(*)")
        .eq("id", id)
        .single()

      if (portError || !port) {
        throw new Error(`Porta não encontrada: ${id}`)
      }

      // Iniciar uma transação
      const { data: updatedPort, error: updateError } = await supabase
        .rpc('release_port', { 
          port_id: id,
          cto_id: port.cto_id 
        })

      if (updateError) {
        throw new Error(`Erro ao liberar porta: ${updateError.message}`)
      }

      return this.mapPortFromDB(updatedPort)
    } catch (error) {
      console.error(`Erro ao liberar porta ${id}:`, error)
      throw error
    }
  }

  private mapPortFromDB(data: any): CTOPort {
    return {
      id: data.id,
      ctoId: data.cto_id,
      portNumber: data.port_number,
      status: data.status as CTOPortStatus,
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

// Exportar uma instância única do serviço
export const ctoPortService = new CTOPortService()
