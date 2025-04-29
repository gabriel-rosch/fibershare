// Definição de tipos para CTOs e portas
export interface CTOPort {
  id: string
  number: number
  status: string
  price: number
  customer?: string | null
  operatorId?: string | null
  operatorName?: string | null
  address?: string | null
  plan?: string | null
  startDate?: string | null
  endDate?: string | null
}

export interface CTO {
  id: string
  name: string
  description: string
  totalPorts: number
  occupiedPorts: number
  coordinates: [number, number]
  region?: string
  status?: string
  ownerId?: string
  ownerName?: string
  ports: CTOPort[]
}

// Função para calcular a porcentagem de ocupação
export function calculateOccupancyPercentage(cto: CTO): number {
  if (cto.totalPorts === 0) return 0
  return Math.round((cto.occupiedPorts / cto.totalPorts) * 100)
}

// Função para obter a cor da ocupação
export function getOccupancyColor(percentage: number): string {
  if (percentage >= 90) return "text-red-500"
  if (percentage >= 70) return "text-yellow-500"
  return "text-green-500"
}

// Função para obter a cor do status da CTO
export function getCTOStatusColor(status: string): string {
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

// Função para obter o nome do status da CTO
export function getCTOStatusName(status: string): string {
  switch (status) {
    case "active":
      return "Ativa"
    case "maintenance":
      return "Em manutenção"
    case "inactive":
      return "Inativa"
    default:
      return "Desconhecido"
  }
}
