import type { ServiceOrder, ServiceOrderType, ServiceOrderStatus } from "@/lib/interfaces/service-interfaces"
import { serviceOrderService } from "@/lib/services/supabase/service-order-service"
import { authService } from "@/lib/services/supabase/auth-service"

export interface CreateServiceOrderData {
  type: ServiceOrderType
  title: string
  description: string
  targetId: string
  targetName: string
}

export class ServiceOrderService {
  static async getServiceOrders(
    type?: ServiceOrderType,
    status?: ServiceOrderStatus,
    direction: "incoming" | "outgoing" | "all" = "all",
  ): Promise<ServiceOrder[]> {
    try {
      // Verificar se o usuário é um desenvolvedor
      const isDeveloper = await authService.isDeveloperUser()

      if (isDeveloper) {
        // Criar dados mockados para desenvolvedores
        const mockOrders: ServiceOrder[] = [
          {
            id: "order-001",
            type: "partnership_request",
            status: "pending",
            title: "Solicitação de Parceria - FiberNet",
            description: "Solicitação para estabelecer parceria de compartilhamento de infraestrutura",
            requesterId: "op-007",
            requesterName: "FiberShare",
            targetId: "op-001",
            targetName: "FiberNet",
            createdAt: "2025-04-10T09:30:00Z",
            updatedAt: "2025-04-10T09:30:00Z",
            notes: ["Solicitação enviada em 10/04/2025", "Aguardando resposta da operadora"],
          },
          {
            id: "order-002",
            type: "partnership_request",
            status: "in_progress",
            title: "Solicitação de Parceria - OptiConnect",
            description: "Solicitação para estabelecer parceria de compartilhamento de infraestrutura",
            requesterId: "op-007",
            requesterName: "FiberShare",
            targetId: "op-002",
            targetName: "OptiConnect",
            createdAt: "2025-04-05T14:15:00Z",
            updatedAt: "2025-04-07T10:45:00Z",
            notes: [
              "Solicitação enviada em 05/04/2025",
              "Operadora aceitou iniciar negociações em 07/04/2025",
              "Reunião agendada para 15/04/2025",
            ],
          },
          {
            id: "order-003",
            type: "partnership_request",
            status: "completed",
            title: "Solicitação de Parceria - TelecomSul",
            description: "Solicitação para estabelecer parceria de compartilhamento de infraestrutura",
            requesterId: "op-007",
            requesterName: "FiberShare",
            targetId: "op-003",
            targetName: "TelecomSul",
            createdAt: "2025-03-20T11:00:00Z",
            updatedAt: "2025-04-01T16:30:00Z",
            completedAt: "2025-04-01T16:30:00Z",
            notes: [
              "Solicitação enviada em 20/03/2025",
              "Operadora aceitou iniciar negociações em 22/03/2025",
              "Contrato assinado em 01/04/2025",
            ],
          },
          {
            id: "order-004",
            type: "partnership_request",
            status: "rejected",
            title: "Solicitação de Parceria - NetNordeste",
            description: "Solicitação para estabelecer parceria de compartilhamento de infraestrutura",
            requesterId: "op-007",
            requesterName: "FiberShare",
            targetId: "op-004",
            targetName: "NetNordeste",
            createdAt: "2025-03-15T09:45:00Z",
            updatedAt: "2025-03-18T14:20:00Z",
            notes: [
              "Solicitação enviada em 15/03/2025",
              "Operadora rejeitou a solicitação em 18/03/2025",
              "Motivo: Não há interesse em parcerias no momento",
            ],
          },
          {
            id: "order-005",
            type: "maintenance",
            status: "in_progress",
            title: "Manutenção Preventiva - CTO-042",
            description: "Manutenção preventiva na CTO-042 localizada em São Paulo",
            requesterId: "op-001",
            requesterName: "FiberNet",
            targetId: "op-007",
            targetName: "FiberShare",
            createdAt: "2025-04-08T08:30:00Z",
            updatedAt: "2025-04-09T10:15:00Z",
            notes: [
              "Solicitação recebida em 08/04/2025",
              "Equipe técnica designada em 09/04/2025",
              "Manutenção agendada para 12/04/2025",
            ],
          },
        ]

        // Aplicar filtros
        let filteredOrders = [...mockOrders]

        if (type) {
          filteredOrders = filteredOrders.filter((order) => order.type === type)
        }

        if (status) {
          filteredOrders = filteredOrders.filter((order) => order.status === status)
        }

        if (direction === "incoming") {
          filteredOrders = filteredOrders.filter((order) => order.targetId === "op-007")
        } else if (direction === "outgoing") {
          filteredOrders = filteredOrders.filter((order) => order.requesterId === "op-007")
        }

        return filteredOrders
      }

      // Buscar ordens de serviço do Supabase
      const orders = await serviceOrderService.getServiceOrders(type, status, direction)
      return orders
    } catch (error) {
      console.error("ServiceOrderService.getServiceOrders error:", error)
      throw error
    }
  }

