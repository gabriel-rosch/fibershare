import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

// Criar nova porta para uma CTO específica
export const createCTOPort = async (req: AuthRequest, res: Response) => {
  const { ctoId } = req.params;
  const { portNumber, status = 'available', price = 0 } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  if (portNumber === undefined || status === undefined) {
    return res.status(400).json({ message: 'Número da porta e status são obrigatórios.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { operator: true }
    });

    const cto = await prisma.cTO.findUnique({ 
      where: { id: ctoId }, 
      include: { operator: true } 
    });

    if (!cto) {
      return res.status(404).json({ message: 'CTO não encontrada.' });
    }

    if (!user?.operatorId || user.operatorId !== cto.operatorId) {
      return res.status(403).json({ message: 'Usuário não autorizado a adicionar portas a esta CTO.' });
    }

    // Verificar se o número da porta já existe nesta CTO
    const existingPort = await prisma.cTOPort.findFirst({
        where: { ctoId, number: portNumber }
    });
    if (existingPort) {
        return res.status(409).json({ message: `Porta número ${portNumber} já existe nesta CTO.` });
    }

    // Verificar se adicionar esta porta excede o total de portas da CTO
    const currentPortCount = await prisma.cTOPort.count({ where: { ctoId: ctoId } });
    if (currentPortCount >= cto.totalPorts) {
        return res.status(400).json({ message: 'Não é possível adicionar mais portas, capacidade máxima da CTO atingida.' });
    }

    const newPort = await prisma.cTOPort.create({
      data: {
        ctoId,
        number: portNumber,
        status,
        price,
      },
    });

    // Atualizar contagem de portas ocupadas/disponíveis na CTO (se necessário, dependendo da lógica)
    // Exemplo: Se a porta for criada como 'occupied', incrementar occupiedPorts
    if (status === 'occupied' || status === 'reserved' || status === 'maintenance') {
        await prisma.cTO.update({
            where: { id: ctoId },
            data: { occupiedPorts: { increment: 1 } }
        });
    }

    res.status(201).json(newPort);
  } catch (error) {
    console.error('Erro ao criar porta de CTO:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar porta de CTO.' });
  }
};

// Listar todas as portas de uma CTO específica
export const getPortsByCTO = async (req: Request, res: Response) => {
  const { ctoId } = req.params;
  try {
    // Verificar se a CTO existe
    const ctoExists = await prisma.cTO.findUnique({ where: { id: ctoId } });
    if (!ctoExists) {
        return res.status(404).json({ message: 'CTO não encontrada.' });
    }

    const ports = await prisma.cTOPort.findMany({
      where: { ctoId },
      orderBy: { number: 'asc' }, // Mudado de portNumber para number
      // Incluir dados do inquilino atual se necessário
      // include: { currentTenant: true } // Depende de como 'currentTenantId' é mapeado
    });
    res.status(200).json(ports);
  } catch (error) {
    console.error('Erro ao listar portas da CTO:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao listar portas da CTO.' });
  }
};

// Obter detalhes de uma porta específica
export const getPortDetails = async (req: Request, res: Response) => {
  const { portId } = req.params; // Usar portId ou id dependendo da rota
  try {
    const port = await prisma.cTOPort.findUnique({
      where: { id: portId },
      include: { cto: { include: { operator: true } } } // Incluir detalhes da CTO e operador
    });
    if (!port) {
      return res.status(404).json({ message: 'Porta não encontrada.' });
    }
    res.status(200).json(port);
  } catch (error) {
    console.error('Erro ao buscar detalhes da porta:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar detalhes da porta.' });
  }
};

