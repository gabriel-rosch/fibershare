import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { userService } from '../services/userService';
import { AuthRequest } from '../middlewares/authMiddleware';

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
      search as string,
      role as string,
      operatorId as string
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

// Adicione estas funções específicas para rotas de perfil
export const getUserProfile = getUserById;
export const updateUserProfile = updateUser;

