import { v4 as uuidv4 } from "uuid"
import { createServerClient } from "@/lib/supabase/server"
import { SupabaseAuthService } from "./auth-service"
import type { ChatConversation, ChatMessage } from "@/lib/interfaces/service-interfaces"

export class SupabaseChatService {
  // Mapear dados do Supabase para o formato da aplicação
  private static mapConversation(data: any): ChatConversation {
    return {
      id: data.id,
      participants:
        data.participants?.map((p: any) => ({
          id: p.operator_id,
          name: p.operator?.name || "Desconhecido",
          avatar: p.operator?.avatar_url || null,
        })) || [],
      lastMessage:
        data.messages && data.messages.length > 0
          ? {
              id: data.messages[0].id,
              content: data.messages[0].content,
              senderId: data.messages[0].sender_id,
              senderName: data.messages[0].sender?.name || "Desconhecido",
              timestamp: new Date(data.messages[0].created_at).toISOString(),
              read: data.messages[0].read,
            }
          : null,
      unreadCount: data.unread_count || 0,
      createdAt: new Date(data.created_at).toISOString(),
      updatedAt: new Date(data.updated_at).toISOString(),
    }
  }

  private static mapMessage(data: any): ChatMessage {
    return {
      id: data.id,
      content: data.content,
      senderId: data.sender_id,
      senderName: data.sender?.name || "Desconhecido",
      timestamp: new Date(data.created_at).toISOString(),
      read: data.read,
    }
  }

  // Obter todas as conversas do usuário atual
  static async getConversations(): Promise<ChatConversation[]> {
    try {
      const supabase = createServerClient()
      const currentOperatorId = await SupabaseAuthService.getCurrentOperatorId()

      if (!currentOperatorId) {
        console.error("Operador atual não encontrado")
        return []
      }

      // Buscar todas as conversas onde o operador atual é participante
      const { data: participations, error: participationsError } = await supabase
        .from("chat_participants")
        .select("conversation_id")
        .eq("operator_id", currentOperatorId)

      if (participationsError) {
        console.error("Erro ao buscar participações:", participationsError)
        throw new Error(`Erro ao buscar participações: ${participationsError.message}`)
      }

      if (!participations || participations.length === 0) {
        return []
      }

      const conversationIds = participations.map((p) => p.conversation_id)

      // Buscar detalhes das conversas
      const { data: conversations, error: conversationsError } = await supabase
        .from("chat_conversations")
        .select(`
          *,
          participants:chat_participants(
            operator_id,
            operator:operator_id(id, name, avatar_url)
          ),
          messages:chat_messages(
            id, content, sender_id, read, created_at,
            sender:sender_id(id, name)
          )
        `)
        .in("id", conversationIds)
        .order("updated_at", { ascending: false })

      if (conversationsError) {
        console.error("Erro ao buscar conversas:", conversationsError)
        throw new Error(`Erro ao buscar conversas: ${conversationsError.message}`)
      }

      // Para cada conversa, calcular o número de mensagens não lidas
      const conversationsWithUnreadCount = await Promise.all(
        (conversations || []).map(async (conversation) => {
          const { count, error: countError } = await supabase
            .from("chat_messages")
            .select("id", { count: "exact", head: true })
            .eq("conversation_id", conversation.id)
            .eq("read", false)
            .neq("sender_id", currentOperatorId)

          if (countError) {
            console.error(`Erro ao contar mensagens não lidas para conversa ${conversation.id}:`, countError)
            return { ...conversation, unread_count: 0 }
          }

          return { ...conversation, unread_count: count || 0 }
        }),
      )

      return conversationsWithUnreadCount.map(this.mapConversation)
    } catch (error: any) {
      console.error("Erro ao buscar conversas:", error)
      throw error
    }
  }

  // Obter mensagens de uma conversa específica
  static async getMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const supabase = createServerClient()
      const currentOperatorId = await SupabaseAuthService.getCurrentOperatorId()

      if (!currentOperatorId) {
        console.error("Operador atual não encontrado")
        return []
      }

