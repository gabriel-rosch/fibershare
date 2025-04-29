"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useChat } from "@/lib/hooks/use-chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, User } from "lucide-react"
import { StaggeredList } from "@/components/animations/staggered-list"
import { FadeIn } from "@/components/animations/fade-in"

export default function ChatPage() {
  const {
    conversations,
    messages,
    loading,
    activeConversation,
    setActiveConversation,
    sendMessage: sendChatMessage,
  } = useChat()

  const [messageText, setMessageText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Rolar para a última mensagem quando novas mensagens são carregadas
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (messageText.trim() && activeConversation) {
      sendChatMessage(activeConversation.id, messageText)
      setMessageText("")
    }
  }

  // Função para formatar a data
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Função para formatar a data da última mensagem
  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffDays === 1) {
      return "Ontem"
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { day: "2-digit", month: "2-digit" })
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Chat</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Lista de contatos */}
        <Card className="p-4 md:col-span-1 h-full">
          <h2 className="text-xl font-semibold mb-4">Contatos</h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-muted"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-280px)]">
              <StaggeredList>
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      activeConversation?.id === conversation.id ? "bg-primary/10" : "hover:bg-muted"
                    }`}
                    onClick={() => setActiveConversation(conversation)}
                  >
                    <Avatar>
                      <AvatarFallback>{conversation.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium truncate">{conversation.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {conversation.lastMessage && formatLastMessageTime(conversation.lastMessage.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage?.content || "Nenhuma mensagem"}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="default" className="ml-auto">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                ))}
              </StaggeredList>
            </ScrollArea>
          )}
        </Card>

        {/* Janela de mensagens */}
        <Card className="p-4 md:col-span-2 h-full flex flex-col">
          {activeConversation ? (
            <>
              <div className="flex items-center gap-3 pb-4 border-b mb-4">
                <Avatar>
                  <AvatarFallback>{activeConversation.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{activeConversation.name}</h2>
              </div>

              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4 min-h-[calc(100vh-380px)]">
                  {loading ? (
                    <div className="space-y-4 py-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[80%] p-3 rounded-lg animate-pulse ${
                              i % 2 === 0 ? "bg-primary/20" : "bg-muted"
                            }`}
                            style={{ width: `${150 + Math.random() * 200}px`, height: "60px" }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <FadeIn>
                      {messages.map((message) => {
                        const isFromCurrentUser = message.senderId === "current-user"

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isFromCurrentUser ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                isFromCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                              }`}
                            >
                              <p>{message.text || message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isFromCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}
                              >
                                {formatMessageTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </FadeIn>
                  )}
                </div>
              </ScrollArea>

              <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!messageText.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <User className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhuma conversa selecionada</h2>
              <p className="text-muted-foreground">
                Selecione uma conversa na lista de contatos para começar a conversar
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
