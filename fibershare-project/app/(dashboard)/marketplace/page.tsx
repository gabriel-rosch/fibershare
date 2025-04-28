"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "@/lib/i18n/use-translations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  MapPin,
  Search,
  Star,
  StarHalf,
  Building2,
  Network,
  Clock,
  CheckCircle2,
  XCircle,
  Link2,
  Phone,
  Mail,
  ExternalLink,
  Users,
  UserCheck,
} from "lucide-react"
import { FadeIn } from "@/components/animations/fade-in"
import { StaggeredList } from "@/components/animations/staggered-list"
import { HoverCard } from "@/components/animations/hover-card"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useOperators } from "@/lib/hooks/use-operators"
import type { Operator } from "@/lib/mock-data/operators"
import { useServiceOrders } from "@/lib/hooks/use-service-orders"

// Funções auxiliares para substituir as funções removidas de mock-data
const getOrderTypeName = (type: string): string => {
  const typeNames: Record<string, string> = {
    maintenance: "Manutenção",
    support: "Suporte",
    installation: "Instalação",
    removal: "Remoção",
    partnership_request: "Solicitação de Parceria",
    other: "Outro",
  }
  return typeNames[type] || type
}

const getOrderStatusName = (status: string): string => {
  const statusNames: Record<string, string> = {
    pending: "Pendente",
    in_progress: "Em Andamento",
    completed: "Concluído",
    cancelled: "Cancelado",
    rejected: "Rejeitado",
  }
  return statusNames[status] || status
}

