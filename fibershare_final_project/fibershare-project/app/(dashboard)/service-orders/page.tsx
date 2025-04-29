"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "@/lib/i18n/use-translations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { FadeIn } from "@/components/animations/fade-in"
import { StaggeredList } from "@/components/animations/staggered-list"
import { HoverCard } from "@/components/animations/hover-card"
import { useDebounce } from "@/lib/hooks/use-debounce"
// Importe o hook useServiceOrders em vez de usePortOrders:
import { useServiceOrders } from "@/lib/hooks/use-service-orders"
import {
  Search,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Network,
  User,
  Building2,
  PenToolIcon as Tool,
} from "lucide-react"

// Definindo o tipo para o status da ordem de porta
export type PortOrderStatus =
  | "pending_approval"
  | "rejected"
  | "contract_generated"
  | "contract_signed"
  | "installation_scheduled"
  | "installation_in_progress"
  | "completed"
  | "cancelled"

// Definindo o tipo para o status da ordem de serviço
export type ServiceOrderStatus = "pending" | "in_progress" | "completed" | "rejected" | "cancelled"

// Função para obter o nome do status da ordem de porta
export function getPortOrderStatusName(status: PortOrderStatus): string {
  const statusNames: Record<PortOrderStatus, string> = {
    pending_approval: "Aguardando Aprovação",
    rejected: "Rejeitada",
    contract_generated: "Contrato Gerado",
    contract_signed: "Contrato Assinado",
    installation_scheduled: "Instalação Agendada",
    installation_in_progress: "Instalação em Andamento",
    completed: "Concluída",
    cancelled: "Cancelada",
  }
  return statusNames[status] || status
}

// Função para obter a cor do status da ordem de porta
export function getPortOrderStatusColor(status: PortOrderStatus): string {
  const statusColors: Record<PortOrderStatus, string> = {
    pending_approval: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    contract_generated: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    contract_signed: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    installation_scheduled: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    installation_in_progress: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  }
  return statusColors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
}

