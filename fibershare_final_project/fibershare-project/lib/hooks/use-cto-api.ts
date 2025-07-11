"use client"

import { useState, useEffect } from "react"
import type { CTO, ExtendedCTO } from "@/lib/interfaces/service-interfaces"
import apiClient from "@/lib/apiClient"

export function useCTOApi() {
  const [ctos, setCTOs] = useState<ExtendedCTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCTOs()
  }, [])

  // Função para buscar CTOs
  const fetchCTOs = async () => {
    try {
      setIsLoading(true)
      console.log('🔄 Buscando CTOs...');
      const response = await apiClient.get("/ctos")
      const ctosData = response.data
      console.log('📡 Dados CTOs recebidos:', ctosData);

      // Mapear os dados para o formato da aplicação
      const formattedCTOs: ExtendedCTO[] = ctosData.map((cto: any) => ({
        id: cto.id,
        name: cto.name,
        coordinates: {
          lat: cto.latitude || cto.lat,
          lng: cto.longitude || cto.lng
        },
        // Manter também o campo location para compatibilidade
        location: {
          lat: cto.latitude || cto.lat,
          lng: cto.longitude || cto.lng
        },
        status: cto.status,
        totalPorts: cto.totalPorts,
        ownerId: cto.operatorId || cto.ownerId,
        operatorId: cto.operatorId || cto.ownerId,
        description: cto.description,
        occupiedPorts: cto.occupiedPorts || 0,
        latitude: cto.latitude || cto.lat,
        longitude: cto.longitude || cto.lng
      }))

      console.log('✅ CTOs formatadas:', formattedCTOs);
      setCTOs(formattedCTOs)
      setError(null)
    } catch (err: any) {
      console.error("❌ Erro ao buscar CTOs:", err)
      setError(err.message || "Erro ao carregar dados")
    } finally {
      setIsLoading(false)
    }
  }

  // Função para buscar portas de uma CTO específica
  const fetchCTOPorts = async (ctoId: string) => {
    try {
      const response = await apiClient.get(`/ctos/${ctoId}/ports`)
      const portsData = response.data

      // Atualizar o estado das CTOs com as portas carregadas
      setCTOs((prevCTOs) =>
        prevCTOs.map((cto) => {
          if (cto.id === ctoId) {
            return {
              ...cto,
              ports: portsData.map((port: any) => ({
                id: port.id,
                ctoId: port.ctoId,
                number: port.portNumber,
                status: port.status,
                price: port.price || 0,
                clientId: port.clientId,
                lastModified: port.lastModified,
                portNumber: port.portNumber,
                customer: port.client?.name,
                operatorName: port.operator?.name
              }))
            }
          }
          return cto
        })
      )

      return portsData
    } catch (error) {
      console.error("Erro ao buscar portas:", error)
      throw error
    }
  }

  return {
    ctos,
    isLoading,
    error,
    refreshData: fetchCTOs,
    fetchCTOPorts
  }
}
