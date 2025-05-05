"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/authContext"
import { useToast } from "@/components/ui/use-toast";
import { getServiceOrders, createServiceOrder, updateServiceOrder } from "@/lib/apiClient"
import type { ServiceOrder, ServiceOrderType, ServiceOrderStatus } from "@/lib/interfaces/service-interfaces"

interface UseServiceOrdersOptions {
  initialType?: ServiceOrderType
  initialStatus?: ServiceOrderStatus
  initialDirection?: "incoming" | "outgoing" | "all"
  autoLoad?: boolean
}

interface UseServiceOrdersResult {
  orders: ServiceOrder[]
  isLoading: boolean
  error: Error | null
  type: ServiceOrderType | undefined
  status: ServiceOrderStatus | undefined
  direction: "incoming" | "outgoing" | "all"
  setType: (type: ServiceOrderType | undefined) => void
  setStatus: (status: ServiceOrderStatus | undefined) => void
  setDirection: (direction: "incoming" | "outgoing" | "all") => void
  fetchOrders: () => Promise<void>
  createOrder: (data: any) => Promise<ServiceOrder>
  updateOrderStatus: (id: string, status: ServiceOrderStatus, note?: string) => Promise<ServiceOrder>
}

export function useServiceOrders({
  initialType,
  initialStatus,
  initialDirection = "all",
  autoLoad = true,
}: UseServiceOrdersOptions = {}): UseServiceOrdersResult {
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(autoLoad)
  const [error, setError] = useState<Error | null>(null)
  const [type, setType] = useState<ServiceOrderType | undefined>(initialType)
  const [status, setStatus] = useState<ServiceOrderStatus | undefined>(initialStatus)
  const [direction, setDirection] = useState<"incoming" | "outgoing" | "all">(initialDirection)
  const { user } = useAuth()
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await getServiceOrders({ direction, type, status })
      setOrders(response.data)
      setError(null)
    } catch (err) {
      console.error('Erro ao buscar ordens:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar ordens';
      setError(err instanceof Error ? err : new Error(errorMessage))
      setOrders([])
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false)
    }
  }, [direction, type, status, toast])

  const createOrder = async (data: any): Promise<ServiceOrder> => {
    try {
      const response = await createServiceOrder(data)
      await fetchOrders() // Recarregar ordens após criar uma nova
      toast({
        title: "Sucesso",
        description: "Ordem de serviço criada com sucesso.",
      });
      return response.data
    } catch (err) {
      console.error('Erro ao criar ordem:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar ordem de serviço';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err
    }
  }

  const updateOrderStatus = async (id: string, newStatus: ServiceOrderStatus, note?: string): Promise<ServiceOrder> => {
    try {
      const response = await updateServiceOrder(id, { status: newStatus, note })
      setOrders((prevOrders) => prevOrders.map((order) => (order.id === id ? response.data : order)))
      toast({
        title: "Sucesso",
        description: "Status da ordem atualizado com sucesso.",
      });
      return response.data
    } catch (err) {
      console.error(`useServiceOrders: Erro ao atualizar ordem ${id}:`, err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar status da ordem';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err
    }
  }

  useEffect(() => {
    if (user) { // Só buscar ordens se houver um usuário autenticado
      fetchOrders()
    }
  }, [fetchOrders, user])

  return {
    orders,
    isLoading,
    error,
    type,
    status,
    direction,
    setType,
    setStatus,
    setDirection,
    fetchOrders,
    createOrder,
    updateOrderStatus,
  }
}
