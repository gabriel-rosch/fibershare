"use client"

import { useState, useEffect } from "react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, MapPin, Users, Activity, Settings, ChevronRight } from "lucide-react"
import type { CTO } from "@/lib/utils/cto-utils"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SheetClose } from "@/components/ui/sheet"

export interface CTODrawerProps {
  selectedCTO: CTO;
  onClose: () => void;
}

export function CTODrawer({ selectedCTO, onClose }: CTODrawerProps) {
  const [activeTab, setActiveTab] = useState("info")

  // Resetar a tab ativa quando o drawer é aberto
  useEffect(() => {
    if (selectedCTO) {
      setActiveTab("info")
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

  if (!selectedCTO) {
    return (
      <Sheet>
        <SheetContent className="w-[400px] sm:w-[540px] p-0">
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
      <SheetContent className="w-[400px] sm:w-[540px] p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>{selectedCTO.name}</SheetTitle>
          <SheetDescription>{selectedCTO.description || "Sem descrição"}</SheetDescription>
        </SheetHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full rounded-none px-4">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="p-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Localização</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCTO.region} ({selectedCTO.coordinates[1].toFixed(6)},{" "}
                    {selectedCTO.coordinates[0].toFixed(6)})
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">Ocupação</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCTO.occupiedPorts}/{selectedCTO.totalPorts} portas ({occupancyPercentage}%)
                  </p>
                </div>
                <Progress value={occupancyPercentage} className={getOccupancyColor(occupancyPercentage)} />
              </div>

              <div className="border rounded-md p-3">
                <h4 className="text-sm font-medium mb-2">Portas Disponíveis</h4>
                <p className="text-2xl font-bold">
                  {selectedCTO.totalPorts - selectedCTO.occupiedPorts}
                  <span className="text-sm font-normal text-muted-foreground ml-1">de {selectedCTO.totalPorts}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
                <Button variant="outline" className="justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Monitorar
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clients" className="p-0">
            <ScrollArea className="h-[300px]">
              <div className="p-4 space-y-2">
                <p className="text-sm text-muted-foreground mb-4">Clientes conectados a esta CTO:</p>
                {Array.from({ length: selectedCTO.occupiedPorts }).map((_, index) => (
                  <div key={index} className="border rounded-md p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Cliente #{index + 1}</h4>
                        <p className="text-xs text-muted-foreground">Porta {index + 1}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
                {selectedCTO.occupiedPorts === 0 && (
                  <div className="flex items-center justify-center h-[200px]">
                    <p className="text-muted-foreground">Nenhum cliente conectado</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="p-0">
            <ScrollArea className="h-[300px]">
              <div className="p-4 space-y-4">
                <p className="text-sm text-muted-foreground mb-4">Histórico de atividades:</p>
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="border-b pb-2 last:border-0">
                    <p className="text-sm font-medium">
                      {index === 0
                        ? "Manutenção realizada"
                        : index === 1
                          ? "Cliente adicionado"
                          : index === 2
                            ? "Cliente removido"
                            : index === 3
                              ? "CTO ativada"
                              : "CTO criada"}
                    </p>
                    <div className="flex justify-between">
                      <p className="text-xs text-muted-foreground">
                        {index === 0
                          ? "Técnico: João Silva"
                          : index === 1
                            ? "Porta: 5"
                            : index === 2
                              ? "Porta: 8"
                              : index === 3
                                ? "Técnico: Maria Oliveira"
                                : "Operador: Carlos Santos"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {index === 0
                          ? "Hoje, 14:30"
                          : index === 1
                            ? "Ontem, 10:15"
                            : index === 2
                              ? "3 dias atrás"
                              : index === 3
                                ? "1 semana atrás"
                                : "1 mês atrás"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <div className="p-4 border-t flex justify-end">
          <SheetClose asChild>
            <Button variant="outline" onClick={onClose}>Fechar</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
