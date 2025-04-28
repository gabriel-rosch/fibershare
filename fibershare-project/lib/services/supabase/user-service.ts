import { createClient } from "@supabase/supabase-js"
import { authService } from "./auth-service"

export interface User {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  operatorId: string
  operatorName?: string
  isFirstAccess: boolean
  createdAt: string
  lastLogin?: string
  tempPassword?: string
}

export interface CreateUserData {
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  operatorId?: string
}

export class SupabaseUserService {
  private getClient() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")
  }

  async getUsers(search?: string, role?: string, status?: string): Promise<User[]> {
    try {
      const supabase = this.getClient()

      // Obter o ID do operador atual
      const operatorId = await authService.getCurrentOperatorId()

      if (!operatorId) {
        console.error("ID do operador não encontrado")
        return []
      }

      // Buscar os perfis de usuário
      let query = supabase.from("profiles").select("*").eq("operator_id", operatorId)

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      if (role && role !== "all") {
        query = query.eq("role", role)
      }

      if (status && status !== "all") {
        query = query.eq("status", status)
      }

      const { data: profiles, error } = await query.order("name")

      if (error) {
        console.error("Erro ao buscar perfis:", error)
        throw error
      }

      // Buscar os nomes dos operadores
      const operatorIds = [...new Set(profiles.map((profile) => profile.operator_id))]
      const { data: operators, error: operatorError } = await supabase
        .from("operators")
        .select("id, name")
        .in("id", operatorIds)

      if (operatorError) {
        console.error("Erro ao buscar operadores:", operatorError)
      }

      // Mapear os operadores por ID para fácil acesso
      const operatorMap = (operators || []).reduce(
        (map, op) => {
          map[op.id] = op.name
          return map
        },
        {} as Record<string, string>,
      )

      // Mapear os perfis para o formato de usuário
      return profiles.map((profile) => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        status: profile.status || "active",
        operatorId: profile.operator_id,
        operatorName: operatorMap[profile.operator_id] || "Desconhecido",
        isFirstAccess: profile.is_first_access || false,
        createdAt: profile.created_at,
        lastLogin: profile.last_login,
      }))
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
      throw error
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const supabase = this.getClient()

      // Buscar o perfil do usuário
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", id).single()

      if (error) throw error

      // Buscar o nome do operador
      const { data: operator, error: operatorError } = await supabase
        .from("operators")
        .select("name")
        .eq("id", profile.operator_id)
        .single()

      if (operatorError) {
        console.error("Erro ao buscar operador:", operatorError)
      }

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        status: profile.status || "active",
        operatorId: profile.operator_id,
        operatorName: operator?.name || "Desconhecido",
        isFirstAccess: profile.is_first_access || false,
        createdAt: profile.created_at,
        lastLogin: profile.last_login,
      }
    } catch (error) {
      console.error(`Erro ao buscar usuário ${id}:`, error)
      throw error
    }
  }

  async createUser(data: CreateUserData): Promise<User> {
    try {
      // Se não foi fornecido um operatorId, usar o do usuário atual
      const operatorId = data.operatorId || (await authService.getCurrentOperatorId())

      if (!operatorId) {
        throw new Error("ID do operador não encontrado")
      }

      // Registrar o usuário usando o authService
      const { user, error, tempPassword } = await authService.registerUser({
        name: data.name,
        email: data.email,
        operatorId: operatorId,
        role: data.role,
        isFirstAccess: true,
      })

      if (error) throw error

      // Retornar o usuário criado
      return {
        id: user.id,
        name: user.profile.name,
        email: user.profile.email,
        role: user.profile.role,
        status: data.status || "active",
        operatorId: user.profile.operator_id,
        isFirstAccess: true,
        createdAt: user.profile.created_at,
        tempPassword,
      } as User
    } catch (error) {
      console.error("Erro ao criar usuário:", error)
      throw error
    }
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    try {
      const supabase = this.getClient()

      const updateData: any = {}

      if (data.name !== undefined) updateData.name = data.name
      if (data.email !== undefined) updateData.email = data.email
      if (data.role !== undefined) updateData.role = data.role
      if (data.status !== undefined) updateData.status = data.status
      if (data.isFirstAccess !== undefined) updateData.is_first_access = data.isFirstAccess

      updateData.updated_at = new Date().toISOString()

      const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      // Buscar o nome do operador
      const { data: operator, error: operatorError } = await supabase
        .from("operators")
        .select("name")
        .eq("id", updatedProfile.operator_id)
        .single()

      if (operatorError) {
        console.error("Erro ao buscar operador:", operatorError)
      }

      return {
        id: updatedProfile.id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        role: updatedProfile.role,
        status: updatedProfile.status || "active",
        operatorId: updatedProfile.operator_id,
        operatorName: operator?.name || "Desconhecido",
        isFirstAccess: updatedProfile.is_first_access || false,
        createdAt: updatedProfile.created_at,
        lastLogin: updatedProfile.last_login,
      }
    } catch (error) {
      console.error(`Erro ao atualizar usuário ${id}:`, error)
      throw error
    }
  }

  async deleteUser(id: string): Promise<{ id: string; deleted: boolean }> {
    try {
      const supabase = this.getClient()

      // Primeiro, excluir o perfil
      const { error: profileError } = await supabase.from("profiles").delete().eq("id", id)

      if (profileError) throw profileError

      // Em seguida, excluir o usuário da autenticação
      const { error: authError } = await supabase.auth.admin.deleteUser(id)

      if (authError) throw authError

      return { id, deleted: true }
    } catch (error) {
      console.error(`Erro ao excluir usuário ${id}:`, error)
      throw error
    }
  }
}

// Exportar uma instância singleton para uso em toda a aplicação
export const userService = new SupabaseUserService()
