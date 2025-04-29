import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('Erro: JWT_SECRET não está definido no arquivo .env');
  process.exit(1);
}

export interface AuthUser {
  userId: string;
  operatorId?: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

interface JWTPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
  operatorId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  console.log('Auth Header:', authHeader); // Debug
  console.log('User in request:', req.user); // Debug

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      message: 'Token não fornecido',
      code: 'token_missing'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    console.log('Decoded token:', decoded); // Debug
    req.user = decoded as AuthUser;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        message: 'Token expirado',
        code: 'token_expired'
      });
    }
    return res.status(401).json({ 
      message: 'Token inválido',
      code: 'token_invalid'
    });
  }
};

// Middleware para verificar se o usuário pertence à operadora
export const checkOperatorAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  const operatorId = req.params.operatorId;

  if (!user || !user.operatorId || user.operatorId !== operatorId) {
    return res.status(403).json({ message: 'Acesso não autorizado a esta operadora' });
  }

  next();
};

