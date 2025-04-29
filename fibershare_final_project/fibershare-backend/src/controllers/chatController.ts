import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: string; name?: string };
}

// Enviar uma nova mensagem de chat
export const sendMessage = async (req: AuthRequest, res: Response) => {
  const { receiverId, content } = req.body;
  const senderId = req.user?.userId;

  if (!senderId) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  if (!receiverId || !content) {
    return res.status(400).json({ message: 'ID do destinatário e conteúdo da mensagem são obrigatórios.' });
  }

  if (senderId === receiverId) {
    return res.status(400).json({ message: 'Não é possível enviar mensagem para si mesmo.' });
  }

  try {
    // Verificar se o destinatário existe
    const receiverExists = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiverExists) {
      return res.status(404).json({ message: 'Destinatário não encontrado.' });
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        senderId,
        receiverId,
        content,
        read: false, // Mensagem começa como não lida
      },
      include: { sender: { select: { id: true, name: true } }, receiver: { select: { id: true, name: true } } }
    });

    // Aqui você pode adicionar lógica para notificar o destinatário (e.g., via WebSockets)

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao enviar mensagem.' });
  }
};

// Obter mensagens entre dois usuários (conversa)
export const getConversation = async (req: AuthRequest, res: Response) => {
  const { otherUserId } = req.params; // ID do outro usuário na conversa
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  if (!otherUserId) {
    return res.status(400).json({ message: 'ID do outro usuário é obrigatório.' });
  }

  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' }, // Ordenar do mais antigo para o mais recente
      include: { sender: { select: { id: true, name: true } }, receiver: { select: { id: true, name: true } } }
    });

    // Marcar mensagens recebidas como lidas (opcional, pode ser feito em outra rota/evento)
    await prisma.chatMessage.updateMany({
        where: {
            senderId: otherUserId,
            receiverId: userId,
            read: false
        },
        data: { read: true }
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Erro ao obter conversa:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao obter conversa.' });
  }
};

// Obter lista de contatos/conversas recentes
export const getContacts = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
        // Obter todas as mensagens enviadas ou recebidas pelo usuário
        const messages = await prisma.chatMessage.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId },
                ],
            },
            orderBy: { createdAt: 'desc' },
            include: { 
                sender: { select: { id: true, name: true } }, 
                receiver: { select: { id: true, name: true } } 
            }
        });

        // Agrupar mensagens por contato e obter a última mensagem e contagem de não lidas
        const contactsMap = new Map<string, any>();

        for (const message of messages) {
            const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
            const otherUserName = message.senderId === userId ? message.receiver.name : message.sender.name;

            if (!contactsMap.has(otherUserId)) {
                contactsMap.set(otherUserId, {
                    id: otherUserId,
                    name: otherUserName,
                    // avatar: '', // Adicionar lógica para buscar avatar se necessário
                    // status: 'offline', // Adicionar lógica para status online/offline se necessário
                    lastMessage: message,
                    unreadCount: 0,
                });
            }

            // Contar mensagens não lidas recebidas do outro usuário
            if (message.receiverId === userId && !message.read) {
                contactsMap.get(otherUserId).unreadCount++;
            }
        }

        const contacts = Array.from(contactsMap.values());

        res.status(200).json(contacts);
    } catch (error) {
        console.error('Erro ao obter contatos:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao obter contatos.' });
    }
};

