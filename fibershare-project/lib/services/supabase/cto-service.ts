import { createClient } from "@supabase/supabase-js"
import type { CTO } from "@/lib/interfaces/service-interfaces"
import { authService } from "./auth-service"

export class SupabaseCTOService {
  private supabase: any

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    )
  }

  async getCTOs(search?: string, region?: string): Promise<CTO[]> {
    // Obter o ID do operador atual
    const operatorId = await authService.getCurrentOperatorId()

    // Verificar se o usuário atual é um desenvolvedor
    const isDeveloper = await authService.isDeveloperUser()

    if (isDeveloper) {
      // Retornar dados mockados para desenvolvedores
      console.log("Usando dados mockados para CTOs")
      const { ctos } = await import("@/lib/mock-data/ctos")

      // Aplicar filtros aos dados mockados
      let filteredCTOs = [...ctos]

      if (search) {
        const searchLower = search.toLowerCase()
        filteredCTOs = filteredCTOs.filter(
          (cto) => cto.name.toLowerCase().includes(searchLower) || cto.description.toLowerCase().includes(searchLower),
        )
      }

      if (region && region !== "all") {
        filteredCTOs = filteredCTOs.filter((cto) => cto.region === region)
      }

      return filteredCTOs
    }

    try {
      console.log("Buscando CTOs do Supabase")
      let query = this.supabase.from("ctos").select("*")

      // Filtrar por operador se não for desenvolvedor
      if (operatorId) {
        query = query.eq("operator_id", operatorId)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      if (region && region !== "all") {
        query = query.eq("region", region)
      }

      const { data, error } = await query.order("name")

      if (error) {
        console.error("Erro ao buscar CTOs:", error)
        throw new Error(`Falha ao buscar CTOs: ${error.message}`)
      }

      return (data || []).map(this.mapCTOFromDB)
    } catch (error) {
      console.error("Erro ao buscar CTOs:", error)
      throw new Error(`Falha ao buscar CTOs: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async getCTOById(id: string): Promise<CTO> {
    // Obter o ID do operador atual
    const operatorId = await authService.getCurrentOperatorId()

    // Verificar se o usuário atual é um desenvolvedor
    const isDeveloper = await authService.isDeveloperUser()

    if (isDeveloper) {
      // Retornar dados mockados para desenvolvedores
      const { ctos } = await import("@/lib/mock-data/ctos")
      const cto = ctos.find((c) => c.id === id)
      if (!cto) {
        throw new Error(`CTO não encontrada: ${id}`)
      }
      return cto
    }

    try {
      let query = this.supabase.from("ctos").select("*").eq("id", id)

      // Filtrar por operador se não for desenvolvedor
      if (operatorId) {
        query = query.eq("operator_id", operatorId)
      }

      const { data, error } = await query.single()

      if (error) {
        console.error(`Erro ao buscar CTO ${id}:`, error)
        throw new Error(`Falha ao buscar CTO: ${error.message}`)
      }

      if (!data) {
        throw new Error(`CTO não encontrada: ${id}`)
      }

      return this.mapCTOFromDB(data)
    } catch (error) {
      console.error(`Erro ao buscar CTO ${id}:`, error)
      throw new Error(`Falha ao buscar CTO: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async createCTO(data: Partial<CTO>): Promise<CTO> {
    // Obter o ID do operador atual
    const operatorId = await authService.getCurrentOperatorId()

    // Verificar se o usuário atual é um desenvolvedor
    const isDeveloper = await authService.isDeveloperUser()

    if (isDeveloper) {
      // Simular criação para desenvolvedores
      const { ctos } = await import("@/lib/mock-data/ctos")
      const newCTO: CTO = {
        id: `mock-${Date.now()}`,
        name: data.name || "Nova CTO",
        description: data.description || "Descrição da nova CTO",
        totalPorts: data.totalPorts || 16,
        occupiedPorts: data.occupiedPorts || 0,
        coordinates: data.coordinates || [0, 0],
        region: data.region || "Centro",
        status: data.status || "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return newCTO
    }

    try {
      const { data: newCTO, error } = await this.supabase
        .from("ctos")
        .insert([
          {
            name: data.name,
            description: data.description,
            total_ports: data.totalPorts,
            occupied_ports: data.occupiedPorts || 0,
            coordinates: data.coordinates,
            region: data.region,
            status: data.status || "active",
            operator_id: operatorId, // Associar à operadora do usuário atual
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Erro ao criar CTO:", error)
        throw new Error(`Falha ao criar CTO: ${error.message}`)
      }

      return this.mapCTOFromDB(newCTO)
    } catch (error) {
      console.error("Erro ao criar CTO:", error)
      throw new Error(`Falha ao criar CTO: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async updateCTO(id: string, data: Partial<CTO>): Promise<CTO> {
    // Obter o ID do operador atual
    const operatorId = await authService.getCurrentOperatorId()

    // Verificar se o usuário atual é um desenvolvedor
    const isDeveloper = await authService.isDeveloperUser()

    if (isDeveloper) {
      // Simular atualização para desenvolvedores
      const { ctos } = await import("@/lib/mock-data/ctos")
      const ctoIndex = ctos.findIndex((c) => c.id === id)
      if (ctoIndex === -1) {
        throw new Error(`CTO não encontrada: ${id}`)
      }

      const updatedCTO = {
        ...ctos[ctoIndex],
        ...data,
        updatedAt: new Date().toISOString(),
      }

      return updatedCTO
    }

    try {
      // Verificar se a CTO pertence à operadora do usuário atual
      if (operatorId) {
        const { data: existingCTO, error: checkError } = await this.supabase
          .from("ctos")
          .select("operator_id")
          .eq("id", id)
          .eq("operator_id", operatorId)
          .single()

        if (checkError || !existingCTO) {
          throw new Error("Você não tem permissão para atualizar esta CTO")
        }
      }

      const updateData: any = {}

      if (data.name !== undefined) updateData.name = data.name
      if (data.description !== undefined) updateData.description = data.description
      if (data.totalPorts !== undefined) updateData.total_ports = data.totalPorts
      if (data.occupiedPorts !== undefined) updateData.occupied_ports = data.occupiedPorts
      if (data.coordinates !== undefined) updateData.coordinates = data.coordinates
      if (data.region !== undefined) updateData.region = data.region
      if (data.status !== undefined) updateData.status = data.status

      updateData.updated_at = new Date().toISOString()

      const { data: updatedCTO, error } = await this.supabase
        .from("ctos")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error(`Erro ao atualizar CTO ${id}:`, error)
        throw new Error(`Falha ao atualizar CTO: ${error.message}`)
      }

      return this.mapCTOFromDB(updatedCTO)
    } catch (error) {
      console.error(`Erro ao atualizar CTO ${id}:`, error)
      throw new Error(`Falha ao atualizar CTO: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async deleteCTO(id: string): Promise<{ id: string; deleted: boolean }> {
    // Obter o ID do operador atual
    const operatorId = await authService.getCurrentOperatorId()

    // Verificar se o usuário atual é um desenvolvedor
    const isDeveloper = await authService.isDeveloperUser()

    if (isDeveloper) {
      // Simular exclusão para desenvolvedores
      return { id, deleted: true }
    }

    try {
      // Verificar se a CTO pertence à operadora do usuário atual
      if (operatorId) {
        const { data: existingCTO, error: checkError } = await this.supabase
          .from("ctos")
          .select("operator_id")
          .eq("id", id)
          .eq("operator_id", operatorId)
          .single()

        if (checkError || !existingCTO) {
          throw new Error("Você não tem permissão para excluir esta CTO")
        }
      }

      const { error } = await this.supabase.from("ctos").delete().eq("id", id)

      if (error) {
        console.error(`Erro ao excluir CTO ${id}:`, error)
        throw new Error(`Falha ao excluir CTO: ${error.message}`)
      }

      return { id, deleted: true }
    } catch (error) {
      console.error(`Erro ao excluir CTO ${id}:`, error)
      throw new Error(`Falha ao excluir CTO: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Método auxiliar para mapear dados do banco para o formato da interface
  private mapCTOFromDB(data: any): CTO {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      totalPorts: data.total_ports,
      occupiedPorts: data.occupied_ports,
      coordinates: data.coordinates,
      region: data.region,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }
}

// Exportar uma instância singleton para uso em toda a aplicação
export const ctoService = new SupabaseCTOService()
