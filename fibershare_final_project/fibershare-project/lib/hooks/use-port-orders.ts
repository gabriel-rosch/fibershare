"use client"

import { useState, useEffect, useCallback } from "react"
import { portOrderService } from "@/lib/services/port-order-service"
import { type PortOrderStatus } from "@/lib/interfaces/service-interfaces"

interface UsePortOrdersOptions {
  initialStatus?: PortOrderStatus
  initialDirection?: "incoming" | "outgoing" | "all"
  initialCtoId?: string
  initialSearch?: string
  autoLoad?: boolean
}

export function usePortOrders({
  initialStatus,
  initialDirection = "all",
  initialCtoId,
  initialSearch,
  autoLoad = true,
}: UsePortOrdersOptions = {}) {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(autoLoad)
  const [error, setError] = useState<Error | null>(null)
  const [status, setStatus] = useState<PortOrderStatus | undefined>(initialStatus)
  const [direction, setDirection] = useState<"incoming" | "outgoing" | "all">(initialDirection)
  const [search, setSearch] = useState<string | undefined>(initialSearch)
  const [ctoId, setCtoId] = useState<string | undefined>(initialCtoId)

  // Função para buscar ordens
  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("usePortOrders: Buscando ordens")
      const data = await portOrderService.getPortOrders(status, direction, ctoId, search)
      console.log(`usePortOrders: ${data.length} ordens encontradas`)
      setOrders(data)
    } catch (err) {
      console.error("usePortOrders: Erro ao buscar ordens:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
      // Definir uma lista vazia em caso de erro para evitar problemas de renderização
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }, [status, direction, ctoId, search])

  // Função para obter uma ordem específica
  const getOrderById = async (id: string) => {
    try {
      return await portOrderService.getPortOrderById(id)
    } catch (err) {
      console.error(`usePortOrders: Erro ao buscar ordem ${id}:`, err)
      throw err
    }
  }

  // Função para criar uma nova ordem
  const createOrder = async (data: any) => {
    try {
      const newOrder = await portOrderService.createPortOrder(data)
      // Atualizar a lista de ordens
      setOrders((prevOrders) => [newOrder, ...prevOrders])
      return newOrder
    } catch (err) {
      console.error("usePortOrders: Erro ao criar ordem:", err)
      throw err
    }
  }

  // Função para atualizar uma ordem existente
  const updateOrder = async (id: string, data: any) => {
    try {
      const updatedOrder = await portOrderService.updatePortOrder(id, data)
      // Atualizar a lista de ordens
      setOrders((prevOrders) => prevOrders.map((order) => (order.id === id ? updatedOrder : order)))
      return updatedOrder
    } catch (err) {
      console.error(`usePortOrders: Erro ao atualizar ordem ${id}:`, err)
      throw err
    }
  }

  // Função para adicionar uma nota a uma ordem
  const addNote = async (id: string, content: string) => {
    try {
      await portOrderService.addNoteToOrder(id, content)
      // Recarregar a ordem para obter a nota adicionada
      const updatedOrder = await portOrderService.getPortOrderById(id)
      // Atualizar a lista de ordens
      setOrders((prevOrders) => prevOrders.map((order) => (order.id === id ? updatedOrder : order)))
    } catch (err) {
      console.error(`usePortOrders: Erro ao adicionar nota à ordem ${id}:`, err)
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
    status,
    direction,
    search,
    ctoId,
    setStatus,
    setDirection,
    setSearch,
    setCtoId,
    fetchOrders,
    getOrderById,
    createOrder,
    updateOrder,
    addNote,
  }
}
