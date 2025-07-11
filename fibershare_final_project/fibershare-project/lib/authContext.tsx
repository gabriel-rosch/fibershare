"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { login as apiLogin, getUserProfile, register as apiRegister } from '@/lib/apiClient'; // Renomeei para evitar conflito de nomes
import { tokenService } from './tokenService';
import { useToast } from '@/components/ui/use-toast';

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
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = tokenService.get();
      if (token) {
        try {
          const { data } = await getUserProfile();
          setUser(data);
        } catch (error) {
          console.error("Failed to fetch user profile, logging out.", error);
          tokenService.remove();
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await apiLogin({ email, password });
      tokenService.set(data.token);
      setUser(data.user);
      toast({ title: "Sucesso", description: "Login realizado com sucesso!" });
      router.push("/dashboard");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Falha ao fazer login. Verifique suas credenciais.";
      toast({
        title: "Erro no Login",
        description: errorMessage,
        variant: "destructive",
      });
      throw error; // Re-throw para que o componente saiba que falhou
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const { data } = await apiRegister(userData);
      toast({
        title: "Sucesso",
        description: "Conta criada com sucesso! Por favor, faça o login.",
      });
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Falha ao registrar. Tente novamente.";
      toast({
        title: "Erro no Registro",
        description: errorMessage,
        variant: "destructive",
      });
      throw error; // Re-throw para o componente
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    tokenService.remove();
    setUser(null);
    router.push('/login');
  };

  const value = {
    isAuthenticated: !!user,
    user,
    isLoading: loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
