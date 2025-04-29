"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/authContext"
import apiClient from "@/lib/apiClient"
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

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/service-orders', {
        params: { direction }
      })
      setOrders(response.data)
      setError(null)
    } catch (err) {
      console.error('Erro ao buscar ordens:', err)
      setError(err instanceof Error ? err : new Error('Erro ao buscar ordens'))
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }, [direction])

  const createOrder = async (data: any): Promise<ServiceOrder> => {
    try {
      const response = await apiClient.post('/service-orders', data)
      await fetchOrders() // Recarregar ordens após criar uma nova
      return response.data
    } catch (err) {
      console.error('Erro ao criar ordem:', err)
      throw err
    }
  }

  const updateOrderStatus = async (id: string, newStatus: ServiceOrderStatus, note?: string): Promise<ServiceOrder> => {
    try {
      const response = await apiClient.patch(`/service-orders/${id}`, { status: newStatus, note })
      setOrders((prevOrders) => prevOrders.map((order) => (order.id === id ? response.data : order)))
      return response.data
    } catch (err) {
      console.error(`useServiceOrders: Erro ao atualizar ordem ${id}:`, err)
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
