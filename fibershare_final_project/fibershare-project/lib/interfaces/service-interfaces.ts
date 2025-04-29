// Interfaces para operadores
export interface Operator {
  id: string
  name: string
  logo?: string
  region: string
  ctoCount: number
  rating: number // 1-5 estrelas
  partnershipStatus?: "none" | "pending" | "active"
  description: string
  contactEmail: string
  contactPhone: string
  createdAt: string
  email?: string
  role?: string
  status?: string
  updatedAt?: string
}

// Interfaces para CTOs
export interface CTO {
  id: string
  name: string
  location: {
    lat: number
    lng: number
  }
  status: 'active' | 'inactive' | 'maintenance'
  totalPorts: number
  operatorId: string
}

// Interfaces para portas de CTO
export type CTOPortStatus = 'available' | 'reserved' | 'occupied' | 'maintenance'

export interface CTOPort {
  id: string
  ctoId: string
  number: number
  status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  clientId?: string
  lastModified?: Date
  price?: number
}

// Interfaces para ordens de serviço
export type ServiceOrderType =
  | "partnership_request"
  | "maintenance"
  | "installation"
  | "cancellation"
  | "support"
  | "removal"
  | "other"
export type ServiceOrderStatus = "pending" | "in_progress" | "completed" | "rejected" | "cancelled"

export interface ServiceOrder {
  id: string
  type: ServiceOrderType
  status: ServiceOrderStatus
  title: string
  description: string
  requesterId: string
  requesterName: string
  targetId: string
  targetName: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  notes?: string[]
}

export interface ServiceOrderNote {
  id: string
  orderId: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
  isSystemNote: boolean
}

// Interfaces para ordens de serviço de portas
export type PortOrderStatus =
  | "pending_approval" // Aguardando aprovação do proprietário
  | "rejected" // Rejeitada pelo proprietário
  | "contract_generated" // Contrato gerado, aguardando assinaturas
  | "contract_signed" // Contrato assinado por ambas as partes
  | "installation_scheduled" // Instalação agendada
  | "installation_in_progress" // Instalação em andamento
  | "completed" // Instalação concluída, porta em uso
  | "cancelled" // Cancelada após aprovação

export interface PortServiceOrder {
  id: string
  ctoId: string
  ctoName: string
  portNumber: number
  requesterId: string
  requesterName: string
  ownerId: string
  ownerName: string
  status: PortOrderStatus
  createdAt: string
  updatedAt: string
  scheduledDate?: string
  completedDate?: string
  contractUrl?: string
  contractSignedByRequester: boolean
  contractSignedByOwner: boolean
  notes: PortOrderNote[]
  price: number // Preço mensal do aluguel
  installationFee: number // Taxa de instalação (única)
}

export interface PortOrderNote {
  id: string
  orderId: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
  isSystemNote: boolean
}

// Interfaces para chat
export interface ChatContact {
  id: string
  name: string
  avatar: string
  status: "online" | "offline" | "away"
  lastSeen: string
  unreadCount: number
  lastMessage?: {
    id?: string
    content: string
    timestamp: string
    senderId?: string
    receiverId?: string
    read?: boolean
  }
}

export interface ChatMessage {
  id: string
  content: string
  timestamp: string
  senderId: string
  receiverId: string
  read: boolean
  text?: string // Para compatibilidade
}

// Interfaces para usuários
export interface User {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  createdAt: string
  lastLogin?: string
}

export interface CreateUserData {
  name: string
  email: string
  role: string
  status: "active" | "inactive"
}

// Interfaces para dashboard
export interface DashboardStat {
  id: string
  title: string
  value: string
  icon: string
  color: string
  description: string
}

export interface Activity {
  id: string
  action: string
  details: string
  date: string
  type: string
}

export interface QuickAction {
  id: string
  title: string
  icon: string
}

export interface MarketplaceSummary {
  totalRented: string
  totalReceived: string
  periodBalance: string
}

// Interfaces para marketplace
export interface AvailablePort {
  id: string
  location: string
  provider: string
  quantity: number
  price: number
  technology: string
  distance: string
}

export interface MyListing {
  id: string
  location: string
  quantity: number
  price: number
  rented: number
  available: number
  revenue: string
}

export interface MyRental {
  id: string
  location: string
  provider: string
  quantity: number
  price: number
  totalCost: string
  startDate: string
  endDate: string
}

export interface CreateListingData {
  location: string
  quantity: number
  price: number
  technology: string
}

export interface ExtendedCTOPort extends CTOPort {
  portNumber: number;
  price: number;
  customer?: string;
  operatorName?: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
}

export interface ExtendedCTO extends CTO {
  ports?: ExtendedCTOPort[];
  description?: string;
  occupiedPorts: number;
}
