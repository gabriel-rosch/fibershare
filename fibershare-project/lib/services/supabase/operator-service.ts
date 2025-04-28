import { createClient } from "@supabase/supabase-js"
import type { IOperator, IOperatorService } from "@/lib/interfaces/service-interfaces"
import { authService } from "./auth-service"

export class SupabaseOperatorService implements IOperatorService {
  private supabase: any

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    )
  }

  async getOperators(search?: string, role?: string, status?: string): Promise<IOperator[]> {
    try {
      console.log("Buscando operadores do Supabase")
      let query = this.supabase.from("operators").select("*")

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      if (role && role !== "all") {
        query = query.eq("role", role)
      }

      if (status) {
        query = query.eq("status", status)
      }

      const { data, error } = await query.order("name")

      if (error) {
        console.error("Erro ao buscar operadores:", error)
        throw new Error(`Falha ao buscar operadores: ${error.message}`)
      }

      return (data || []).map(this.mapOperatorFromDB)
    } catch (error) {
      console.error("Erro ao buscar operadores:", error)
      throw error
    }
  }

  async getOperatorById(id: string): Promise<IOperator> {
    try {
      const { data, error } = await this.supabase
        .from("operators")
        .select("*")
        .eq("id", id)
        .single()

      if (error || !data) {
        throw new Error(`Operador não encontrado: ${id}`)
      }

      return this.mapOperatorFromDB(data)
    } catch (error) {
      console.error(`Erro ao buscar operador ${id}:`, error)
      throw error
    }
  }

  async getCurrentOperator(): Promise<IOperator> {
    try {
      const { data: authData, error: authError } = await this.supabase.auth.getUser()

      if (authError || !authData.user) {
        console.error("Erro ao obter usuário autenticado:", authError)
        throw new Error("Usuário não autenticado")
      }

      const { data, error } = await this.supabase
        .from("operators")
        .select("*")
        .eq("email", authData.user.email)
        .single()

      if (error || !data) {
        console.error("Erro ao buscar operador atual:", error)
        throw new Error("Operador não encontrado para o usuário autenticado")
      }

      return this.mapOperatorFromDB(data)
    } catch (error) {
      console.error("Erro ao buscar operador atual:", error)
      throw error
    }
  }

  async getPartners(): Promise<IOperator[]> {
    try {
      console.log("Buscando parceiros do Supabase")
      // Buscar o operador atual para excluí-lo da lista de parceiros
      const currentOperator = await this.getCurrentOperator()

      // Buscar todos os operadores exceto o atual
      const { data, error } = await this.supabase
        .from("operators")
        .select("*")
        .neq("id", currentOperator.id)
        .limit(5) // Limitar a 5 parceiros
        .order("name")

      if (error) {
        console.error("Erro ao buscar parceiros:", error)
        throw new Error(`Falha ao buscar parceiros: ${error.message}`)
      }

      return (data || []).map(this.mapOperatorFromDB)
    } catch (error) {
      console.error("Erro ao buscar parceiros:", error)
      throw error
    }
  }

  async createOperator(data: Partial<IOperator>): Promise<IOperator> {
    try {
      const { data: newOperator, error } = await this.supabase
        .from("operators")
        .insert([
          {
            name: data.name,
            email: data.email,
            role: data.role || "operator",
            status: data.status || "active",
            region: data.region,
            avatar_url: data.avatarUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Erro ao criar operador:", error)
        throw new Error(`Falha ao criar operador: ${error.message}`)
      }

      return this.mapOperatorFromDB(newOperator)
    } catch (error) {
      console.error("Erro ao criar operador:", error)
      throw error
    }
  }

  async updateOperator(id: string, data: Partial<IOperator>): Promise<IOperator> {
    try {
      const { data: updatedOperator, error } = await this.supabase
        .from("operators")
        .update(data)
        .eq("id", id)
        .select()
        .single()

      if (error || !updatedOperator) {
        throw new Error(`Erro ao atualizar operador: ${error?.message || 'Operador não encontrado'}`)
      }

      return this.mapOperatorFromDB(updatedOperator)
    } catch (error) {
      console.error(`Erro ao atualizar operador ${id}:`, error)
      throw error
    }
  }

  async deleteOperator(id: string): Promise<{ id: string; deleted: boolean }> {
    try {
      const { error } = await this.supabase.from("operators").delete().eq("id", id)

      if (error) {
        console.error(`Erro ao excluir operador ${id}:`, error)
        throw new Error(`Falha ao excluir operador: ${error.message}`)
      }

      return { id, deleted: true }
    } catch (error) {
      console.error(`Erro ao excluir operador ${id}:`, error)
      throw error
    }
  }

  // Método auxiliar para mapear dados do banco para o formato da interface
  private mapOperatorFromDB(data: any): IOperator {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      region: data.region,
      avatarUrl: data.avatar_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }
}

// Exportar uma instância singleton para uso em toda a aplicação
export const operatorService = new SupabaseOperatorService()
