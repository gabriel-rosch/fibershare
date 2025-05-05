import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { operatorService } from '../services/operatorService';
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const router = Router();
const prisma = new PrismaClient();

// Schema de validação para registro de operadora
const registerOperatorSchema = z.object({
  operatorName: z.string().min(3, { message: "Nome da operadora deve ter pelo menos 3 caracteres" }),
  operatorEmail: z.string().email({ message: "Email da operadora inválido" }),
  adminName: z.string().min(3, { message: "Nome do administrador deve ter pelo menos 3 caracteres" }),
  adminEmail: z.string().email({ message: "Email do administrador inválido" }),
  adminPassword: z.string().min(8, { message: "Senha deve ter pelo menos 8 caracteres" }),
  stripePriceId: z.string().min(1, { message: "ID do plano é obrigatório" }),
  region: z.string().min(2, { message: "Região é obrigatória" }),
  description: z.string().min(10, { message: "Descrição deve ter pelo menos 10 caracteres" }),
  contactEmail: z.string().email({ message: "Email de contato inválido" }),
  contactPhone: z.string().min(10, { message: "Telefone de contato inválido" })
});

// Rota para registrar uma nova operadora
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar dados de entrada
    const validation = registerOperatorSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: validation.error.errors
      });
    }

    // Registrar operadora
    const result = await operatorService.registerOperator(validation.data);
    
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Rota para obter planos de assinatura disponíveis
router.get('/subscription-plans', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await operatorService.getSubscriptionPlans();
    res.json(plans);
  } catch (error) {
    next(error);
  }
});

// Rota para listar operadoras (já existente, mantida)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
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
    next(error);
  }
});

export default router; 