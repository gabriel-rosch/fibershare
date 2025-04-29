import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { hashPassword, comparePassword } from '../utils/passwordUtils';

dotenv.config();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, role, operatorId } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
  }

  if ((role === 'operator_admin' || role === 'operator_user') && !operatorId) {
    return res.status(400).json({ message: 'Operadora é obrigatória para usuários de operadora' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email já cadastrado.' });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status: 'active',
        operatorId,
      },
    });

    // Não retornar a senha no response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({ message: 'Usuário registrado com sucesso!', user: userWithoutPassword });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao registrar usuário.' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Email e senha são obrigatórios.' 
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ 
        message: 'Email ou senha incorretos.' 
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Email ou senha incorretos.' 
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ 
        message: 'Sua conta está inativa. Entre em contato com o suporte.' 
      });
    }

    // Atualizar lastLogin
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
    });

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expira em 1 hora
    );

    // Não retornar a senha no response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({ 
      token, 
      user: userWithoutPassword,
      message: 'Login realizado com sucesso!' 
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor ao fazer login.' 
    });
  }
};

