"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, MapPin, Activity, Settings, List } from "lucide-react"
import type { CTO, CTOPort } from "@/lib/interfaces/service-interfaces"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"
import { ctoPortService } from "@/lib/services/supabase/cto-port-service"

interface CTODrawerProps {
  selectedCTO: CTO;
  onClose: () => void;
  onPortSelect: (portId: string) => void;
}

export function CTODrawer({ selectedCTO, onClose, onPortSelect }: CTODrawerProps) {
  const [ports, setPorts] = useState<CTOPort[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPorts() {
      if (!selectedCTO?.id) return

      setLoading(true)
      setError(null)

      try {
        const { ports: portsList } = await ctoPortService.getPortsByCTOId(selectedCTO.id)
        setPorts(portsList)
      } catch (err) {
        console.error("Erro ao carregar portas:", err)
        setError("Erro ao carregar portas")
      } finally {
        setLoading(false)
      }
    }

    loadPorts()
  }, [selectedCTO?.id])

  // Calcular a porcentagem de ocupação
  const calculateOccupancy = (cto: CTO) => {
    if (cto.totalPorts <= 0) return 0
    return Math.round((cto.occupiedPorts / cto.totalPorts) * 100)
  }

  // Função para obter a cor da ocupação
  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 70) return "bg-yellow-500"
    return "bg-green-500"
  }

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

  if (!selectedCTO) {
    return (
      <Sheet>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
          <SheetHeader className="p-6 border-b">
            <SheetTitle>Detalhes da CTO</SheetTitle>
            <SheetDescription>
              Selecione uma CTO no mapa para ver seus detalhes.
            </SheetDescription>
          </SheetHeader>
          <div className="p-4 flex items-center justify-center h-[200px]">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma CTO selecionada</p>
            </div>
          </div>
          <div className="p-4 border-t flex justify-end">
            <SheetClose asChild>
              <Button variant="outline" onClick={onClose}>Fechar</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  const occupancyPercentage = calculateOccupancy(selectedCTO)

  return (
    <Sheet>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>{selectedCTO.name}</SheetTitle>
          <SheetDescription>{selectedCTO.description || "Sem descrição"}</SheetDescription>
        </SheetHeader>

        <div className="p-4">
          <h3 className="text-lg font-medium mb-4">Portas da CTO</h3>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {ports.map((port) => (
                <Button
                  key={port.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onPortSelect(port.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getPortStatusColor(port.status)}`} />
                    <span>Porta {port.portNumber}</span>
                  </div>
                </Button>
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
  )
}
