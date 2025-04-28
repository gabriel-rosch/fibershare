import { ctoService } from "@/lib/services/supabase/cto-service"
import { authService } from "@/lib/services/supabase/auth-service"
import type { CTO } from "@/lib/interfaces/service-interfaces"
import type { CTO as CTOUtil } from "@/lib/utils/cto-utils"

// Interface para criar uma nova CTO
export interface CreateCTOData {
  name: string
  description?: string
  totalPorts: number
  occupiedPorts: number
  coordinates: [number, number]
}

// Interface para atualizar uma CTO existente
export interface UpdateCTOData {
  name?: string
  description?: string
  totalPorts?: number
  occupiedPorts?: number
  coordinates?: [number, number]
}

export interface CTOService {
  getAllCTOs(): Promise<CTOUtil[]>
  getCTOById(id: string): Promise<CTOUtil | null>
  searchCTOs(query: string): Promise<CTOUtil[]>
}

export class MockCTOService implements CTOService {
  async getAllCTOs(): Promise<CTOUtil[]> {
    // Implementação para retornar dados simulados
    return []
  }

  async getCTOById(id: string): Promise<CTOUtil | null> {
    // Implementação para retornar dados simulados
    return null
  }

  async searchCTOs(query: string): Promise<CTOUtil[]> {
    // Implementação para retornar dados simulados
    return []
  }
}

// Classe de serviço para CTOs
export class CTOService {
  // Listar todas as CTOs
  static async getCTOs(search?: string, minIdleness?: number, maxIdleness?: number): Promise<CTO[]> {
    try {
      // Verificar se o usuário é um desenvolvedor
      const isDeveloper = await authService.isDeveloperUser()

      if (isDeveloper) {
        // Criar dados mockados para desenvolvedores
        const mockCTOs: CTO[] = [
          {
            id: "cto-001",
            name: "CTO-001",
            description: "CTO com alta ocupação",
            totalPorts: 16,
            occupiedPorts: 15,
            coordinates: [-48.618, -27.598],
            createdAt: "2025-01-15T10:30:00Z",
            updatedAt: "2025-04-10T14:20:00Z",
          },
          {
            id: "cto-002",
            name: "CTO-002",
            description: "CTO com média ocupação",
            totalPorts: 16,
            occupiedPorts: 8,
            coordinates: [-48.617, -27.597],
            createdAt: "2025-01-20T09:15:00Z",
            updatedAt: "2025-04-12T11:45:00Z",
          },
          {
            id: "cto-003",
            name: "CTO-003",
            description: "CTO com baixa ocupação",
            totalPorts: 16,
            occupiedPorts: 2,
            coordinates: [-48.619, -27.597],
            createdAt: "2025-02-05T14:30:00Z",
            updatedAt: "2025-04-15T16:20:00Z",
          },
          {
            id: "cto-004",
            name: "CTO-004",
            description: "CTO totalmente ocupada",
            totalPorts: 8,
            occupiedPorts: 8,
            coordinates: [-48.62, -27.599],
            createdAt: "2025-02-10T08:45:00Z",
            updatedAt: "2025-04-18T09:30:00Z",
          },
          {
            id: "cto-005",
            name: "CTO-005",
            description: "CTO sem ocupação",
            totalPorts: 32,
            occupiedPorts: 0,
            coordinates: [-48.616, -27.596],
            createdAt: "2025-03-01T11:20:00Z",
            updatedAt: "2025-04-20T13:15:00Z",
          },
        ]

        // Aplicar filtros
        let filteredCTOs = [...mockCTOs]

        if (search) {
          const searchLower = search.toLowerCase()
          filteredCTOs = filteredCTOs.filter(
            (cto) =>
              cto.name.toLowerCase().includes(searchLower) ||
              (cto.description && cto.description.toLowerCase().includes(searchLower)),
          )
        }

        if (minIdleness !== undefined) {
          filteredCTOs = filteredCTOs.filter((cto) => {
            const idleness = this.calculateIdleness(cto.totalPorts, cto.occupiedPorts)
            return idleness >= minIdleness
          })
        }

        if (maxIdleness !== undefined) {
          filteredCTOs = filteredCTOs.filter((cto) => {
            const idleness = this.calculateIdleness(cto.totalPorts, cto.occupiedPorts)
            return idleness <= maxIdleness
          })
        }

        return filteredCTOs
      }

      // Buscar CTOs do Supabase
      const ctos = await ctoService.getCTOs(search, minIdleness, maxIdleness)
      return ctos
    } catch (error) {
      console.error("CTOService.getCTOs error:", error)
      throw error
    }
  }

