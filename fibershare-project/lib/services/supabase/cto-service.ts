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
    try {
      console.log("Buscando CTOs do Supabase")
      let query = this.supabase.from("ctos").select(`
        *,
        operator:owner_id(id, name),
        ports:cto_ports(*)
      `)

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      if (region && region !== "all") {
        query = query.eq("region", region)
      }

      const { data, error } = await query.order("name")

      if (error) {
        throw new Error(`Falha ao buscar CTOs: ${error.message}`)
      }

      return (data || []).map(this.mapCTOFromDB)
    } catch (error) {
      console.error("Erro ao buscar CTOs:", error)
      throw error
    }
  }

  async getCTOById(id: string): Promise<CTO> {
    try {
      const { data, error } = await this.supabase
        .from("ctos")
        .select(`
          *,
          operator:owner_id(id, name)
        `)
        .eq("id", id)
        .single()

      if (error || !data) {
        throw new Error(`CTO não encontrada: ${id}`)
      }

      return this.mapCTOFromDB(data)
    } catch (error) {
      console.error(`Erro ao buscar CTO ${id}:`, error)
      throw error
    }
  }

  async createCTO(data: Partial<CTO>): Promise<CTO> {
    try {
      const { data: newCTO, error } = await this.supabase
        .from("ctos")
        .insert([{
          name: data.name,
          description: data.description,
          total_ports: data.totalPorts,
          occupied_ports: data.occupiedPorts || 0,
          coordinates: data.coordinates,
          region: data.region,
          status: data.status || "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single()

      if (error) {
        throw new Error(`Falha ao criar CTO: ${error.message}`)
      }

      return this.mapCTOFromDB(newCTO)
    } catch (error) {
      console.error("Erro ao criar CTO:", error)
      throw error
    }
  }

  async updateCTO(id: string, data: Partial<CTO>): Promise<CTO> {
    try {
      const { data: updatedCTO, error } = await this.supabase
        .from("ctos")
        .update(data)
        .eq("id", id)
        .select(`
          *,
          operator:owner_id(id, name)
        `)
        .single()

      if (error || !updatedCTO) {
        throw new Error(`Erro ao atualizar CTO: ${error?.message || 'CTO não encontrada'}`)
      }

      return this.mapCTOFromDB(updatedCTO)
    } catch (error) {
      console.error(`Erro ao atualizar CTO ${id}:`, error)
      throw error
    }
  }

  async deleteCTO(id: string): Promise<{ id: string; deleted: boolean }> {
    try {
      const { error } = await this.supabase
        .from("ctos")
        .delete()
        .eq("id", id)

      if (error) {
        throw new Error(`Falha ao excluir CTO: ${error.message}`)
      }

      return { id, deleted: true }
    } catch (error) {
      console.error(`Erro ao excluir CTO ${id}:`, error)
      throw error
    }
  }

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

export const ctoService = new SupabaseCTOService()
