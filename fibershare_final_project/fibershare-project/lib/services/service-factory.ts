import type {
  IOperatorService,
  ICTOService,
  ICTOPortService,
  IServiceOrderService,
  IPortOrderService,
  IChatService,
} from "@/lib/interfaces/service-interfaces"

import { SupabaseOperatorService } from "@/lib/services/supabase/operator-service"
import { SupabaseCTOService } from "@/lib/services/supabase/cto-service"
import { SupabaseCTOPortService } from "@/lib/services/supabase/cto-port-service"
import { SupabaseServiceOrderService } from "@/lib/services/supabase/service-order-service"
import { SupabasePortOrderService } from "@/lib/services/supabase/port-order-service"
import { SupabaseChatService } from "@/lib/services/supabase/chat-service"

// Tipo de implementação de serviço
export type ServiceImplementation = "supabase" | "api"

// Configuração global da implementação de serviço
let currentImplementation: ServiceImplementation = "supabase"

// Função para definir a implementação de serviço
export function setServiceImplementation(implementation: ServiceImplementation): void {
  currentImplementation = implementation
  console.log(`Implementação de serviço alterada para: ${implementation}`)
}

// Fábrica de serviços
export class ServiceFactory {
  // Serviço de Operadores
  static getOperatorService(): IOperatorService {
    if (currentImplementation === "supabase") {
      return new SupabaseOperatorService()
    }

    // No futuro, quando implementar a API externa:
    // if (currentImplementation === "api") {
    //   return new ApiOperatorService()
    // }

    throw new Error(`Implementação de serviço não suportada: ${currentImplementation}`)
  }

  // Serviço de CTOs
  static getCTOService(): ICTOService {
    if (currentImplementation === "supabase") {
      return new SupabaseCTOService()
    }

    throw new Error(`Implementação de serviço não suportada: ${currentImplementation}`)
  }

  // Serviço de Portas de CTO
  static getCTOPortService(): ICTOPortService {
    if (currentImplementation === "supabase") {
      return new SupabaseCTOPortService()
    }

    throw new Error(`Implementação de serviço não suportada: ${currentImplementation}`)
  }

  // Serviço de Ordens de Serviço
  static getServiceOrderService(): IServiceOrderService {
    if (currentImplementation === "supabase") {
      return new SupabaseServiceOrderService()
    }

    throw new Error(`Implementação de serviço não suportada: ${currentImplementation}`)
  }

  // Serviço de Ordens de Porta
  static getPortOrderService(): IPortOrderService {
    if (currentImplementation === "supabase") {
      return new SupabasePortOrderService()
    }

    throw new Error(`Implementação de serviço não suportada: ${currentImplementation}`)
  }

  // Serviço de Chat
  static getChatService(): IChatService {
    if (currentImplementation === "supabase") {
      return new SupabaseChatService()
    }

    throw new Error(`Implementação de serviço não suportada: ${currentImplementation}`)
  }
}

// Adicionar uma exportação com 's' minúsculo para compatibilidade
export const serviceFactory = ServiceFactory
