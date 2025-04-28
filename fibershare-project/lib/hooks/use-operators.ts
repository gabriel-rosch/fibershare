"use client"

import { useState, useEffect, useCallback } from "react"
import { OperatorService } from "@/lib/services/operator-service"
import type { Operator } from "@/lib/interfaces/service-interfaces"

interface UseOperatorsOptions {
  initialSearch?: string
  initialRegion?: string
  initialMinRating?: number
  autoLoad?: boolean
  loadPartners?: boolean
}

interface UseOperatorsResult {
  operators: Operator[]
  currentOperator: Operator | null
  partners: Operator[]
  isLoading: boolean
  isLoadingPartners: boolean
  error: Error | null
  partnerError: Error | null
  search: string | undefined
  region: string | undefined
  minRating: number | undefined
  setSearch: (search: string | undefined) => void
  setRegion: (region: string | undefined) => void
  setMinRating: (minRating: number | undefined) => void
  fetchOperators: () => Promise<void>
  fetchPartners: () => Promise<void>
}

export function useOperators({
  initialSearch,
  initialRegion,
  initialMinRating,
  autoLoad = true,
  loadPartners = false,
}: UseOperatorsOptions = {}): UseOperatorsResult {
  const [operators, setOperators] = useState<Operator[]>([])
  const [currentOperator, setCurrentOperator] = useState<Operator | null>(null)
  const [partners, setPartners] = useState<Operator[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(autoLoad)
  const [isLoadingPartners, setIsLoadingPartners] = useState<boolean>(loadPartners)
  const [error, setError] = useState<Error | null>(null)
  const [partnerError, setPartnerError] = useState<Error | null>(null)
  const [search, setSearch] = useState<string | undefined>(initialSearch)
  const [region, setRegion] = useState<string | undefined>(initialRegion)
  const [minRating, setMinRating] = useState<number | undefined>(initialMinRating)

  // Função para buscar operadoras
  const fetchOperators = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("useOperators: Buscando operadoras")
      const data = await OperatorService.getOperators(search, region, minRating)
      console.log(`useOperators: ${data.length} operadoras encontradas`)
      setOperators(data)

      // Buscar operadora atual se ainda não tiver sido carregada
      if (!currentOperator) {
        try {
          const current = await OperatorService.getCurrentOperator()
          setCurrentOperator(current)
        } catch (currentErr) {
          console.error("useOperators: Erro ao buscar operadora atual:", currentErr)
          // Não definir erro aqui para não afetar a exibição das operadoras
        }
      }
    } catch (err) {
      console.error("useOperators: Erro ao buscar operadoras:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
      // Definir uma lista vazia em caso de erro para evitar problemas de renderização
      setOperators([])
    } finally {
      setIsLoading(false)
    }
  }, [search, region, minRating, currentOperator])

  // Função para buscar parceiros
  const fetchPartners = useCallback(async () => {
    setIsLoadingPartners(true)
    setPartnerError(null)

    try {
      console.log("useOperators: Buscando parceiros")
      const data = await OperatorService.getPartners()
      console.log(`useOperators: ${data.length} parceiros encontrados`)
      setPartners(data)
    } catch (err) {
      console.error("useOperators: Erro ao buscar parceiros:", err)
      setPartnerError(err instanceof Error ? err : new Error(String(err)))
      // Definir uma lista vazia em caso de erro para evitar problemas de renderização
      setPartners([])
    } finally {
      setIsLoadingPartners(false)
    }
  }, [])

  // Carregar operadoras inicialmente se autoLoad for true
  useEffect(() => {
    if (autoLoad) {
      fetchOperators()
    }
  }, [autoLoad, fetchOperators])

  // Carregar parceiros inicialmente se loadPartners for true
  useEffect(() => {
    if (loadPartners) {
      fetchPartners()
    }
  }, [loadPartners, fetchPartners])

  return {
    operators,
    currentOperator,
    partners,
    isLoading,
    isLoadingPartners,
    error,
    partnerError,
    search,
    region,
    minRating,
    setSearch,
    setRegion,
    setMinRating,
    fetchOperators,
    fetchPartners,
  }
}
