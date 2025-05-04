import { PrismaClient, Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

type PortOrderStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed' | 'in_progress';

interface CreatePortOrderData {
  portId: string;
  requesterId: string;
  installationFee?: number;
  scheduledDate?: Date;
}

interface UpdatePortOrderData {
  status?: PortOrderStatus;
  scheduledDate?: Date;
  contractSignedByRequester?: boolean;
  contractSignedByOwner?: boolean;
}

export const portServiceOrderService = {
  getPortOrders: async (
    userId: string,
    direction: 'incoming' | 'outgoing' | 'all' = 'all',
    status?: PortOrderStatus
  ) => {
    // Buscar informações do usuário para determinar se é operador
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { operatorId: true, role: true }
    });

    if (!user) {
      throw new NotFoundError('Usuário');
    }

    const isOperator = !!user.operatorId && (user.role === 'operator_admin' || user.role === 'operator_user');
    
    // Construir a consulta
    const where: Prisma.PortServiceOrderWhereInput = {};
    
    if (direction === 'incoming' && isOperator) {
      // Para operadores, pedidos recebidos são aqueles para suas portas
      if (user.operatorId) {
        where.port = {
          cto: {
            operatorId: user.operatorId
          }
        };
      }
    } else if (direction === 'outgoing') {
      // Pedidos enviados são aqueles onde o usuário é o solicitante
      where.requesterId = userId;
    } else if (direction === 'all') {
      // Todos os pedidos relacionados ao usuário
      if (isOperator) {
        if (user.operatorId) {
          where.OR = [
            { requesterId: userId },
            { port: { cto: { operatorId: user.operatorId } } }
          ];
        } else {
          where.requesterId = userId;
        }
      } else {
        where.requesterId = userId;
      }
    }
    
    if (status) {
      where.status = status;
    }
    
    const orders = await prisma.portServiceOrder.findMany({
      where,
      include: {
        port: {
          include: {
            cto: {
              include: {
                operator: {
                  select: { name: true }
                }
              }
            }
          }
        },
        requester: {
          select: {
            name: true,
            email: true
          }
        },
        notes: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return orders.map(order => ({
      id: order.id,
      status: order.status,
      portId: order.portId,
      portNumber: order.port.number,
      ctoId: order.port.ctoId,
      ctoName: order.port.cto.name,
      operatorId: order.port.cto.operatorId,
      operatorName: order.port.cto.operator.name,
      requesterId: order.requesterId,
      requesterName: order.requester.name,
      requesterEmail: order.requester.email,
      price: order.price,
      installationFee: order.installationFee,
      scheduledDate: order.scheduledDate?.toISOString(),
      contractSignedByRequester: order.contractSignedByRequester,
      contractSignedByOwner: order.contractSignedByOwner,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      completedDate: order.completedDate?.toISOString(),
      notes: order.notes.map(note => ({
        id: note.id,
        content: note.content,
        createdAt: note.createdAt.toISOString(),
        isSystemNote: note.isSystemNote,
        authorId: note.authorId,
        authorName: note.authorName
      }))
    }));
  },
  
  getPortOrderById: async (id: string, userId: string) => {
    const order = await prisma.portServiceOrder.findUnique({
      where: { id },
      include: {
        port: {
          include: {
            cto: {
              include: {
                operator: {
                  select: { name: true, id: true }
                }
              }
            }
          }
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true
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
      throw new NotFoundError('Ordem de serviço de porta');
    }
    
    // Verificar se o usuário tem acesso a esta ordem
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { operatorId: true, role: true }
    });
    
    if (!user) {
      throw new NotFoundError('Usuário');
    }
    
    const isOperator = !!user.operatorId && (user.role === 'operator_admin' || user.role === 'operator_user');
    const isOwner = isOperator && user.operatorId === order.port.cto.operatorId;
    const isRequester = order.requesterId === userId;
    
    if (!isOwner && !isRequester) {
      throw new ForbiddenError('Usuário não tem acesso a esta ordem de serviço');
    }
    
    return {
      id: order.id,
      status: order.status,
      portId: order.portId,
      portNumber: order.port.number,
      ctoId: order.port.ctoId,
      ctoName: order.port.cto.name,
      operatorId: order.port.cto.operatorId,
      operatorName: order.port.cto.operator.name,
      requesterId: order.requesterId,
      requesterName: order.requester.name,
      requesterEmail: order.requester.email,
      price: order.price,
      installationFee: order.installationFee,
      scheduledDate: order.scheduledDate?.toISOString(),
      contractSignedByRequester: order.contractSignedByRequester,
      contractSignedByOwner: order.contractSignedByOwner,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      completedDate: order.completedDate?.toISOString(),
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
  
  createPortOrder: async (data: CreatePortOrderData) => {
    const { portId, requesterId, installationFee, scheduledDate } = data;
    
    // Verificar se a porta existe
    const port = await prisma.cTOPort.findUnique({
      where: { id: portId },
      include: {
        cto: {
          include: {
            operator: true
          }
        }
      }
    });
    
    if (!port) {
      throw new NotFoundError('Porta');
    }
    
    // Verificar se a porta está disponível
    if (port.status !== 'available') {
      throw new BadRequestError('Porta não está disponível para solicitação');
    }
    
    // Verificar se o solicitante existe
    const requester = await prisma.user.findUnique({
      where: { id: requesterId }
    });
    
    if (!requester) {
      throw new NotFoundError('Usuário solicitante');
    }
    
    // Verificar se já existe uma ordem pendente para esta porta
    const existingOrder = await prisma.portServiceOrder.findFirst({
      where: {
        portId,
        status: 'pending'
      }
    });
    
    if (existingOrder) {
      throw new BadRequestError('Já existe uma solicitação pendente para esta porta');
    }
    
    // Criar a ordem
    const order = await prisma.portServiceOrder.create({
      data: {
        portId,
        requesterId,
        ownerId: port.cto.operatorId,
        status: 'pending',
        price: port.price || 0,
        installationFee: installationFee || 0,
        scheduledDate,
        contractSignedByRequester: false,
        contractSignedByOwner: false
      }
    });
    
    // Adicionar nota do sistema
    await prisma.portOrderNote.create({
      data: {
        orderId: order.id,
        content: `Solicitação criada por ${requester.name}`,
        isSystemNote: true,
        authorId: requesterId,
        authorName: requester.name
      }
    });
    
    return order;
  },
  
  updatePortOrder: async (id: string, data: UpdatePortOrderData, userId: string) => {
    const { status, scheduledDate, contractSignedByRequester, contractSignedByOwner } = data;
    
    // Verificar se a ordem existe
    const order = await prisma.portServiceOrder.findUnique({
      where: { id },
      include: {
        port: {
          include: {
            cto: true
          }
        },
        requester: true
      }
    });
    
    if (!order) {
      throw new NotFoundError('Ordem de serviço de porta');
    }
    
    // Verificar permissões
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { operatorId: true, role: true }
    });
    
    if (!user) {
      throw new NotFoundError('Usuário');
    }
    
    const isOperator = !!user.operatorId && (user.role === 'operator_admin' || user.role === 'operator_user');
    const isOwner = isOperator && user.operatorId === order.port.cto.operatorId;
    const isRequester = order.requesterId === userId;
    
    // Verificar permissões específicas
    if (status && !isOwner && status !== 'cancelled') {
      throw new ForbiddenError('Apenas o proprietário pode alterar o status da ordem');
    }
    
    if (status === 'cancelled' && !isRequester && !isOwner) {
      throw new ForbiddenError('Apenas o solicitante ou o proprietário podem cancelar a ordem');
    }
    
    if (contractSignedByOwner !== undefined && !isOwner) {
      throw new ForbiddenError('Apenas o proprietário pode assinar o contrato como proprietário');
    }
    
    if (contractSignedByRequester !== undefined && !isRequester) {
      throw new ForbiddenError('Apenas o solicitante pode assinar o contrato como solicitante');
    }
    
    // Preparar dados para atualização
    const updateData: Prisma.PortServiceOrderUpdateInput = {};
    
    if (status !== undefined) {
      updateData.status = status;
      
      // Se estiver completando a ordem, definir completedDate
      if (status === 'completed') {
        updateData.completedDate = new Date();
        
        // Atualizar o status da porta para ocupada
        await prisma.cTOPort.update({
          where: { id: order.portId },
          data: {
            status: 'occupied',
            clientId: order.requesterId
          }
        });
        
        // Atualizar contador de portas ocupadas na CTO
        await prisma.cTO.update({
          where: { id: order.port.ctoId },
          data: {
            occupiedPorts: {
              increment: 1
            }
          }
        });
      }
    }
    
    if (scheduledDate !== undefined) {
      updateData.scheduledDate = scheduledDate;
    }
    
    if (contractSignedByRequester !== undefined) {
      updateData.contractSignedByRequester = contractSignedByRequester;
    }
    
    if (contractSignedByOwner !== undefined) {
      updateData.contractSignedByOwner = contractSignedByOwner;
    }
    
    // Atualizar a ordem
    const updatedOrder = await prisma.portServiceOrder.update({
      where: { id },
      data: updateData
    });
    
    // Adicionar nota do sistema sobre a mudança de status
    if (status) {
      let statusMessage = '';
      switch (status) {
        case 'approved':
          statusMessage = 'aprovada';
          break;
        case 'rejected':
          statusMessage = 'rejeitada';
          break;
        case 'cancelled':
          statusMessage = 'cancelada';
          break;
        case 'in_progress':
          statusMessage = 'em andamento';
          break;
        case 'completed':
          statusMessage = 'concluída';
          break;
        default:
          statusMessage = status;
      }
      
      await prisma.portOrderNote.create({
        data: {
          orderId: id,
          content: `Status alterado para ${statusMessage} por ${user.role === 'operator_admin' || user.role === 'operator_user' ? 'operadora' : 'cliente'}`,
          isSystemNote: true,
          authorId: userId,
          authorName: user.role === 'operator_admin' || user.role === 'operator_user' ? 'Operadora' : order.requester.name
        }
      });
    }
    
    // Adicionar nota sobre assinatura de contrato
    if (contractSignedByRequester !== undefined && contractSignedByRequester) {
      await prisma.portOrderNote.create({
        data: {
          orderId: id,
          content: `Contrato assinado pelo solicitante`,
          isSystemNote: true,
          authorId: userId,
          authorName: order.requester.name
        }
      });
    }
    
    if (contractSignedByOwner !== undefined && contractSignedByOwner) {
      await prisma.portOrderNote.create({
        data: {
          orderId: id,
          content: `Contrato assinado pela operadora`,
          isSystemNote: true,
          authorId: userId,
          authorName: 'Operadora'
        }
      });
    }
    
    return updatedOrder;
  },
  
  addNoteToOrder: async (orderId: string, content: string, userId: string) => {
    // Verificar se a ordem existe
    const order = await prisma.portServiceOrder.findUnique({
      where: { id: orderId },
      include: {
        port: {
          include: {
            cto: true
          }
        }
      }
    });
    
    if (!order) {
      throw new NotFoundError('Ordem de serviço de porta');
    }
    
    // Verificar permissões
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { operatorId: true, role: true, name: true }
    });
    
    if (!user) {
      throw new NotFoundError('Usuário');
    }
    
    const isOperator = !!user.operatorId && (user.role === 'operator_admin' || user.role === 'operator_user');
    const isOwner = isOperator && user.operatorId === order.port.cto.operatorId;
    const isRequester = order.requesterId === userId;
    
    if (!isOwner && !isRequester) {
      throw new ForbiddenError('Usuário não tem permissão para adicionar notas a esta ordem');
    }
    
    // Adicionar a nota
    const note = await prisma.portOrderNote.create({
      data: {
        orderId,
        content,
        isSystemNote: false,
        authorId: userId,
        authorName: user.name || 'Usuário'
      }
    });
    
    return note;
  }
}; 