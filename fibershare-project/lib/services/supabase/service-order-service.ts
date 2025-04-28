import { v4 as uuidv4 } from "uuid"
import type { ServiceOrder, ServiceOrderStatus, ServiceOrderType } from "@/lib/interfaces/service-interfaces"
import { authService } from "@/lib/services/supabase/auth-service"
import { createServerClient } from "@/lib/supabase/server"

export class SupabaseServiceOrderService {
  // Converter dados do Supabase para o formato da aplicação
  private mapServiceOrder(data: any): ServiceOrder {
    return {
      id: data.id,
      type: data.type,
      title: data.title,
      description: data.description,
      status: data.status,
      createdAt: new Date(data.created_at).toISOString(),
      updatedAt: new Date(data.updated_at).toISOString(),
      requesterId: data.requester_id,
      requesterName: data.requester?.name || "Desconhecido",
      targetId: data.target_id,
      targetName: data.target?.name || "Desconhecido",
      completedAt: data.completed_at ? new Date(data.completed_at).toISOString() : undefined,
      notes: (data.notes || []).map((note: any) => ({
        id: note.id,
        orderId: note.order_id,
        authorId: note.author_id,
        authorName: note.author?.name || "Sistema",
        content: note.content,
        isSystemNote: note.is_system_note,
        createdAt: new Date(note.created_at).toISOString(),
      })),
    }
  }

  // Listar todas as ordens de serviço
  async getServiceOrders(
    type?: ServiceOrderType,
    status?: ServiceOrderStatus,
    direction?: "incoming" | "outgoing" | "all",
  ): Promise<ServiceOrder[]> {
    try {
      const supabase = createServerClient()
      const currentOperatorId = await authService.getCurrentOperatorId()

      if (!currentOperatorId) {
        console.error("Operador atual não encontrado")
        return []
      }

      console.log(`Buscando ordens para operador ${currentOperatorId}, direção: ${direction}`)

      let query = supabase
        .from("service_orders")
        .select(`
          *,
          requester:requester_id(id, name),
          target:target_id(id, name),
          notes:service_order_notes(
            *,
            author:author_id(id, name)
          )
        `)
        .order("created_at", { ascending: false })

      // Aplicar filtros
      if (type) {
        query = query.eq("type", type)
      }

      if (status) {
        query = query.eq("status", status)
      }

      // Filtrar por direção (entrada/saída)
      if (direction === "incoming") {
        query = query.eq("target_id", currentOperatorId)
      } else if (direction === "outgoing") {
        query = query.eq("requester_id", currentOperatorId)
      } else {
        // Se for "all" ou undefined, buscar ambas
        query = query.or(`requester_id.eq.${currentOperatorId},target_id.eq.${currentOperatorId}`)
      }

      const { data, error } = await query

      if (error) {
        console.error("Erro ao buscar ordens de serviço:", error)
        throw new Error(`Erro ao buscar ordens: ${error.message}`)
      }

      console.log(`Encontradas ${data?.length || 0} ordens de serviço`)

      // Mapear dados para o formato da aplicação
      return (data || []).map((order) => this.mapServiceOrder(order))
    } catch (error: any) {
      console.error("Erro ao buscar ordens de serviço:", error)
      throw error
    }
  }

