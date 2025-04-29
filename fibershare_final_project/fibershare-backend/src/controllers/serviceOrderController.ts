import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: string; name?: string }; // Adicionado name opcional
}

// Criar nova Ordem de Serviço (genérica)
export const createServiceOrder = async (req: AuthRequest, res: Response) => {
  const { type, title, description, targetId } = req.body;
  const requesterId = req.user?.userId;
  const requesterName = req.user?.name; // Obter nome do usuário logado

  if (!requesterId || !requesterName) {
    return res.status(401).json({ message: 'Usuário não autenticado ou nome não disponível.' });
  }

  if (!type || !title || !description || !targetId) {
    return res.status(400).json({ message: 'Tipo, título, descrição e ID do alvo são obrigatórios.' });
  }

  try {
    // Opcional: Validar se targetId existe (pode ser um usuário, CTO, etc., dependendo do tipo)
    // Para simplificar, assumimos que o targetId é um ID de usuário válido por enquanto
    const targetUser = await prisma.user.findUnique({ where: { id: targetId } });
    if (!targetUser) {
        return res.status(404).json({ message: 'Usuário alvo não encontrado.' });
    }

    const newOrder = await prisma.serviceOrder.create({
      data: {
        type,
        status: 'pending', // Status inicial
        title,
        description,
        requesterId,
        // requesterName: requesterName, // O schema não tem requesterName, usar relação
        targetId,
        // targetName: targetUser.name, // O schema não tem targetName, usar relação
      },
      include: { requester: true, target: true } // Incluir dados do requisitante e alvo
    });

    // Criar uma nota inicial do sistema (opcional)
    await prisma.serviceOrderNote.create({
        data: {
            orderId: newOrder.id,
            authorId: requesterId, // Ou um ID de sistema
            authorName: 'Sistema', // Ou nome do requisitante
            content: `Ordem de serviço criada por ${requesterName}.`,
            isSystemNote: true,
        }
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Erro ao criar ordem de serviço:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar ordem de serviço.' });
  }
};

// Listar Ordens de Serviço (com filtros básicos)
export const getAllServiceOrders = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;
  const { status, type, requesterId, targetId } = req.query;

  if (!userId) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  try {
    let whereClause: any = {};

    // Filtrar por status, tipo, etc.
    if (status) whereClause.status = status as string;
    if (type) whereClause.type = type as string;
    if (requesterId) whereClause.requesterId = requesterId as string;
    if (targetId) whereClause.targetId = targetId as string;

    // Restrição: Usuários comuns só veem suas próprias ordens (requisitadas ou direcionadas)
    // Admins/Operadores podem ter visão mais ampla (ajustar conforme necessário)
    if (userRole !== 'admin') { // Exemplo: admin vê tudo, outros veem as suas
        whereClause.OR = [
            { requesterId: userId },
            { targetId: userId }
        ];
    }

    const orders = await prisma.serviceOrder.findMany({
      where: whereClause,
      include: { requester: { select: { id: true, name: true, email: true } }, target: { select: { id: true, name: true, email: true } }, notes: true }, // Incluir dados relevantes
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Erro ao listar ordens de serviço:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao listar ordens de serviço.' });
  }
};

// Obter detalhes de uma Ordem de Serviço específica
export const getServiceOrderDetails = async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (!userId) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  try {
    const order = await prisma.serviceOrder.findUnique({
      where: { id: orderId },
      include: {
          requester: { select: { id: true, name: true, email: true } },
          target: { select: { id: true, name: true, email: true } },
          notes: { orderBy: { createdAt: 'asc' } } // Incluir notas ordenadas
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Ordem de serviço não encontrada.' });
    }

    // Verificar permissão (usuário deve ser requisitante, alvo ou admin)
    if (userRole !== 'admin' && order.requesterId !== userId && order.targetId !== userId) {
        return res.status(403).json({ message: 'Usuário não autorizado a visualizar esta ordem de serviço.' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Erro ao buscar detalhes da ordem de serviço:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar detalhes da ordem de serviço.' });
  }
};

// Atualizar status de uma Ordem de Serviço
export const updateServiceOrderStatus = async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const { status, note } = req.body; // Permitir adicionar uma nota ao atualizar status
  const userId = req.user?.userId;
  const userName = req.user?.name;
  const userRole = req.user?.role;

  if (!userId || !userName) {
    return res.status(401).json({ message: 'Usuário não autenticado ou nome não disponível.' });
  }

  if (!status) {
    return res.status(400).json({ message: 'Novo status é obrigatório.' });
  }

  try {
    // Verificar se a ordem existe
    const order = await prisma.serviceOrder.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ message: 'Ordem de serviço não encontrada.' });
    }

    // Verificar permissão (quem pode atualizar o status? Ex: alvo da ordem ou admin)
    if (userRole !== 'admin' && order.targetId !== userId) {
        return res.status(403).json({ message: 'Usuário não autorizado a atualizar o status desta ordem de serviço.' });
    }

    // Validar transição de status (opcional, mas recomendado)
    // Ex: Não pode voltar de 'completed' para 'pending'

    const dataToUpdate: any = { status };
    if (status === 'completed') {
        dataToUpdate.completedAt = new Date();
    }

    const updatedOrder = await prisma.serviceOrder.update({
      where: { id: orderId },
      data: dataToUpdate,
      include: { requester: true, target: true } // Incluir dados para retorno
    });

    // Adicionar nota sobre a atualização de status
    const noteContent = note ? `${note} (Status atualizado para ${status} por ${userName})` : `Status atualizado para ${status} por ${userName}.`;
    await prisma.serviceOrderNote.create({
        data: {
            orderId: orderId,
            authorId: userId,
            authorName: userName,
            content: noteContent,
            isSystemNote: !note, // Marcar como nota do sistema se não houver nota manual
        }
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Erro ao atualizar status da ordem de serviço:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar status da ordem de serviço.' });
  }
};

// Adicionar nota a uma Ordem de Serviço
export const addServiceOrderNote = async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;
    const userName = req.user?.name;
    const userRole = req.user?.role;

    if (!userId || !userName) {
        return res.status(401).json({ message: 'Usuário não autenticado ou nome não disponível.' });
    }

    if (!content) {
        return res.status(400).json({ message: 'Conteúdo da nota é obrigatório.' });
    }

    try {
        // Verificar se a ordem existe
        const order = await prisma.serviceOrder.findUnique({ where: { id: orderId } });
        if (!order) {
            return res.status(404).json({ message: 'Ordem de serviço não encontrada.' });
        }

        // Verificar permissão (quem pode adicionar nota? Requisitante, alvo ou admin)
        if (userRole !== 'admin' && order.requesterId !== userId && order.targetId !== userId) {
            return res.status(403).json({ message: 'Usuário não autorizado a adicionar nota a esta ordem de serviço.' });
        }

        const newNote = await prisma.serviceOrderNote.create({
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
        console.error('Erro ao adicionar nota à ordem de serviço:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao adicionar nota.' });
    }
};

