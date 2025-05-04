import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ctoService } from '../services/ctoService';
import { AuthRequest } from '../middlewares/authMiddleware';

// Schemas de validação
const createCTOSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  totalPorts: z.number().int().positive({ message: "Número de portas deve ser maior que zero" }),
  status: z.enum(['active', 'inactive', 'maintenance'], {
    errorMap: () => ({ message: "Status inválido" })
  }),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  })
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
    const validation = createCTOSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validation.error.errors 
      });
    }
    
    const { name, totalPorts, status, location } = validation.data;
    const operatorId = req.user?.operatorId;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    
    if (!operatorId) {
      return res.status(403).json({ 
        message: 'Usuário não está vinculado a uma operadora'
      });
    }
    
    const cto = await ctoService.createCTO({
      name,
      totalPorts,
      status,
      latitude: location.lat,
      longitude: location.lng,
      operatorId
    }, userId);
    
    res.status(201).json(cto);
  } catch (error) {
    next(error);
  }
};

export const updateCTO = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    
    const validation = updateCTOSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validation.error.errors 
      });
    }
    
    const { name, totalPorts, status, location } = validation.data;
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (totalPorts !== undefined) updateData.totalPorts = totalPorts;
    if (status !== undefined) updateData.status = status;
    if (location !== undefined) {
      updateData.latitude = location.lat;
      updateData.longitude = location.lng;
    }
    
    const updatedCTO = await ctoService.updateCTO(id, updateData, userId);
    
    res.status(200).json(updatedCTO);
  } catch (error) {
    next(error);
  }
};

export const deleteCTO = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    
    await ctoService.deleteCTO(id, userId);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
