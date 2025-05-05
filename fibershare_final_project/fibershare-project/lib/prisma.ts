import { PrismaClient } from '@prisma/client';

// Declaração para o escopo global
declare global {
  var prisma: PrismaClient | undefined;
}

// Exporta uma instância do PrismaClient que é reutilizada entre hot reloads em desenvolvimento
// e compartilhada entre funções serverless em produção
export const prisma = global.prisma || new PrismaClient();

// Em desenvolvimento, anexamos o prisma ao objeto global para evitar
// múltiplas instâncias do Prisma Client sendo criadas
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
} 