  // Obter uma CTO específica
  static async getCTOById(id: string): Promise<CTO> {
    try {
      // Verificar se o usuário é um desenvolvedor
      const isDeveloper = await authService.isDeveloperUser()

      if (isDeveloper) {
        // Criar dados mockados para desenvolvedores
        const mockCTOs: CTO[] = [
          {
            id: "cto-001",
            name: "CTO-001",
            description: "CTO com alta ocupação",
            totalPorts: 16,
            occupiedPorts: 15,
            coordinates: [-48.618, -27.598],
            createdAt: "2025-01-15T10:30:00Z",
            updatedAt: "2025-04-10T14:20:00Z",
          },
          {
            id: "cto-002",
            name: "CTO-002",
            description: "CTO com média ocupação",
            totalPorts: 16,
            occupiedPorts: 8,
            coordinates: [-48.617, -27.597],
            createdAt: "2025-01-20T09:15:00Z",
            updatedAt: "2025-04-12T11:45:00Z",
          },
        ]

        const cto = mockCTOs.find((c) => c.id === id)
        if (!cto) {
          throw new Error(`CTO com ID ${id} não encontrada`)
        }
        return cto
      }

      // Buscar CTO do Supabase
      const cto = await ctoService.getCTOById(id)
      return cto
    } catch (error) {
      console.error(`CTOService.getCTOById error for ID ${id}:`, error)
      throw error
    }
  }

  // Criar uma nova CTO
  static async createCTO(data: CreateCTOData): Promise<CTO> {
    try {
      // Verificar se o usuário é um desenvolvedor
      const isDeveloper = await authService.isDeveloperUser()

      if (isDeveloper) {
        // Simular criação para desenvolvedores
        return {
          id: `cto-${Date.now()}`,
          name: data.name,
          description: data.description || "",
          totalPorts: data.totalPorts,
          occupiedPorts: data.occupiedPorts,
          coordinates: data.coordinates,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }

      // Criar CTO no Supabase
      const cto = await ctoService.createCTO(data)
      return cto
    } catch (error) {
      console.error("CTOService.createCTO error:", error)
      throw error
    }
  }

  // Atualizar uma CTO existente
  static async updateCTO(id: string, data: UpdateCTOData): Promise<CTO> {
    try {
      // Verificar se o usuário é um desenvolvedor
      const isDeveloper = await authService.isDeveloperUser()

      if (isDeveloper) {
        // Simular atualização para desenvolvedores
        const cto = await this.getCTOById(id)
        return {
          ...cto,
          ...data,
          updatedAt: new Date().toISOString(),
        }
      }

      // Atualizar CTO no Supabase
      const cto = await ctoService.updateCTO(id, data)
      return cto
    } catch (error) {
      console.error(`CTOService.updateCTO error for ID ${id}:`, error)
      throw error
    }
  }

  // Excluir uma CTO
  static async deleteCTO(id: string): Promise<{ id: string; deleted: boolean }> {
    try {
      // Verificar se o usuário é um desenvolvedor
      const isDeveloper = await authService.isDeveloperUser()

      if (isDeveloper) {
        // Simular exclusão para desenvolvedores
        return { id, deleted: true }
      }

      // Excluir CTO no Supabase
      return await ctoService.deleteCTO(id)
    } catch (error) {
      console.error(`CTOService.deleteCTO error for ID ${id}:`, error)
      throw error
    }
  }

  // Métodos utilitários
  static calculateIdleness(total: number, occupied: number): number {
    if (total <= 0) return 0
    return Math.max(0, Math.min(100, ((total - occupied) / total) * 100))
  }

  static getColorFromIdleness(idleness: number): string {
    // Vermelho quando 0% ocioso (100% ocupado)
    // Verde quando 100% ocioso (0% ocupado)
    // Gradiente entre vermelho e verde para valores intermediários
    const r = Math.floor(255 - idleness * 2.55)
    const g = Math.floor(idleness * 2.55)
    const b = 0
    return `rgb(${r}, ${g}, ${b})`
  }
}
