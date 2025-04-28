"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ConfigModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfigModal({ open, onOpenChange }: ConfigModalProps) {
  const [showLabels, setShowLabels] = useState(true)
  const [showGrid, setShowGrid] = useState(false)
  const [opacity, setOpacity] = useState([80])
  const [activeTab, setActiveTab] = useState("visual")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurações do Mapa</DialogTitle>
          <DialogDescription>Ajuste as configurações visuais e de desempenho do mapa.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="performance">Desempenho</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-labels" className="flex flex-col space-y-1">
                <span>Mostrar Rótulos</span>
                <span className="font-normal text-xs text-muted-foreground">Exibe os nomes das CTOs no mapa</span>
              </Label>
              <Switch id="show-labels" checked={showLabels} onCheckedChange={setShowLabels} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-grid" className="flex flex-col space-y-1">
                <span>Mostrar Grade</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Exibe uma grade de coordenadas no mapa
                </span>
              </Label>
              <Switch id="show-grid" checked={showGrid} onCheckedChange={setShowGrid} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opacity-slider" className="flex flex-col space-y-1">
                <span>Opacidade dos Marcadores</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Ajuste a transparência dos marcadores no mapa
                </span>
              </Label>
              <Slider id="opacity-slider" value={opacity} min={20} max={100} step={1} onValueChange={setOpacity} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>20%</span>
                <span>{opacity}%</span>
                <span>100%</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="high-quality" className="flex flex-col space-y-1">
                <span>Alta Qualidade</span>
                <span className="font-normal text-xs text-muted-foreground">Renderiza o mapa em alta resolução</span>
              </Label>
              <Switch id="high-quality" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="animations" className="flex flex-col space-y-1">
                <span>Animações</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Habilita animações ao navegar pelo mapa
                </span>
              </Label>
              <Switch id="animations" defaultChecked />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onOpenChange(false)}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
