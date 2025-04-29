"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import type { CTO } from "@/lib/interfaces/service-interfaces"
import { ctoPortService } from "@/lib/services/supabase/cto-port-service"

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

  // Adicionar log para debug das CTOs
  useEffect(() => {
    console.log('CTOs recebidas:', ctos)
  }, [ctos])

  // Função para converter coordenadas do formato {lat, lng} para [lng, lat]
  const convertCoordinates = (coordinates: any): [number, number] => {
    if (!coordinates) return [-49.0771, -26.9187] // Coordenadas padrão
    return [coordinates.lng, coordinates.lat]
  }

  // Inicializar o mapa
  useEffect(() => {
    if (!mapContainer.current) return
    if (map.current) return

    try {
      mapboxgl.accessToken = mapboxToken

      // Se tiver CTOs, usar a primeira como centro
      const firstCTO = ctos.find(cto => cto.coordinates)
      const initialCenter = firstCTO ? convertCoordinates(firstCTO.coordinates) : [-49.0771, -26.9187]

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: lightStyle,
        center: initialCenter as [number, number],
        zoom: 13,
        pitch: 0,
        bearing: 0,
      })

      // Adicionar controles básicos
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right")
      map.current.addControl(new mapboxgl.ScaleControl(), "bottom-right")

      map.current.on('load', () => {
        console.log('Mapa carregado com centro em:', initialCenter)
      })

    } catch (error) {
      console.error('Erro ao inicializar o mapa:', error)
    }
  }, [mapboxToken, lightStyle, ctos])

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

    // Adicionar texto com o número de portas disponíveis
    const availablePorts = cto.totalPorts - cto.occupiedPorts
    if (availablePorts > 0) {
      el.textContent = availablePorts.toString()
    }

    return el
  }

  // Atualizar marcadores quando as CTOs mudarem
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return

    // Remover marcadores que não existem mais
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      if (!ctos.find(cto => cto.id === id)) {
        marker.remove()
        delete markersRef.current[id]
      }
    })

    // Adicionar ou atualizar marcadores
    ctos.forEach((cto) => {
      if (!cto.coordinates) return

      const coordinates = convertCoordinates(cto.coordinates)

      // Se o marcador já existe, apenas atualize sua posição
      if (markersRef.current[cto.id]) {
        markersRef.current[cto.id].setLngLat(coordinates)
        return
      }

      const el = createMarkerElement(cto)

      // Criar e adicionar o marcador
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat(coordinates)
        .addTo(map.current!)

      // Adicionar apenas o evento de clique
      el.addEventListener('click', () => {
        onCTOClick(cto)
      })

      // Armazenar referência ao marcador
      markersRef.current[cto.id] = marker
    })

    // Ajustar o zoom para mostrar todos os marcadores
    if (ctos.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      let validCoordinates = false

      ctos.forEach((cto) => {
        if (cto.coordinates) {
          const coords = convertCoordinates(cto.coordinates)
          bounds.extend(coords)
          validCoordinates = true
        }
      })

      if (validCoordinates) {
        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 350 },
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