export default function MarketplacePage() {
  const { t } = useTranslations()
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [activeTab, setActiveTab] = useState("operators")
  const [selectedRegion, setSelectedRegion] = useState<string>("all")
  const [minRating, setMinRating] = useState<number | undefined>(undefined)
  const [showPartnershipDialog, setShowPartnershipDialog] = useState(false)
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null)
  const [partnershipNote, setPartnershipNote] = useState("")

  // Usar os hooks para buscar dados
  const {
    operators,
    currentOperator,
    partners,
    isLoading: operatorsLoading,
    isLoadingPartners,
    error: operatorsError,
    setSearch,
    setRegion,
    setMinRating: setOperatorMinRating,
    fetchOperators,
    fetchPartners,
  } = useOperators({
    initialSearch: debouncedSearch,
    initialRegion: selectedRegion !== "all" ? selectedRegion : undefined,
    initialMinRating: minRating,
    loadPartners: true,
  })

  const {
    orders,
    isLoading: ordersLoading,
    error: ordersError,
    direction,
    setDirection,
    createOrder,
  } = useServiceOrders()

  // Função para lidar com a pesquisa
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setSearch(e.target.value)
  }

  // Função para lidar com a mudança de região
  const handleRegionChange = (value: string) => {
    setSelectedRegion(value)
    setRegion(value !== "all" ? value : undefined)
  }

  // Função para lidar com a mudança de avaliação mínima
  const handleRatingChange = (value: string) => {
    const rating = value === "all" ? undefined : Number(value)
    setMinRating(rating)
    setOperatorMinRating(rating)
  }

  // Função para abrir o diálogo de solicitação de parceria
  const handleRequestPartnership = (operator: Operator) => {
    setSelectedOperator(operator)
    setShowPartnershipDialog(true)
  }

  // Função para enviar solicitação de parceria
  const handleSubmitPartnershipRequest = async () => {
    if (!selectedOperator) return

    try {
      await createOrder({
        type: "partnership_request",
        title: `Solicitação de Parceria - ${selectedOperator.name}`,
        description:
          partnershipNote ||
          `Solicitação para estabelecer parceria de compartilhamento de infraestrutura com ${selectedOperator.name}`,
        targetId: selectedOperator.id,
        targetName: selectedOperator.name,
      })

      toast({
        title: "Solicitação enviada",
        description: `Sua solicitação de parceria para ${selectedOperator.name} foi enviada com sucesso.`,
      })

      setShowPartnershipDialog(false)
      setSelectedOperator(null)
      setPartnershipNote("")
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar a solicitação. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  // Renderizar estrelas para avaliação
  const renderRatingStars = (rating: number | undefined) => {
    if (rating === undefined) rating = 0

    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
    }

    return <div className="flex items-center">{stars}</div>
  }

  // Lista de regiões disponíveis
  const regions = [
    { value: "all", label: "Todas as regiões" },
    { value: "São Paulo", label: "São Paulo" },
    { value: "Rio de Janeiro", label: "Rio de Janeiro" },
    { value: "Belo Horizonte", label: "Belo Horizonte" },
    { value: "Brasília", label: "Brasília" },
    { value: "Recife", label: "Recife" },
    { value: "Porto Alegre", label: "Porto Alegre" },
    { value: "Nacional", label: "Nacional" },
  ]

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketplace de Parcerias</h1>
            <p className="text-muted-foreground mt-1">Conecte-se com outras operadoras e expanda sua rede</p>
          </div>
          {currentOperator && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{currentOperator.name}</p>
                <p className="text-xs text-muted-foreground">{currentOperator.ctoCount} CTOs cadastradas</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                {currentOperator.name.charAt(0)}
              </div>
            </div>
          )}
        </div>
      </FadeIn>

      <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por operadora..."
            className="pl-8 pr-4 py-2 w-full"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={selectedRegion} onValueChange={handleRegionChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Região" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={minRating?.toString() || "all"} onValueChange={handleRatingChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Avaliação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as avaliações</SelectItem>
              <SelectItem value="4.5">4.5+ estrelas</SelectItem>
              <SelectItem value="4">4+ estrelas</SelectItem>
              <SelectItem value="3.5">3.5+ estrelas</SelectItem>
              <SelectItem value="3">3+ estrelas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="operators" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="operators">Operadoras</TabsTrigger>
          <TabsTrigger value="partners">Meus Parceiros</TabsTrigger>
          <TabsTrigger value="my-orders">Minhas Ordens</TabsTrigger>
        </TabsList>

        <TabsContent value="operators" className="space-y-4">
          {operatorsLoading ? (
            <StaggeredList className="grid gap-4 md:grid-cols-2">
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-[#FF6B00] to-[#FF9D4D]"></div>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
            </StaggeredList>
          ) : operators?.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Nenhuma operadora encontrada</p>
            </div>
          ) : (
            <StaggeredList className="grid gap-4 md:grid-cols-2">
              {operators?.map((operator) => (
                <HoverCard key={operator.id}>
                  <Card className="overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-[#FF6B00] to-[#FF9D4D]"></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-[#FF6B00]" />
                          {operator.name}
                        </div>
                        {renderRatingStars(operator.rating)}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {operator.region}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">CTOs Cadastradas</p>
                          <p className="text-lg font-semibold flex items-center gap-1">
                            <Network className="h-4 w-4 text-[#FF6B00]" />
                            {operator.ctoCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Avaliação</p>
                          <p className="text-lg font-semibold">
                            {operator.rating ? operator.rating.toFixed(1) : "0.0"}/5.0
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Descrição</p>
                          <p className="text-sm">{operator.description}</p>
                        </div>
                      </div>
                      <Button
                        className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                        onClick={() => handleRequestPartnership(operator)}
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Solicitar Parceria
                      </Button>
                    </CardContent>
                  </Card>
                </HoverCard>
              ))}
            </StaggeredList>
          )}
        </TabsContent>

        <TabsContent value="partners" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Meus Parceiros</h2>
            <div className="text-sm text-muted-foreground">
              <Users className="inline-block mr-1 h-4 w-4" />
              {partners.length} parceiros ativos
            </div>
          </div>

          {isLoadingPartners ? (
            <StaggeredList className="grid gap-4 md:grid-cols-2">
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-[#0066CC] to-[#4D94FF]"></div>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
            </StaggeredList>
          ) : partners.length === 0 ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <UserCheck className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum parceiro encontrado</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Você ainda não possui parcerias ativas. Solicite parcerias com outras operadoras na aba "Operadoras".
              </p>
            </div>
          ) : (
            <StaggeredList className="grid gap-4 md:grid-cols-2">
              {partners.map((partner) => (
                <HoverCard key={partner.id}>
                  <Card className="overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-[#0066CC] to-[#4D94FF]"></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-[#0066CC]" />
                          {partner.name}
                        </div>
                        {renderRatingStars(partner.rating)}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {partner.region}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">CTOs Compartilhadas</p>
                          <p className="text-lg font-semibold flex items-center gap-1">
                            <Network className="h-4 w-4 text-[#0066CC]" />
                            {Math.floor(partner.ctoCount * 0.4)} {/* Simulando CTOs compartilhadas */}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Parceria desde</p>
                          <p className="text-sm">
                            {new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Contato</p>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Phone className="h-4 w-4 text-[#0066CC]" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Mail className="h-4 w-4 text-[#0066CC]" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 inline-block">
                            Ativo
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          <Link2 className="mr-2 h-4 w-4" />
                          Detalhes da Parceria
                        </Button>
                        <Button className="flex-1 bg-[#0066CC] hover:bg-[#0066CC]/90 text-white">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ver CTOs
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </HoverCard>
              ))}
            </StaggeredList>
          )}
        </TabsContent>

        <TabsContent value="my-orders" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Minhas Ordens de Serviço</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className={direction === "outgoing" ? "bg-muted" : ""}
                onClick={() => setDirection("outgoing")}
              >
                Enviadas
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={direction === "incoming" ? "bg-muted" : ""}
                onClick={() => setDirection("incoming")}
              >
                Recebidas
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={direction === "all" ? "bg-muted" : ""}
                onClick={() => setDirection("all")}
              >
                Todas
              </Button>
            </div>
          </div>

          {ordersLoading ? (
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-[#0A1A3A] to-[#2A4A7A]"></div>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-16 w-full rounded-md" />
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Nenhuma ordem de serviço encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <HoverCard key={order.id}>
                  <Card className="overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-[#0A1A3A] to-[#2A4A7A]"></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{order.title}</CardTitle>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : order.status === "in_progress"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                : order.status === "completed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : order.status === "rejected"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                          }`}
                        >
                          {getOrderStatusName(order.status)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Tipo</p>
                          <p className="text-sm font-medium">{getOrderTypeName(order.type)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Solicitante</p>
                          <p className="text-sm font-medium">{order.requesterName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Destinatário</p>
                          <p className="text-sm font-medium">{order.targetName}</p>
                        </div>
                      </div>

                      <div className="bg-muted/50 p-3 rounded-md mb-4">
                        <p className="text-sm">{order.description}</p>
                      </div>

                      {order.notes && order.notes.length > 0 && (
                        <div className="border-t pt-3 mt-3">
                          <p className="text-sm font-medium mb-2">Histórico:</p>
                          <ul className="space-y-1">
                            {order.notes.map((note, index) => (
                              <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                                <span className="mt-0.5">•</span> {note}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {order.status === "pending" && order.targetId === currentOperator?.id && (
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            <XCircle className="mr-1 h-4 w-4" />
                            Rejeitar
                          </Button>
                          <Button size="sm" className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            Aceitar
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </HoverCard>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para solicitar parceria */}
      <Dialog open={showPartnershipDialog} onOpenChange={setShowPartnershipDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Solicitar Parceria</DialogTitle>
            <DialogDescription>Envie uma solicitação de parceria para {selectedOperator?.name}</DialogDescription>
          </DialogHeader>

          {selectedOperator && (
            <div className="py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-[#0A1A3A] flex items-center justify-center text-white font-bold">
                  {selectedOperator.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium">{selectedOperator.name}</h3>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{selectedOperator.region}</span>
                  </div>
                </div>
                <div className="ml-auto">
                  {renderRatingStars(selectedOperator.rating)}
                  <p className="text-xs text-right">{selectedOperator.rating.toFixed(1)}/5.0</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">CTOs Cadastradas</p>
                  <p className="text-lg font-semibold">{selectedOperator.ctoCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contato</p>
                  <p className="text-sm">{selectedOperator.contactEmail}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="note" className="block text-sm font-medium mb-1">
                    Mensagem (opcional)
                  </label>
                  <textarea
                    id="note"
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Descreva o objetivo da parceria..."
                    value={partnershipNote}
                    onChange={(e) => setPartnershipNote(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPartnershipDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitPartnershipRequest} className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
              Enviar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
