import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { BadRequestError, NotFoundError, UnauthorizedError, ConflictError, ForbiddenError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  console.error('JWT_SECRET não está definido no arquivo .env');
  process.exit(1);
}

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  role: string;
  operatorId?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  registerUser: async (userData: RegisterUserData) => {
    const { name, email, password, role, operatorId } = userData;

    // Verificar se o email já está em uso
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Email já cadastrado');
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
        status: 'active',
        operatorId,
      },
    });

    // Não retornar a senha
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  loginUser: async (loginData: LoginData) => {
    const { email, password } = loginData;

    // Buscar o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { operator: true }
    });

    if (!user || !user.password) {
      throw new UnauthorizedError('Email ou senha incorretos');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Email ou senha incorretos');
    }

    if (user.status === 'inactive') {
      throw new ForbiddenError('Sua conta está inativa. Entre em contato com o suporte');
    }

    // Atualizar lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        operatorId: user.operatorId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Não retornar a senha
    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword
    };
  },

  getUserProfile: async (userId: string) => {
    if (!userId) {
      throw new BadRequestError('ID do usuário não fornecido.');
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { operator: true }
    });

    if (!user) {
      throw new NotFoundError('Usuário');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}; 