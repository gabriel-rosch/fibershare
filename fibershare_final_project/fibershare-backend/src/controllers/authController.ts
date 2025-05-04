import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { z } from 'zod';
import { authService } from '../services/authService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { userService } from '../services/userService';

dotenv.config();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

// Schemas de validação
const registerSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  role: z.enum(["admin", "operator_admin", "operator_user", "client"], {
    errorMap: () => ({ message: "Função inválida" })
  }),
  operatorId: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "Senha é obrigatória" })
});

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar dados de entrada
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validation.error.errors 
      });
    }

    const userData = validation.data;
    
    // Verificar regras específicas
    if ((userData.role === 'operator_admin' || userData.role === 'operator_user') && !userData.operatorId) {
      return res.status(400).json({ 
        message: 'Operadora é obrigatória para usuários de operadora' 
      });
    }

    // Chamar o serviço
    const user = await authService.registerUser(userData);

    // Retornar resposta
    res.status(201).json({ 
      message: 'Usuário registrado com sucesso!', 
      user 
    });
  } catch (error) {
    next(error);
  }
};

const generateToken = (user: any) => {
  return jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      role: user.role,
      operatorId: user.operatorId
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar dados de entrada
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validation.error.errors 
      });
    }

    // Chamar o serviço
    const { token, user } = await authService.loginUser(validation.data);

    // Retornar resposta
    res.status(200).json({ 
      token, 
      user,
      message: 'Login realizado com sucesso!' 
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    
    // Adicione logs para depuração
    console.log('Buscando perfil do usuário:', userId);
    
    const userProfile = await userService.getUserProfile(userId);
    
    // Adicione logs para depuração
    console.log('Perfil encontrado:', userProfile ? 'Sim' : 'Não');
    
    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    next(error);
  }
};