  // Buscar uma ordem de serviço específica
  async getServiceOrderById(id: string): Promise<ServiceOrder> {
    try {
      const supabase = createServerClient()

      const { data, error } = await supabase
        .from("service_orders")
        .select(`
          *,
          requester:requester_id(id, name),
          target:target_id(id, name),
          notes:service_order_notes(
            *,
            author:author_id(id, name)
          )
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error(`Erro ao buscar ordem de serviço ${id}:`, error)
        throw new Error(`Erro ao buscar ordem: ${error.message}`)
      }

      if (!data) {
        throw new Error("Ordem não encontrada")
      }

      return this.mapServiceOrder(data)
    } catch (error: any) {
      console.error(`Erro ao buscar ordem de serviço ${id}:`, error)
      throw error
    }
  }

  // Criar uma nova ordem de serviço
  async createServiceOrder(data: {
    type: ServiceOrderType
    title: string
    description: string
    target_id: string
    initial_note?: string
  }): Promise<ServiceOrder> {
    try {
      const supabase = createServerClient()
      const currentOperatorId = await authService.getCurrentOperatorId()

      if (!currentOperatorId) {
        throw new Error("Operador atual não encontrado")
      }

      // Criar a ordem de serviço
      const orderId = uuidv4()
      const now = new Date().toISOString()

      const { data: newOrder, error: orderError } = await supabase
        .from("service_orders")
        .insert({
          id: orderId,
          type: data.type,
          title: data.title,
          description: data.description,
          status: "pending",
          created_at: now,
          updated_at: now,
          requester_id: currentOperatorId,
          target_id: data.target_id,
        })
        .select()
        .single()

      if (orderError || !newOrder) {
        throw new Error(`Erro ao criar ordem de serviço: ${orderError?.message || "Falha na criação"}`)
      }

      // Se houver uma nota inicial, adicionar
      if (data.initial_note) {
        const { error: noteError } = await supabase.from("service_order_notes").insert({
          id: uuidv4(),
          order_id: orderId,
          author_id: currentOperatorId,
          content: data.initial_note,
          is_system_note: false,
          created_at: now,
        })

        if (noteError) {
          console.error("Erro ao adicionar nota inicial:", noteError)
          // Não falhar a criação da ordem se a nota falhar
        }
      }

      // Buscar a ordem completa com notas
      const { data: completeOrder, error: completeOrderError } = await supabase
        .from("service_orders")
        .select(`
          *,
          requester:requester_id(id, name),
          target:target_id(id, name),
          notes:service_order_notes(
            *,
            author:author_id(id, name)
          )
        `)
        .eq("id", orderId)
        .single()

      if (completeOrderError || !completeOrder) {
        throw new Error(`Erro ao buscar ordem completa: ${completeOrderError?.message || "Não encontrada"}`)
      }

      return this.mapServiceOrder(completeOrder)
    } catch (error: any) {
      console.error("Erro ao criar ordem de serviço:", error)
      throw error
    }
  }

  // Atualizar o status de uma ordem de serviço
  async updateServiceOrder(id: string, status: ServiceOrderStatus, note?: string): Promise<ServiceOrder> {
    try {
      const supabase = createServerClient()
      const currentOperatorId = await authService.getCurrentOperatorId()

      if (!currentOperatorId) {
        throw new Error("Operador atual não encontrado")
      }

      // Atualizar o status da ordem
      const now = new Date().toISOString()
      const updateData: any = {
        status,
        updated_at: now,
      }

      // Se o status for "completed", adicionar a data de conclusão
      if (status === "completed") {
        updateData.completed_at = now
      }

      const { data: updatedOrder, error: updateError } = await supabase
        .from("service_orders")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

      if (updateError || !updatedOrder) {
        throw new Error(`Erro ao atualizar ordem: ${updateError?.message || "Falha na atualização"}`)
      }

      // Se houver uma nota, adicionar
      if (note) {
        const { error: noteError } = await supabase.from("service_order_notes").insert({
          id: uuidv4(),
          order_id: id,
          author_id: currentOperatorId,
          content: note,
          is_system_note: false,
          created_at: now,
        })

        if (noteError) {
          console.error("Erro ao adicionar nota:", noteError)
          // Não falhar a atualização da ordem se a nota falhar
        }
      }

      // Buscar a ordem completa com notas
      const { data: completeOrder, error: completeOrderError } = await supabase
        .from("service_orders")
        .select(`
          *,
          requester:requester_id(id, name),
          target:target_id(id, name),
          notes:service_order_notes(
            *,
            author:author_id(id, name)
          )
        `)
        .eq("id", id)
        .single()

      if (completeOrderError || !completeOrder) {
        throw new Error(`Erro ao buscar ordem completa: ${completeOrderError?.message || "Não encontrada"}`)
      }

      return this.mapServiceOrder(completeOrder)
    } catch (error: any) {
      console.error("Erro ao atualizar ordem de serviço:", error)
      throw error
    }
  }
}

// Exportar uma instância singleton para uso em toda a aplicação
export const serviceOrderService = new SupabaseServiceOrderService()
