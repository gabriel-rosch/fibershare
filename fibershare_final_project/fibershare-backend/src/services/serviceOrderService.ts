import { PrismaClient, Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

type ServiceOrderType = 'partnership_request' | 'maintenance' | 'installation' | 'cancellation' | 'support' | 'removal' | 'other';
type ServiceOrderStatus = 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';

interface CreateOrderData {
  type: ServiceOrderType;
  title: string;
  description: string;
  requesterId: string;
  targetId: string;
}

interface UpdateOrderData {
  status?: ServiceOrderStatus;
  note?: string;
}

export const serviceOrderService = {
  getOrders: async (
    userId: string,
    direction: 'incoming' | 'outgoing' | 'all' = 'all',
    type?: ServiceOrderType,
    status?: ServiceOrderStatus
  ) => {
    const where: Prisma.ServiceOrderWhereInput = {};

    if (direction === 'incoming') {
      where.targetId = userId;
    } else if (direction === 'outgoing') {
      where.requesterId = userId;
    } else {
      where.OR = [
        { requesterId: userId },
        { targetId: userId }
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const orders = await prisma.serviceOrder.findMany({
      where,
      include: {
        requester: {
          select: {
            name: true,
            email: true,
            operator: {
              select: {
                name: true
              }
            }
          }
        },
        target: {
          select: {
            name: true,
            email: true,
            operator: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return orders.map(order => ({
      id: order.id,
      type: order.type,
      status: order.status,
      title: order.title,
      description: order.description,
      requesterId: order.requesterId,
      requesterName: order.requester.name,
      requesterEmail: order.requester.email,
      requesterOperator: order.requester.operator?.name,
      targetId: order.targetId,
      targetName: order.target.name,
      targetEmail: order.target.email,
      targetOperator: order.target.operator?.name,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      completedAt: order.completedAt?.toISOString()
    }));
  },

  getOrderById: async (id: string, userId: string) => {
    const order = await prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        requester: {
          select: {
            name: true,
            email: true,
            operator: {
              select: {
                name: true
              }
            }
          }
        },
        target: {
          select: {
            name: true,
            email: true,
            operator: {
              select: {
                name: true
              }
            }
          }
        },
        notes: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!order) {
      throw new NotFoundError('Ordem de serviço');
    }

    // Verificar se o usuário tem acesso a esta ordem
    if (order.requesterId !== userId && order.targetId !== userId) {
      throw new ForbiddenError('Usuário não tem acesso a esta ordem de serviço');
    }

    return {
      id: order.id,
      type: order.type,
      status: order.status,
      title: order.title,
      description: order.description,
      requesterId: order.requesterId,
      requesterName: order.requester.name,
      requesterEmail: order.requester.email,
      requesterOperator: order.requester.operator?.name,
      targetId: order.targetId,
      targetName: order.target.name,
      targetEmail: order.target.email,
      targetOperator: order.target.operator?.name,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      completedAt: order.completedAt?.toISOString(),
      notes: order.notes.map(note => ({
        id: note.id,
        content: note.content,
        createdAt: note.createdAt.toISOString(),
        isSystemNote: note.isSystemNote,
        authorId: note.authorId,
        authorName: note.authorName
      }))
    };
  },

  createOrder: async (data: CreateOrderData) => {
    const { type, title, description, requesterId, targetId } = data;

    // Verificar se o solicitante existe
    const requester = await prisma.user.findUnique({
      where: { id: requesterId }
    });

    if (!requester) {
      throw new NotFoundError('Usuário solicitante');
    }

    // Verificar se o alvo existe
    const target = await prisma.user.findUnique({
      where: { id: targetId }
    });

    if (!target) {
      throw new NotFoundError('Usuário alvo');
    }

    // Criar a ordem de serviço
    const order = await prisma.serviceOrder.create({
      data: {
        type,
        status: 'pending',
        title,
        description,
        requesterId,
        targetId
      }
    });

    // Adicionar nota do sistema
    await prisma.serviceOrderNote.create({
      data: {
        orderId: order.id,
        content: `Ordem de serviço criada por ${requester.name}`,
        isSystemNote: true,
        authorId: requesterId,
        authorName: requester.name
      }
    });

    return order;
  },

  updateOrderStatus: async (id: string, data: UpdateOrderData, userId: string) => {
    const { status, note } = data;

    // Verificar se a ordem existe
    const order = await prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        requester: {
          select: { name: true }
        },
        target: {
          select: { name: true }
        }
      }
    });

    if (!order) {
      throw new NotFoundError('Ordem de serviço');
    }

    // Verificar se o usuário tem permissão para atualizar esta ordem
    if (order.requesterId !== userId && order.targetId !== userId) {
      throw new ForbiddenError('Usuário não tem permissão para atualizar esta ordem');
    }

    // Preparar dados para atualização
    const updateData: Prisma.ServiceOrderUpdateInput = {};
    
    if (status) {
      updateData.status = status;
      
      // Se estiver completando a ordem, definir completedAt
      if (status === 'completed') {
        updateData.completedAt = new Date();
      }
    }

    // Atualizar a ordem
    const updatedOrder = await prisma.serviceOrder.update({
      where: { id },
      data: updateData
    });

    // Adicionar nota se fornecida
    if (note) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true }
      });

      await prisma.serviceOrderNote.create({
        data: {
          orderId: id,
          content: note,
          isSystemNote: false,
          authorId: userId,
          authorName: user?.name || 'Usuário'
        }
      });
    }

    // Adicionar nota do sistema sobre a mudança de status
    if (status) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true }
      });

      let statusMessage = '';
      switch (status) {
        case 'in_progress':
          statusMessage = 'em andamento';
          break;
        case 'completed':
          statusMessage = 'concluída';
          break;
        case 'rejected':
          statusMessage = 'rejeitada';
          break;
        case 'cancelled':
          statusMessage = 'cancelada';
          break;
        default:
          statusMessage = status;
      }

      await prisma.serviceOrderNote.create({
        data: {
          orderId: id,
          content: `Status alterado para ${statusMessage} por ${user?.name}`,
          isSystemNote: true,
          authorId: userId,
          authorName: user?.name || 'Usuário'
        }
      });
    }

    return updatedOrder;
  },

  addNote: async (orderId: string, content: string, userId: string) => {
    // Verificar se a ordem existe
    const order = await prisma.serviceOrder.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new NotFoundError('Ordem de serviço');
    }

    // Verificar se o usuário tem permissão para adicionar notas
    if (order.requesterId !== userId && order.targetId !== userId) {
      throw new ForbiddenError('Usuário não tem permissão para adicionar notas a esta ordem');
    }

    // Buscar nome do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });

    // Adicionar a nota
    const note = await prisma.serviceOrderNote.create({
      data: {
        orderId,
        content,
        isSystemNote: false,
        authorId: userId,
        authorName: user?.name || 'Usuário'
      }
    });

    return note;
  }
}; 