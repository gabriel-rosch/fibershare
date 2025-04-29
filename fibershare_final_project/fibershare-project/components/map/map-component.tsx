"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { useCTOApi } from "@/lib/hooks/use-cto-api"
import { Layers, Network, Settings, Map, Home, Plus } from "lucide-react"
import { MapSidebar } from "./map-sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CTODrawer } from "./cto-drawer"
import type { CTO, ExtendedCTO, CreateCTOData } from "@/lib/interfaces/service-interfaces"
import 'mapbox-gl/dist/mapbox-gl.css';
import { CTOForm } from "./cto-form"
import apiClient from "@/lib/apiClient"
import { useToast } from "@/components/ui/use-toast"

// Configurações do MapBox
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoiZ2FicmllbC1yb3NjaCIsImEiOiJjbTZhYWsycXgwbmduMmpxMnV0Z2p3cm43In0.Z25cdO-rQQ86m03_ZCs5vg"
const LIGHT_STYLE = process.env.NEXT_PUBLIC_MAPBOX_LIGHT_STYLE || "mapbox://styles/mapbox/light-v11"
const THREE_D_STYLE = process.env.NEXT_PUBLIC_MAPBOX_3D_STYLE || "mapbox://styles/mapbox/satellite-streets-v12"

// Componente de mapa que será carregado apenas no cliente
const MapboxMapComponent = dynamic(() => import("@/components/map/mapbox-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted/20">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando mapa...</p>
      </div>
    </div>
  ),
})

export function MapComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedCTO, setSelectedCTO] = useState<CTO | null>(null)
  const [selectedPortId, setSelectedPortId] = useState<string | null>(null)
  const { ctos, isLoading, error, refreshData } = useCTOApi()
  const [isAddingCTO, setIsAddingCTO] = useState(false)
  const [newCTOCoordinates, setNewCTOCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const { toast } = useToast()

  // Função para lidar com o clique em uma CTO no mapa
  const handleMapCTOClick = (cto: CTO) => {
    setSelectedCTO(cto)
    setSidebarOpen(true)
  }

  // Função para lidar com a seleção de CTO na sidebar
  const handleCTOSelect = (cto: CTO) => {
    setSelectedCTO(cto)
    setSelectedPortId(null) // Limpa a seleção de porta anterior
  }

  // Função para lidar com a seleção de porta
  const handlePortSelect = (portId: string) => {
    setSelectedPortId(portId)
  }

  // Função para fechar drawers
  const handleCloseDrawers = () => {
    setSelectedCTO(null)
    setSelectedPortId(null)
  }

  // Função para iniciar o modo de adicionar CTO
  const handleStartAddCTO = () => {
    setIsAddingCTO(true)
  }

  // Função para lidar com o clique no mapa quando estiver adicionando CTO
  const handleMapClick = (coordinates: { lat: number; lng: number }) => {
    if (isAddingCTO) {
      setNewCTOCoordinates(coordinates)
      setIsAddingCTO(false)
    }
  }

  // Função para criar nova CTO
  const handleCreateCTO = async (data: CreateCTOData) => {
    try {
      const response = await apiClient.post('/ctos', data);
      if (response.data) {
        await refreshData();
        setNewCTOCoordinates(null);
        toast({
          title: "CTO criada com sucesso!",
          description: `A CTO ${response.data.name} foi criada com ${response.data.totalPorts} portas.`,
          variant: "default",
        })
      }
    } catch (error: any) {
      console.error('Erro ao criar CTO:', error.response?.data || error);
      toast({
        title: "Erro ao criar CTO",
        description: error.response?.data?.error || "Ocorreu um erro ao criar a CTO",
        variant: "destructive",
      })
    }
  }

  // Adicionar logs para debug
  console.log('MAPBOX_TOKEN:', MAPBOX_TOKEN);
  console.log('Rendering map with CTOs:', ctos);

  // Verificar se o token existe antes de renderizar
  if (!MAPBOX_TOKEN) {
    return <div>Erro: Token do Mapbox não encontrado</div>;
  }

  return (
    <div className="relative h-[calc(100vh-56px)] w-full flex">
      {/* Coluna lateral fixa */}
      <div className="w-16 bg-background border-r flex flex-col items-center py-4 z-20">
        <TooltipProvider>
          <div className="flex flex-col gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={() => {
                    /* Ação para o botão inicial */
                  }}
                >
                  <Home className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Início</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={() => {
                    /* Ação para o botão de mapa */
                  }}
                >
                  <Map className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Mapa</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={sidebarOpen ? "secondary" : "ghost"}
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Layers className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Visualizar CTOs</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={() => {
                    /* Ação para o botão de rede */
                  }}
                >
                  <Network className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Visualizar Rede</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={() => {
                    /* Ação para o botão de rede */
                  }}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Configurações</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isAddingCTO ? "secondary" : "ghost"}
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={handleStartAddCTO}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Adicionar CTO</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Área do mapa */}
      <div className="flex-1 relative">
        <MapboxMapComponent
          mapboxToken={MAPBOX_TOKEN}
          lightStyle={LIGHT_STYLE}
          threeDStyle={THREE_D_STYLE}
          className="w-full h-full absolute inset-0"
          ctos={ctos}
          onCTOClick={handleMapCTOClick}
          isAddingCTO={isAddingCTO}
          onMapClick={handleMapClick}
        />

        {/* Sidebar e Drawers */}
        <div className="fixed inset-y-0 left-16 z-50">
          <MapSidebar
            open={sidebarOpen}
            onOpenChange={setSidebarOpen}
            ctos={ctos}
            loading={isLoading}
            error={error}
            leftOffset={0}
            onCTOSelect={handleCTOSelect}
            selectedCTO={selectedCTO}
            onPortSelect={handlePortSelect}
            onRefreshData={refreshData}
          />

          {/* Drawer de CTO */}
          {selectedCTO && !selectedPortId && (
            <CTODrawer
              selectedCTO={selectedCTO as ExtendedCTO}
              onClose={handleCloseDrawers}
              onPortSelect={handlePortSelect}
            />
          )}
        </div>
      </div>

      {newCTOCoordinates && (
        <CTOForm
          coordinates={newCTOCoordinates}
          open={!!newCTOCoordinates}
          onOpenChange={(open) => !open && setNewCTOCoordinates(null)}
          onSubmit={handleCreateCTO}
        />
      )}
    </div>
  )
}
