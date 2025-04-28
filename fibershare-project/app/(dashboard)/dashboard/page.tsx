"use client"

import { useTranslations } from "@/lib/i18n/use-translations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Network, Share2, Percent, DollarSign, BarChart3, Map } from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { StaggeredList } from "@/components/animations/staggered-list"
import { HoverCard } from "@/components/animations/hover-card"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useApi } from "@/lib/hooks/use-api"
import { Skeleton } from "@/components/ui/skeleton"

// Tipos para os dados da API
interface DashboardStat {
  id: string
  title: string
  value: string
  icon: string
  color: string
  description: string
}

interface Activity {
  id: string
  action: string
  details: string
  date: string
  type: string
}

interface QuickAction {
  id: string
  title: string
  icon: string
}

interface MarketplaceSummary {
  totalRented: string
  totalReceived: string
  periodBalance: string
}

export default function DashboardPage() {
  const { t } = useTranslations()

  // Buscar dados das APIs
  const { data: stats, isLoading: statsLoading } = useApi<DashboardStat[]>("/api/dashboard/stats")
  const { data: activities, isLoading: activitiesLoading } = useApi<Activity[]>("/api/dashboard/activities")
  const { data: actions, isLoading: actionsLoading } = useApi<QuickAction[]>("/api/dashboard/quick-actions")
  const { data: summary, isLoading: summaryLoading } = useApi<MarketplaceSummary>("/api/dashboard/summary")

  // Função para renderizar o ícone correto com base no nome da string
  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case "Network":
        return <Network className={className} />
      case "Share2":
        return <Share2 className={className} />
      case "Percent":
        return <Percent className={className} />
      case "DollarSign":
        return <DollarSign className={className} />
      case "BarChart3":
        return <BarChart3 className={className} />
      default:
        return <DollarSign className={className} />
    }
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketplace de Rede Neutra</h1>
            <p className="text-muted-foreground mt-1">Gerencie suas portas e maximize sua infraestrutura</p>
          </div>
          <Link href="/map">
            <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
              <Map className="mr-2 h-4 w-4" />
              Visualizar Mapa
            </Button>
          </Link>
        </div>
      </FadeIn>

      <StaggeredList className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading
          ? Array(4)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="overflow-hidden card-new-york">
                  <div className="h-1 bg-gradient-to-r from-[#FF6B00] to-[#FF9D4D]"></div>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))
          : stats?.map((stat, index) => (
              <HoverCard key={stat.id}>
                <Card className="overflow-hidden card-new-york">
                  <div className="h-1 bg-gradient-to-r from-[#FF6B00] to-[#FF9D4D]"></div>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <motion.div
                      className="rounded-full p-2 bg-muted"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {renderIcon(`${stat.icon}`, `h-5 w-5 ${stat.color}`)}
                    </motion.div>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      className="text-3xl font-bold"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.1, duration: 0.5, type: "spring" }}
                    >
                      {stat.value}
                    </motion.div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              </HoverCard>
            ))}
      </StaggeredList>

      <div className="grid gap-6 md:grid-cols-2">
        <FadeIn direction="left" delay={0.2}>
          <HoverCard>
            <Card className="card-new-york overflow-hidden h-full">
              <div className="h-1 bg-gradient-to-r from-[#FF6B00] to-[#FF9D4D]"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-[#FF6B00]" />
                  Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className="space-y-6">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <Skeleton className="h-2 w-2 rounded-full mt-1" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-32 mb-1" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-20 mt-1" />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <StaggeredList className="space-y-6">
                    {activities?.map((activity, i) => (
                      <div key={activity.id} className="flex items-start gap-4">
                        <motion.div
                          className={`mt-1 h-2 w-2 rounded-full ${
                            activity.type === "rental"
                              ? "bg-green-500"
                              : activity.type === "availability"
                                ? "bg-blue-500"
                                : activity.type === "contract"
                                  ? "bg-purple-500"
                                  : activity.type === "request"
                                    ? "bg-[#FF6B00]"
                                    : "bg-gray-500"
                          }`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.details}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                        </div>
                      </div>
                    ))}
                  </StaggeredList>
                )}
              </CardContent>
            </Card>
          </HoverCard>
        </FadeIn>

        <FadeIn direction="right" delay={0.3}>
          <HoverCard>
            <Card className="card-new-york overflow-hidden h-full">
              <div className="h-1 bg-gradient-to-r from-[#0A1A3A] to-[#2A4A7A]"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-[#0A1A3A]" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {actionsLoading ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-md" />
                      ))}
                  </div>
                ) : (
                  <StaggeredList className="grid gap-3 md:grid-cols-2">
                    {actions?.map((action, i) => (
                      <motion.div
                        key={action.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="cursor-pointer hover:bg-muted transition-colors">
                          <CardContent className="p-4 flex items-center gap-3">
                            {renderIcon(action.icon, "h-5 w-5 text-[#FF6B00]")}
                            <p className="text-sm font-medium">{action.title}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </StaggeredList>
                )}

                <div className="mt-6 bg-muted/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">Resumo do Marketplace</h3>
                  {summaryLoading ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor total alugado:</span>
                        <span className="font-medium">{summary?.totalRented}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor total recebido:</span>
                        <span className="font-medium">{summary?.totalReceived}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Saldo do período:</span>
                        <span className="font-medium text-green-500">{summary?.periodBalance}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </HoverCard>
        </FadeIn>
      </div>
    </div>
  )
}
