import { PrismaClient, Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

interface CreatePortData {
  ctoId: string;
  number: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  price?: number;
}

interface UpdatePortData {
  status?: 'available' | 'occupied' | 'reserved' | 'maintenance';
  clientId?: string;
  price?: number;
}

export const ctoPortService = {
  getPortsByCTO: async (ctoId: string) => {
    console.log('🔍 Serviço: Buscando CTO com ID:', ctoId);
    
    const cto = await prisma.cTO.findUnique({
      where: { id: ctoId },
      include: {
        ports: {
          orderBy: { number: 'asc' }
        },
        operator: {
          select: { name: true }
        }
      }
    });

    console.log('📊 CTO encontrada:', cto ? 'Sim' : 'Não');
    
    if (!cto) {
      console.log('❌ CTO não encontrada com ID:', ctoId);
      throw new NotFoundError('CTO');
    }
    
    console.log('✅ CTO encontrada:', cto.name, 'Portas:', cto.ports.length);

    return {
      cto: {
        id: cto.id,
        name: cto.name,
        operatorName: cto.operator.name,
        totalPorts: cto.totalPorts,
        occupiedPorts: cto.occupiedPorts,
        status: cto.status,
        location: {
          lat: cto.latitude,
          lng: cto.longitude
        }
      },
      ports: cto.ports.map(port => ({
        id: port.id,
        number: port.number,
        status: port.status,
        clientId: port.clientId,
        price: port.price
      }))
    };
  },

  getPortDetails: async (portId: string) => {
    const port = await prisma.cTOPort.findUnique({
      where: { id: portId },
      include: {
        cto: {
          include: {
            operator: {
              select: { name: true }
            }
          }
        }
      }
    });

    if (!port) {
      throw new NotFoundError('Porta');
    }

    return {
      id: port.id,
      number: port.number,
      status: port.status,
      clientId: port.clientId,
      price: port.price,
      cto: {
        id: port.cto.id,
        name: port.cto.name,
        operatorName: port.cto.operator.name,
        location: {
          lat: port.cto.latitude,
          lng: port.cto.longitude
        }
      }
    };
  },

  createCTOPort: async (data: CreatePortData, userId: string) => {
    const { ctoId, number, status, price } = data;

    // Verificar se a CTO existe
    const cto = await prisma.cTO.findUnique({
      where: { id: ctoId },
      include: { operator: true }
    });

    if (!cto) {
      throw new NotFoundError('CTO');
    }

    // Verificar se o usuário pertence à operadora da CTO
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { operatorId: true }
    });

    if (!user || user.operatorId !== cto.operatorId) {
      throw new ForbiddenError('Usuário não autorizado a criar portas nesta CTO');
    }

    // Verificar se já existe uma porta com este número
    const existingPort = await prisma.cTOPort.findFirst({
      where: {
        ctoId,
        number
      }
    });

    if (existingPort) {
      throw new BadRequestError(`Já existe uma porta com o número ${number} nesta CTO`);
    }

    // Criar a porta
    const port = await prisma.cTOPort.create({
      data: {
        ctoId,
        number,
        status,
        price
      }
    });

    // Atualizar o contador de portas ocupadas se necessário
    if (status === 'occupied') {
      await prisma.cTO.update({
        where: { id: ctoId },
        data: {
          occupiedPorts: {
            increment: 1
          }
        }
      });
    }

    return port;
  },

  updateCTOPort: async (portId: string, data: UpdatePortData, userId: string) => {
    const { status, clientId, price } = data;

    // Verificar se a porta existe
    const port = await prisma.cTOPort.findUnique({
      where: { id: portId },
      include: {
        cto: {
          include: { operator: true }
        }
      }
    });

    if (!port) {
      throw new NotFoundError('Porta');
    }

    // Verificar se o usuário pertence à operadora da CTO
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { operatorId: true }
    });

    if (!user || user.operatorId !== port.cto.operatorId) {
      throw new ForbiddenError('Usuário não autorizado a atualizar esta porta');
    }

    // Preparar dados para atualização
    const updateData: Prisma.CTOPortUpdateInput = {};
    if (status !== undefined) updateData.status = status;
    if (clientId !== undefined) updateData.clientId = clientId;
    if (price !== undefined) updateData.price = price;

    // Atualizar contador de portas ocupadas se o status mudou
    if (status !== undefined && status !== port.status) {
      if (status === 'occupied' && port.status !== 'occupied') {
        await prisma.cTO.update({
          where: { id: port.ctoId },
          data: {
            occupiedPorts: {
              increment: 1
            }
          }
        });
      } else if (status !== 'occupied' && port.status === 'occupied') {
        await prisma.cTO.update({
          where: { id: port.ctoId },
          data: {
            occupiedPorts: {
              decrement: 1
            }
          }
        });
      }
    }

    // Atualizar a porta
    const updatedPort = await prisma.cTOPort.update({
      where: { id: portId },
      data: updateData
    });

    return updatedPort;
  },

  deleteCTOPort: async (portId: string, userId: string) => {
    // Verificar se a porta existe
    const port = await prisma.cTOPort.findUnique({
      where: { id: portId },
      include: {
        cto: {
          include: { operator: true }
        }
      }
    });

    if (!port) {
      throw new NotFoundError('Porta');
    }

    // Verificar se o usuário pertence à operadora da CTO
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { operatorId: true }
    });

    if (!user || user.operatorId !== port.cto.operatorId) {
      throw new ForbiddenError('Usuário não autorizado a deletar esta porta');
    }

    // Verificar se a porta está ocupada
    if (port.status === 'occupied') {
      throw new BadRequestError('Não é possível deletar uma porta ocupada');
    }

    // Verificar se existem ordens de serviço associadas
    const portOrders = await prisma.portServiceOrder.findMany({
      where: { portId }
    });

    if (portOrders.length > 0) {
      throw new BadRequestError('Não é possível deletar uma porta com ordens de serviço associadas');
    }

    // Deletar a porta
    await prisma.cTOPort.delete({
      where: { id: portId }
    });

    return true;
  }
}; 