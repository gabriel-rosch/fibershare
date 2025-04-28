"use client"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import type { CTO } from "@/lib/utils/cto-utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PortDrawer } from "./port-drawer"

interface MapSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ctos: CTO[]
  loading: boolean
  error: any
  leftOffset?: number
  onCTOUpdated?: () => void
  onCTOSelect?: (cto: CTO) => void
  selectedCTO?: CTO | null
  onPortSelect?: (portId: string) => void
  onRefreshData?: () => void
}

export function MapSidebar({
  open,
  onOpenChange,
  ctos = [],
  loading,
  error,
  leftOffset = 0,
  onCTOUpdated,
  onCTOSelect,
  selectedCTO,
  onPortSelect,
  onRefreshData,
}: MapSidebarProps) {
  const [localSelectedCTO, setLocalSelectedCTO] = useState<CTO | null>(null)
  const [portDrawerOpen, setPortDrawerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Sincronizar o selectedCTO externo com o estado local
  useEffect(() => {
    if (selectedCTO) {
      setLocalSelectedCTO(selectedCTO)
    }
  }, [selectedCTO])

  // Função para obter o rótulo de status
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativa"
      case "maintenance":
        return "Em Manutenção"
      case "inactive":
        return "Inativa"
      default:
        return status
    }
  }

  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "maintenance":
        return "bg-yellow-500"
      case "inactive":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Função para lidar com o clique em uma CTO
  const handleCTOClick = (cto: CTO) => {
    setLocalSelectedCTO(cto)
    setPortDrawerOpen(true)

    // Notificar o componente pai sobre a seleção da CTO
    if (onCTOSelect) {
      onCTOSelect(cto)
    }

    // Carregar as portas da CTO quando ela for selecionada
    fetchCTOPorts(cto.id)
  }

  // Função para buscar portas de uma CTO
  const fetchCTOPorts = async (ctoId: string) => {
    try {
      setIsLoading(true)
      // Usar o endpoint para buscar todas as portas de uma CTO
      const response = await fetch(`/api/ctos/${ctoId}/ports`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao buscar portas para CTO")
      }
      const portsData = await response.json()

      // Atualizar a CTO selecionada com as portas carregadas
      if (localSelectedCTO && localSelectedCTO.id === ctoId) {
        const updatedCTO = {
          ...localSelectedCTO,
          ports: portsData.map((port: any) => ({
            id: port.id,
            number: port.portNumber,
            status: port.status,
            price: port.price || 0,
            customer: port.currentTenantName,
            operatorId: port.operatorId,
            operatorName: port.operatorName,
            address: port.address,
            plan: port.plan,
            startDate: port.startDate,
            endDate: port.endDate,
          })),
        }

        setLocalSelectedCTO(updatedCTO)

        // Atualizar também no componente pai se necessário
        if (onCTOSelect) {
          onCTOSelect(updatedCTO)
        }
      }

      setIsLoading(false)
    } catch (error: any) {
      console.error("Erro ao buscar portas:", error.message)
      setIsLoading(false)
    }
  }

  // Função para atualizar os dados após uma operação
  const handlePortUpdated = () => {
    // Quando uma porta for atualizada, recarregar os dados da CTO
    if (onRefreshData) {
      onRefreshData()
    }

    // Também recarregar as portas da CTO selecionada
    if (localSelectedCTO) {
      fetchCTOPorts(localSelectedCTO.id)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          className="w-[350px] p-0"
          // Aplicar margem à esquerda para alinhar com a coluna lateral
          style={{ marginLeft: `${leftOffset}px`, width: `calc(350px - ${leftOffset}px)` }}
          // Desabilitar o botão de fechar padrão
          closeButton={false}
        >
          <SheetHeader className="p-4 border-b">
            <SheetTitle>CTOs</SheetTitle>
          </SheetHeader>

          <CTOList
            ctos={ctos}
            loading={loading}
            error={error}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
            onCTOClick={handleCTOClick}
            selectedCTO={localSelectedCTO}
          />
        </SheetContent>
      </Sheet>

      {/* Gaveta de portas */}
      {localSelectedCTO && (
        <PortDrawer
          open={portDrawerOpen}
          onOpenChange={setPortDrawerOpen}
          cto={localSelectedCTO}
          onPortUpdated={handlePortUpdated}
          isLoading={isLoading}
        />
      )}
    </>
  )
}

interface CTOListProps {
  ctos: CTO[]
  loading: boolean
  error: string | null
  getStatusColor: (status: string) => string
  getStatusLabel: (status: string) => string
  onCTOClick: (cto: CTO) => void
  selectedCTO: CTO | null
}

function CTOList({ ctos, loading, error, getStatusColor, getStatusLabel, onCTOClick, selectedCTO }: CTOListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="text-center">
          <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-xs text-muted-foreground">Carregando CTOs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-3">
        <Alert variant="destructive">
          <AlertTitle className="text-sm">Erro</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!ctos || ctos.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-xs text-muted-foreground">Nenhuma CTO encontrada</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-120px)]">
      <div className="p-3 grid gap-2">
        {ctos.map((cto) => (
          <div
            key={cto.id}
            className={`border rounded-md p-2 hover:bg-muted/50 cursor-pointer transition-colors ${
              selectedCTO && selectedCTO.id === cto.id ? "bg-muted border-primary" : ""
            }`}
            onClick={() => onCTOClick(cto)}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">{cto.name}</h3>
              <Badge className={`${getStatusColor(cto.status || "")} text-white text-xs py-0 h-5`}>
                {getStatusLabel(cto.status || "")}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 mb-1 line-clamp-1">{cto.description}</p>
            <div className="text-xs">
              <span>
                {cto.totalPorts - cto.occupiedPorts}/{cto.totalPorts} portas disponíveis
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
