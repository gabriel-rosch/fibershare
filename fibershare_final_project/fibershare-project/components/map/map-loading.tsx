"use client"

import { Building2, MapPin, Network } from "lucide-react"

export function MapLoading() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        {/* Logo animado */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-primary">
            <Network className="h-12 w-12 text-primary-foreground animate-pulse" />
          </div>
        </div>

        {/* Ícones flutuantes */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute top-0 left-0 animate-float-delay-1">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="absolute top-0 right-0 animate-float-delay-2">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 animate-float-delay-3">
            <Network className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        {/* Texto de loading */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">
            Carregando Mapa
          </h3>
          <p className="text-sm text-muted-foreground">
            Preparando visualização da rede...
          </p>
        </div>

        {/* Barra de progresso */}
        <div className="max-w-xs mx-auto">
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-progress rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
} 