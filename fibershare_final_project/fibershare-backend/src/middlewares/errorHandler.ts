import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ZodError } from 'zod';

// Classe base para erros da aplicação
export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'internal_error') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Erros específicos
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} não encontrado(a)`, 404, 'not_found');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Não autorizado') {
    super(message, 401, 'unauthorized');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acesso negado') {
    super(message, 403, 'forbidden');
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400, 'bad_request');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'conflict');
  }
}

// Middleware de tratamento de erros
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Erros da aplicação
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code
      }
    });
  }

  // Erros de validação do Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: 'Erro de validação',
        code: 'validation_error',
        details: err.errors
      }
    });
  }

  // Erros do Prisma
  if (err instanceof PrismaClientKnownRequestError) {
    // P2002: Unique constraint violation
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: {
          message: 'Registro já existe',
          code: 'conflict',
          fields: (err.meta?.target as string[]) || []
        }
      });
    }

    // P2025: Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: {
          message: 'Registro não encontrado',
          code: 'not_found'
        }
      });
    }

    // P2003: Foreign key constraint failed
    if (err.code === 'P2003') {
      return res.status(400).json({
        error: {
          message: 'Operação não permitida: existem registros relacionados',
          code: 'foreign_key_constraint'
        }
      });
    }
  }

  // Erro genérico
  return res.status(500).json({
    error: {
      message: 'Erro interno do servidor',
      code: 'internal_server_error'
    }
  });
}; 