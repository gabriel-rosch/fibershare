import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { userService } from '../services/userService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { authService } from '../services/authService';

// Schemas de validação
const createUserSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  role: z.enum(["admin", "operator_admin", "operator_user", "client"], {
    errorMap: () => ({ message: "Função inválida" })
  }),
  status: z.enum(["active", "inactive"], {
    errorMap: () => ({ message: "Status inválido" })
  }).optional(),
  operatorId: z.string().uuid({ message: "ID da operadora inválido" }).optional()
});

const updateUserSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }).optional(),
  email: z.string().email({ message: "Email inválido" }).optional(),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }).optional(),
  role: z.enum(["admin", "operator_admin", "operator_user", "client"], {
    errorMap: () => ({ message: "Função inválida" })
  }).optional(),
  status: z.enum(["active", "inactive"], {
    errorMap: () => ({ message: "Status inválido" })
  }).optional(),
  operatorId: z.string().uuid({ message: "ID da operadora inválido" }).optional().nullable()
});

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, role, operatorId } = req.query;
    
    const users = await userService.getUsers(
      search as string | undefined,
      role as string | undefined,
      operatorId as string | undefined
    );
    
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = createUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: validation.error.errors
      });
    }
    
    const user = await userService.createUser(validation.data);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const validation = updateUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: validation.error.errors
      });
    }
    
    const user = await userService.updateUser(id, validation.data);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Adicionei esta função para o endpoint /api/auth/profile
export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const userProfile = await authService.getUserProfile(userId);
    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    next(error);
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;
  const { name, email } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  try {
    const updatedUser = await userService.updateUser(userId, { name, email });
    res.status(200).json({ message: 'Perfil atualizado com sucesso!', user: updatedUser });
  } catch (error) {
    next(error);
  }
};

