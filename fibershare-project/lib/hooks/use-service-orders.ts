"use client"

import { useState, useEffect, useCallback } from "react"
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

  // Função para buscar ordens
  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Construir a URL com os parâmetros de filtro
      let url = "/api/service-orders?"
      const params = new URLSearchParams()

      if (type) params.append("type", type)
      if (status) params.append("status", status)
      if (direction) params.append("direction", direction)

      url += params.toString()

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Erro ao buscar ordens: ${response.statusText}`)
      }

      const data = await response.json()
      setOrders(data)
    } catch (err) {
      console.error("useServiceOrders: Erro ao buscar ordens:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
      // Definir uma lista vazia em caso de erro para evitar problemas de renderização
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }, [type, status, direction])

  // Função para criar uma nova ordem
  const createOrder = async (data: any): Promise<ServiceOrder> => {
    try {
      const response = await fetch("/api/service-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Erro ao criar ordem: ${response.statusText}`)
      }

      const newOrder = await response.json()

      // Atualizar a lista de ordens
      setOrders((prevOrders) => [newOrder, ...prevOrders])
      return newOrder
    } catch (err) {
      console.error("useServiceOrders: Erro ao criar ordem:", err)
      throw err
    }
  }

  // Função para atualizar o status de uma ordem
  const updateOrderStatus = async (id: string, newStatus: ServiceOrderStatus, note?: string): Promise<ServiceOrder> => {
    try {
      const response = await fetch(`/api/service-orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus, note }),
      })

      if (!response.ok) {
        throw new Error(`Erro ao atualizar ordem: ${response.statusText}`)
      }

      const updatedOrder = await response.json()

      // Atualizar a lista de ordens
      setOrders((prevOrders) => prevOrders.map((order) => (order.id === id ? updatedOrder : order)))
      return updatedOrder
    } catch (err) {
      console.error(`useServiceOrders: Erro ao atualizar ordem ${id}:`, err)
      throw err
    }
  }

  // Carregar ordens inicialmente se autoLoad for true
  useEffect(() => {
    if (autoLoad) {
      fetchOrders()
    }
  }, [autoLoad, fetchOrders])

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
