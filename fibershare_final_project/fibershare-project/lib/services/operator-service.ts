import type { Operator } from "@/lib/interfaces/service-interfaces"
import { operatorService } from "@/lib/services/supabase/operator-service"
import { authService } from "@/lib/services/supabase/auth-service"

export class OperatorService {
  static async getOperators(search?: string, region?: string, minRating?: number): Promise<Operator[]> {
    try {
      // Verificar se o usuário é um desenvolvedor
      const isDeveloper = await authService.isDeveloperUser()

      if (isDeveloper) {
        // Criar dados mockados para desenvolvedores
        const mockOperators: Operator[] = [
          {
            id: "op-001",
            name: "FiberNet",
            region: "São Paulo",
            ctoCount: 248,
            rating: 4.8,
            description: "Operadora especializada em fibra óptica para áreas urbanas",
            contactEmail: "contato@fibernet.com",
            contactPhone: "(11) 3456-7890",
            createdAt: "2023-05-15T10:30:00Z",
          },
          {
            id: "op-002",
            name: "OptiConnect",
            region: "Rio de Janeiro",
            ctoCount: 186,
            rating: 4.5,
            description: "Soluções de conectividade para empresas e residências",
            contactEmail: "contato@opticonnect.com",
            contactPhone: "(21) 3456-7890",
            createdAt: "2023-06-20T14:45:00Z",
          },
          {
            id: "op-003",
            name: "TelecomSul",
            region: "Porto Alegre",
            ctoCount: 124,
            rating: 4.2,
            description: "Operadora regional com foco em qualidade de serviço",
            contactEmail: "contato@telecomsul.com",
            contactPhone: "(51) 3456-7890",
            createdAt: "2023-07-10T09:15:00Z",
          },
          {
            id: "op-004",
            name: "NetNordeste",
            region: "Recife",
            ctoCount: 156,
            rating: 4.0,
            description: "Conectando o Nordeste com tecnologia de ponta",
            contactEmail: "contato@netnordeste.com",
            contactPhone: "(81) 3456-7890",
            createdAt: "2023-08-05T11:30:00Z",
          },
          {
            id: "op-005",
            name: "CentralTelecom",
            region: "Brasília",
            ctoCount: 210,
            rating: 4.6,
            description: "Infraestrutura de fibra óptica para o Centro-Oeste",
            contactEmail: "contato@centraltelecom.com",
            contactPhone: "(61) 3456-7890",
            createdAt: "2023-09-12T16:20:00Z",
          },
          {
            id: "op-006",
            name: "FiberMinas",
            region: "Belo Horizonte",
            ctoCount: 178,
            rating: 4.3,
            description: "Conectividade de alta velocidade para Minas Gerais",
            contactEmail: "contato@fiberminas.com",
            contactPhone: "(31) 3456-7890",
            createdAt: "2023-10-18T13:45:00Z",
          },
        ]

        // Aplicar filtros aos dados mockados
        let filteredOperators = [...mockOperators]

        if (search) {
          const searchLower = search.toLowerCase()
          filteredOperators = filteredOperators.filter(
            (op) =>
              op.name.toLowerCase().includes(searchLower) ||
              (op.contactEmail && op.contactEmail.toLowerCase().includes(searchLower)),
          )
        }

        if (region && region !== "all") {
          filteredOperators = filteredOperators.filter((op) => op.region === region)
        }

        if (minRating) {
          filteredOperators = filteredOperators.filter((op) => (op.rating || 0) >= minRating)
        }

        return filteredOperators
      }

      // Buscar operadores do Supabase
      const operators = await operatorService.getOperators(search, region)

      // Mapear para o formato esperado pela aplicação
      return operators.map((op) => ({
        id: op.id,
        name: op.name,
        email: op.email,
        role: op.role,
        status: op.status,
        region: op.region || "Nacional",
        ctoCount: op.ctoCount || 0,
        rating: op.rating || 4.5, // Valor padrão para rating
        description: op.description || "Operadora de telecomunicações",
        contactEmail: op.email || "contato@operadora.com",
        contactPhone: op.phone || "(00) 0000-0000",
        createdAt: op.createdAt,
        updatedAt: op.updatedAt,
      }))
    } catch (error) {
      console.error("OperatorService.getOperators error:", error)
      throw error
    }
  }

