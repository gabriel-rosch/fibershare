import axios from 'axios';
import { tokenService } from './tokenService';

// Criação da instância do axios com configuração base
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use((config) => {
  const token = tokenService.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorCode = error.response.data?.code;
      // Redirecionar apenas em caso de token inválido ou expirado, não em caso de 'Usuário não encontrado' durante o login
      if (errorCode === 'token_expired' || errorCode === 'token_invalid' || errorCode === 'token_missing') {
        tokenService.remove();
        if (typeof window !== "undefined") {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// API de autenticação
export const login = async (credentials: { email: string; password: string }) => {
  return api.post('/auth/login', credentials);
};

export const register = async (userData: any) => {
  return api.post('/auth/register', userData);
};

export const getUserProfile = async () => {
  return api.get('/auth/profile');
};

// API de CTOs e portas
export const getCTOs = async (params?: any) => {
  return api.get('/ctos', { params });
};

export const getCTOById = async (id: string) => {
  return api.get(`/ctos/${id}`);
};

export const createCTO = async (data: any) => {
  return api.post('/ctos', data);
};

export const updateCTO = async (id: string, data: any) => {
  return api.put(`/ctos/${id}`, data);
};

export const deleteCTO = async (id: string) => {
  return api.delete(`/ctos/${id}`);
};

export const getPortsByCTO = async (ctoId: string) => {
  return api.get(`/ports/cto/${ctoId}`);
};

export const getPortDetails = async (portId: string) => {
  return api.get(`/ports/${portId}`);
};

export const createPort = async (ctoId: string, data: any) => {
  return api.post(`/ports/cto/${ctoId}`, data);
};

export const updatePort = async (portId: string, data: any) => {
  return api.put(`/ports/${portId}`, data);
};

export const deletePort = async (portId: string) => {
  return api.delete(`/ports/${portId}`);
};

// API de operadoras
export const getOperators = async (params?: any) => {
  return api.get('/operators', { params });
};

export const getOperatorById = async (id: string) => {
  return api.get(`/operators/${id}`);
};

// API de ordens de serviço
export const getServiceOrders = async (params?: any) => {
  return api.get('/service-orders', { params });
};

export const createServiceOrder = async (data: any) => {
  return api.post('/service-orders', data);
};

export const updateServiceOrder = async (id: string, data: any) => {
  return api.put(`/service-orders/${id}`, data);
};

// API de ordens de serviço de portas
export const getPortOrders = async (params?: any) => {
  return api.get('/port-orders', { params });
};

export const createPortOrder = async (data: any) => {
  return api.post('/port-orders', data);
};

export const updatePortOrder = async (id: string, data: any) => {
  return api.put(`/port-orders/${id}`, data);
};

// API de Dashboard
export const fetchDashboardStats = async () => {
  return api.get('/dashboard/stats');
};

export const fetchDashboardActivities = async (params?: any) => {
  return api.get('/dashboard/activities', { params });
};

export const fetchDashboardQuickActions = async () => {
  return api.get('/dashboard/quick-actions');
};

export const fetchDashboardSummary = async () => {
  return api.get('/dashboard/summary');
};

// Exportar a instância do axios para uso direto em casos específicos
export default api;

