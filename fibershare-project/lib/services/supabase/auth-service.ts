import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Interface para o registro de usuário
export interface RegisterUserData {
  name: string
  email: string
  password?: string
  operatorId: string
  role: string
  isFirstAccess?: boolean
}

// Interface para o login de usuário
export interface LoginUserData {
  email: string
  password: string
}

export class SupabaseAuthService {
  private getAdminClient() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")
  }

  private getAnonClient() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "")
  }

  // Gerar uma senha temporária aleatória
  private generateTempPassword(length = 10): string {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      password += charset[randomIndex]
    }
    return password
  }

  // Verificar se um email já está em uso
  async isEmailInUse(email: string): Promise<boolean> {
    try {
      const supabase = this.getAdminClient()
      const { data, error } = await supabase.from("profiles").select("id").eq("email", email).limit(1)

      if (error) {
        console.error("Erro ao verificar email:", error)
        return false
      }

      return data && data.length > 0
    } catch (error) {
      console.error("Erro ao verificar email:", error)
      return false
    }
  }

  // Registrar um novo usuário
  async registerUser(userData: RegisterUserData): Promise<{ user: any; error: any; tempPassword?: string }> {
    try {
      const supabase = this.getAdminClient()

      // Gerar uma senha temporária se não foi fornecida
      const tempPassword = userData.password || this.generateTempPassword()

      // Criar o usuário na autenticação
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: tempPassword,
        email_confirm: true,
      })

      if (authError) throw authError

      // Criar o perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: authData.user.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            operator_id: userData.operatorId,
            is_first_access: userData.isFirstAccess !== false,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (profileError) {
        // Se houver erro ao criar o perfil, excluir o usuário da autenticação
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw profileError
      }

      return {
        user: {
          id: authData.user.id,
          profile: profileData,
        },
        error: null,
        tempPassword: userData.isFirstAccess !== false ? tempPassword : undefined,
      }
    } catch (error) {
      console.error("Erro ao registrar usuário:", error)
      return { user: null, error, tempPassword: undefined }
    }
  }

  // Obter o usuário atual
  async getCurrentUser(): Promise<{ user: any; error: any }> {
    try {
      // Para desenvolvimento, retornar um usuário fictício
      if (process.env.NODE_ENV === "development") {
        return {
          user: {
            id: "dev-user-id",
            email: "dev@example.com",
            profile: {
              name: "Usuário de Desenvolvimento",
              role: "admin",
              operator_id: "00000000-0000-0000-0000-000000000000",
            },
          },
          error: null,
        }
      }

      // Em produção, tentar obter o usuário autenticado
      try {
        const cookieStore = cookies()
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "",
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          {
            cookies: {
              get(name: string) {
                return cookieStore.get(name)?.value
              },
            },
          },
        )

        const { data, error } = await supabase.auth.getUser()
        if (error) throw error

        if (!data.user) {
          return { user: null, error: null }
        }

        // Buscar o perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError) throw profileError

        // Buscar o nome do operador
        const { data: operatorData, error: operatorError } = await supabase
          .from("operators")
          .select("name")
          .eq("id", profileData.operator_id)
          .single()

        return {
          user: {
            ...data.user,
            profile: profileData,
            operatorName: operatorError ? null : operatorData?.name,
          },
          error: null,
        }
      } catch (error) {
        console.error("Erro ao obter usuário atual:", error)
        return { user: null, error }
      }
    } catch (error) {
      console.error("Erro ao obter usuário atual:", error)
      return { user: null, error }
    }
  }

  // Obter o ID do operador atual
  async getCurrentOperatorId(): Promise<string | null> {
    try {
      // Para desenvolvimento, retornar um ID de operador padrão
      if (process.env.NODE_ENV === "development") {
        return "00000000-0000-0000-0000-000000000000"
      }

      const { user, error } = await this.getCurrentUser()
      if (error || !user) return null
      return user.profile?.operator_id || null
    } catch (error) {
      console.error("Erro ao obter ID do operador atual:", error)
      return null
    }
  }

  // Atualizar a senha do usuário
  async updatePassword(userId: string, newPassword: string): Promise<{ success: boolean; error: any }> {
    try {
      const supabase = this.getAdminClient()
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword,
      })

      if (error) throw error

      // Atualizar o status de primeiro acesso
      await supabase.from("profiles").update({ is_first_access: false }).eq("id", userId)

      return { success: true, error: null }
    } catch (error) {
      console.error("Erro ao atualizar senha:", error)
      return { success: false, error }
    }
  }

  // Verificar se é o primeiro acesso do usuário
  async isFirstAccess(userId: string): Promise<boolean> {
    try {
      const supabase = this.getAdminClient()
      const { data, error } = await supabase.from("profiles").select("is_first_access").eq("id", userId).single()

      if (error) {
        console.error("Erro ao verificar primeiro acesso:", error)
        return false
      }

      return data?.is_first_access === true
    } catch (error) {
      console.error("Erro ao verificar primeiro acesso:", error)
      return false
    }
  }
}

// Exportar uma instância singleton para uso em toda a aplicação
export const authService = new SupabaseAuthService()
