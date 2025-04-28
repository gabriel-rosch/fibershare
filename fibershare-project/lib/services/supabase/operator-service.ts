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
    // Verificar se o usuário atual é um desenvolvedor
    const isDeveloper = await authService.isDeveloperUser()

    if (isDeveloper) {
      // Retornar dados mockados para desenvolvedores
      console.log("Usando dados mockados para desenvolvedores")
      const { operators } = await import("@/lib/mock-data/operators")

      // Aplicar filtros aos dados mockados
      let filteredOperators = [...operators]

      if (search) {
        const searchLower = search.toLowerCase()
        filteredOperators = filteredOperators.filter(
          (op) =>
            op.name.toLowerCase().includes(searchLower) || (op.email && op.email.toLowerCase().includes(searchLower)),
        )
      }

      if (role && role !== "all") {
        filteredOperators = filteredOperators.filter((op) => op.role === role)
      }

      if (status) {
        filteredOperators = filteredOperators.filter((op) => op.status === status)
      }

      return filteredOperators
    }

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
      throw new Error(`Falha ao buscar operadores: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async getOperatorById(id: string): Promise<IOperator> {
    // Verificar se o usuário atual é um desenvolvedor
    const isDeveloper = await authService.isDeveloperUser()

    if (isDeveloper) {
      // Retornar dados mockados para desenvolvedores
      const { operators } = await import("@/lib/mock-data/operators")
      const operator = operators.find((op) => op.id === id)
      if (!operator) {
        throw new Error(`Operador não encontrado: ${id}`)
      }
      return operator
    }

    try {
      const { data, error } = await this.supabase.from("operators").select("*").eq("id", id).single()

      if (error) {
        console.error(`Erro ao buscar operador ${id}:`, error)
        throw new Error(`Falha ao buscar operador: ${error.message}`)
      }

      if (!data) {
        throw new Error(`Operador não encontrado: ${id}`)
      }

      return this.mapOperatorFromDB(data)
    } catch (error) {
      console.error(`Erro ao buscar operador ${id}:`, error)
      throw new Error(`Falha ao buscar operador: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async getCurrentOperator(): Promise<IOperator> {
    // Verificar se o usuário atual é um desenvolvedor
    const isDeveloper = await authService.isDeveloperUser()

    if (isDeveloper) {
      // Retornar dados mockados para desenvolvedores
      const { operators } = await import("@/lib/mock-data/operators")
      return operators[0] // Retornar o primeiro operador como o atual
    }

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
      throw new Error(`Falha ao buscar operador atual: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async getPartners(): Promise<IOperator[]> {
    // Verificar se o usuário atual é um desenvolvedor
    const isDeveloper = await authService.isDeveloperUser()

    if (isDeveloper) {
      // Retornar dados mockados para desenvolvedores
      console.log("Usando dados mockados para parceiros")
      const { operators } = await import("@/lib/mock-data/operators")
      return [operators[1], operators[3], operators[5] || operators[2]].filter(Boolean)
    }

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
      throw new Error(`Falha ao buscar parceiros: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async createOperator(data: Partial<IOperator>): Promise<IOperator> {
    // Verificar se o usuário atual é um desenvolvedor
    const isDeveloper = await authService.isDeveloperUser()

    if (isDeveloper) {
      // Simular criação para desenvolvedores
      const { operators } = await import("@/lib/mock-data/operators")
      const newOperator: IOperator = {
        id: `mock-${Date.now()}`,
        name: data.name || "Novo Operador",
        email: data.email || "novo@exemplo.com",
        role: data.role || "operator",
        status: data.status || "active",
        region: data.region,
        avatarUrl: data.avatarUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return newOperator
    }

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
      throw new Error(`Falha ao criar operador: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async updateOperator(id: string, data: Partial<IOperator>): Promise<IOperator> {
    // Verificar se o usuário atual é um desenvolvedor
    const isDeveloper = await authService.isDeveloperUser()

    if (isDeveloper) {
      // Simular atualização para desenvolvedores
      const { operators } = await import("@/lib/mock-data/operators")
      const operatorIndex = operators.findIndex((op) => op.id === id)
      if (operatorIndex === -1) {
        throw new Error(`Operador não encontrado: ${id}`)
      }

      const updatedOperator = {
        ...operators[operatorIndex],
        ...data,
        updatedAt: new Date().toISOString(),
      }

      return updatedOperator
    }

    try {
      const updateData: any = {}

      if (data.name !== undefined) updateData.name = data.name
      if (data.email !== undefined) updateData.email = data.email
      if (data.role !== undefined) updateData.role = data.role
      if (data.status !== undefined) updateData.status = data.status
      if (data.region !== undefined) updateData.region = data.region
      if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl

      updateData.updated_at = new Date().toISOString()

      const { data: updatedOperator, error } = await this.supabase
        .from("operators")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error(`Erro ao atualizar operador ${id}:`, error)
        throw new Error(`Falha ao atualizar operador: ${error.message}`)
      }

      return this.mapOperatorFromDB(updatedOperator)
    } catch (error) {
      console.error(`Erro ao atualizar operador ${id}:`, error)
      throw new Error(`Falha ao atualizar operador: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async deleteOperator(id: string): Promise<{ id: string; deleted: boolean }> {
    // Verificar se o usuário atual é um desenvolvedor
    const isDeveloper = await authService.isDeveloperUser()

    if (isDeveloper) {
      // Simular exclusão para desenvolvedores
      return { id, deleted: true }
    }

    try {
      const { error } = await this.supabase.from("operators").delete().eq("id", id)

      if (error) {
        console.error(`Erro ao excluir operador ${id}:`, error)
        throw new Error(`Falha ao excluir operador: ${error.message}`)
      }

      return { id, deleted: true }
    } catch (error) {
      console.error(`Erro ao excluir operador ${id}:`, error)
      throw new Error(`Falha ao excluir operador: ${error instanceof Error ? error.message : String(error)}`)
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
