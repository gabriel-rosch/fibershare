import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "../supabase/client"

export type UserRole = "admin" | "manager" | "technician" | "viewer"

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  operatorId?: string
  operatorName?: string
  isFirstAccess?: boolean
  avatar_url?: string | null
  isDevelopmentUser?: boolean
}

interface RegisterData {
  name: string
  email: string
  password: string
  operatorId: string
  role?: UserRole
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  register: (data: RegisterData) => Promise<void>
  updatePassword: (userId: string, newPassword: string) => Promise<boolean>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      signIn: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) throw error

          if (data.user) {
            // Fetch user profile from your users table
            const { data: profileData } = await supabase
              .from("profiles")
              .select("*, operators(name)")
              .eq("id", data.user.id)
              .single()

            set({
              user: {
                id: data.user.id,
                email: data.user.email!,
                name: profileData?.name || data.user.email!.split("@")[0],
                role: (profileData?.role as UserRole) || "viewer",
                operatorId: profileData?.operator_id,
                operatorName: profileData?.operators?.name,
                isFirstAccess: profileData?.is_first_access || false,
                avatar_url: profileData?.avatar_url,
              },
              isLoading: false,
            })
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false })
        }
      },
      signOut: async () => {
        set({ isLoading: true })

        // Se for um usuário de desenvolvimento, apenas limpe o estado
        const { user } = get()
        if (user?.isDevelopmentUser) {
          set({ user: null, isLoading: false })
          return
        }

        // Caso contrário, faça logout no Supabase
        await supabase.auth.signOut()
        set({ user: null, isLoading: false })
      },
      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          })

          const result = await response.json()

          if (!response.ok) {
            throw new Error(result.error || "Falha ao registrar usuário")
          }

          // Após o registro bem-sucedido, faça login
          await get().signIn(data.email, data.password)
        } catch (error: any) {
          set({ error: error.message, isLoading: false })
        }
      },
      updatePassword: async (userId, newPassword) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch("/api/auth/first-access", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, newPassword }),
          })

          const result = await response.json()

          if (!response.ok) {
            throw new Error(result.error || "Falha ao atualizar senha")
          }

          // Atualizar o estado do usuário para não ser mais primeiro acesso
          const { user } = get()
          if (user) {
            set({
              user: {
                ...user,
                isFirstAccess: false,
              },
              isLoading: false,
            })
          } else {
            set({ isLoading: false })
          }

          return true
        } catch (error: any) {
          set({ error: error.message, isLoading: false })
          return false
        }
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: "auth-storage",
    },
  ),
)
