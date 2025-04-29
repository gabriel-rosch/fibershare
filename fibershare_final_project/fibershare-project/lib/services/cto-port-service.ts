import apiClient from '@/lib/apiClient'
import type { CTOPort } from '@/lib/interfaces/service-interfaces'

export const ctoPortService = {
  getPortsByCTO: async (ctoId: string) => {
    const response = await apiClient.get(`/ports/cto/${ctoId}`)
    return response.data
  },

  updatePort: async (portId: string, data: Partial<CTOPort>) => {
    const response = await apiClient.put(`/ports/${portId}`, data)
    return response.data
  },

  createPort: async (ctoId: string, data: Partial<CTOPort>) => {
    const response = await apiClient.post(`/ports/cto/${ctoId}`, data)
    return response.data
  },

  deletePort: async (portId: string) => {
    const response = await apiClient.delete(`/ports/${portId}`)
    return response.data
  },

  getPortDetails: async (portId: string) => {
    const response = await apiClient.get(`/ports/${portId}`)
    return response.data
  },

  getPortsByCTOId: async (ctoId: string) => {
    const response = await apiClient.get(`/ports/cto/${ctoId}/details`);
    return {
      ports: response.data.ports,
      occupiedCount: response.data.occupiedCount
    };
  },

  reservePort: async (portId: string) => {
    const response = await apiClient.post(`/ports/${portId}/reserve`);
    return response.data;
  },

  getPortById: async (portId: string) => {
    const response = await apiClient.get(`/ports/${portId}`);
    return response.data;
  },

  // Adicione outros métodos conforme necessário
} 