import { supabase } from "@/lib/supabase/client"
import { createServerClient } from "@/lib/supabase/server"
import { authService } from "./auth-service"
import { useAuthStore } from "@/lib/store/auth-store"

export type PortOrderStatus =
  | "pending_approval"
  | "rejected"
  | "contract_generated"
  | "contract_signed"
  | "installation_scheduled"
  | "installation_in_progress"
  | "completed"
  | "cancelled"

export interface PortOrderNote {
  id: string
  order_id: string
  author_id: string
  content: string
  is_system_note: boolean
  created_at: string
  author_name?: string // Preenchido após a consulta
}

export interface PortOrder {
  id: string
  cto_id: string
  port_number: number
  requester_id: string
  owner_id: string
  status: PortOrderStatus
  price: number
  installation_fee?: number
  contract_signed_by_requester: boolean
  contract_signed_by_owner: boolean
  scheduled_date?: string
  completed_date?: string
  created_at: string
  updated_at: string
  cto_name?: string // Preenchido após a consulta
  requester_name?: string // Preenchido após a consulta
  owner_name?: string // Preenchido após a consulta
  notes?: PortOrderNote[] // Preenchido após a consulta
}

export interface CreatePortOrderData {
  cto_id: string
  port_number: number
  owner_id: string
  price: number
  installation_fee?: number
  note?: string
}

export interface UpdatePortOrderData {
  status?: PortOrderStatus
  contract_signed_by_requester?: boolean
  contract_signed_by_owner?: boolean
  scheduled_date?: string
  completed_date?: string
  note?: string
}

