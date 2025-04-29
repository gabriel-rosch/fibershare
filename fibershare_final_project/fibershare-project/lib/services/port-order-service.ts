import type { PortServiceOrder, PortOrderStatus } from "@/lib/interfaces/service-interfaces"
import { portOrderService } from "@/lib/services/supabase/port-order-service"
import { authService } from "@/lib/services/supabase/auth-service"

export interface CreatePortOrderData {
  ctoId: string
  ctoName: string
  portNumber: number
  price: number
  installationFee: number
  targetId: string
  targetName: string
}

export interface UpdatePortOrderData {
  status?: PortOrderStatus
  scheduledDate?: string
  contractSignedByRequester?: boolean
  contractSignedByOwner?: boolean
  note?: string
}

export class PortOrderService {
  static async getPortOrders(
    status?: PortOrderStatus,
    direction: "incoming" | "outgoing" | "all" = "all",
    ctoId?: string,
    search?: string,
  ): Promise<PortServiceOrder[]> {
    try {
      // Verificar se o usuário é um desenvolvedor
      const isDeveloper = await authService.isDeveloperUser()

      if (isDeveloper) {
        // Criar dados mockados para desenvolvedores
        const mockPortOrders: PortServiceOrder[] = [
          {
            id: "port-order-001",
            ctoId: "cto-001",
            ctoName: "CTO-001",
            portNumber: 3,
            requesterId: "op-001",
            requesterName: "FiberNet",
            ownerId: "op-007",
            ownerName: "FiberShare",
            status: "pending_approval",
            createdAt: "2025-04-15T10:30:00Z",
            updatedAt: "2025-04-15T10:30:00Z",
            contractSignedByRequester: false,
            contractSignedByOwner: false,
            price: 45.9,
            installationFee: 120.0,
            notes: [
              {
                id: "note-001",
                orderId: "port-order-001",
                authorId: "op-001",
                authorName: "FiberNet",
                content: "Solicitação de aluguel de porta para atender cliente residencial na região.",
                createdAt: "2025-04-15T10:30:00Z",
                isSystemNote: false,
              },
              {
                id: "note-002",
                orderId: "port-order-001",
                authorId: "system",
                authorName: "Sistema",
                content: "Ordem de serviço criada e aguardando aprovação do proprietário.",
                createdAt: "2025-04-15T10:30:00Z",
                isSystemNote: true,
              },
            ],
          },
          {
            id: "port-order-002",
            ctoId: "cto-002",
            ctoName: "CTO-002",
            portNumber: 5,
            requesterId: "op-002",
            requesterName: "OptiConnect",
            ownerId: "op-007",
            ownerName: "FiberShare",
            status: "contract_generated",
            createdAt: "2025-04-10T14:15:00Z",
            updatedAt: "2025-04-12T09:45:00Z",
            contractUrl: "https://example.com/contracts/port-order-002.pdf",
            contractSignedByRequester: true,
            contractSignedByOwner: false,
            price: 42.5,
            installationFee: 100.0,
            notes: [
              {
                id: "note-003",
                orderId: "port-order-002",
                authorId: "op-002",
                authorName: "OptiConnect",
                content: "Solicitação de aluguel de porta para cliente empresarial.",
                createdAt: "2025-04-10T14:15:00Z",
                isSystemNote: false,
              },
              {
                id: "note-004",
                orderId: "port-order-002",
                authorId: "op-007",
                authorName: "FiberShare",
                content: "Solicitação aprovada. Gerando contrato para assinatura.",
                createdAt: "2025-04-11T10:20:00Z",
                isSystemNote: false,
              },
            ],
          },
          {
            id: "port-order-003",
            ctoId: "cto-003",
            ctoName: "CTO-003",
            portNumber: 8,
            requesterId: "op-007",
            requesterName: "FiberShare",
            ownerId: "op-003",
            ownerName: "TelecomSul",
            status: "installation_scheduled",
            createdAt: "2025-04-05T09:20:00Z",
            updatedAt: "2025-04-14T11:30:00Z",
            scheduledDate: "2025-04-20T09:00:00Z",
            contractUrl: "https://example.com/contracts/port-order-003.pdf",
            contractSignedByRequester: true,
            contractSignedByOwner: true,
            price: 48.75,
            installationFee: 150.0,
            notes: [
              {
                id: "note-007",
                orderId: "port-order-003",
                authorId: "op-007",
                authorName: "FiberShare",
                content: "Solicitação urgente para atender novo condomínio.",
                createdAt: "2025-04-05T09:20:00Z",
                isSystemNote: false,
              },
            ],
          },
        ]

        // Aplicar filtros
        let filteredOrders = [...mockPortOrders]

        if (status) {
          filteredOrders = filteredOrders.filter((order) => order.status === status)
        }

        if (direction === "incoming") {
          filteredOrders = filteredOrders.filter((order) => order.ownerId === "op-007")
        } else if (direction === "outgoing") {
          filteredOrders = filteredOrders.filter((order) => order.requesterId === "op-007")
        }

        if (ctoId) {
          filteredOrders = filteredOrders.filter((order) => order.ctoId === ctoId)
        }

        if (search) {
          const searchLower = search.toLowerCase()
          filteredOrders = filteredOrders.filter(
            (order) =>
              order.ctoName.toLowerCase().includes(searchLower) ||
              order.requesterName.toLowerCase().includes(searchLower) ||
              order.ownerName.toLowerCase().includes(searchLower),
          )
        }

        return filteredOrders
      }

      // Buscar ordens de porta do Supabase
      const orders = await portOrderService.getPortOrders(status, direction, ctoId, search)
      return orders
    } catch (error) {
      console.error("PortOrderService.getPortOrders error:", error)
      throw error
    }
  }

