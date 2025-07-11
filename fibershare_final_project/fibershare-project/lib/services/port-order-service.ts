import type { PortServiceOrder, PortOrderStatus } from "@/lib/interfaces/service-interfaces"
import apiClient from '@/lib/apiClient';

export interface CreatePortOrderData {
  ctoId: string
  ctoName: string
  portNumber: number
  price: number
  installationFee: number
  targetId: string
  targetName: string
}

export interface UpdatePortOrderData {
  status?: PortOrderStatus
  scheduledDate?: string
  contractSignedByRequester?: boolean
  contractSignedByOwner?: boolean
  note?: string
}



export const portOrderService = {
  getPortOrders: async (
    status?: PortOrderStatus,
    direction?: "incoming" | "outgoing" | "all",
    ctoId?: string,
    search?: string
  ) => {
    const response = await apiClient.get('/port-orders', { params: { status, direction, ctoId, search } });
    return response.data;
  },

  getPortOrderById: async (id: string) => {
    const response = await apiClient.get(`/port-orders/${id}`);
    return response.data;
  },

  createPortOrder: async (data: any) => {
    const response = await apiClient.post('/port-orders', data);
    return response.data;
  },

  updatePortOrder: async (id: string, data: any) => {
    const response = await apiClient.put(`/port-orders/${id}`, data);
    return response.data;
  },

  addNoteToOrder: async (id: string, content: string) => {
    const response = await apiClient.post(`/port-orders/${id}/notes`, { content });
    return response.data;
  }
};

export class PortOrderService {
  static async getPortOrders(
    status?: PortOrderStatus,
    direction: "incoming" | "outgoing" | "all" = "all",
    ctoId?: string,
    search?: string,
  ): Promise<PortServiceOrder[]> {
    try {
      const response = await apiClient.get('/port-orders', {
        params: { status, direction, ctoId, search }
      });
      return response.data;
    } catch (error) {
      console.error("PortOrderService.getPortOrders error:", error);
      throw error;
    }
  }

  static async getPortOrderById(id: string): Promise<PortServiceOrder> {
    const response = await apiClient.get(`/port-orders/${id}`);
    return response.data;
  }

  static async createPortOrder(data: CreatePortOrderData): Promise<PortServiceOrder> {
    const response = await apiClient.post('/port-orders', data);
    return response.data;
  }

  static async updatePortOrder(id: string, data: UpdatePortOrderData): Promise<PortServiceOrder> {
    const response = await apiClient.put(`/port-orders/${id}`, data);
    return response.data;
  }

  static async addNoteToOrder(id: string, content: string): Promise<void> {
    const response = await apiClient.post(`/port-orders/${id}/notes`, { content });
    return response.data;
  }
}
