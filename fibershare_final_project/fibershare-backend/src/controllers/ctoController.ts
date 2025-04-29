import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

// Criar nova CTO
export const createCTO = async (req: AuthRequest, res: Response) => {
  const { name, description, totalPorts, latitude, longitude, region } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  try {
    // Buscar o usuário e verificar se pertence a uma operadora
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { operator: true }
    });

    if (!user || !user.operatorId || !user.operator) {
      return res.status(403).json({ message: 'Usuário não está associado a uma operadora.' });
    }

    // Verificar se o usuário tem permissão (operator_admin)
    if (user.role !== 'operator_admin') {
      return res.status(403).json({ message: 'Usuário não tem permissão para criar CTOs.' });
    }

    const cto = await prisma.cTO.create({
      data: {
        name,
        description,
        totalPorts,
        occupiedPorts: 0,
        latitude,
        longitude,
        region,
        operatorId: user.operatorId
      }
    });

    res.status(201).json(cto);
  } catch (error) {
    console.error('Erro ao criar CTO:', error);
    res.status(500).json({ message: 'Erro interno ao criar CTO.' });
  }
};

// Listar todas as CTOs
export const getAllCTOs = async (req: Request, res: Response) => {
  try {
    const ctos = await prisma.cTO.findMany({
      include: { operator: true, ports: true },
    });
    res.status(200).json(ctos);
  } catch (error) {
    console.error('Erro ao listar CTOs:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao listar CTOs.' });
  }
};

// Obter detalhes de uma CTO específica
export const getCTODetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const cto = await prisma.cTO.findUnique({
      where: { id },
      include: { operator: true, ports: true },
    });
    if (!cto) {
      return res.status(404).json({ message: 'CTO não encontrada.' });
    }
    res.status(200).json(cto);
  } catch (error) {
    console.error('Erro ao buscar detalhes da CTO:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar detalhes da CTO.' });
  }
};

// Atualizar uma CTO
export const updateCTO = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, totalPorts, latitude, longitude, region, status } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { operator: true }
    });

    const cto = await prisma.cTO.findUnique({ 
      where: { id },
      include: { operator: true }
    });

    if (!cto) {
      return res.status(404).json({ message: 'CTO não encontrada.' });
    }

    if (!user?.operatorId || user.operatorId !== cto.operatorId) {
      return res.status(403).json({ message: 'Usuário não autorizado a modificar esta CTO.' });
    }

    if (totalPorts !== undefined && totalPorts < cto.occupiedPorts) {
        return res.status(400).json({ message: 'Número total de portas não pode ser menor que o número de portas ocupadas.' });
    }

    const updatedCTO = await prisma.cTO.update({
      where: { id },
      data: {
        name,
        description,
        totalPorts,
        latitude,
        longitude,
        region,
        status,
      },
    });
    res.status(200).json(updatedCTO);
  } catch (error) {
    console.error('Erro ao atualizar CTO:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar CTO.' });
  }
};

// Deletar uma CTO
export const deleteCTO = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { operator: true }
    });

    const cto = await prisma.cTO.findUnique({ where: { id }, include: { operator: true } });
    if (!cto) {
      return res.status(404).json({ message: 'CTO não encontrada.' });
    }
    if (!user?.operatorId || user.operatorId !== cto.operatorId) {
        return res.status(403).json({ message: 'Usuário não autorizado a deletar esta CTO.' });
    }

    const ports = await prisma.cTOPort.findMany({ where: { ctoId: id, status: 'occupied' } });
    if (ports.length > 0) {
         return res.status(400).json({ message: 'Não é possível deletar CTO com portas ocupadas.' });
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const portOrders = await tx.portServiceOrder.findMany({ where: { port: { ctoId: id } } });
        const portOrderIds = portOrders.map((po: any) => po.id);
        if (portOrderIds.length > 0) {
            await tx.portOrderNote.deleteMany({ where: { orderId: { in: portOrderIds } } });
        }
        await tx.portServiceOrder.deleteMany({ where: { port: { ctoId: id } } });
        await tx.cTOPort.deleteMany({ where: { ctoId: id } });
        await tx.cTO.delete({ where: { id } });
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar CTO:', error);
    // Corrigir verificação de erro do Prisma
    if (error instanceof PrismaClientKnownRequestError && (error as any).code === 'P2003') {
         return res.status(400).json({ message: 'Não é possível deletar a CTO pois existem recursos associados (ex: portas, ordens de serviço).' });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao deletar CTO.' });
  }
};
