import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('Erro: JWT_SECRET não está definido no arquivo .env');
  process.exit(1);
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    operatorId?: string;
  };
}

interface JWTPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
  operatorId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido ou inválido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Token expirado.' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Token inválido.' });
    }
    return res.status(500).json({ message: 'Falha ao autenticar o token.' });
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

