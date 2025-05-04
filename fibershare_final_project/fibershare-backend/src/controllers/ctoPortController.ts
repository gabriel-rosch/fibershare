import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ctoPortService } from '../services/ctoPortService';
import { AuthRequest } from '../middlewares/authMiddleware';

// Schemas de validação
const createPortSchema = z.object({
  number: z.number().int().positive(),
  status: z.enum(['available', 'occupied', 'reserved', 'maintenance']),
  price: z.number().optional()
});

const updatePortSchema = z.object({
  status: z.enum(['available', 'occupied', 'reserved', 'maintenance']).optional(),
  clientId: z.string().optional(),
  price: z.number().optional()
});

export const getPortsByCTO = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ctoId } = req.params;
    const ports = await ctoPortService.getPortsByCTO(ctoId);
    
    // Certifique-se de retornar um array
    res.status(200).json(ports);
  } catch (error) {
    next(error);
  }
};

export const getPortDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { portId } = req.params;
    const port = await ctoPortService.getPortDetails(portId);
    res.status(200).json(port);
  } catch (error) {
    next(error);
  }
};

export const createCTOPort = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { ctoId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const validation = createPortSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: validation.error.errors
      });
    }

    const { number, status, price } = validation.data;
    const port = await ctoPortService.createCTOPort({
      ctoId,
      number,
      status,
      price
    }, userId);

    res.status(201).json(port);
  } catch (error) {
    next(error);
  }
};

export const updateCTOPort = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { portId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const validation = updatePortSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: validation.error.errors
      });
    }

    const port = await ctoPortService.updateCTOPort(portId, validation.data, userId);
    res.status(200).json(port);
  } catch (error) {
    next(error);
  }
};

export const deleteCTOPort = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { portId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    await ctoPortService.deleteCTOPort(portId, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
