"use client"
import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { CTO } from "@/lib/utils/cto-utils"

export interface PortDrawerProps {
  selectedCTO: CTO;
  selectedPortId: string;
  onClose: () => void;
  onRefreshData: () => Promise<void>;
}

export function PortDrawer({ selectedCTO, selectedPortId, onClose, onRefreshData }: PortDrawerProps) {
  const [selectedPort, setSelectedPort] = useState<any | null>(null)
  const [newPrice, setNewPrice] = useState<string>("")
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Função para formatar preço
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
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

  // Função para obter o rótulo do status da porta
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

  // Função para selecionar uma porta
  const handlePortSelect = (port: any) => {
    setSelectedPort(port)
    setNewPrice(port.price ? port.price.toString() : "0")
    setError(null)
    setSuccess(null)
  }

  // Função para atualizar o preço da porta
  const handleUpdatePrice = async () => {
    if (!selectedPort) return

    try {
      setUpdating(true)
      setError(null)
      setSuccess(null)

      const price = Number.parseFloat(newPrice)
      if (isNaN(price) || price < 0) {
        setError("Preço inválido")
        setUpdating(false)
        return
      }

      const response = await fetch(`/api/cto-ports/${selectedPort.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ price }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao atualizar preço")
      }

      const updatedPort = await response.json()

      // Atualizar a porta no estado local
      if (selectedCTO.ports) {
        const updatedPorts = selectedCTO.ports.map((port) => (port.id === selectedPort.id ? { ...port, price } : port))

        // Atualizar a CTO com as portas atualizadas
        selectedCTO.ports = updatedPorts
      }

      // Atualizar a porta selecionada
      setSelectedPort({ ...selectedPort, price })

      setSuccess("Preço atualizado com sucesso")

      // Notificar o componente pai sobre a atualização
      if (onRefreshData) {
        await onRefreshData()
      }
    } catch (error: any) {
      console.error("Erro ao atualizar preço:", error)
      setError(error.message || "Erro ao atualizar preço")
    } finally {
      setUpdating(false)
    }
  }

  // Função para reservar uma porta
  const handleReservePort = async () => {
    if (!selectedPort) return

    try {
      setUpdating(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/cto-ports/${selectedPort.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "reserved" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao reservar porta")
      }

      const updatedPort = await response.json()

      // Atualizar a porta no estado local
      if (selectedCTO.ports) {
        const updatedPorts = selectedCTO.ports.map((port) =>
          port.id === selectedPort.id ? { ...port, status: "reserved" } : port,
        )

        // Atualizar a CTO com as portas atualizadas
        selectedCTO.ports = updatedPorts
      }

      // Atualizar a porta selecionada
      setSelectedPort({ ...selectedPort, status: "reserved" })

      setSuccess("Porta reservada com sucesso")

      // Notificar o componente pai sobre a atualização
      if (onRefreshData) {
        await onRefreshData()
      }
    } catch (error: any) {
      console.error("Erro ao reservar porta:", error)
      setError(error.message || "Erro ao reservar porta")
    } finally {
      setUpdating(false)
    }
  }

  // Função para liberar uma porta
  const handleReleasePort = async () => {
    if (!selectedPort) return

    try {
      setUpdating(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/cto-ports/${selectedPort.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "available" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao liberar porta")
      }

      const updatedPort = await response.json()

      // Atualizar a porta no estado local
      if (selectedCTO.ports) {
        const updatedPorts = selectedCTO.ports.map((port) =>
          port.id === selectedPort.id ? { ...port, status: "available" } : port,
        )

        // Atualizar a CTO com as portas atualizadas
        selectedCTO.ports = updatedPorts
      }

      // Atualizar a porta selecionada
      setSelectedPort({ ...selectedPort, status: "available" })

      setSuccess("Porta liberada com sucesso")

      // Notificar o componente pai sobre a atualização
      if (onRefreshData) {
        await onRefreshData()
      }
    } catch (error: any) {
      console.error("Erro ao liberar porta:", error)
      setError(error.message || "Erro ao liberar porta")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Sheet>
      <SheetContent className="w-[400px] sm:w-[540px] p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>CTO: {selectedCTO.name}</SheetTitle>
          <SheetDescription>{selectedCTO.description}</SheetDescription>
        </SheetHeader>

        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Portas</h3>

          {selectedCTO.ports && selectedCTO.ports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma porta encontrada para esta CTO</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {selectedCTO.ports.map((port) => (
                <div
                  key={port.id}
                  className={`border rounded-md p-2 text-center cursor-pointer transition-colors ${
                    selectedPort?.id === port.id ? "ring-2 ring-primary" : "hover:bg-muted/50"
                  }`}
                  onClick={() => handlePortSelect(port)}
                >
                  <div className="text-sm font-medium">Porta {port.number}</div>
                  <Badge className={`${getPortStatusColor(port.status)} text-white text-xs mt-1`}>
                    {getPortStatusLabel(port.status)}
                  </Badge>
                  <div className="text-xs mt-1">{formatCurrency(port.price || 0)}</div>
                </div>
              ))}
            </div>
          )}

          {selectedPort && (
            <div className="mt-6">
              <Separator className="my-4" />
              <h4 className="text-md font-medium mb-2">Detalhes da Porta {selectedPort.number}</h4>

              <Tabs defaultValue="info">
                <TabsList className="mb-4">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="actions">Ações</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <div className="font-medium">
                        <Badge className={`${getPortStatusColor(selectedPort.status)} text-white text-xs`}>
                          {getPortStatusLabel(selectedPort.status)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Preço</Label>
                      <div className="font-medium">{formatCurrency(selectedPort.price || 0)}</div>
                    </div>
                    {selectedPort.customer && (
                      <div className="col-span-2">
                        <Label className="text-xs text-muted-foreground">Cliente</Label>
                        <div className="font-medium">{selectedPort.customer}</div>
                      </div>
                    )}
                    {selectedPort.operatorName && (
                      <div className="col-span-2">
                        <Label className="text-xs text-muted-foreground">Operador</Label>
                        <div className="font-medium">{selectedPort.operatorName}</div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="price">Preço</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          disabled={updating}
                        />
                        <Button onClick={handleUpdatePrice} disabled={updating}>
                          {updating ? "Atualizando..." : "Atualizar"}
                        </Button>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {selectedPort.status === "available" ? (
                        <Button
                          onClick={handleReservePort}
                          disabled={updating}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          {updating ? "Processando..." : "Reservar Porta"}
                        </Button>
                      ) : selectedPort.status === "reserved" ? (
                        <Button
                          onClick={handleReleasePort}
                          disabled={updating}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {updating ? "Processando..." : "Liberar Porta"}
                        </Button>
                      ) : null}
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
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