  static async getCurrentOperator(): Promise<Operator> {
    try {
      // Verificar se o usuário é um desenvolvedor
      const isDeveloper = await authService.isDeveloperUser()

      if (isDeveloper) {
        // Criar dados mockados para desenvolvedores
        return {
          id: "op-007",
          name: "FiberShare",
          region: "Nacional",
          ctoCount: 325,
          rating: 4.7,
          description: "Sua empresa de compartilhamento de infraestrutura de fibra óptica",
          contactEmail: "contato@fibershare.com",
          contactPhone: "(11) 9876-5432",
          createdAt: "2023-04-01T08:00:00Z",
        }
      }

      // Buscar operador atual do Supabase
      const operator = await operatorService.getCurrentOperator()

      // Mapear para o formato esperado pela aplicação
      return {
        id: operator.id,
        name: operator.name,
        email: operator.email,
        role: operator.role,
        status: operator.status,
        region: operator.region || "Nacional",
        ctoCount: operator.ctoCount || 0,
        rating: operator.rating || 4.7,
        description: operator.description || "Sua empresa de compartilhamento de infraestrutura de fibra óptica",
        contactEmail: operator.email || "contato@operadora.com",
        contactPhone: operator.phone || "(00) 0000-0000",
        createdAt: operator.createdAt,
        updatedAt: operator.updatedAt,
      }
    } catch (error) {
      console.error("OperatorService.getCurrentOperator error:", error)
      throw error
    }
  }

  static async getPartners(): Promise<Operator[]> {
    try {
      // Verificar se o usuário é um desenvolvedor
      const isDeveloper = await authService.isDeveloperUser()

      if (isDeveloper) {
        // Criar dados mockados para desenvolvedores
        const mockOperators: Operator[] = [
          {
            id: "op-001",
            name: "FiberNet",
            region: "São Paulo",
            ctoCount: 248,
            rating: 4.8,
            description: "Operadora especializada em fibra óptica para áreas urbanas",
            contactEmail: "contato@fibernet.com",
            contactPhone: "(11) 3456-7890",
            createdAt: "2023-05-15T10:30:00Z",
          },
          {
            id: "op-003",
            name: "TelecomSul",
            region: "Porto Alegre",
            ctoCount: 124,
            rating: 4.2,
            description: "Operadora regional com foco em qualidade de serviço",
            contactEmail: "contato@telecomsul.com",
            contactPhone: "(51) 3456-7890",
            createdAt: "2023-07-10T09:15:00Z",
          },
          {
            id: "op-005",
            name: "CentralTelecom",
            region: "Brasília",
            ctoCount: 210,
            rating: 4.6,
            description: "Infraestrutura de fibra óptica para o Centro-Oeste",
            contactEmail: "contato@centraltelecom.com",
            contactPhone: "(61) 3456-7890",
            createdAt: "2023-09-12T16:20:00Z",
          },
        ]

        return mockOperators
      }

      // Buscar parceiros do Supabase
      const partners = await operatorService.getPartners()

      // Mapear para o formato esperado pela aplicação
      return partners.map((op) => ({
        id: op.id,
        name: op.name,
        email: op.email,
        role: op.role,
        status: op.status,
        region: op.region || "Nacional",
        ctoCount: op.ctoCount || 0,
        rating: op.rating || 4.5,
        description: op.description || "Operadora de telecomunicações",
        contactEmail: op.email || "contato@operadora.com",
        contactPhone: op.phone || "(00) 0000-0000",
        createdAt: op.createdAt,
        updatedAt: op.updatedAt,
      }))
    } catch (error) {
      console.error("OperatorService.getPartners error:", error)
      throw error
    }
  }
}
