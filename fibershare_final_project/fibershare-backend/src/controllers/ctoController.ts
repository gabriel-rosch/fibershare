import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthRequest } from '../middlewares/authMiddleware';

const prismaClient = new PrismaClient();

// Criar nova CTO
export const createCTO = async (req: AuthRequest, res: Response) => {
  try {
    const { name, totalPorts, status, location } = req.body;
    const operatorId = req.user?.operatorId;

    if (!operatorId) {
      return res.status(401).json({ error: 'Operadora não identificada' });
    }

    // Validações básicas
    if (!name || !totalPorts || !status || !location) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    if (totalPorts < 1) {
      return res.status(400).json({ error: 'Número de portas deve ser maior que zero' });
    }

    // Criar a CTO
    const cto = await prismaClient.cTO.create({
      data: {
        name,
        totalPorts,
        status,
        latitude: location.lat,
        longitude: location.lng,
        operatorId,
        occupiedPorts: 0, // Inicialmente sem portas ocupadas
      }
    });

    // Criar as portas da CTO
    const ports = Array.from({ length: totalPorts }, (_, i) => ({
      ctoId: cto.id,
      number: i + 1,
      status: 'available',
    }));

    await prismaClient.cTOPort.createMany({
      data: ports
    });

    // Retornar a CTO criada com suas portas
    const ctoWithPorts = await prismaClient.cTO.findUnique({
      where: { id: cto.id },
      include: {
        ports: true
      }
    });

    return res.status(201).json(ctoWithPorts);
  } catch (error) {
    console.error('Erro ao criar CTO:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Listar todas as CTOs
export const getAllCTOs = async (req: Request, res: Response) => {
  try {
    const ctos = await prismaClient.cTO.findMany({
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
    const cto = await prismaClient.cTO.findUnique({
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
  const { name, totalPorts, latitude, longitude, status } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  try {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      include: { operator: true }
    });

    const cto = await prismaClient.cTO.findUnique({ 
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

    const updatedCTO = await prismaClient.cTO.update({
      where: { id },
      data: {
        name,
        totalPorts,
        latitude,
        longitude,
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
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      include: { operator: true }
    });

    const cto = await prismaClient.cTO.findUnique({ where: { id }, include: { operator: true } });
    if (!cto) {
      return res.status(404).json({ message: 'CTO não encontrada.' });
    }
    if (!user?.operatorId || user.operatorId !== cto.operatorId) {
        return res.status(403).json({ message: 'Usuário não autorizado a deletar esta CTO.' });
    }

    const ports = await prismaClient.cTOPort.findMany({ where: { ctoId: id, status: 'occupied' } });
    if (ports.length > 0) {
         return res.status(400).json({ message: 'Não é possível deletar CTO com portas ocupadas.' });
    }

    await prismaClient.$transaction(async (tx: Prisma.TransactionClient) => {
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
