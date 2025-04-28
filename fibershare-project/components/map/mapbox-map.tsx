"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import type { CTO } from "@/lib/utils/cto-utils"

export interface MapboxMapProps {
  mapboxToken: string
  lightStyle: string
  threeDStyle: string
  className?: string
  ctos: CTO[]
  onCTOClick: (cto: CTO) => void
}

export default function MapboxMap({
  mapboxToken,
  lightStyle,
  threeDStyle,
  className,
  ctos = [],
  onCTOClick,
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({})
  const [is3DMode, setIs3DMode] = useState(false)

  // Inicializar o mapa
  useEffect(() => {
    if (!mapContainer.current) return // Verificar se o container existe
    if (map.current) return // Evitar reinicialização

    // Adicionar logs para debug
    console.log('Inicializando mapa com token:', mapboxToken)
    console.log('Estilo:', lightStyle)

    try {
      mapboxgl.accessToken = mapboxToken

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: lightStyle,
        center: [-49.0771, -26.9187], // Coordenadas iniciais (Blumenau, SC)
        zoom: 13,
        pitch: 0,
        bearing: 0,
      })

      // Adicionar controles básicos
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right")
      map.current.addControl(new mapboxgl.ScaleControl(), "bottom-right")

      // Adicionar evento de carregamento
      map.current.on('load', () => {
        console.log('Mapa carregado com sucesso')
      })

      // Adicionar evento de erro
      map.current.on('error', (e) => {
        console.error('Erro no mapa:', e)
      })

    } catch (error) {
      console.error('Erro ao inicializar o mapa:', error)
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [mapboxToken, lightStyle])

  // Escutar o evento toggle3DMode
  useEffect(() => {
    const handle3DToggle = (event: CustomEvent) => {
      const enabled = event.detail?.enabled
      setIs3DMode(enabled)

      if (!map.current) return

      if (enabled) {
        // Ativar modo 3D
        map.current.easeTo({
          pitch: 60, // Inclinação para visualização 3D
          bearing: 30, // Rotação para melhor visualização 3D
          duration: 1000, // Duração da animação em ms
        })

        // Mudar para estilo 3D se disponível
        if (threeDStyle) {
          map.current.setStyle(threeDStyle)
        }

        // Adicionar extrude aos edifícios se o estilo suportar
        map.current.once("style.load", () => {
          if (map.current?.getLayer("building")) {
            map.current.setLayoutProperty("building", "visibility", "visible")

            // Verificar se já existe a camada 3D de edifícios
            if (!map.current.getLayer("3d-buildings")) {
              // Adicionar camada 3D de edifícios
              map.current.addLayer({
                id: "3d-buildings",
                source: "composite",
                "source-layer": "building",
                filter: ["==", "extrude", "true"],
                type: "fill-extrusion",
                minzoom: 15,
                paint: {
                  "fill-extrusion-color": "#aaa",
                  "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "height"]],
                  "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "min_height"]],
                  "fill-extrusion-opacity": 0.6,
                },
              })
            }
          }
        })
      } else {
        // Desativar modo 3D
        map.current.easeTo({
          pitch: 0,
          bearing: 0,
          duration: 1000,
        })

        // Voltar para o estilo padrão
        map.current.setStyle(lightStyle)
      }
    }

    // Adicionar listener para o evento personalizado
    window.addEventListener("toggle3DMode", handle3DToggle as EventListener)

    return () => {
      window.removeEventListener("toggle3DMode", handle3DToggle as EventListener)
    }
  }, [lightStyle, threeDStyle])

  // Função para obter a cor do marcador com base no status da CTO
  const getMarkerColor = (status: string | undefined): string => {
    if (!status) return "#6366f1" // Cor padrão (roxo) se não houver status

    switch (status) {
      case "active":
        return "#10b981" // Verde
      case "maintenance":
        return "#f59e0b" // Amarelo
      case "inactive":
        return "#ef4444" // Vermelho
      default:
        return "#6366f1" // Roxo (padrão)
    }
  }

  // Função para criar um elemento HTML para o marcador
  const createMarkerElement = (cto: CTO) => {
    const el = document.createElement("div")
    el.className = "cto-marker"
    el.style.width = "24px"
    el.style.height = "24px"
    el.style.borderRadius = "50%"
    el.style.backgroundColor = getMarkerColor(cto.status)
    el.style.border = "2px solid white"
    el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)"
    el.style.cursor = "pointer"
    el.style.display = "flex"
    el.style.alignItems = "center"
    el.style.justifyContent = "center"
    el.style.color = "white"
    el.style.fontWeight = "bold"
    el.style.fontSize = "10px"
    el.style.transition = "transform 0.2s"

    // Adicionar texto com o número de portas disponíveis
    const availablePorts = cto.totalPorts - cto.occupiedPorts
    if (availablePorts > 0) {
      el.textContent = availablePorts.toString()
    }

    // Adicionar efeito hover
    el.onmouseenter = () => {
      el.style.transform = "scale(1.2)"
    }
    el.onmouseleave = () => {
      el.style.transform = "scale(1)"
    }

    return el
  }

  // Adicionar marcadores para as CTOs
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return

    // Limpar marcadores existentes
    Object.values(markersRef.current).forEach((marker) => marker.remove())
    markersRef.current = {}

    // Adicionar novos marcadores
    ctos.forEach((cto) => {
      if (!cto.coordinates || cto.coordinates.length !== 2) return

      const el = createMarkerElement(cto)

      // Criar popup com informações da CTO
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: bold;">${cto.name}</h3>
            <p style="margin: 0; font-size: 12px;">${cto.description || "Sem descrição"}</p>
            <p style="margin: 4px 0 0; font-size: 12px;">
              <strong>Portas:</strong> ${cto.totalPorts - cto.occupiedPorts}/${cto.totalPorts} disponíveis
            </p>
          </div>
        `)

      // Criar e adicionar o marcador
      const marker = new mapboxgl.Marker(el)
        .setLngLat([cto.coordinates[0], cto.coordinates[1]])
        .setPopup(popup)
        .addTo(map.current!)

      // Adicionar evento de clique
      el.addEventListener("click", () => {
        if (onCTOClick) {
          onCTOClick(cto)
        }
      })

      // Armazenar referência ao marcador
      markersRef.current[cto.id] = marker
    })

    // Ajustar o zoom para mostrar todos os marcadores se houver CTOs
    if (ctos.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()

      ctos.forEach((cto) => {
        if (cto.coordinates && cto.coordinates.length === 2) {
          bounds.extend([cto.coordinates[0], cto.coordinates[1]])
        }
      })

      // Só ajustar o zoom se tivermos coordenadas válidas
      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
          duration: 1000,
        })
      }
    }
  }, [ctos, onCTOClick])

  return (
    <div 
      ref={mapContainer} 
      className={`${className || ''} relative`}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
