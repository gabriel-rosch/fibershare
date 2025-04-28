"use client"

import { useState, useEffect } from "react"
import type { CTO } from "@/lib/utils/cto-utils"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

export function useCTOApi() {
  const [ctos, setCTOs] = useState<CTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function fetchCTOs() {
      try {
        setIsLoading(true)

        // Buscar CTOs
        const { data: ctosData, error: ctosError } = await supabase
          .from("ctos")
          .select(`
            *,
            operator:owner_id(id, name)
          `)
          .order("name")

        if (ctosError) throw new Error(ctosError.message)

        // Para cada CTO, buscar suas portas
        const ctosWithPorts = await Promise.all(
          ctosData.map(async (cto) => {
            const { data: portsData, error: portsError } = await supabase
              .from("cto_ports")
              .select(`
                *,
                current_tenant:current_tenant_id(id, name)
              `)
              .eq("cto_id", cto.id)
              .order("port_number")

            if (portsError) {
              console.error(`Erro ao buscar portas para CTO ${cto.id}:`, portsError)
              return mapCTO(cto, [])
            }

            // Mapear as portas para o formato esperado pelo componente
            const ports = portsData.map((port) => ({
              id: port.id,
              number: port.port_number,
              status: port.status,
              price: Number(port.price) || 0,
              customer: port.current_tenant?.name || null,
              // Não temos operator_id na tabela cto_ports, então usamos o owner_id da CTO
              operatorId: cto.owner_id,
              operatorName: cto.operator?.name || null,
              address: port.address || null,
              plan: port.plan || null,
              startDate: port.start_date || null,
              endDate: port.end_date || null,
            }))

            return mapCTO(cto, ports)
          }),
        )

        setCTOs(ctosWithPorts)
        setError(null)
      } catch (err: any) {
        console.error("Erro ao buscar CTOs:", err)
        setError(err.message || "Erro ao carregar dados")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCTOs()
  }, [supabase])

  // Função para mapear os dados da CTO do formato do Supabase para o formato da aplicação
  function mapCTO(ctoData: any, ports: any[]): CTO {
    return {
      id: ctoData.id,
      name: ctoData.name || `CTO ${ctoData.id}`,
      description: ctoData.description || "",
      totalPorts: ctoData.total_ports || 0,
      occupiedPorts: ctoData.occupied_ports || 0,
      coordinates: ctoData.coordinates || [-48.618, -27.598],
      region: ctoData.region || "Centro",
      status: ctoData.status || "active",
      ownerId: ctoData.owner_id,
      ownerName: ctoData.operator?.name,
      ports: ports,
    }
  }

  // Função para recarregar os dados
  const refreshData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/ctos")
      if (!response.ok) {
        throw new Error("Falha ao carregar CTOs")
      }
      const data = await response.json()

      // Mapear os dados para o formato esperado
      const formattedCTOs = data.map((cto) => ({
        ...cto,
        coordinates: [cto.longitude, cto.latitude],
      }))

      setCTOs(formattedCTOs)
      setError(null)
    } catch (err) {
      console.error("Erro ao carregar CTOs:", err)
      setError("Falha ao carregar dados")
    } finally {
      setIsLoading(false)
    }
  }

  // Função para buscar portas de uma CTO específica
  const fetchCTOPorts = async (ctoId) => {
    try {
      const response = await fetch(`/api/cto-ports/${ctoId}`)
      if (!response.ok) {
        throw new Error("Erro ao buscar portas para CTO")
      }
      const portsData = await response.json()

      // Atualizar o estado das CTOs com as portas carregadas
      setCTOs((prevCTOs) =>
        prevCTOs.map((cto) => {
          if (cto.id === ctoId) {
            return {
              ...cto,
              ports: portsData.map((port) => ({
                id: port.id,
                number: port.port_number,
                status: port.status,
                price: port.price || 0,
                customer: port.customer_name,
                operatorId: port.operator_id,
                operatorName: port.operator_name,
                address: port.address,
                plan: port.plan,
                startDate: port.start_date,
                endDate: port.end_date,
              })),
            }
          }
          return cto
        }),
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
    refreshData,
  }
}
