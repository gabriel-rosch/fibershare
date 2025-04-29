import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: string; name?: string };
}

// Criar nova Ordem de Serviço de Porta
export const createPortServiceOrder = async (req: AuthRequest, res: Response) => {
  const { portId, price, installationFee = 0 } = req.body;
  const requesterId = req.user?.userId;

  if (!requesterId) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  if (!portId || price === undefined) {
    return res.status(400).json({ message: 'ID da porta e preço são obrigatórios.' });
  }

  try {
    // Buscar a porta e incluir o usuário do operador
    const port = await prisma.cTOPort.findUnique({ 
      where: { id: portId },
      include: { 
        cto: { 
          include: { 
            operator: {
              include: { users: true }
            } 
          } 
        } 
      }
    });
    
    if (!port) {
      return res.status(404).json({ message: 'Porta não encontrada.' });
    }

    // Encontrar o admin da operadora
    const operatorAdmin = port.cto.operator.users.find(user => user.role === 'operator_admin');
    if (!operatorAdmin) {
      return res.status(400).json({ message: 'Administrador da operadora não encontrado.' });
    }

    const ownerId = operatorAdmin.id;
    
    if (ownerId === requesterId) {
      return res.status(400).json({ message: 'Você não pode alugar sua própria porta.' });
    }

    // Verificar se a porta está disponível
    if (port.status !== 'available') {
      return res.status(400).json({ message: 'Esta porta não está disponível para aluguel.' });
    }

    // Criar a ordem de serviço de porta
    const newPortOrder = await prisma.portServiceOrder.create({
      data: {
        status: 'pending_approval',
        price,
        installationFee,
        contractSignedByRequester: false,
        contractSignedByOwner: false,
        requesterId,
        ownerId,
        portId,
      },
      include: { requester: true, owner: true, port: { include: { cto: true } } }
    });

    // Criar uma nota inicial do sistema
    await prisma.portOrderNote.create({
      data: {
        orderId: newPortOrder.id,
        authorId: requesterId,
        authorName: 'Sistema',
        content: `Solicitação de aluguel criada. Aguardando aprovação do proprietário.`,
        isSystemNote: true,
      }
    });

    res.status(201).json(newPortOrder);
  } catch (error) {
    console.error('Erro ao criar ordem de serviço de porta:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar ordem de serviço de porta.' });
  }
};

// Listar Ordens de Serviço de Porta (com filtros)
export const getAllPortServiceOrders = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;
  const { status, requesterId, ownerId, portId } = req.query;

  if (!userId) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  try {
    // Usar tipo genérico para whereClause
    let whereClause: any = {};

    // Filtrar por status, etc.
    if (status) whereClause.status = status as string;
    if (portId) whereClause.portId = portId as string;
    if (requesterId) whereClause.requesterId = requesterId as string;
    if (ownerId) whereClause.ownerId = ownerId as string;

    // Restrição: Usuários comuns só veem suas próprias ordens (requisitadas ou como proprietário)
    if (userRole !== 'admin') {
      whereClause.OR = [
        { requesterId: userId },
        { ownerId: userId }
      ];
    }

    const orders = await prisma.portServiceOrder.findMany({
      where: whereClause,
      include: { 
        requester: { select: { id: true, name: true, email: true } }, 
        owner: { select: { id: true, name: true, email: true } },
        port: { include: { cto: true } },
        notes: true 
      },
      orderBy: { createdAt: 'desc' },
    });
    
    res.status(200).json(orders);
  } catch (error) {
    console.error('Erro ao listar ordens de serviço de porta:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao listar ordens de serviço de porta.' });
  }
};

