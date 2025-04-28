// Tipos para os dados da API
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

// Interfaces para usuários
export interface User {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  operatorId?: string
  operatorName?: string
  isFirstAccess?: boolean
  createdAt: string
  lastLogin?: string
  tempPassword?: string
}

export interface CreateUserData {
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  operatorId?: string
}

// Classe de serviço para encapsular as chamadas de API
export class ApiService {
  // Dashboard
  static async getDashboardStats(): Promise<DashboardStat[]> {
    const response = await fetch("/api/dashboard/stats")
    if (!response.ok) throw new Error("Failed to fetch dashboard stats")
    return response.json()
  }

  static async getRecentActivities(): Promise<Activity[]> {
    const response = await fetch("/api/dashboard/activities")
    if (!response.ok) throw new Error("Failed to fetch recent activities")
    return response.json()
  }

  static async getQuickActions(): Promise<QuickAction[]> {
    const response = await fetch("/api/dashboard/quick-actions")
    if (!response.ok) throw new Error("Failed to fetch quick actions")
    return response.json()
  }

  static async getMarketplaceSummary(): Promise<MarketplaceSummary> {
    const response = await fetch("/api/dashboard/summary")
    if (!response.ok) throw new Error("Failed to fetch marketplace summary")
    return response.json()
  }

  // Marketplace
  static async getAvailablePorts(search?: string): Promise<AvailablePort[]> {
    const url = search
      ? `/api/marketplace/available?search=${encodeURIComponent(search)}`
      : "/api/marketplace/available"

    const response = await fetch(url)
    if (!response.ok) throw new Error("Failed to fetch available ports")
    return response.json()
  }

  static async getMyListings(): Promise<MyListing[]> {
    const response = await fetch("/api/marketplace/my-listings")
    if (!response.ok) throw new Error("Failed to fetch my listings")
    return response.json()
  }

  static async getMyRentals(): Promise<MyRental[]> {
    const response = await fetch("/api/marketplace/my-rentals")
    if (!response.ok) throw new Error("Failed to fetch my rentals")
    return response.json()
  }

  static async getPortDetails(id: string): Promise<AvailablePort> {
    const response = await fetch(`/api/marketplace/available/${id}`)
    if (!response.ok) throw new Error("Failed to fetch port details")
    return response.json()
  }

  static async getListingDetails(id: string): Promise<MyListing> {
    const response = await fetch(`/api/marketplace/my-listings/${id}`)
    if (!response.ok) throw new Error("Failed to fetch listing details")
    return response.json()
  }

  static async createListing(data: CreateListingData): Promise<MyListing> {
    const response = await fetch("/api/marketplace/my-listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) throw new Error("Failed to create listing")
    return response.json()
  }

  static async updateListing(id: string, data: Partial<MyListing>): Promise<MyListing> {
    const response = await fetch(`/api/marketplace/my-listings/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) throw new Error("Failed to update listing")
    return response.json()
  }

  static async deleteListing(id: string): Promise<{ id: string; deleted: boolean }> {
    const response = await fetch(`/api/marketplace/my-listings/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) throw new Error("Failed to delete listing")
    return response.json()
  }

  // Usuários
  static async getUsers(search?: string, role?: string, status?: string): Promise<User[]> {
    let url = "/api/users"
    const params = new URLSearchParams()

    if (search) params.append("search", search)
    if (role && role !== "all") params.append("role", role)
    if (status) params.append("status", status)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await fetch(url)
    if (!response.ok) throw new Error("Failed to fetch users")
    return response.json()
  }

  static async getUserById(id: string): Promise<User> {
    const response = await fetch(`/api/users/${id}`)
    if (!response.ok) throw new Error("Failed to fetch user")
    return response.json()
  }

  static async createUser(data: CreateUserData): Promise<User> {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create user")
    }
    return response.json()
  }

  static async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) throw new Error("Failed to update user")
    return response.json()
  }

  static async deleteUser(id: string): Promise<{ id: string; deleted: boolean }> {
    const response = await fetch(`/api/users/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) throw new Error("Failed to delete user")
    return response.json()
  }
}