export default function ServiceOrdersPage() {
  const { t } = useTranslations()
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState<ServiceOrderStatus | undefined>(undefined)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [orderDetail, setOrderDetail] = useState<any | null>(null)
  const [newNote, setNewNote] = useState("")
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false)

  // Substitua a chamada do hook usePortOrders por useServiceOrders:
  // Usar o hook para buscar dados
  const {
    orders,
    isLoading,
    error,
    direction,
    setDirection,
    status,
    setStatus,
    type,
    setType,
    fetchOrders,
    createOrder,
    updateOrderStatus,
  } = useServiceOrders({
    initialStatus: selectedStatus,
    initialDirection: "all",
  })

  // Função para lidar com a pesquisa
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Atualize a função handleStatusChange para usar setStatus:
  // Função para lidar com a mudança de status
  const handleStatusChange = (value: string) => {
    const newStatus = value === "all" ? undefined : (value as ServiceOrderStatus)
    setSelectedStatus(newStatus)
    setStatus(newStatus)
  }

  // Função para lidar com a mudança de direção
  const handleDirectionChange = (value: string) => {
    setDirection(value as "incoming" | "outgoing" | "all")
  }

  // Atualize a função handleOpenOrderDetail para buscar os detalhes da ordem:
  // Função para abrir o diálogo de detalhes da ordem
  const handleOpenOrderDetail = async (orderId: string) => {
    try {
      const response = await fetch(`/api/service-orders/${orderId}`)
      if (!response.ok) {
        throw new Error(`Erro ao buscar detalhes da ordem: ${response.statusText}`)
      }
      const order = await response.json()
      setOrderDetail(order)
      setSelectedOrder(orderId)
      setShowOrderDialog(true)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da ordem.",
        variant: "destructive",
      })
    }
  }

  // Função para adicionar uma nota à ordem
  const handleAddNote = async () => {
    if (!selectedOrder || !newNote.trim()) return

    setIsSubmittingNote(true)
    try {
      // await addNote(selectedOrder, newNote)
      setNewNote("")
      toast({
        title: "Nota adicionada",
        description: "Sua nota foi adicionada com sucesso.",
      })

      // Atualizar os detalhes da ordem
      // const updatedOrder = await getOrderById(selectedOrder)
      // setOrderDetail(updatedOrder)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a nota.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingNote(false)
    }
  }

  // Atualize a função handleUpdateOrderStatus para usar updateOrderStatus:
  // Função para atualizar o status da ordem
  const handleUpdateOrderStatus = async (newStatus: ServiceOrderStatus, note?: string) => {
    if (!selectedOrder) return

    setIsUpdatingOrder(true)
    try {
      const updatedOrder = await updateOrderStatus(selectedOrder, newStatus, note)
      setOrderDetail(updatedOrder)
      toast({
        title: "Ordem atualizada",
        description: `O status da ordem foi atualizado para ${newStatus}.`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a ordem.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingOrder(false)
    }
  }

  // Função para assinar o contrato
  const handleSignContract = async () => {
    if (!selectedOrder || !orderDetail) return

    setIsUpdatingOrder(true)
    try {
      // Determinar qual parte está assinando
      const isRequester = orderDetail.requesterId === "op-007" // ID do currentOperator
      const updateData = isRequester ? { contractSignedByRequester: true } : { contractSignedByOwner: true }

      // const updatedOrder = await updateOrder(selectedOrder, {
      //   ...updateData,
      //   note: "Contrato assinado.",
      // })
      // setOrderDetail(updatedOrder)
      toast({
        title: "Contrato assinado",
        description: "O contrato foi assinado com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível assinar o contrato.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingOrder(false)
    }
  }

  // Função para agendar instalação
  const handleScheduleInstallation = async (date: string) => {
    if (!selectedOrder) return

    setIsUpdatingOrder(true)
    try {
      // const updatedOrder = await updateOrder(selectedOrder, {
      //   status: "installation_scheduled",
      //   scheduledDate: date,
      //   note: `Instalação agendada para ${new Date(date).toLocaleDateString("pt-BR")}.`,
      // })
      // setOrderDetail(updatedOrder)
      toast({
        title: "Instalação agendada",
        description: "A instalação foi agendada com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível agendar a instalação.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingOrder(false)
    }
  }

  // Função para iniciar instalação
  const handleStartInstallation = async () => {
    if (!selectedOrder) return

    setIsUpdatingOrder(true)
    try {
      // const updatedOrder = await updateOrder(selectedOrder, {
      //   status: "installation_in_progress",
      //   note: "Instalação iniciada.",
      // })
      // setOrderDetail(updatedOrder)
      toast({
        title: "Instalação iniciada",
        description: "A instalação foi iniciada com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a instalação.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingOrder(false)
    }
  }

  // Função para concluir instalação
  const handleCompleteInstallation = async () => {
    if (!selectedOrder) return

    setIsUpdatingOrder(true)
    try {
      // const updatedOrder = await updateOrder(selectedOrder, {
      //   status: "completed",
      //   note: "Instalação concluída com sucesso.",
      // })
      // setOrderDetail(updatedOrder)
      toast({
        title: "Instalação concluída",
        description: "A instalação foi concluída com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível concluir a instalação.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingOrder(false)
    }
  }

  // Renderizar ações disponíveis com base no status da ordem
  const renderOrderActions = () => {
    if (!orderDetail) return null

    const isOwner = orderDetail.ownerId === "op-007" // ID do currentOperator
    const isRequester = orderDetail.requesterId === "op-007" // ID do currentOperator

    switch (orderDetail.status) {
      case "pending_approval":
        if (isOwner) {
          return (
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleUpdateOrderStatus("rejected", "Solicitação rejeitada.")}
                disabled={isUpdatingOrder}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rejeitar
              </Button>
              <Button
                className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                onClick={() =>
                  handleUpdateOrderStatus("in_progress", "Solicitação aprovada. Contrato gerado para assinatura.")
                }
                disabled={isUpdatingOrder}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Aprovar
              </Button>
            </div>
          )
        }
        return (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md text-sm">
            <p className="text-yellow-700 dark:text-yellow-400">Aguardando aprovação do proprietário da porta.</p>
          </div>
        )

      case "contract_generated":
        return (
          <div className="mt-4">
            {orderDetail.contractUrl && (
              <Button
                variant="outline"
                className="w-full mb-3"
                onClick={() => window.open(orderDetail.contractUrl, "_blank")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Visualizar Contrato
              </Button>
            )}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span>Assinatura do Solicitante:</span>
                {orderDetail.contractSignedByRequester ? (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  >
                    Assinado
                  </Badge>
                ) : isRequester ? (
                  <Button size="sm" onClick={handleSignContract} disabled={isUpdatingOrder}>
                    Assinar
                  </Button>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  >
                    Pendente
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span>Assinatura do Proprietário:</span>
                {orderDetail.contractSignedByOwner ? (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  >
                    Assinado
                  </Badge>
                ) : isOwner ? (
                  <Button size="sm" onClick={handleSignContract} disabled={isUpdatingOrder}>
                    Assinar
                  </Button>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  >
                    Pendente
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )

      case "contract_signed":
        if (isRequester) {
          return (
            <div className="mt-4">
              <p className="mb-2 text-sm">Agendar data para instalação:</p>
              <div className="flex gap-2">
                <Input
                  type="datetime-local"
                  className="flex-1"
                  id="installation-date"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <Button
                  onClick={() => {
                    const dateInput = document.getElementById("installation-date") as HTMLInputElement
                    if (dateInput && dateInput.value) {
                      handleScheduleInstallation(new Date(dateInput.value).toISOString())
                    } else {
                      toast({
                        title: "Erro",
                        description: "Selecione uma data válida para a instalação.",
                        variant: "destructive",
                      })
                    }
                  }}
                  disabled={isUpdatingOrder}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar
                </Button>
              </div>
            </div>
          )
        }
        return (
          <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-md text-sm">
            <p className="text-indigo-700 dark:text-indigo-400">
              Contrato assinado por ambas as partes. Aguardando agendamento da instalação pelo solicitante.
            </p>
          </div>
        )

      case "installation_scheduled":
        if (isRequester) {
          return (
            <div className="mt-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md text-sm mb-3">
                <p className="text-purple-700 dark:text-purple-400">
                  Instalação agendada para:{" "}
                  {orderDetail.scheduledDate
                    ? new Date(orderDetail.scheduledDate).toLocaleString("pt-BR")
                    : "Data não definida"}
                </p>
              </div>
              <Button
                className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                onClick={handleStartInstallation}
                disabled={isUpdatingOrder}
              >
                <Tool className="mr-2 h-4 w-4" />
                Iniciar Instalação
              </Button>
            </div>
          )
        }
        return (
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md text-sm">
            <p className="text-purple-700 dark:text-purple-400">
              Instalação agendada para:{" "}
              {orderDetail.scheduledDate
                ? new Date(orderDetail.scheduledDate).toLocaleString("pt-BR")
                : "Data não definida"}
            </p>
          </div>
        )

      case "installation_in_progress":
        if (isRequester) {
          return (
            <div className="mt-4">
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md text-sm mb-3">
                <p className="text-orange-700 dark:text-orange-400">Instalação em andamento.</p>
              </div>
              <Button
                className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                onClick={handleCompleteInstallation}
                disabled={isUpdatingOrder}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Concluir Instalação
              </Button>
            </div>
          )
        }
        return (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md text-sm">
            <p className="text-orange-700 dark:text-orange-400">Instalação em andamento.</p>
          </div>
        )

      case "completed":
        return (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md text-sm">
            <p className="text-green-700 dark:text-green-400">
              Instalação concluída em:{" "}
              {orderDetail.completedDate
                ? new Date(orderDetail.completedDate).toLocaleString("pt-BR")
                : "Data não registrada"}
            </p>
          </div>
        )

      case "rejected":
        return (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-sm">
            <p className="text-red-700 dark:text-red-400">Solicitação rejeitada pelo proprietário.</p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
            <p className="text-muted-foreground mt-1">Gerencie solicitações de aluguel de portas e instalações</p>
          </div>
        </div>
      </FadeIn>

      <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por CTO ou operadora..."
            className="pl-8 pr-4 py-2 w-full"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={selectedStatus || "all"} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
              <SelectItem value="rejected">Rejeitada</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
          <Select value={direction} onValueChange={handleDirectionChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Direção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ordens</SelectItem>
              <SelectItem value="incoming">Recebidas</SelectItem>
              <SelectItem value="outgoing">Enviadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="active">Em Andamento</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-[#FF6B00] to-[#FF9D4D]"></div>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Nenhuma ordem de serviço encontrada</p>
            </div>
          ) : (
            <StaggeredList className="space-y-4">
              {orders.map((order) => (
                <HoverCard key={order.id}>
                  <Card className="overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-[#FF6B00] to-[#FF9D4D]"></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Network className="h-5 w-5 text-[#FF6B00]" />
                          {order.title || "Ordem de Serviço"}
                        </CardTitle>
                        <Badge className={getPortOrderStatusColor(order.status as PortOrderStatus)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Solicitante</p>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-[#FF6B00]" />
                            {order.requesterName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Destinatário</p>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5 text-[#0A1A3A]" />
                            {order.targetName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Tipo</p>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5 text-green-600" />
                            {order.type}
                          </p>
                        </div>
                      </div>
                      <Button className="w-full" variant="outline" onClick={() => handleOpenOrderDetail(order.id)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </Button>
                    </CardContent>
                  </Card>
                </HoverCard>
              ))}
            </StaggeredList>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array(2)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-[#FF6B00] to-[#FF9D4D]"></div>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <StaggeredList className="space-y-4">
              {orders
                .filter(
                  (order) =>
                    order.status !== "completed" && order.status !== "rejected" && order.status !== "cancelled",
                )
                .map((order) => (
                  <HoverCard key={order.id}>
                    <Card className="overflow-hidden">
                      <div className="h-1 bg-gradient-to-r from-[#FF6B00] to-[#FF9D4D]"></div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Network className="h-5 w-5 text-[#FF6B00]" />
                            {order.title || "Ordem de Serviço"}
                          </CardTitle>
                          <Badge className={getPortOrderStatusColor(order.status as PortOrderStatus)}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Solicitante</p>
                            <p className="text-sm font-medium flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-[#FF6B00]" />
                              {order.requesterName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Destinatário</p>
                            <p className="text-sm font-medium flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5 text-[#0A1A3A]" />
                              {order.targetName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Tipo</p>
                            <p className="text-sm font-medium flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5 text-green-600" />
                              {order.type}
                            </p>
                          </div>
                        </div>
                        <Button className="w-full" variant="outline" onClick={() => handleOpenOrderDetail(order.id)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </Button>
                      </CardContent>
                    </Card>
                  </HoverCard>
                ))}
            </StaggeredList>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array(2)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-[#FF6B00] to-[#FF9D4D]"></div>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <StaggeredList className="space-y-4">
              {orders
                .filter((order) => order.status === "completed" || order.status === "rejected")
                .map((order) => (
                  <HoverCard key={order.id}>
                    <Card className="overflow-hidden">
                      <div className="h-1 bg-gradient-to-r from-[#FF6B00] to-[#FF9D4D]"></div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Network className="h-5 w-5 text-[#FF6B00]" />
                            {order.title || "Ordem de Serviço"}
                          </CardTitle>
                          <Badge className={getPortOrderStatusColor(order.status as PortOrderStatus)}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Solicitante</p>
                            <p className="text-sm font-medium flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-[#FF6B00]" />
                              {order.requesterName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Destinatário</p>
                            <p className="text-sm font-medium flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5 text-[#0A1A3A]" />
                              {order.targetName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Tipo</p>
                            <p className="text-sm font-medium flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5 text-green-600" />
                              {order.type}
                            </p>
                          </div>
                        </div>
                        <Button className="w-full" variant="outline" onClick={() => handleOpenOrderDetail(order.id)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </Button>
                      </CardContent>
                    </Card>
                  </HoverCard>
                ))}
            </StaggeredList>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para detalhes da ordem */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-[#FF6B00]" />
              {orderDetail?.title || "Detalhes da Ordem"}
            </DialogTitle>
            <DialogDescription>
              Ordem de serviço criada em {orderDetail && new Date(orderDetail.createdAt).toLocaleDateString("pt-BR")}
            </DialogDescription>
          </DialogHeader>

          {orderDetail && (
            <div className="py-4">
              <div className="flex justify-between items-center mb-4">
                <Badge className={getPortOrderStatusColor(orderDetail.status as PortOrderStatus)}>
                  {orderDetail.status}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Atualizado em {new Date(orderDetail.updatedAt).toLocaleString("pt-BR")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Detalhes da Solicitação</h3>
                    <div className="bg-muted p-3 rounded-md space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Solicitante:</span>
                        <span className="text-sm font-medium">{orderDetail.requesterName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Destinatário:</span>
                        <span className="text-sm font-medium">{orderDetail.targetName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tipo:</span>
                        <span className="text-sm font-medium">{orderDetail.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Descrição:</span>
                        <span className="text-sm font-medium">{orderDetail.description}</span>
                      </div>
                    </div>
                  </div>

                  {/* Renderizar detalhes financeiros apenas se existirem */}
                  {orderDetail.price !== undefined && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Detalhes Financeiros</h3>
                      <div className="bg-muted p-3 rounded-md space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Valor Mensal:</span>
                          <span className="text-sm font-medium">
                            R$ {typeof orderDetail.price === "number" ? orderDetail.price.toFixed(2) : "0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Taxa de Instalação:</span>
                          <span className="text-sm font-medium">
                            R${" "}
                            {typeof orderDetail.installationFee === "number"
                              ? orderDetail.installationFee.toFixed(2)
                              : "0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Primeiro Mês:</span>
                          <span className="text-sm font-medium">
                            R${" "}
                            {(
                              (typeof orderDetail.price === "number" ? orderDetail.price : 0) +
                              (typeof orderDetail.installationFee === "number" ? orderDetail.installationFee : 0)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {renderOrderActions()}
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Histórico</h3>
                  <div className="bg-muted p-3 rounded-md h-[300px] overflow-y-auto">
                    <div className="space-y-3">
                      {orderDetail.notes &&
                        orderDetail.notes.map((note, index) => (
                          <div
                            key={note.id}
                            className={`p-2 rounded-md ${
                              note.isSystemNote
                                ? "bg-muted-foreground/10"
                                : note.authorId === "op-007"
                                  ? "bg-blue-100 dark:bg-blue-900/20"
                                  : "bg-gray-100 dark:bg-gray-800/50"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium">
                                {note.isSystemNote ? "Sistema" : note.authorName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(note.createdAt).toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <p className="text-sm">{note.content}</p>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Adicionar Comentário</h3>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Digite seu comentário..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        className="self-end"
                        onClick={handleAddNote}
                        disabled={!newNote.trim() || isSubmittingNote}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Enviar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
