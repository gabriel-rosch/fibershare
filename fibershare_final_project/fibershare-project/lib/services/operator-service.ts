import type { Operator } from "@/lib/interfaces/service-interfaces"
import { getOperators as fetchOperators, getOperatorById as fetchOperatorById } from '../apiClient';
import apiClient from '../apiClient';
import { toast } from '@/components/ui/use-toast';

export const operatorService = {
  getOperators: async () => {
    try {
      const response = await fetchOperators();
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar operadoras:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de operadoras.",
        variant: "destructive"
      });
      return [];
    }
  },

  getOperatorById: async (id: string) => {
    try {
      const response = await fetchOperatorById(id);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar operadora:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da operadora.",
        variant: "destructive"
      });
      throw error;
    }
  },

  createOperator: async (data: Partial<Operator>) => {
    try {
      const response = await apiClient.post('/operators', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar operadora:', error);
      throw error;
    }
  },

  updateOperator: async (id: string, data: Partial<Operator>) => {
    try {
      const response = await apiClient.put(`/operators/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar operadora:', error);
      throw error;
    }
  },

  deleteOperator: async (id: string) => {
    try {
      await apiClient.delete(`/operators/${id}`);
    } catch (error) {
      console.error('Erro ao deletar operadora:', error);
      throw error;
    }
  }
};
