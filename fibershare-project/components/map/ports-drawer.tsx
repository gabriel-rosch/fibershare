"use client"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import type { CTO, CTOPort } from "@/lib/interfaces/service-interfaces"
import { ctoPortService } from "@/lib/services/supabase/cto-port-service"
import { PortEditDrawer } from "./port-edit-drawer"

interface PortsDrawerProps {
  selectedCTO: CTO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  onPortSelect: (portId: string) => void
  onRefreshData: () => Promise<void>
}

export function PortsDrawer({ 
  selectedCTO, 
  open,
  onOpenChange,
  onClose, 
  onPortSelect,
  onRefreshData
}: PortsDrawerProps) {
  const [ports, setPorts] = useState<CTOPort[]>([])
  const [occupiedCount, setOccupiedCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPort, setSelectedPort] = useState<CTOPort | null>(null)

  useEffect(() => {
    async function loadPorts() {
      if (!selectedCTO?.id) return
      
      setLoading(true)
      setError(null)
      
      try {
        const { ports: portsList, occupiedCount } = await ctoPortService.getPortsByCTOId(selectedCTO.id)
        setPorts(portsList)
        setOccupiedCount(occupiedCount)
      } catch (err) {
        console.error("Erro ao carregar portas:", err)
        setError("Erro ao carregar portas")
      } finally {
        setLoading(false)
      }
    }

    loadPorts()
  }, [selectedCTO?.id])

  // Função para obter a cor do status da porta
  const getPortStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "reserved":
        return "bg-purple-500"
      case "occupied":
        return "bg-blue-500"
      case "maintenance":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  // Função para obter o rótulo do status
  const getPortStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "Disponível"
      case "reserved":
        return "Reservada"
      case "occupied":
        return "Ocupada"
      case "maintenance":
        return "Manutenção"
      default:
        return status
    }
  }

  const handleReservePort = async (portId: string) => {
    try {
      setLoading(true)
      await ctoPortService.reservePort(portId)
      // Recarregar as portas após reservar
      if (selectedCTO?.id) {
        const updatedPorts = await ctoPortService.getPortsByCTOId(selectedCTO.id)
        setPorts(updatedPorts.ports)
        setOccupiedCount(updatedPorts.occupiedCount)
      }
    } catch (error) {
      console.error("Erro ao reservar porta:", error)
      setError("Erro ao reservar porta")
    } finally {
      setLoading(false)
    }
  }

  // Função para lidar com o clique na porta
  const handlePortClick = (port: CTOPort) => {
    setSelectedPort(port)
  }

  // Função para atualizar a lista após mudanças
  const handlePortUpdated = async () => {
    if (selectedCTO?.id) {
      const updatedPorts = await ctoPortService.getPortsByCTOId(selectedCTO.id)
      setPorts(updatedPorts.ports)
      setOccupiedCount(updatedPorts.occupiedCount)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Portas da CTO {selectedCTO?.name}</SheetTitle>
            <SheetDescription className="flex items-center justify-between">
              <span>
                {selectedCTO?.totalPorts - occupiedCount} portas disponíveis
                de {selectedCTO?.totalPorts} totais
              </span>
            </SheetDescription>
          </SheetHeader>

          <div className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : error ? (
              <div className="text-center text-destructive p-4">{error}</div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {ports.map((port) => (
                  <div key={port.id} className="relative group">
                    <Button
                      variant="outline"
                      className="h-auto p-2 flex flex-col items-start w-full"
                      onClick={() => handlePortClick(port)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getPortStatusColor(port.status)}`} />
                          <span className="font-medium text-sm">Porta {port.portNumber}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {getPortStatusLabel(port.status)}
                        </span>
                      </div>
                      {(port.price > 0 || port.currentTenantName) && (
                        <div className="mt-1 text-xs text-muted-foreground w-full truncate">
                          {port.currentTenantName && (
                            <div className="truncate" title={port.currentTenantName}>
                              {port.currentTenantName}
                            </div>
                          )}
                          {port.price > 0 && (
                            <div>R$ {port.price.toFixed(2)}</div>
                          )}
                        </div>
                      )}
                    </Button>
                    
                    {port.status === "available" && (
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleReservePort(port.id)}>
                              Reservar Porta
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t flex justify-end">
            <SheetClose asChild>
              <Button variant="outline" onClick={onClose}>Fechar</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>

      {selectedPort && (
        <PortEditDrawer
          port={selectedPort}
          open={!!selectedPort}
          onOpenChange={(open) => !open && setSelectedPort(null)}
          onClose={() => setSelectedPort(null)}
          onPortUpdated={handlePortUpdated}
          onRefreshData={onRefreshData}
        />
      )}
    </>
  )
} 