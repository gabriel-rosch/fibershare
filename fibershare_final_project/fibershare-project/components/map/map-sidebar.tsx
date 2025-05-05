"use client"
import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { CTO } from "@/lib/interfaces/service-interfaces"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, List } from "lucide-react"
import { PortsDrawer } from "./ports-drawer"

interface MapSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ctos: CTO[]
  loading: boolean
  error: string | null
  leftOffset: number
  onCTOSelect: (cto: CTO) => void
  selectedCTO: CTO | null
  onPortSelect: (portId: string) => void
  onRefreshData: () => Promise<void>
}

export function MapSidebar({
  open,
  onOpenChange,
  ctos,
  loading,
  error,
  leftOffset,
  onCTOSelect,
  selectedCTO,
  onPortSelect,
  onRefreshData
}: MapSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCTOForPorts, setSelectedCTOForPorts] = useState<CTO | null>(null)
  const [portsDrawerOpen, setPortsDrawerOpen] = useState(false)

  // Filtrar CTOs com base no termo de busca
  const filteredCTOs = ctos.filter((cto) =>
    cto.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Função para lidar com a seleção de CTO
  const handleCTOSelect = (cto: CTO) => {
    onCTOSelect(cto)
  }

  // Função para visualizar portas
  const handleViewPorts = (cto: CTO, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedCTOForPorts(cto)
    setPortsDrawerOpen(true)
  }

  // Função para obter a cor do status
  const getStatusColor = (status: string | undefined) => {
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

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          className="w-[350px] p-0"
          style={{ 
            marginLeft: `${leftOffset}px`,
            left: leftOffset,
            position: 'fixed'
          }}
        >
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Lista de CTOs</SheetTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar CTOs..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-8rem)]">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : error ? (
              <div className="p-4 text-center text-destructive">{error}</div>
            ) : filteredCTOs.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nenhuma CTO encontrada
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {filteredCTOs.map((cto) => (
                  <div key={cto.id} className="flex items-center gap-2">
                    <Button
                      variant={selectedCTO?.id === cto.id ? "secondary" : "outline"}
                      className={`flex-1 justify-start ${
                        selectedCTO?.id === cto.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handleCTOSelect(cto)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(cto.status)}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{cto.name}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {cto.totalPorts - cto.occupiedPorts}/{cto.totalPorts}
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleViewPorts(cto, e)}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Drawer de Portas */}
      {selectedCTOForPorts && (
        <PortsDrawer
          selectedCTO={selectedCTOForPorts}
          open={portsDrawerOpen}
          onOpenChange={setPortsDrawerOpen}
          onClose={() => {
            setPortsDrawerOpen(false)
            setSelectedCTOForPorts(null)
          }}
          onPortSelect={onPortSelect}
          onRefreshData={onRefreshData}
        />
      )}
    </>
  )
}
