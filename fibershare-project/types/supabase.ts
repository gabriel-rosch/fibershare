export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      ctos: {
        Row: {
          id: string
          name: string
          description: string | null
          total_ports: number
          occupied_ports: number
          longitude: number
          latitude: number
          region: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          total_ports: number
          occupied_ports: number
          longitude: number
          latitude: number
          region?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          total_ports?: number
          occupied_ports?: number
          longitude?: number
          latitude?: number
          region?: string | null
          status?: string
          created_at?: string
        }
      }
      // Adicione outras tabelas conforme necessário
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
