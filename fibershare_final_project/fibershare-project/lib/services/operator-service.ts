import type { Operator } from "@/lib/interfaces/service-interfaces"
import apiClient from '@/lib/apiClient';

export const operatorService = {
  getOperators: async () => {
    try {
      const response = await apiClient.get('/operators');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar operadoras:', error);
      return [];
    }
  },

  getOperatorById: async (id: string) => {
    try {
      const response = await apiClient.get(`/operators/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar operadora:', error);
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
