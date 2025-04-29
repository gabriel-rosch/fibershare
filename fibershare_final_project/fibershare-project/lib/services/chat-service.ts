import apiClient from '@/lib/apiClient';
import type { ChatMessage, ChatContact } from '@/lib/interfaces/service-interfaces';

// Função para obter contatos de chat
export async function getContacts(): Promise<ChatContact[]> {
  try {
    // Simulação simples para evitar erros de servidor
    return [
      {
        id: "contact-1",
        name: "Operadora A",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "online",
        lastSeen: new Date().toISOString(),
        unreadCount: 2,
        lastMessage: {
          id: "msg-1",
          content: "Olá, temos interesse em discutir uma parceria",
          timestamp: new Date().toISOString(),
          senderId: "contact-1",
          receiverId: "current-user",
          read: false,
        },
      },
      {
        id: "contact-2",
        name: "Operadora B",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "offline",
        lastSeen: new Date(Date.now() - 3600000).toISOString(),
        unreadCount: 0,
        lastMessage: {
          id: "msg-2",
          content: "Obrigado pela informação",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          senderId: "current-user",
          receiverId: "contact-2",
          read: true,
        },
      },
    ]
  } catch (error) {
    console.error("Erro ao buscar contatos:", error)
    return []
  }
}

export async function getMessages(contactId: string): Promise<ChatMessage[]> {
  try {
    // Simulação simples para evitar erros de servidor
    return [
      {
        id: "msg-1",
        content: "Olá, como podemos ajudar?",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        senderId: contactId,
        receiverId: "current-user",
        read: true,
      },
      {
        id: "msg-2",
        content: "Estamos interessados em discutir uma parceria",
        timestamp: new Date(Date.now() - 3000000).toISOString(),
        senderId: "current-user",
        receiverId: contactId,
        read: true,
      },
      {
        id: "msg-3",
        content: "Ótimo! Podemos agendar uma reunião?",
        timestamp: new Date(Date.now() - 2400000).toISOString(),
        senderId: contactId,
        receiverId: "current-user",
        read: true,
      },
    ]
  } catch (error) {
    console.error(`Erro ao buscar mensagens para ${contactId}:`, error)
    return []
  }
}

export async function sendMessage(contactId: string, content: string): Promise<ChatMessage> {
  try {
    // Simulação simples para evitar erros de servidor
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content,
      timestamp: new Date().toISOString(),
      senderId: "current-user",
      receiverId: contactId,
      read: true,
    }

    return newMessage
  } catch (error) {
    console.error(`Erro ao enviar mensagem para ${contactId}:`, error)
    throw error
  }
}

export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function formatLastSeen(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) {
    return "agora mesmo"
  } else if (diffMins < 60) {
    return `há ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`
  } else if (diffHours < 24) {
    return `há ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`
  } else {
    return `há ${diffDays} ${diffDays === 1 ? "dia" : "dias"}`
  }
}

export const chatService = {
  getConversations: async () => {
    const response = await apiClient.get('/chat/conversations');
    return response.data;
  },

  getMessages: async (contactId: string) => {
    const response = await apiClient.get(`/chat/messages/${contactId}`);
    return response.data;
  },

  sendMessage: async (contactId: string, content: string) => {
    const response = await apiClient.post('/chat/messages', { contactId, content });
    return response.data;
  }
};
