"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth-store"
import { MapHeader } from "@/components/map/map-header"

export default function MapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  // Mostrar um estado de carregamento ou nada enquanto verifica a autenticação
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <MapHeader />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
