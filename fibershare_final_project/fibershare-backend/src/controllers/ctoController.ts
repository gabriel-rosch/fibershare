import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ctoService } from '../services/ctoService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ForbiddenError, BadRequestError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

// Schemas de validação
const createCTOSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  description: z.string().optional(),
  totalPorts: z.number().int().positive({ message: "Número de portas deve ser maior que zero" }),
  latitude: z.number(),
  longitude: z.number(),
  region: z.string().optional(),
  status: z.enum(['active', 'inactive', 'maintenance']),
});

const updateCTOSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }).optional(),
  totalPorts: z.number().int().positive({ message: "Número de portas deve ser maior que zero" }).optional(),
  status: z.enum(['active', 'inactive', 'maintenance'], {
    errorMap: () => ({ message: "Status inválido" })
  }).optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional()
});

export const getAllCTOs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status, operatorId } = req.query;
    
    const ctos = await ctoService.getAllCTOs(
      search as string | undefined,
      status as string | undefined,
      operatorId as string | undefined
    );
    
    res.status(200).json(ctos);
  } catch (error) {
    next(error);
  }
};

export const getCTODetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const cto = await ctoService.getCTODetails(id);
    res.status(200).json(cto);
  } catch (error) {
    next(error);
  }
};

export const createCTO = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const operatorId = req.user?.operatorId;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    // Apenas 'admin' e 'operator_admin' podem criar CTOs
    if (userRole !== 'admin' && userRole !== 'operator_admin') {
      return res.status(403).json({ message: 'Permissão negada para criar CTOs.' });
    }

    if (!operatorId) {
        return res.status(403).json({ message: 'Usuário não está associado a uma operadora.' });
    }
    
    // Validar o corpo da requisição com Zod
    const validationResult = createCTOSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Dados inválidos', errors: validationResult.error.formErrors });
    }
    
    const ctoData = {
      ...validationResult.data,
      operatorId: operatorId, // Usa o operatorId do token do usuário
    };

    const cto = await ctoService.createCTO(ctoData, userId);
    res.status(201).json(cto);
  } catch (error) {
    next(error); // Passa o erro para o errorHandler centralizado
  }
};

export const updateCTO = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const dataToUpdate = req.body;
  const userId = req.user?.userId;

  if (!userId) {
      return next(new ForbiddenError('Usuário não autenticado.'));
  }

  try {
    const updatedCTO = await ctoService.updateCTO(id, dataToUpdate, userId);
    res.status(200).json(updatedCTO);
  } catch (error) {
    next(error);
  }
};

export const deleteCTO = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
      return next(new ForbiddenError('Usuário não autenticado.'));
  }

  try {
    await ctoService.deleteCTO(id, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