// Atualizar uma porta específica
export const updateCTOPort = async (req: AuthRequest, res: Response) => {
  const { portId } = req.params;
  const { status, price, address, plan, currentTenantId /* outros campos */ } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { operator: true }
    });

    const port = await prisma.cTOPort.findUnique({ where: { id: portId }, include: { cto: { include: { operator: true } } } });
    if (!port) {
      return res.status(404).json({ message: 'Porta não encontrada.' });
    }

    if (!user?.operatorId || user.operatorId !== port.cto.operatorId) {
      return res.status(403).json({ message: 'Usuário não autorizado a modificar esta porta.' });
    }

    // Lógica para atualizar contagem de portas ocupadas na CTO ao mudar o status
    let occupiedPortsIncrement = 0;
    const oldStatus = port.status;
    const newStatus = status;

    const wasOccupied = oldStatus === 'occupied' || oldStatus === 'reserved' || oldStatus === 'maintenance';
    const isOccupied = newStatus === 'occupied' || newStatus === 'reserved' || newStatus === 'maintenance';

    if (!wasOccupied && isOccupied) {
        occupiedPortsIncrement = 1;
    } else if (wasOccupied && !isOccupied) {
        occupiedPortsIncrement = -1;
    }

    const updatedPort = await prisma.cTOPort.update({
      where: { id: portId },
      data: {
        status,
        price
      },
    });

    // Atualizar contagem na CTO se o status mudou significativamente
    if (occupiedPortsIncrement !== 0) {
        await prisma.cTO.update({
            where: { id: port.ctoId },
            data: { occupiedPorts: { increment: occupiedPortsIncrement } }
        });
    }

    res.status(200).json(updatedPort);
  } catch (error) {
    console.error('Erro ao atualizar porta de CTO:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar porta de CTO.' });
  }
};

// Deletar uma porta específica
export const deleteCTOPort = async (req: AuthRequest, res: Response) => {
  const { portId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { operator: true }
    });

    const port = await prisma.cTOPort.findUnique({ where: { id: portId }, include: { cto: { include: { operator: true } } } });
    if (!port) {
      return res.status(404).json({ message: 'Porta não encontrada.' });
    }

    if (!user?.operatorId || user.operatorId !== port.cto.operatorId) {
      return res.status(403).json({ message: 'Usuário não autorizado a deletar esta porta.' });
    }

    // Verificar se a porta está ocupada ou reservada antes de deletar (regra de negócio)
    if (port.status === 'occupied' || port.status === 'reserved') {
      // Verificar se existem PortServiceOrders ativas para esta porta
      const activeOrders = await prisma.portServiceOrder.findMany({
          where: {
              portId: portId,
              NOT: { status: { in: ['completed', 'cancelled', 'rejected'] } }
          }
      });
      if (activeOrders.length > 0) {
          return res.status(400).json({ message: 'Não é possível deletar a porta pois existem ordens de serviço ativas associadas.' });
      }
    }

    const oldStatus = port.status;
    const wasOccupied = oldStatus === 'occupied' || oldStatus === 'reserved' || oldStatus === 'maintenance';

    // Usar transação para garantir consistência
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Deletar notas de ordens de serviço associadas
        const portOrders = await tx.portServiceOrder.findMany({ where: { portId: portId } });
        const portOrderIds = portOrders.map((po: any) => po.id);
        if (portOrderIds.length > 0) {
            await tx.portOrderNote.deleteMany({ where: { orderId: { in: portOrderIds } } });
        }
        // Deletar ordens de serviço associadas
        await tx.portServiceOrder.deleteMany({ where: { portId: portId } });
        // Deletar a porta
        await tx.cTOPort.delete({ where: { id: portId } });

        // Atualizar contagem na CTO se a porta estava ocupada/reservada/manutenção
        if (wasOccupied) {
            await tx.cTO.update({
                where: { id: port.ctoId },
                data: { occupiedPorts: { decrement: 1 } }
            });
        }
    });

    res.status(204).send(); // No content
  } catch (error) {
    console.error('Erro ao deletar porta de CTO:', error);
     if (error instanceof PrismaClientKnownRequestError && (error as any).code === 'P2003') {
         return res.status(400).json({ message: 'Não é possível deletar a porta pois existem recursos associados.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao deletar porta de CTO.' });
  }
};
