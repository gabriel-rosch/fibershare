import { PrismaClient, Prisma } from '@prisma/client';
import { NotFoundError, ForbiddenError, BadRequestError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

interface CreateCTOData {
  name: string;
  totalPorts: number;
  status: string;
  latitude: number;
  longitude: number;
  operatorId: string;
}

export const ctoService = {
  getAllCTOs: async (search?: string, status?: string, operatorId?: string) => {
    const where: Prisma.CTOWhereInput = {};
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    
    if (status) {
      where.status = status;
    }
    
    if (operatorId) {
      where.operatorId = operatorId;
    }
    
    const ctos = await prisma.cTO.findMany({
      where,
      include: {
        operator: {
          select: {
            name: true,
          },
        },
      },
    });
    
    return ctos.map(cto => ({
      ...cto,
      location: {
        lat: cto.latitude,
        lng: cto.longitude,
      },
    }));
  },
  
  getCTODetails: async (id: string) => {
    const cto = await prisma.cTO.findUnique({
      where: { id },
      include: {
        operator: {
          select: {
            name: true,
          },
        },
        ports: {
          orderBy: {
            number: 'asc',
          },
        },
      },
    });
    
    if (!cto) {
      throw new NotFoundError('CTO');
    }
    
    return {
      ...cto,
      location: {
        lat: cto.latitude,
        lng: cto.longitude,
      },
    };
  },
  
  createCTO: async (data: CreateCTOData, userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { operator: true }
    });
    
    if (!user?.operatorId) {
      throw new ForbiddenError('Usuário não está vinculado a uma operadora');
    }
    
    if (user.operatorId !== data.operatorId) {
      throw new ForbiddenError('Usuário não pode criar CTO para outra operadora');
    }
    
    if (data.totalPorts < 1) {
      throw new BadRequestError('Número de portas deve ser maior que zero');
    }
    
    // Criar a CTO e suas portas em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar a CTO
      const cto = await tx.cTO.create({
        data: {
          name: data.name,
          totalPorts: data.totalPorts,
          status: data.status,
          latitude: data.latitude,
          longitude: data.longitude,
          operatorId: data.operatorId,
          occupiedPorts: 0,
        }
      });
      
      // Criar as portas da CTO
      const ports = Array.from({ length: data.totalPorts }, (_, i) => ({
        ctoId: cto.id,
        number: i + 1,
        status: 'available',
      }));
      
      await tx.cTOPort.createMany({
        data: ports,
      });
      
      return cto;
    });
    
    return {
      ...result,
      location: {
        lat: result.latitude,
        lng: result.longitude,
      },
    };
  },
  
  updateCTO: async (id: string, data: Partial<CreateCTOData>, userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { operator: true }
    });
    
    const cto = await prisma.cTO.findUnique({ 
      where: { id },
      include: { ports: true }
    });
    
    if (!cto) {
      throw new NotFoundError('CTO');
    }
    
    if (!user?.operatorId || user.operatorId !== cto.operatorId) {
      throw new ForbiddenError('Usuário não autorizado a atualizar esta CTO');
    }
    
    // Se estiver atualizando o número de portas
    if (data.totalPorts !== undefined && data.totalPorts !== cto.totalPorts) {
      if (data.totalPorts < cto.totalPorts) {
        // Verificar se há portas ocupadas que seriam removidas
        const highestPortNumber = await prisma.cTOPort.findFirst({
          where: {
            ctoId: id,
            status: { in: ['occupied', 'reserved', 'maintenance'] },
          },
          orderBy: { number: 'desc' },
          select: { number: true },
        });
        
        if (highestPortNumber && highestPortNumber.number > data.totalPorts) {
          throw new BadRequestError('Não é possível reduzir o número de portas pois existem portas ocupadas com número maior que o novo total');
        }
        
        // Remover portas excedentes
        await prisma.cTOPort.deleteMany({
          where: {
            ctoId: id,
            number: { gt: data.totalPorts },
          },
        });
      } else {
        // Adicionar novas portas
        const newPorts = Array.from(
          { length: data.totalPorts - cto.totalPorts },
          (_, i) => ({
            ctoId: id,
            number: cto.totalPorts + i + 1,
            status: 'available',
          })
        );
        
        await prisma.cTOPort.createMany({
          data: newPorts,
        });
      }
    }
    
    // Atualizar a CTO
    const updateData: Prisma.CTOUpdateInput = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.totalPorts !== undefined) updateData.totalPorts = data.totalPorts;
    
    const updatedCTO = await prisma.cTO.update({
      where: { id },
      data: updateData,
    });
    
    return {
      ...updatedCTO,
      location: {
        lat: updatedCTO.latitude,
        lng: updatedCTO.longitude,
      },
    };
  },
  
  deleteCTO: async (id: string, userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { operator: true }
    });
    
    const cto = await prisma.cTO.findUnique({ 
      where: { id }, 
      include: { operator: true } 
    });
    
    if (!cto) {
      throw new NotFoundError('CTO');
    }
    
    if (!user?.operatorId || user.operatorId !== cto.operatorId) {
      throw new ForbiddenError('Usuário não autorizado a deletar esta CTO');
    }
    
    const ports = await prisma.cTOPort.findMany({ 
      where: { ctoId: id, status: 'occupied' } 
    });
    
    if (ports.length > 0) {
      throw new BadRequestError('Não é possível deletar CTO com portas ocupadas');
    }
    
    await prisma.$transaction(async (tx) => {
      const portOrders = await tx.portServiceOrder.findMany({ 
        where: { port: { ctoId: id } } 
      });
      
      const portOrderIds = portOrders.map((po) => po.id);
      
      if (portOrderIds.length > 0) {
        await tx.portOrderNote.deleteMany({ 
          where: { orderId: { in: portOrderIds } } 
        });
      }
      
      await tx.portServiceOrder.deleteMany({ 
        where: { port: { ctoId: id } } 
      });
      
      await tx.cTOPort.deleteMany({ 
        where: { ctoId: id } 
      });
      
      await tx.cTO.delete({ 
        where: { id } 
      });
    });
    
    return true;
  }
}; 