      // Verificar se o usuário é participante da conversa
      const { count, error: participantError } = await supabase
        .from("chat_participants")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conversationId)
        .eq("operator_id", currentOperatorId)

      if (participantError) {
        console.error("Erro ao verificar participação:", participantError)
        throw new Error(`Erro ao verificar participação: ${participantError.message}`)
      }

      if (!count || count === 0) {
        throw new Error("Usuário não é participante desta conversa")
      }

      // Buscar mensagens
      const { data: messages, error: messagesError } = await supabase
        .from("chat_messages")
        .select(`
          *,
          sender:sender_id(id, name)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (messagesError) {
        console.error("Erro ao buscar mensagens:", messagesError)
        throw new Error(`Erro ao buscar mensagens: ${messagesError.message}`)
      }

      // Marcar mensagens como lidas
      const { error: updateError } = await supabase
        .from("chat_messages")
        .update({ read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", currentOperatorId)
        .eq("read", false)

      if (updateError) {
        console.error("Erro ao marcar mensagens como lidas:", updateError)
        // Não falhar a operação se a atualização de leitura falhar
      }

      return (messages || []).map(this.mapMessage)
    } catch (error: any) {
      console.error("Erro ao buscar mensagens:", error)
      throw error
    }
  }

  // Enviar uma mensagem
  static async sendMessage(conversationId: string, content: string): Promise<ChatMessage> {
    try {
      const supabase = createServerClient()
      const currentOperatorId = await SupabaseAuthService.getCurrentOperatorId()

      if (!currentOperatorId) {
        throw new Error("Operador atual não encontrado")
      }

      // Verificar se o usuário é participante da conversa
      const { count, error: participantError } = await supabase
        .from("chat_participants")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conversationId)
        .eq("operator_id", currentOperatorId)

      if (participantError) {
        throw new Error(`Erro ao verificar participação: ${participantError.message}`)
      }

      if (!count || count === 0) {
        throw new Error("Usuário não é participante desta conversa")
      }

      // Enviar mensagem
      const messageId = uuidv4()
      const now = new Date().toISOString()

      const { data: message, error: messageError } = await supabase
        .from("chat_messages")
        .insert({
          id: messageId,
          conversation_id: conversationId,
          sender_id: currentOperatorId,
          content,
          read: false,
          created_at: now,
        })
        .select()
        .single()

      if (messageError || !message) {
        throw new Error(`Erro ao enviar mensagem: ${messageError?.message || "Falha no envio"}`)
      }

      // Atualizar a data de atualização da conversa
      const { error: updateError } = await supabase
        .from("chat_conversations")
        .update({ updated_at: now })
        .eq("id", conversationId)

      if (updateError) {
        console.error("Erro ao atualizar data da conversa:", updateError)
        // Não falhar a operação se a atualização da conversa falhar
      }

      // Buscar detalhes do remetente
      const { data: sender, error: senderError } = await supabase
        .from("operators")
        .select("name")
        .eq("id", currentOperatorId)
        .single()

      if (senderError) {
        console.error("Erro ao buscar remetente:", senderError)
        // Continuar mesmo se não conseguir buscar o remetente
      }

      return {
        id: message.id,
        content: message.content,
        senderId: message.sender_id,
        senderName: sender?.name || "Desconhecido",
        timestamp: new Date(message.created_at).toISOString(),
        read: message.read,
      }
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error)
      throw error
    }
  }

  // Criar uma nova conversa
  static async createConversation(participantIds: string[]): Promise<ChatConversation> {
    try {
      const supabase = createServerClient()
      const currentOperatorId = await SupabaseAuthService.getCurrentOperatorId()

      if (!currentOperatorId) {
        throw new Error("Operador atual não encontrado")
      }

      // Garantir que o operador atual está na lista de participantes
      if (!participantIds.includes(currentOperatorId)) {
        participantIds.push(currentOperatorId)
      }

      // Verificar se já existe uma conversa com os mesmos participantes
      const existingConversation = await this.findExistingConversation(participantIds)
      if (existingConversation) {
        return existingConversation
      }

      // Criar nova conversa
      const conversationId = uuidv4()
      const now = new Date().toISOString()

      const { error: conversationError } = await supabase.from("chat_conversations").insert({
        id: conversationId,
        created_at: now,
        updated_at: now,
      })

      if (conversationError) {
        throw new Error(`Erro ao criar conversa: ${conversationError.message}`)
      }

      // Adicionar participantes
      const participants = participantIds.map((operatorId) => ({
        id: uuidv4(),
        conversation_id: conversationId,
        operator_id: operatorId,
        created_at: now,
      }))

      const { error: participantsError } = await supabase.from("chat_participants").insert(participants)

      if (participantsError) {
        // Tentar excluir a conversa criada se falhar ao adicionar participantes
        await supabase.from("chat_conversations").delete().eq("id", conversationId)
        throw new Error(`Erro ao adicionar participantes: ${participantsError.message}`)
      }

      // Buscar detalhes dos participantes
      const { data: participantDetails, error: detailsError } = await supabase
        .from("operators")
        .select("id, name, avatar_url")
        .in("id", participantIds)

      if (detailsError) {
        console.error("Erro ao buscar detalhes dos participantes:", detailsError)
        // Continuar mesmo se não conseguir buscar detalhes
      }

      return {
        id: conversationId,
        participants: (participantDetails || []).map((p) => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar_url,
        })),
        lastMessage: null,
        unreadCount: 0,
        createdAt: now,
        updatedAt: now,
      }
    } catch (error: any) {
      console.error("Erro ao criar conversa:", error)
      throw error
    }
  }

  // Verificar se já existe uma conversa com os mesmos participantes
  private static async findExistingConversation(participantIds: string[]): Promise<ChatConversation | null> {
    try {
      const supabase = createServerClient()

      // Buscar todas as conversas onde todos os participantes estão presentes
      const { data: conversations, error: conversationsError } = await supabase.from("chat_conversations").select(`
          id,
          created_at,
          updated_at,
          participants:chat_participants(operator_id)
        `)

      if (conversationsError) {
        console.error("Erro ao buscar conversas existentes:", conversationsError)
        return null
      }

      // Filtrar conversas que têm exatamente os mesmos participantes
      const matchingConversation = (conversations || []).find((conversation) => {
        const conversationParticipantIds = conversation.participants.map((p: any) => p.operator_id)

        // Verificar se tem o mesmo número de participantes
        if (conversationParticipantIds.length !== participantIds.length) {
          return false
        }

        // Verificar se todos os participantes desejados estão na conversa
        return participantIds.every((id) => conversationParticipantIds.includes(id))
      })

      if (!matchingConversation) {
        return null
      }

      // Buscar detalhes completos da conversa
      return this.getConversationById(matchingConversation.id)
    } catch (error) {
      console.error("Erro ao buscar conversa existente:", error)
      return null
    }
  }

  // Buscar detalhes de uma conversa pelo ID
  private static async getConversationById(conversationId: string): Promise<ChatConversation | null> {
    try {
      const supabase = createServerClient()
      const currentOperatorId = await SupabaseAuthService.getCurrentOperatorId()

      if (!currentOperatorId) {
        return null
      }

      // Buscar detalhes da conversa
      const { data: conversation, error: conversationError } = await supabase
        .from("chat_conversations")
        .select(`
          *,
          participants:chat_participants(
            operator_id,
            operator:operator_id(id, name, avatar_url)
          ),
          messages:chat_messages(
            id, content, sender_id, read, created_at,
            sender:sender_id(id, name)
          )
        `)
        .eq("id", conversationId)
        .order("messages.created_at", { ascending: false })
        .limit(1, { foreignTable: "messages" })
        .single()

      if (conversationError) {
        console.error("Erro ao buscar detalhes da conversa:", conversationError)
        return null
      }

      // Contar mensagens não lidas
      const { count, error: countError } = await supabase
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conversationId)
        .eq("read", false)
        .neq("sender_id", currentOperatorId)

      if (countError) {
        console.error("Erro ao contar mensagens não lidas:", countError)
        // Continuar mesmo se não conseguir contar
      }

      return this.mapConversation({
        ...conversation,
        unread_count: count || 0,
      })
    } catch (error) {
      console.error("Erro ao buscar conversa por ID:", error)
      return null
    }
  }
}

// Exportar uma instância da classe para compatibilidade
export const chatService = SupabaseChatService