  static async getPortOrderById(id: string): Promise<PortServiceOrder> {
    try {
      // Verificar se o usuário é um desenvolvedor
      const isDeveloper = await authService.isDeveloperUser()

      if (isDeveloper) {
        // Criar dados mockados para desenvolvedores
        const mockPortOrders: PortServiceOrder[] = [
          {
            id: "port-order-001",
            ctoId: "cto-001",
            ctoName: "CTO-001",
            portNumber: 3,
            requesterId: "op-001",
            requesterName: "FiberNet",
            ownerId: "op-007",
            ownerName: "FiberShare",
            status: "pending_approval",
            createdAt: "2025-04-15T10:30:00Z",
            updatedAt: "2025-04-15T10:30:00Z",
            contractSignedByRequester: false,
            contractSignedByOwner: false,
            price: 45.9,
            installationFee: 120.0,
            notes: [
              {
                id: "note-001",
                orderId: "port-order-001",
                authorId: "op-001",
                authorName: "FiberNet",
                content: "Solicitação de aluguel de porta para atender cliente residencial na região.",
                createdAt: "2025-04-15T10:30:00Z",
                isSystemNote: false,
              },
              {
                id: "note-002",
                orderId: "port-order-001",
                authorId: "system",
                authorName: "Sistema",
                content: "Ordem de serviço criada e aguardando aprovação do proprietário.",
                createdAt: "2025-04-15T10:30:00Z",
                isSystemNote: true,
              },
            ],
          },
          {
            id: "port-order-002",
            ctoId: "cto-002",
            ctoName: "CTO-002",
            portNumber: 5,
            requesterId: "op-002",
            requesterName: "OptiConnect",
            ownerId: "op-007",
            ownerName: "FiberShare",
            status: "contract_generated",
            createdAt: "2025-04-10T14:15:00Z",
            updatedAt: "2025-04-12T09:45:00Z",
            contractUrl: "https://example.com/contracts/port-order-002.pdf",
            contractSignedByRequester: true,
            contractSignedByOwner: false,
            price: 42.5,
            installationFee: 100.0,
            notes: [
              {
                id: "note-003",
                orderId: "port-order-002",
                authorId: "op-002",
                authorName: "OptiConnect",
                content: "Solicitação de aluguel de porta para cliente empresarial.",
                createdAt: "2025-04-10T14:15:00Z",
                isSystemNote: false,
              },
              {
                id: "note-004",
                orderId: "port-order-002",
                authorId: "op-007",
                authorName: "FiberShare",
                content: "Solicitação aprovada. Gerando contrato para assinatura.",
                createdAt: "2025-04-11T10:20:00Z",
                isSystemNote: false,
              },
            ],
          },
        ]

        const order = mockPortOrders.find((o) => o.id === id)
        if (!order) {
          throw new Error(`Ordem de porta com ID ${id} não encontrada`)
        }
        return order
      }

      // Buscar ordem de porta do Supabase
      const order = await portOrderService.getPortOrderById(id)
      return order
    } catch (error) {
      console.error(`PortOrderService.getPortOrderById error for ID ${id}:`, error)
      throw error
    }
  }