export class SupabasePortOrderService {
  /**
   * Obtém as ordens de porta com base nos filtros
   */
  async getPortOrders(
    status?: string,
    direction: "incoming" | "outgoing" | "all" = "all",
    ctoId?: string,
    search?: string,
  ) {
    try {
      // Verificar autenticação
      const userId = await authService.getCurrentOperatorId()

      // Se for um usuário de desenvolvimento, retornar dados mockados
      if (isDevelopmentUser()) {
        return getMockPortOrders(status, direction)
      }

      if (!userId) {
        throw new Error("Usuário não autenticado")
      }

      const supabase = createServerClient()
      let query = supabase.from("port_orders").select(`
        *,
        requester:requester_id(id, name, email, avatar_url),
        owner:owner_id(id, name, email, avatar_url),
        cto:cto_id(id, name, description)
      `)

      // Aplicar filtros de direção
      if (direction === "incoming") {
        query = query.eq("owner_id", userId)
      } else if (direction === "outgoing") {
        query = query.eq("requester_id", userId)
      } else {
        // Se for "all", buscar ordens onde o usuário é o solicitante ou o proprietário
        query = query.or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
      }

      // Aplicar filtro de CTO, se fornecido
      if (ctoId) {
        query = query.eq("cto_id", ctoId)
      }

      // Aplicar filtro de status, se fornecido
      if (status) {
        query = query.eq("status", status)
      }

      // Ordenar por data de atualização (mais recente primeiro)
      query = query.order("updated_at", { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error("Erro ao buscar ordens de porta:", error)
        throw new Error(`Erro ao buscar ordens de porta: ${error.message}`)
      }

      // Transformar os dados para o formato esperado pela aplicação
      const transformedOrders = data.map((order) => ({
        id: order.id,
        ctoId: order.cto_id,
        ctoName: order.cto?.name,
        portNumber: order.port_number,
        requesterId: order.requester_id,
        requesterName: order.requester?.name,
        ownerId: order.owner_id,
        ownerName: order.owner?.name,
        status: order.status,
        price: order.price,
        installationFee: order.installation_fee,
        contractSignedByRequester: order.contract_signed_by_requester,
        contractSignedByOwner: order.contract_signed_by_owner,
        scheduledDate: order.scheduled_date,
        completedDate: order.completed_date,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      }))

      // Aplicar filtro de pesquisa, se fornecido
      if (search) {
        const searchLower = search.toLowerCase()
        return transformedOrders.filter(
          (order) =>
            order.ctoName?.toLowerCase().includes(searchLower) ||
            order.requesterName?.toLowerCase().includes(searchLower) ||
            order.ownerName?.toLowerCase().includes(searchLower),
        )
      }

      return transformedOrders
    } catch (error) {
      console.error("Erro ao buscar ordens de porta:", error)
      throw error
    }
  }

  // Outras funções do serviço...
  async getPortOrderById(id: string): Promise<PortOrder> {
    try {
      // Se for um usuário de desenvolvimento, retornar dados mockados
      if (isDevelopmentUser()) {
        const mockOrders = getMockPortOrders()
        const order = mockOrders.find((o) => o.id === id)
        if (order) return order
        throw new Error(`Ordem de porta não encontrada: ${id}`)
      }

      const { data, error } = await supabase
        .from("port_orders")
        .select(`
          *,
          cto:cto_id(id, name),
          requester:requester_id(id, name),
          owner:owner_id(id, name)
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error(`Erro ao buscar ordem de porta ${id}:`, error)
        throw new Error(`Falha ao buscar ordem de porta: ${error.message}`)
      }

      if (!data) {
        throw new Error(`Ordem de porta não encontrada: ${id}`)
      }

      // Processar o resultado para o formato esperado
      const order: PortOrder = {
        ...data,
        cto_name: data.cto?.name,
        requester_name: data.requester?.name,
        owner_name: data.owner?.name,
      }

      // Buscar as notas da ordem
      const { data: notes, error: notesError } = await supabase
        .from("port_order_notes")
        .select(`
          *,
          author:author_id(id, name)
        `)
        .eq("order_id", id)
        .order("created_at")

      if (notesError) {
        console.error(`Erro ao buscar notas da ordem ${id}:`, notesError)
      } else {
        order.notes = (notes || []).map((note: any) => ({
          ...note,
          author_name: note.author?.name || "Sistema",
        }))
      }

      return order
    } catch (error) {
      console.error(`Erro ao buscar ordem de porta ${id}:`, error)
      throw error
    }
  }

  async createPortOrder(data: CreatePortOrderData): Promise<PortOrder> {
    try {
      // Se for um usuário de desenvolvimento, simular criação
      if (isDevelopmentUser()) {
        const mockOrder = {
          id: `po-${Date.now()}`,
          ctoId: data.cto_id,
          ctoName: "CTO Simulada",
          portNumber: data.port_number,
          requesterId: "dev-user",
          requesterName: "Usuário de Desenvolvimento",
          ownerId: data.owner_id,
          ownerName: "Proprietário Simulado",
          status: "pending_approval" as PortOrderStatus,
          price: data.price,
          installationFee: data.installation_fee || 0,
          contractSignedByRequester: false,
          contractSignedByOwner: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: data.note
            ? [
                {
                  id: `note-${Date.now()}`,
                  order_id: `po-${Date.now()}`,
                  author_id: "dev-user",
                  content: data.note,
                  is_system_note: false,
                  created_at: new Date().toISOString(),
                  author_name: "Usuário de Desenvolvimento",
                },
              ]
            : [],
        }
        return mockOrder
      }

      // Primeiro, obter o operador atual
      const operatorId = await authService.getCurrentOperatorId()
      if (!operatorId) {
        throw new Error("Usuário não autenticado")
      }

      // Iniciar uma transação
      const now = new Date().toISOString()

      // 1. Criar a ordem de porta
      const { data: newOrder, error: orderError } = await supabase
        .from("port_orders")
        .insert([
          {
            cto_id: data.cto_id,
            port_number: data.port_number,
            requester_id: operatorId,
            owner_id: data.owner_id,
            status: "pending_approval",
            price: data.price,
            installation_fee: data.installation_fee,
            contract_signed_by_requester: false,
            contract_signed_by_owner: false,
            created_at: now,
            updated_at: now,
          },
        ])
        .select()
        .single()

      if (orderError || !newOrder) {
        console.error("Erro ao criar ordem de porta:", orderError)
        throw new Error(`Falha ao criar ordem de porta: ${orderError?.message}`)
      }

      // 2. Adicionar a nota inicial, se fornecida
      if (data.note) {
        await supabase.from("port_order_notes").insert([
          {
            order_id: newOrder.id,
            author_id: operatorId,
            content: data.note,
            is_system_note: false,
            created_at: now,
          },
        ])
      }

      // 3. Adicionar uma nota do sistema
      await supabase.from("port_order_notes").insert([
        {
          order_id: newOrder.id,
          author_id: "system",
          content: "Ordem de aluguel de porta criada e aguardando aprovação do proprietário.",
          is_system_note: true,
          created_at: now,
        },
      ])

      // Buscar a ordem completa com as notas
      return this.getPortOrderById(newOrder.id)
    } catch (error) {
      console.error("Erro ao criar ordem de porta:", error)
      throw error
    }
  }

  async updatePortOrder(id: string, data: UpdatePortOrderData): Promise<PortOrder> {
    try {
      // Se for um usuário de desenvolvimento, simular atualização
      if (isDevelopmentUser()) {
        const mockOrders = getMockPortOrders()
        const orderIndex = mockOrders.findIndex((o) => o.id === id)
        if (orderIndex === -1) throw new Error(`Ordem de porta não encontrada: ${id}`)

        const updatedOrder = { ...mockOrders[orderIndex] }
        if (data.status) updatedOrder.status = data.status
        if (data.contract_signed_by_requester !== undefined)
          updatedOrder.contractSignedByRequester = data.contract_signed_by_requester
        if (data.contract_signed_by_owner !== undefined)
          updatedOrder.contractSignedByOwner = data.contract_signed_by_owner
        if (data.scheduled_date) updatedOrder.scheduledDate = data.scheduled_date
        if (data.completed_date) updatedOrder.completedDate = data.completed_date
        updatedOrder.updatedAt = new Date().toISOString()

        if (data.note) {
          if (!updatedOrder.notes) updatedOrder.notes = []
          updatedOrder.notes.push({
            id: `note-${Date.now()}`,
            order_id: id,
            author_id: "dev-user",
            content: data.note,
            is_system_note: false,
            created_at: new Date().toISOString(),
            author_name: "Usuário de Desenvolvimento",
          })
        }

        return updatedOrder
      }

      // Obter o operador atual
      const operatorId = await authService.getCurrentOperatorId()
      if (!operatorId) {
        throw new Error("Usuário não autenticado")
      }

      // Iniciar uma transação
      const now = new Date().toISOString()

      // 1. Atualizar a ordem de porta
      const updateData: any = {
        updated_at: now,
      }

      if (data.status !== undefined) updateData.status = data.status
      if (data.contract_signed_by_requester !== undefined)
        updateData.contract_signed_by_requester = data.contract_signed_by_requester
      if (data.contract_signed_by_owner !== undefined)
        updateData.contract_signed_by_owner = data.contract_signed_by_owner
      if (data.scheduled_date !== undefined) updateData.scheduled_date = data.scheduled_date
      if (data.completed_date !== undefined) updateData.completed_date = data.completed_date

      const { data: updatedOrder, error: updateError } = await supabase
        .from("port_orders")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

      if (updateError || !updatedOrder) {
        console.error(`Erro ao atualizar ordem de porta ${id}:`, updateError)
        throw new Error(`Falha ao atualizar ordem de porta: ${updateError?.message}`)
      }

      // 2. Adicionar a nota, se fornecida
      if (data.note) {
        await supabase.from("port_order_notes").insert([
          {
            order_id: id,
            author_id: operatorId,
            content: data.note,
            is_system_note: false,
            created_at: now,
          },
        ])
      }

      // 3. Adicionar uma nota do sistema para a mudança de status
      if (data.status) {
        await supabase.from("port_order_notes").insert([
          {
            order_id: id,
            author_id: "system",
            content: `Status alterado para: ${this.getPortOrderStatusName(data.status)}`,
            is_system_note: true,
            created_at: now,
          },
        ])
      }

      // Buscar a ordem completa com as notas
      return this.getPortOrderById(id)
    } catch (error) {
      console.error(`Erro ao atualizar ordem de porta ${id}:`, error)
      throw error
    }
  }

  async addNoteToOrder(id: string, content: string): Promise<PortOrderNote> {
    try {
      // Se for um usuário de desenvolvimento, simular adição de nota
      if (isDevelopmentUser()) {
        const mockNote = {
          id: `note-${Date.now()}`,
          order_id: id,
          author_id: "dev-user",
          content: content,
          is_system_note: false,
          created_at: new Date().toISOString(),
          author_name: "Usuário de Desenvolvimento",
        }
        return mockNote
      }

      // Obter o operador atual
      const operatorId = await authService.getCurrentOperatorId()
      if (!operatorId) {
        throw new Error("Usuário não autenticado")
      }

      // Adicionar a nota
      const now = new Date().toISOString()
      const { data: newNote, error } = await supabase
        .from("port_order_notes")
        .insert([
          {
            order_id: id,
            author_id: operatorId,
            content,
            is_system_note: false,
            created_at: now,
          },
        ])
        .select()
        .single()

      if (error || !newNote) {
        console.error(`Erro ao adicionar nota à ordem ${id}:`, error)
        throw new Error(`Falha ao adicionar nota: ${error?.message}`)
      }

      // Atualizar a data de atualização da ordem
      await supabase.from("port_orders").update({ updated_at: now }).eq("id", id)

      // Buscar o nome do autor
      const { data: author, error: authorError } = await supabase
        .from("operators")
        .select("name")
        .eq("id", operatorId)
        .single()

      // Retornar a nota com o nome do autor
      return {
        ...newNote,
        author_name: authorError ? "Usuário" : author.name,
      }
    } catch (error) {
      console.error(`Erro ao adicionar nota à ordem ${id}:`, error)
      throw error
    }
  }

  // Método utilitário para obter o nome legível do status
  getPortOrderStatusName(status: PortOrderStatus): string {
    switch (status) {
      case "pending_approval":
        return "Aguardando Aprovação"
      case "rejected":
        return "Rejeitada"
      case "contract_generated":
        return "Contrato Gerado"
      case "contract_signed":
        return "Contrato Assinado"
      case "installation_scheduled":
        return "Instalação Agendada"
      case "installation_in_progress":
        return "Instalação em Andamento"
      case "completed":
        return "Concluída"
      case "cancelled":
        return "Cancelada"
      default:
        return "Desconhecido"
    }
  }

  // Método utilitário para obter a cor do status
  getPortOrderStatusColor(status: PortOrderStatus): string {
    switch (status) {
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "contract_generated":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "contract_signed":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
      case "installation_scheduled":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "installation_in_progress":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }
}

// Função auxiliar para verificar se é um usuário de desenvolvimento
function isDevelopmentUser() {
  if (typeof window !== "undefined") {
    const user = useAuthStore.getState().user
    return user?.isDevelopmentUser === true
  }
  return process.env.NODE_ENV === "development"
}

// Função para retornar dados mockados para usuários de desenvolvimento
function getMockPortOrders(status?: string, direction?: string) {
  // Criar dados mockados diretamente aqui
  const mockPortOrders = [
    {
      id: "po-001",
      ctoId: "cto-001",
      ctoName: "CTO Centro",
      portNumber: 1,
      requesterId: "op-007",
      requesterName: "Operadora Teste",
      ownerId: "op-001",
      ownerName: "Operadora A",
      status: "pending_approval" as PortOrderStatus,
      price: 150.0,
      installationFee: 50.0,
      contractSignedByRequester: false,
      contractSignedByOwner: false,
      createdAt: "2023-01-15T10:00:00Z",
      updatedAt: "2023-01-15T10:00:00Z",
      notes: [
        {
          id: "note-001",
          order_id: "po-001",
          author_id: "op-007",
          content: "Solicitação de aluguel de porta enviada.",
          is_system_note: false,
          created_at: "2023-01-15T10:00:00Z",
          author_name: "Operadora Teste",
        },
      ],
    },
    {
      id: "po-002",
      ctoId: "cto-002",
      ctoName: "CTO Norte",
      portNumber: 3,
      requesterId: "op-002",
      requesterName: "Operadora B",
      ownerId: "op-007",
      ownerName: "Operadora Teste",
      status: "contract_signed" as PortOrderStatus,
      price: 200.0,
      installationFee: 75.0,
      contractSignedByRequester: true,
      contractSignedByOwner: true,
      createdAt: "2023-01-10T14:30:00Z",
      updatedAt: "2023-01-12T09:15:00Z",
      notes: [
        {
          id: "note-002",
          order_id: "po-002",
          author_id: "op-002",
          content: "Solicitação de aluguel de porta enviada.",
          is_system_note: false,
          created_at: "2023-01-10T14:30:00Z",
          author_name: "Operadora B",
        },
        {
          id: "note-003",
          order_id: "po-002",
          author_id: "system",
          content: "Contrato assinado por ambas as partes.",
          is_system_note: true,
          created_at: "2023-01-12T09:15:00Z",
          author_name: "Sistema",
        },
      ],
    },
    {
      id: "po-003",
      ctoId: "cto-003",
      ctoName: "CTO Sul",
      portNumber: 2,
      requesterId: "op-007",
      requesterName: "Operadora Teste",
      ownerId: "op-003",
      ownerName: "Operadora C",
      status: "completed" as PortOrderStatus,
      price: 180.0,
      installationFee: 60.0,
      contractSignedByRequester: true,
      contractSignedByOwner: true,
      scheduledDate: "2023-01-20T09:00:00Z",
      completedDate: "2023-01-20T11:30:00Z",
      createdAt: "2023-01-05T08:45:00Z",
      updatedAt: "2023-01-20T11:30:00Z",
      notes: [
        {
          id: "note-004",
          order_id: "po-003",
          author_id: "op-007",
          content: "Solicitação de aluguel de porta enviada.",
          is_system_note: false,
          created_at: "2023-01-05T08:45:00Z",
          author_name: "Operadora Teste",
        },
        {
          id: "note-005",
          order_id: "po-003",
          author_id: "system",
          content: "Instalação concluída com sucesso.",
          is_system_note: true,
          created_at: "2023-01-20T11:30:00Z",
          author_name: "Sistema",
        },
      ],
    },
  ]

  const currentOperator = {
    id: "op-007",
    name: "Operadora Teste",
  }

  let filteredOrders = [...mockPortOrders]

  // Filtrar por direção
  if (direction === "incoming") {
    filteredOrders = filteredOrders.filter((order) => order.ownerId === currentOperator.id)
  } else if (direction === "outgoing") {
    filteredOrders = filteredOrders.filter((order) => order.requesterId === currentOperator.id)
  }

  // Aplicar filtros
  if (status) {
    filteredOrders = filteredOrders.filter((order) => order.status === status)
  }

  // Ordenar por data de atualização (mais recente primeiro)
  filteredOrders.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  return filteredOrders
}

// Criar e exportar uma instância singleton do serviço
export const portOrderService = new SupabasePortOrderService()
