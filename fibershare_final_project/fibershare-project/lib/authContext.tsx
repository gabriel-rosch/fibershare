"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login, register, getUserProfile } from '../lib/apiClient';
import { useRouter } from 'next/navigation';
import { tokenService } from './tokenService';
import { setCookie, deleteCookie } from 'cookies-next';

/**
 * AuthContext - Contexto de Autenticação
 * 
 * Este contexto gerencia o estado de autenticação global da aplicação.
 * Responsabilidades:
 * - Armazenar o usuário autenticado
 * - Fornecer métodos para login/logout
 * - Verificar automaticamente a autenticação ao iniciar a aplicação
 * - Redirecionar para login quando necessário
 */

interface AuthContextType {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    operatorId?: string;
    operator?: {
      id: string;
      name: string;
    };
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    operatorId?: string;
    operator?: {
      id: string;
      name: string;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (tokenService.isValid()) {
        try {
          const response = await getUserProfile();
          setUser(response.data);
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          tokenService.remove();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const loginUser = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await login({ email, password });
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Dados de autenticação inválidos');
      }

      tokenService.set(token);
      setCookie('authToken', token, {
        maxAge: 60 * 60, // 1 hora
        path: '/'
      });
      
      setUser(user);
      
      router.push('/dashboard');
      
      return user;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await register(userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = () => {
    tokenService.remove();
    deleteCookie('authToken');
    setUser(null);
    router.push('/login');
  };

  if (!isClient) {
    return null; // ou um loading state
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login: loginUser,
        register: registerUser,
        logout: logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