  static async createPortOrder(data: CreatePortOrderData): Promise<PortServiceOrder> {
    try {
      // Verificar se o usuário é um desenvolvedor
      const isDeveloper = await authService.isDeveloperUser()

      if (isDeveloper) {
        // Simular criação para desenvolvedores
        return {
          id: `port-order-${Date.now()}`,
          ctoId: data.ctoId,
          ctoName: data.ctoName,
          portNumber: data.portNumber,
          requesterId: "op-007",
          requesterName: "FiberShare",
          ownerId: data.targetId,
          ownerName: data.targetName,
          status: "pending_approval",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          contractSignedByRequester: false,
          contractSignedByOwner: false,
          price: data.price,
          installationFee: data.installationFee,
          notes: [
            {
              id: `note-${Date.now()}`,
              orderId: `port-order-${Date.now()}`,
              authorId: "op-007",
              authorName: "FiberShare",
              content: "Solicitação de aluguel de porta criada.",
              createdAt: new Date().toISOString(),
              isSystemNote: false,
            },
            {
              id: `note-${Date.now() + 1}`,
              orderId: `port-order-${Date.now()}`,
              authorId: "system",
              authorName: "Sistema",
              content: "Ordem de serviço criada e aguardando aprovação do proprietário.",
              createdAt: new Date().toISOString(),
              isSystemNote: true,
            },
          ],
        }
      }

      // Criar ordem de porta no Supabase
      const order = await portOrderService.createPortOrder(data)
      return order
    } catch (error) {
      console.error("PortOrderService.createPortOrder error:", error)
      throw error
    }
  }

  static async updatePortOrder(id: string, data: UpdatePortOrderData): Promise<PortServiceOrder> {
    try {
      // Verificar se o usuário é um desenvolvedor
      const isDeveloper = await authService.isDeveloperUser()

      if (isDeveloper) {
        // Simular atualização para desenvolvedores
        const order = await this.getPortOrderById(id)
        const updatedOrder = {
          ...order,
          ...data,
          updatedAt: new Date().toISOString(),
        }

        // Adicionar nota se fornecida
        if (data.note) {
          updatedOrder.notes = [
            ...order.notes,
            {
              id: `note-${Date.now()}`,
              orderId: id,
              authorId: "op-007",
              authorName: "FiberShare",
              content: data.note,
              createdAt: new Date().toISOString(),
              isSystemNote: false,
            },
          ]
        }

        return updatedOrder
      }

      // Atualizar ordem de porta no Supabase
      const order = await portOrderService.updatePortOrder(id, data)
      return order
    } catch (error) {
      console.error(`PortOrderService.updatePortOrder error for ID ${id}:`, error)
      throw error
    }
  }

  static async addNoteToOrder(id: string, content: string): Promise<void> {
    try {
      // Verificar se o usuário é um desenvolvedor
      const isDeveloper = await authService.isDeveloperUser()

      if (isDeveloper) {
        // Não fazer nada para desenvolvedores, pois a nota será adicionada na próxima chamada para getPortOrderById
        return
      }

      // Adicionar nota à ordem de porta no Supabase
      await portOrderService.addNoteToOrder(id, content)
    } catch (error) {
      console.error(`PortOrderService.addNoteToOrder error for ID ${id}:`, error)
      throw error
    }
  }
}
