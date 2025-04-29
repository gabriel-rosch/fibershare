"use client"

import { useState, useEffect, useCallback } from "react"
import { operatorService } from "@/lib/services/operator-service"
import type { Operator } from "@/lib/interfaces/service-interfaces"

interface UseOperatorsOptions {
  search?: string
  region?: string
  minRating?: number
}

interface UseOperatorsResult {
  operators: Operator[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useOperators(options: UseOperatorsOptions = {}): UseOperatorsResult {
  const [operators, setOperators] = useState<Operator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchOperators = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await operatorService.getOperators()
      setOperators(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao buscar operadoras'))
      setOperators([])
    } finally {
      setIsLoading(false)
    }
  }, [options.search, options.region, options.minRating])

  useEffect(() => {
    fetchOperators()
  }, [fetchOperators])

  return {
    operators,
    isLoading,
    error,
    refetch: fetchOperators
  }
}
