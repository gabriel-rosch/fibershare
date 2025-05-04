import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { portServiceOrderService } from '../services/portServiceOrderService';
import { AuthRequest } from '../middlewares/authMiddleware';

// Schemas de validação
const createPortOrderSchema = z.object({
  portId: z.string().uuid({ message: "ID da porta inválido" }),
  installationFee: z.number().nonnegative().optional(),
  scheduledDate: z.string().optional().transform(val => val ? new Date(val) : undefined)
});

const updatePortOrderSchema = z.object({
  status: z.enum([
    'pending',
    'approved',
    'rejected',
    'cancelled',
    'in_progress',
    'completed'
  ]).optional(),
  scheduledDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  contractSignedByRequester: z.boolean().optional(),
  contractSignedByOwner: z.boolean().optional()
});

const addNoteSchema = z.object({
  content: z.string().min(1, { message: "Conteúdo da nota não pode ser vazio" })
});

export const getPortOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const { direction = 'all', status } = req.query;

    const orders = await portServiceOrderService.getPortOrders(
      userId,
      direction as 'incoming' | 'outgoing' | 'all',
      status as any
    );

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const getPortOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const order = await portServiceOrderService.getPortOrderById(id, userId);
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export const createPortOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const validation = createPortOrderSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: validation.error.errors
      });
    }

    const { portId, installationFee, scheduledDate } = validation.data;
    const order = await portServiceOrderService.createPortOrder({
      portId,
      requesterId: userId,
      installationFee,
      scheduledDate
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const updatePortOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const validation = updatePortOrderSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: validation.error.errors
      });
    }

    const order = await portServiceOrderService.updatePortOrder(id, validation.data, userId);
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export const addNoteToOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const validation = addNoteSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: validation.error.errors
      });
    }

    const { content } = validation.data;
    const note = await portServiceOrderService.addNoteToOrder(id, content, userId);
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};