// Obter detalhes de uma Ordem de Serviço de Porta específica
export const getPortServiceOrderDetails = async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (!userId) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  try {
    const order = await prisma.portServiceOrder.findUnique({
      where: { id: orderId },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true } },
        port: { include: { cto: true } },
        notes: { orderBy: { createdAt: 'asc' } }
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Ordem de serviço de porta não encontrada.' });
    }

    // Verificar permissão (usuário deve ser requisitante, proprietário ou admin)
    if (userRole !== 'admin' && order.requesterId !== userId && order.ownerId !== userId) {
      return res.status(403).json({ message: 'Usuário não autorizado a visualizar esta ordem de serviço de porta.' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Erro ao buscar detalhes da ordem de serviço de porta:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar detalhes da ordem de serviço de porta.' });
  }
};

// Atualizar status de uma Ordem de Serviço de Porta
export const updatePortServiceOrderStatus = async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const { status, note, contractUrl, scheduledDate } = req.body;
  const userId = req.user?.userId;
  const userName = req.user?.name;

  if (!userId || !userName) {
    return res.status(401).json({ message: 'Usuário não autenticado ou nome não disponível.' });
  }

  if (!status) {
    return res.status(400).json({ message: 'Novo status é obrigatório.' });
  }

  try {
    // Verificar se a ordem existe
    const order = await prisma.portServiceOrder.findUnique({ 
      where: { id: orderId },
      include: { port: true }
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Ordem de serviço de porta não encontrada.' });
    }

    // Verificar permissão (quem pode atualizar o status?)
    const isRequester = order.requesterId === userId;
    const isOwner = order.ownerId === userId;
    
    if (!isRequester && !isOwner) {
      return res.status(403).json({ message: 'Usuário não autorizado a atualizar o status desta ordem de serviço de porta.' });
    }

    // Validar transições de status específicas
    // Exemplo: Apenas o proprietário pode aprovar
    if (status === 'contract_generated' && !isOwner) {
      return res.status(403).json({ message: 'Apenas o proprietário pode gerar o contrato.' });
    }
    
    // Exemplo: Verificar se o contrato está assinado por ambos antes de marcar como concluído
    if (status === 'completed' && (!order.contractSignedByRequester || !order.contractSignedByOwner)) {
      return res.status(400).json({ message: 'O contrato deve ser assinado por ambas as partes antes de concluir a ordem.' });
    }

    // Preparar dados para atualização
    const dataToUpdate: any = { status }; // Usar tipo genérico
    
    // Adicionar campos opcionais se fornecidos
    if (contractUrl) dataToUpdate.contractUrl = contractUrl;
    if (scheduledDate) dataToUpdate.scheduledDate = new Date(scheduledDate);
    
    // Atualizar datas específicas com base no status
    if (status === 'completed') {
      dataToUpdate.completedDate = new Date();
    }
    
    // Atualizar assinaturas do contrato se aplicável
    if (status === 'contract_signed') {
      if (isRequester) {
        dataToUpdate.contractSignedByRequester = true;
      } else if (isOwner) {
        dataToUpdate.contractSignedByOwner = true;
      }
    }

    // Atualizar a ordem
    const updatedOrder = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Atualizar a ordem
      const updated = await tx.portServiceOrder.update({
        where: { id: orderId },
        data: dataToUpdate,
        include: { requester: true, owner: true, port: true }
      });
      
      // Se o status for 'completed', atualizar o status da porta para 'occupied'
      if (status === 'completed') {
        await tx.cTOPort.update({
          where: { id: order.portId },
          data: { 
            status: 'occupied',
            currentTenantId: order.requesterId,
            startDate: new Date(),
            // Definir endDate com base no plano, se aplicável
          }
        });
        
        // Atualizar contagem de portas ocupadas na CTO
        const port = await tx.cTOPort.findUnique({
          where: { id: order.portId },
          include: { cto: true }
        });
        
        if (port) {
          await tx.cTO.update({
            where: { id: port.ctoId },
            data: { occupiedPorts: { increment: 1 } }
          });
        }
      }
      
      // Se o status for 'cancelled' e a porta estava reservada, liberar a porta
      if (status === 'cancelled' && order.port.status === 'reserved') {
        await tx.cTOPort.update({
          where: { id: order.portId },
          data: { 
            status: 'available',
            currentTenantId: null
          }
        });
      }
      
      return updated;
    });

    // Adicionar nota sobre a atualização de status
    const noteContent = note 
      ? `${note} (Status atualizado para ${status} por ${userName})` 
      : `Status atualizado para ${status} por ${userName}.`;
    
    await prisma.portOrderNote.create({
      data: {
        orderId: orderId,
        authorId: userId,
        authorName: userName,
        content: noteContent,
        isSystemNote: !note,
      }
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Erro ao atualizar status da ordem de serviço de porta:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar status da ordem de serviço de porta.' });
  }
};

// Adicionar nota a uma Ordem de Serviço de Porta
export const addPortServiceOrderNote = async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const { content } = req.body;
  const userId = req.user?.userId;
  const userName = req.user?.name;

  if (!userId || !userName) {
    return res.status(401).json({ message: 'Usuário não autenticado ou nome não disponível.' });
  }

  if (!content) {
    return res.status(400).json({ message: 'Conteúdo da nota é obrigatório.' });
  }

  try {
    // Verificar se a ordem existe
    const order = await prisma.portServiceOrder.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ message: 'Ordem de serviço de porta não encontrada.' });
    }

    // Verificar permissão (quem pode adicionar nota? Requisitante, proprietário ou admin)
    if (order.requesterId !== userId && order.ownerId !== userId) {
      return res.status(403).json({ message: 'Usuário não autorizado a adicionar nota a esta ordem de serviço de porta.' });
    }

    const newNote = await prisma.portOrderNote.create({
      data: {
        orderId: orderId,
        authorId: userId,
        authorName: userName,
        content: content,
        isSystemNote: false,
      }
    });

    res.status(201).json(newNote);
  } catch (error) {
    console.error('Erro ao adicionar nota à ordem de serviço de porta:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao adicionar nota.' });
  }
};
