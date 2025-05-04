import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

export const dashboardService = {
  getOperatorDashboard: async (operatorId: string) => {
    // Verificar se a operadora existe
    const operator = await prisma.operator.findUnique({
      where: { id: operatorId }
    });

    if (!operator) {
      throw new NotFoundError('Operadora');
    }

    // Buscar estatísticas de CTOs
    const ctoStats = await prisma.cTO.aggregate({
      where: { operatorId },
      _count: { id: true },
      _sum: { 
        totalPorts: true,
        occupiedPorts: true
      }
    });

    // Buscar estatísticas de ordens de serviço de portas
    const portOrderStats = await prisma.portServiceOrder.groupBy({
      by: ['status'],
      where: {
        port: {
          cto: {
            operatorId
          }
        }
      },
      _count: {
        id: true
      }
    });

    // Buscar atividades recentes
    const recentActivities = await prisma.activity.findMany({
      where: {
        OR: [
          { type: 'operator', details: { contains: operatorId } },
          { type: 'cto', details: { contains: operatorId } },
          { type: 'port', details: { contains: operatorId } },
          { type: 'port_order', details: { contains: operatorId } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Calcular porcentagem de ocupação
    const totalPorts = ctoStats._sum.totalPorts || 0;
    const occupiedPorts = ctoStats._sum.occupiedPorts || 0;
    const occupancyRate = totalPorts > 0 ? (occupiedPorts / totalPorts) * 100 : 0;

    // Formatar estatísticas de ordens
    const orderStatusCounts: Record<string, number> = {};
    portOrderStats.forEach(stat => {
      orderStatusCounts[stat.status] = stat._count.id;
    });

    return {
      ctoCount: ctoStats._count.id,
      totalPorts,
      occupiedPorts,
      availablePorts: totalPorts - occupiedPorts,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      portOrders: {
        pending: orderStatusCounts['pending'] || 0,
        approved: orderStatusCounts['approved'] || 0,
        rejected: orderStatusCounts['rejected'] || 0,
        cancelled: orderStatusCounts['cancelled'] || 0,
        inProgress: orderStatusCounts['in_progress'] || 0,
        completed: orderStatusCounts['completed'] || 0,
        total: Object.values(orderStatusCounts).reduce((sum, count) => sum + count, 0)
      },
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        action: activity.action,
        details: activity.details,
        type: activity.type,
        createdAt: activity.createdAt.toISOString()
      }))
    };
  },

  getClientDashboard: async (userId: string) => {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('Usuário');
    }

    // Buscar estatísticas de ordens de serviço de portas
    const portOrderStats = await prisma.portServiceOrder.groupBy({
      by: ['status'],
      where: {
        requesterId: userId
      },
      _count: {
        id: true
      }
    });

    // Buscar portas alugadas
    const rentedPorts = await prisma.cTOPort.findMany({
      where: {
        clientId: userId,
        status: 'occupied'
      },
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

    // Buscar atividades recentes
    const recentActivities = await prisma.activity.findMany({
      where: {
        OR: [
          { type: 'user', details: { contains: userId } },
          { type: 'port_order', details: { contains: userId } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Formatar estatísticas de ordens
    const orderStatusCounts: Record<string, number> = {};
    portOrderStats.forEach(stat => {
      orderStatusCounts[stat.status] = stat._count.id;
    });

    return {
      rentedPortsCount: rentedPorts.length,
      monthlySpending: rentedPorts.reduce((sum, port) => sum + (port.price || 0), 0),
      portOrders: {
        pending: orderStatusCounts['pending'] || 0,
        approved: orderStatusCounts['approved'] || 0,
        rejected: orderStatusCounts['rejected'] || 0,
        cancelled: orderStatusCounts['cancelled'] || 0,
        inProgress: orderStatusCounts['in_progress'] || 0,
        completed: orderStatusCounts['completed'] || 0,
        total: Object.values(orderStatusCounts).reduce((sum, count) => sum + count, 0)
      },
      rentedPorts: rentedPorts.map(port => ({
        id: port.id,
        number: port.number,
        price: port.price,
        ctoId: port.ctoId,
        ctoName: port.cto.name,
        operatorId: port.cto.operatorId,
        operatorName: port.cto.operator.name
      })),
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        action: activity.action,
        details: activity.details,
        type: activity.type,
        createdAt: activity.createdAt.toISOString()
      }))
    };
  }
}; 