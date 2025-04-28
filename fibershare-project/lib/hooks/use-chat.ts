"use client"

import { useState, useEffect, useCallback } from "react"
import type { ChatContact, ChatMessage } from "@/lib/interfaces/service-interfaces"
import { chatService } from "@/lib/services/supabase/chat-service"
import { authService } from "@/lib/services/supabase/auth-service"

export function useChat() {
  const [conversations, setConversations] = useState<ChatContact[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeConversation, setActiveConversation] = useState<ChatContact | null>(null)
  const [loading, setLoading] = useState(true)

  // Carregar contatos
  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true)
      try {
        // Verificar se o usuário é um desenvolvedor
        const isDeveloper = await authService.isDeveloperUser()

        if (isDeveloper) {
          // Dados mockados para desenvolvedores
          const mockContacts: ChatContact[] = [
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

          setConversations(mockContacts)

          // Selecionar o primeiro contato por padrão
          if (mockContacts.length > 0 && !activeConversation) {
            setActiveConversation(mockContacts[0])
          }
        } else {
          // Buscar contatos do Supabase
          const contacts = await chatService.getConversations()
          setConversations(contacts)

          // Selecionar o primeiro contato por padrão
          if (contacts.length > 0 && !activeConversation) {
            setActiveConversation(contacts[0])
          }
        }
      } catch (error) {
        console.error("Erro ao carregar contatos:", error)
      } finally {
        setLoading(false)
      }
    }

    loadContacts()
  }, [activeConversation])

  // Carregar mensagens quando um contato é selecionado
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeConversation) return

      setLoading(true)
      try {
        // Verificar se o usuário é um desenvolvedor
        const isDeveloper = await authService.isDeveloperUser()

        if (isDeveloper) {
          // Dados mockados para desenvolvedores
          const mockChatMessages: Record<string, ChatMessage[]> = {
            "contact-1": [
              {
                id: "msg-1",
                content: "Olá, como podemos ajudar?",
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                senderId: "contact-1",
                receiverId: "current-user",
                read: true,
                text: "Olá, como podemos ajudar?",
              },
              {
                id: "msg-2",
                content: "Estamos interessados em discutir uma parceria",
                timestamp: new Date(Date.now() - 3000000).toISOString(),
                senderId: "current-user",
                receiverId: "contact-1",
                read: true,
                text: "Estamos interessados em discutir uma parceria",
              },
              {
                id: "msg-3",
                content: "Ótimo! Podemos agendar uma reunião?",
                timestamp: new Date(Date.now() - 2400000).toISOString(),
                senderId: "contact-1",
                receiverId: "current-user",
                read: true,
                text: "Ótimo! Podemos agendar uma reunião?",
              },
            ],
            "contact-2": [
              {
                id: "msg-4",
                content: "Bom dia! Temos uma nova oferta para compartilhamento de rede",
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                senderId: "contact-2",
                receiverId: "current-user",
                read: true,
                text: "Bom dia! Temos uma nova oferta para compartilhamento de rede",
              },
              {
                id: "msg-5",
                content: "Obrigado pela informação",
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                senderId: "current-user",
                receiverId: "contact-2",
                read: true,
                text: "Obrigado pela informação",
              },
            ],
          }

          const contactMessages = mockChatMessages[activeConversation.id] || []
          setMessages(contactMessages)
        } else {
          // Buscar mensagens do Supabase
          const messages = await chatService.getMessages(activeConversation.id)

          // Adicionar propriedade text para compatibilidade
          const messagesWithText = messages.map((msg) => ({
            ...msg,
            text: msg.content,
          }))

          setMessages(messagesWithText)
        }
      } catch (error) {
        console.error("Erro ao carregar mensagens:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [activeConversation])

  // Enviar mensagem
  const sendMessage = useCallback(async (contactId: string, content: string) => {
    if (!content.trim()) return null

    try {
      // Verificar se o usuário é um desenvolvedor
      const isDeveloper = await authService.isDeveloperUser()

      if (isDeveloper) {
        // Simular envio de mensagem para desenvolvedores
        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          content: content,
          text: content,
          timestamp: new Date().toISOString(),
          senderId: "current-user",
          receiverId: contactId,
          read: true,
        }

        setMessages((prev) => [...prev, newMessage])

        // Atualizar último mensagem no contato
        setConversations((prev) =>
          prev.map((contact) =>
            contact.id === contactId
              ? {
                  ...contact,
                  lastMessage: {
                    content: content,
                    timestamp: new Date().toISOString(),
                  },
                }
              : contact,
          ),
        )

        // Simular resposta após alguns segundos
        setTimeout(() => {
          const autoReply: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            content: "Obrigado pela mensagem! Responderemos em breve.",
            text: "Obrigado pela mensagem! Responderemos em breve.",
            timestamp: new Date().toISOString(),
            senderId: contactId,
            receiverId: "current-user",
            read: true,
          }

          setMessages((prev) => [...prev, autoReply])

          // Atualizar último mensagem no contato
          setConversations((prev) =>
            prev.map((contact) =>
              contact.id === contactId
                ? {
                    ...contact,
                    lastMessage: {
                      content: autoReply.content,
                      timestamp: autoReply.timestamp,
                    },
                  }
                : contact,
            ),
          )
        }, 2000)

        return newMessage
      } else {
        // Enviar mensagem para o Supabase
        const newMessage = await chatService.sendMessage(contactId, content)

        // Adicionar propriedade text para compatibilidade
        const messageWithText = {
          ...newMessage,
          text: newMessage.content,
        }

        setMessages((prev) => [...prev, messageWithText])

        // Atualizar último mensagem no contato
        setConversations((prev) =>
          prev.map((contact) =>
            contact.id === contactId
              ? {
                  ...contact,
                  lastMessage: {
                    content: content,
                    timestamp: new Date().toISOString(),
                  },
                }
              : contact,
          ),
        )

        return messageWithText
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      return null
    }
  }, [])

  return {
    conversations,
    messages,
    loading,
    activeConversation,
    setActiveConversation,
    sendMessage,
  }
}
