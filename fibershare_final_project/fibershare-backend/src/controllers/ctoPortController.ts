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
    console.log('🔍 Buscando portas para CTO ID:', ctoId);
    
    const ports = await ctoPortService.getPortsByCTO(ctoId);
    console.log('✅ Portas encontradas:', ports.ports?.length || 0);
    
    // Retornar o array de portas diretamente
    res.status(200).json(ports);
  } catch (error) {
    console.error('❌ Erro ao buscar portas da CTO:', error);
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

    console.log('🔄 Atualizando porta:', portId, 'Dados:', req.body);

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const validation = updatePortSchema.safeParse(req.body);
    if (!validation.success) {
      console.log('❌ Dados inválidos:', validation.error.errors);
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: validation.error.errors
      });
    }

    console.log('✅ Dados validados, atualizando porta...');
    const port = await ctoPortService.updateCTOPort(portId, validation.data, userId);
    console.log('✅ Porta atualizada:', port);
    
    res.status(200).json(port);
  } catch (error) {
    console.error('❌ Erro ao atualizar porta:', error);
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

export const reserveCTOPort = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { portId } = req.params;
    const userId = req.user?.userId;

    console.log('🎯 Reservando porta:', portId, 'Usuário:', userId);

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Atualizar o status da porta para "reserved"
    const port = await ctoPortService.updateCTOPort(portId, { status: 'reserved' }, userId);
    console.log('✅ Porta reservada com sucesso:', port);
    
    res.status(200).json({
      message: 'Porta reservada com sucesso',
      port
    });
  } catch (error) {
    console.error('❌ Erro ao reservar porta:', error);
    next(error);
  }
};
