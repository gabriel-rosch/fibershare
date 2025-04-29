import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

// Obter perfil do usuário logado
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { // Selecionar campos específicos para não expor a senha
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar perfil do usuário.' });
  }
};

// Atualizar perfil do usuário logado (exemplo básico)
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const { name, email } = req.body; // Permitir atualização de nome e email, por exemplo

    if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    // Validação básica dos dados recebidos
    if (!name && !email) {
        return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
    }

    try {
        // Verificar se o novo email já está em uso por outro usuário
        if (email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser && existingUser.id !== userId) {
                return res.status(409).json({ message: 'Email já está em uso por outro usuário.' });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: name,
                email: email,
                // Adicionar outros campos atualizáveis conforme necessário
            },
            select: { // Retornar usuário atualizado sem a senha
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                lastLogin: true,
                updatedAt: true
            }
        });

        res.status(200).json({ message: 'Perfil atualizado com sucesso!', user: updatedUser });
    } catch (error) {
        console.error('Erro ao atualizar perfil do usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar perfil do usuário.' });
    }
};

