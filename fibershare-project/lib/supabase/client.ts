import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Singleton para o cliente Supabase
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>()
  }
  return supabaseClient
}

// Manter a exportação original para compatibilidade com código existente
export const supabase = createClientComponentClient()
