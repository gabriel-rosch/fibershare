import axios from 'axios';
import { tokenService } from './tokenService';

// Defina a URL base da sua nova API backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token em todas as requisições
apiClient.interceptors.request.use((config) => {
  const token = tokenService.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenService.remove();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Funções de serviço para autenticação
export const register = (userData: any) => apiClient.post('/auth/register', userData);
export const login = (data: { email: string; password: string }) => apiClient.post('/auth/login', data);
export const getUserProfile = () => apiClient.get('/users/profile');
export const updateUserProfile = (profileData: any) => apiClient.put('/users/profile', profileData);

// Funções de serviço para CTOs
export const fetchCTOs = () => apiClient.get('/ctos');
export const fetchCTODetails = (id: string) => apiClient.get(`/ctos/${id}`);
export const createCTO = (ctoData: any) => apiClient.post('/ctos', ctoData);
export const updateCTO = (id: string, ctoData: any) => apiClient.put(`/ctos/${id}`, ctoData);
export const deleteCTO = (id: string) => apiClient.delete(`/ctos/${id}`);

// Funções de serviço para Portas de CTO
export const fetchPortsByCTO = (ctoId: string) => apiClient.get(`/ports/cto/${ctoId}`);
export const fetchPortDetails = (portId: string) => apiClient.get(`/ports/${portId}`);
export const createCTOPort = (ctoId: string, portData: any) => apiClient.post(`/ports/cto/${ctoId}`, portData);
export const updateCTOPort = (portId: string, portData: any) => apiClient.put(`/ports/${portId}`, portData);
export const deleteCTOPort = (portId: string) => apiClient.delete(`/ports/${portId}`);

// Funções de serviço para Ordens de Serviço (Genéricas)
export const fetchServiceOrders = (params?: any) => apiClient.get('/service-orders', { params });
export const fetchServiceOrderDetails = (orderId: string) => apiClient.get(`/service-orders/${orderId}`);
export const createServiceOrder = (orderData: any) => apiClient.post('/service-orders', orderData);
export const updateServiceOrderStatus = (orderId: string, updateData: any) => apiClient.patch(`/service-orders/${orderId}/status`, updateData);
export const addServiceOrderNote = (orderId: string, noteData: any) => apiClient.post(`/service-orders/${orderId}/notes`, noteData);

// Funções de serviço para Ordens de Serviço de Porta
export const fetchPortServiceOrders = (params?: any) => apiClient.get('/port-orders', { params });
export const fetchPortServiceOrderDetails = (orderId: string) => apiClient.get(`/port-orders/${orderId}`);
export const createPortServiceOrder = (orderData: any) => apiClient.post('/port-orders', orderData);
export const updatePortServiceOrderStatus = (orderId: string, updateData: any) => apiClient.patch(`/port-orders/${orderId}/status`, updateData);
export const addPortServiceOrderNote = (orderId: string, noteData: any) => apiClient.post(`/port-orders/${orderId}/notes`, noteData);

// Funções de serviço para Chat
export const sendMessage = (messageData: any) => apiClient.post('/chat/messages', messageData);
export const fetchConversation = (otherUserId: string) => apiClient.get(`/chat/conversations/${otherUserId}`);
export const fetchContacts = () => apiClient.get('/chat/contacts');

// Funções de serviço para Dashboard
export const fetchDashboardStats = () => apiClient.get('/dashboard/stats');
export const fetchDashboardActivities = (params?: any) => apiClient.get('/dashboard/activities', { params });
export const fetchDashboardQuickActions = () => apiClient.get('/dashboard/quick-actions');
export const fetchDashboardSummary = () => apiClient.get('/dashboard/summary');

// Adicione outras funções de serviço conforme necessário (ex: Marketplace)

export default apiClient;

