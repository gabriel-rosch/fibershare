import { PrismaClient, Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError, ConflictError } from '../middlewares/errorHandler';
import { hashPassword } from '../utils/passwordUtils';

const prisma = new PrismaClient();

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: string;
  status?: string;
  operatorId?: string;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  operatorId?: string | null;
  password?: string;
}

export const userService = {
  getUsers: async (search?: string, role?: string, operatorId?: string) => {
    const where: Prisma.UserWhereInput = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role && role !== 'all') {
      where.role = role;
    }
    
    if (operatorId) {
      where.operatorId = operatorId;
    }
    
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        operatorId: true,
        operator: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
      operatorId: user.operatorId,
      operatorName: user.operator?.name
    }));
  },
  
  getUserById: async (id: string) => {
    // Verificar se o ID é válido
    if (!id) {
      throw new BadRequestError('ID de usuário inválido ou não fornecido');
    }
    
    const user = await prisma.user.findUnique({
      where: {
        id: id  // Certifique-se de que o ID não é undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        operatorId: true,
        operator: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    if (!user) {
      throw new NotFoundError('Usuário');
    }
    
    return user;
  },
  
  createUser: async (userData: CreateUserData) => {
    const { name, email, password, role, status = 'active', operatorId } = userData;
    
    // Verificar se o email já está em uso
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Email já cadastrado');
    }
    
    // Verificar se a operadora existe, se fornecida
    if (operatorId) {
      const operator = await prisma.operator.findUnique({ where: { id: operatorId } });
      if (!operator) {
        throw new NotFoundError('Operadora');
      }
    }
    
    // Hash da senha
    const hashedPassword = await hashPassword(password);
    
    // Criar o usuário (sempre definindo como admin)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'admin', // Sempre define como admin
        status,
        operatorId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        operatorId: true,
        operator: {
          select: {
            name: true
          }
        }
      }
    });
    
    // Registrar atividade
    await prisma.activity.create({
      data: {
        action: 'Usuário criado',
        details: `Usuário ${name} (${email}) foi criado com função ${role}`,
        type: 'user'
      }
    });
    
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      createdAt: newUser.createdAt.toISOString(),
      operatorId: newUser.operatorId,
      operatorName: newUser.operator?.name
    };
  },
  
  updateUser: async (id: string, updateData: UpdateUserData) => {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError('Usuário');
    }
    
    const { name, email, role, status, operatorId, password } = updateData;
    
    // Verificar se o email já está em uso por outro usuário
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new ConflictError('Email já cadastrado por outro usuário');
      }
    }
    
    // Verificar se a operadora existe, se fornecida
    if (operatorId) {
      const operator = await prisma.operator.findUnique({ where: { id: operatorId } });
      if (!operator) {
        throw new NotFoundError('Operadora');
      }
    }
    
    // Preparar dados para atualização
    const updateUserData: Prisma.UserUpdateInput = {};
    
    if (name) updateUserData.name = name;
    if (email) updateUserData.email = email;
    if (role) updateUserData.role = role;
    if (status) updateUserData.status = status;
    if (operatorId !== undefined) {
      // Conectar ou desconectar o operador
      updateUserData.operator = operatorId 
        ? { connect: { id: operatorId } } 
        : { disconnect: true };
    }
    
    // Hash da senha se fornecida
    if (password) {
      updateUserData.password = await hashPassword(password);
    }
    
    // Atualizar o usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateUserData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        operatorId: true,
        operator: {
          select: {
            name: true
          }
        }
      }
    });
    
    // Registrar atividade
    await prisma.activity.create({
      data: {
        action: 'Usuário atualizado',
        details: `Usuário ${updatedUser.name} (${updatedUser.email}) foi atualizado`,
        type: 'user'
      }
    });
    
    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      createdAt: updatedUser.createdAt.toISOString(),
      lastLogin: updatedUser.lastLogin?.toISOString(),
      operatorId: updatedUser.operatorId,
      operatorName: updatedUser.operator?.name
    };
  },
  
  deleteUser: async (id: string) => {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError('Usuário');
    }
    
    // Verificar se o usuário tem portas associadas
    const ports = await prisma.cTOPort.findMany({
      where: { clientId: id }
    });
    
    if (ports.length > 0) {
      throw new BadRequestError('Não é possível excluir o usuário pois existem portas associadas a ele');
    }
    
    // Verificar se o usuário tem ordens de serviço associadas
    const portOrders = await prisma.portServiceOrder.findMany({
      where: { requesterId: id }
    });
    
    if (portOrders.length > 0) {
      throw new BadRequestError('Não é possível excluir o usuário pois existem ordens de serviço associadas a ele');
    }
    
    // Excluir o usuário
    await prisma.user.delete({ where: { id } });
    
    // Registrar atividade
    await prisma.activity.create({
      data: {
        action: 'Usuário excluído',
        details: `Usuário ${user.name} (${user.email}) foi excluído`,
        type: 'user'
      }
    });
    
    return true;
  },
  
  getUserProfile: async (userId: string) => {
    try {
      // Verificar se o ID é válido
      if (!userId) {
        throw new BadRequestError('ID de usuário inválido ou não fornecido');
      }
      
      // Usar o método getUserById ou implementar a lógica diretamente
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          operator: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      
      if (!user) {
        throw new NotFoundError('Usuário');
      }
      
      // Remova informações sensíveis
      const { password, ...userWithoutPassword } = user;
      
      return userWithoutPassword;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      throw error;
    }
  }
}; 