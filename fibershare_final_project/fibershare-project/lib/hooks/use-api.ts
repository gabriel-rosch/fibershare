"use client"

import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"

interface ApiResponse<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useApi<T>(url: string): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log(`useApi: Fetching data from ${url}`) // Log para debug
      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API error: ${response.status}`)
      }

      const result = await response.json()
      console.log(`useApi: Data received:`, result) // Log para debug
      setData(result)
    } catch (err) {
      console.error(`useApi: Error fetching data:`, err) // Log para debug
      setError(err instanceof Error ? err : new Error(String(err)))

      // Mostrar toast de erro
      toast({
        title: "Erro ao carregar dados",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log(`useApi: Initial fetch for ${url}`) // Log para debug
    fetchData()
  }, [url])

  const refetch = async () => {
    console.log(`useApi: Refetching data from ${url}`) // Log para debug
    await fetchData()
  }

  return { data, isLoading, error, refetch }
}
