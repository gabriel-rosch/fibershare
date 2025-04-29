"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CTOFormProps {
  coordinates: { lat: number; lng: number }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateCTOData) => Promise<void>
}

interface CreateCTOData {
  name: string
  totalPorts: number
  status: 'active' | 'inactive' | 'maintenance'
  location: {
    lat: number
    lng: number
  }
}

export function CTOForm({ coordinates, open, onOpenChange, onSubmit }: CTOFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateCTOData>({
    name: '',
    totalPorts: 0,
    status: 'active',
    location: coordinates
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao criar CTO:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Nova CTO</SheetTitle>
          <SheetDescription>
            Preencha os dados da nova CTO
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da CTO</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalPorts">Número de Portas</Label>
            <Input
              id="totalPorts"
              type="number"
              min={1}
              value={formData.totalPorts}
              onChange={(e) => setFormData({ ...formData, totalPorts: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'active' | 'inactive' | 'maintenance') => 
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="inactive">Inativa</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Coordenadas</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  value={coordinates.lat}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  value={coordinates.lng}
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar CTO"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
} 