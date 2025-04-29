"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/authContext" // Importar o novo hook useAuth
import { fetchDashboardStats, fetchDashboardActivities, fetchDashboardQuickActions, fetchDashboardSummary } from "@/lib/apiClient"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { DashboardActivities } from "@/components/dashboard/dashboard-activities"
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions"
import { DashboardSummary } from "@/components/dashboard/dashboard-summary"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()
  
  const [stats, setStats] = useState([])
  const [activities, setActivities] = useState([])
  const [quickActions, setQuickActions] = useState([])
  const [summary, setSummary] = useState(null)
  const [isDataLoading, setIsDataLoading] = useState(true)

  useEffect(() => {
    // Verificar autenticação
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    // Carregar dados do dashboard
    const loadDashboardData = async () => {
      setIsDataLoading(true)
      try {
        // Carregar estatísticas
        const statsResponse = await fetchDashboardStats()
        setStats(statsResponse.data)

        // Carregar atividades
        const activitiesResponse = await fetchDashboardActivities()
        setActivities(activitiesResponse.data)

        // Carregar ações rápidas
        const quickActionsResponse = await fetchDashboardQuickActions()
        setQuickActions(quickActionsResponse.data)

        // Carregar resumo
        const summaryResponse = await fetchDashboardSummary()
        setSummary(summaryResponse.data)
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do dashboard.",
          variant: "destructive",
        })
      } finally {
        setIsDataLoading(false)
      }
    }

    if (isAuthenticated) {
      loadDashboardData()
    }
  }, [isAuthenticated, isLoading, router, toast])

  if (isLoading || !isAuthenticated) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Dashboard" text="Carregando..." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Esqueletos de carregamento */}
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse"></div>
          ))}
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text={`Bem-vindo de volta, ${user?.name || 'Usuário'}!`}
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats stats={stats} isLoading={isDataLoading} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <DashboardActivities activities={activities} isLoading={isDataLoading} />
        </div>
        <div className="col-span-3">
          <div className="grid gap-4">
            <DashboardQuickActions actions={quickActions} isLoading={isDataLoading} />
            <DashboardSummary summary={summary} isLoading={isDataLoading} />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
