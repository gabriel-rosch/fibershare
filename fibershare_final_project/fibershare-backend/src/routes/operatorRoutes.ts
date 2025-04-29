import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    console.log('Buscando operadoras...'); // Log para debug
    const operators = await prisma.operator.findMany({
      select: {
        id: true,
        name: true,
      }
    });
    console.log('Operadoras encontradas:', operators); // Log para debug
    res.json(operators);
  } catch (error) {
    console.error('Erro ao buscar operadoras:', error);
    res.status(500).json({ message: 'Erro ao buscar operadoras' });
  }
});

export default router; 