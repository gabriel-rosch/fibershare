import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { serviceOrderService } from '../services/serviceOrderService';
import { AuthRequest } from '../middlewares/authMiddleware';

// Schemas de validação
const createOrderSchema = z.object({
  type: z.enum([
    'partnership_request',
    'maintenance',
    'installation',
    'cancellation',
    'support',
    'removal',
    'other'
  ]),
  title: z.string().min(3, { message: "Título deve ter pelo menos 3 caracteres" }),
  description: z.string().min(10, { message: "Descrição deve ter pelo menos 10 caracteres" }),
  targetId: z.string().uuid({ message: "ID do alvo inválido" })
});

const updateOrderSchema = z.object({
  status: z.enum([
    'pending',
    'in_progress',
    'completed',
    'rejected',
    'cancelled'
  ]).optional(),
  note: z.string().min(1).optional()
});

const addNoteSchema = z.object({
  content: z.string().min(1, { message: "Conteúdo da nota não pode ser vazio" })
});

export const getOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const { direction = 'all', type, status } = req.query;

    const orders = await serviceOrderService.getOrders(
      userId,
      direction as 'incoming' | 'outgoing' | 'all',
      type as any,
      status as any
    );

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const order = await serviceOrderService.getOrderById(id, userId);
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const validation = createOrderSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: validation.error.errors
      });
    }

    const { type, title, description, targetId } = validation.data;
    const order = await serviceOrderService.createOrder({
      type,
      title,
      description,
      requesterId: userId,
      targetId
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const validation = updateOrderSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: validation.error.errors
      });
    }

    const order = await serviceOrderService.updateOrderStatus(id, validation.data, userId);
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export const addNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
    const note = await serviceOrderService.addNote(id, content, userId);
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

export const getOrderDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    
    const order = await serviceOrderService.getOrderById(orderId, userId);
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

