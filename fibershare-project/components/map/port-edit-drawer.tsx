"use client"
import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CTOPort } from "@/lib/interfaces/service-interfaces"
import { ctoPortService } from "@/lib/services/supabase/cto-port-service"

interface PortEditDrawerProps {
  port: CTOPort
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  onPortUpdated: () => void
  onRefreshData?: () => Promise<void>
}

export function PortEditDrawer({ port, open, onOpenChange, onClose, onPortUpdated, onRefreshData }: PortEditDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [price, setPrice] = useState(port.price?.toString() || "")

  const handleReservePort = async () => {
    try {
      setLoading(true)
      await ctoPortService.reservePort(port.id)
      onPortUpdated()
      if (onRefreshData) {
        await onRefreshData()
      }
      onClose()
    } catch (error) {
      console.error("Erro ao reservar porta:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePrice = async () => {
    try {
      setLoading(true)
      await ctoPortService.updatePortPrice(port.id, Number(price))
      onPortUpdated()
      onClose()
    } catch (error) {
      console.error("Erro ao atualizar preço:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] p-4">
        <SheetHeader className="pb-4">
          <SheetTitle>Editar Porta {port.portNumber}</SheetTitle>
          <SheetDescription>
            Status: {port.status === "available" ? "Disponível" : "Indisponível"}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          {port.status === "available" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço da Porta</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleUpdatePrice}
                    disabled={loading}
                  >
                    Atualizar Preço
                  </Button>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleReservePort}
                disabled={loading}
              >
                Reservar Porta
              </Button>
            </>
          )}
        </div>

        <div className="absolute bottom-4 right-4">
          <SheetClose asChild>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
} 