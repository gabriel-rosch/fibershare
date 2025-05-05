import { getPortsByCTO, getPortDetails, createPort, updatePort, deletePort } from '../apiClient';
import { toast } from '@/components/ui/use-toast';
import type { CTOPort } from '@/lib/interfaces/service-interfaces'

export const ctoPortService = {
  getPortsByCTO: async (ctoId: string) => {
    const response = await getPortsByCTO(ctoId)
    return response.data
  },

  updatePort: async (portId: string, data: Partial<CTOPort>) => {
    const response = await updatePort(portId, data)
    return response.data
  },

  createPort: async (ctoId: string, data: Partial<CTOPort>) => {
    const response = await createPort(ctoId, data)
    return response.data
  },

  deletePort: async (portId: string) => {
    const response = await deletePort(portId)
    return response.data
  },

  getPortDetails: async (portId: string) => {
    const response = await getPortDetails(portId)
    return response.data
  },

  getPortsByCTOId: async (ctoId: string) => {
    try {
      const response = await getPortsByCTO(ctoId);
      
      // Verificar se response.data tem a estrutura esperada
      const ports = response.data.ports || [];
      const ctoInfo = response.data.cto || {};
      
      return {
        ports: ports,
        ctoInfo: ctoInfo,
        occupiedCount: ports.filter((port: any) => port.status === 'occupied').length
      };
    } catch (error) {
      console.error('Erro ao buscar portas da CTO:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as portas da CTO.",
        variant: "destructive"
      });
      return { ports: [], ctoInfo: {}, occupiedCount: 0 };
    }
  },

  reservePort: async (portId: string) => {
    const response = await getPortsByCTO(portId);
    return response.data;
  },

  getPortById: async (portId: string) => {
    const response = await getPortsByCTO(portId);
    return response.data;
  },

  // Adicione outros métodos conforme necessário
} 