  static async getServiceOrderById(id: string): Promise<ServiceOrder> {
    try {
      // Verificar se o usuário é um desenvolvedor
      const isDeveloper = await authService.isDeveloperUser()

      if (isDeveloper) {
        // Criar dados mockados para desenvolvedores
        const mockOrders: ServiceOrder[] = [
          {
            id: "order-001",
            type: "partnership_request",
            status: "pending",
            title: "Solicitação de Parceria - FiberNet",
            description: "Solicitação para estabelecer parceria de compartilhamento de infraestrutura",
            requesterId: "op-007",
            requesterName: "FiberShare",
            targetId: "op-001",
            targetName: "FiberNet",
            createdAt: "2025-04-10T09:30:00Z",
            updatedAt: "2025-04-10T09:30:00Z",
            notes: ["Solicitação enviada em 10/04/2025", "Aguardando resposta da operadora"],
          },
          {
            id: "order-002",
            type: "partnership_request",
            status: "in_progress",
            title: "Solicitação de Parceria - OptiConnect",
            description: "Solicitação para estabelecer parceria de compartilhamento de infraestrutura",
            requesterId: "op-007",
            requesterName: "FiberShare",
            targetId: "op-002",
            targetName: "OptiConnect",
            createdAt: "2025-04-05T14:15:00Z",
            updatedAt: "2025-04-07T10:45:00Z",
            notes: [
              "Solicitação enviada em 05/04/2025",
              "Operadora aceitou iniciar negociações em 07/04/2025",
              "Reunião agendada para 15/04/2025",
            ],
          },
        ]

        const order = mockOrders.find((o) => o.id === id)
        if (!order) {
          throw new Error(`Ordem de serviço com ID ${id} não encontrada`)
        }
        return order
      }

      // Buscar ordem de serviço do Supabase
      const order = await serviceOrderService.getServiceOrderById(id)
      return order
    } catch (error) {
      console.error(`ServiceOrderService.getServiceOrderById error for ID ${id}:`, error)
      throw error
    }
  }

  static async createServiceOrder(data: CreateServiceOrderData): Promise<ServiceOrder> {
    try {
      // Verificar se o usuário é um desenvolvedor
      const isDeveloper = await authService.isDeveloperUser()

      if (isDeveloper) {
        // Criar dados mockados para desenvolvedores
        return {
          id: `order-${Date.now()}`,
          type: data.type,
          status: "pending",
          title: data.title,
          description: data.description,
          requesterId: "op-007",
          requesterName: "FiberShare",
          targetId: data.targetId,
          targetName: data.targetName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: ["Solicitação enviada"],
        }
      }

      // Criar ordem de serviço no Supabase
      const order = await serviceOrderService.createServiceOrder(data)
      return order
    } catch (error) {
      console.error("ServiceOrderService.createServiceOrder error:", error)
      throw error
    }
  }

  static async updateServiceOrder(id: string, status: ServiceOrderStatus, note?: string): Promise<ServiceOrder> {
    try {
      // Verificar se o usuário é um desenvolvedor
      const isDeveloper = await authService.isDeveloperUser()

      if (isDeveloper) {
        // Simular atualização para desenvolvedores
        const mockOrder = await this.getServiceOrderById(id)
        const updatedOrder = {
          ...mockOrder,
          status,
          updatedAt: new Date().toISOString(),
          notes: note ? [...(mockOrder.notes || []), note] : mockOrder.notes,
        }

        if (status === "completed") {
          updatedOrder.completedAt = new Date().toISOString()
        }

        return updatedOrder
      }

      // Atualizar ordem de serviço no Supabase
      const order = await serviceOrderService.updateServiceOrder(id, status, note)
      return order
    } catch (error) {
      console.error(`ServiceOrderService.updateServiceOrder error for ID ${id}:`, error)
      throw error
    }
  }
}
