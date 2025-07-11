import { Router } from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/authController';
import { RequestHandler } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { operatorService } from '../services/operatorService';
import { z } from 'zod';

const router = Router();

router.post('/register', registerUser as RequestHandler);
router.post('/login', loginUser as RequestHandler);
router.get('/profile', authMiddleware as RequestHandler, getUserProfile as RequestHandler);

// Schema de validação para registro de operadora
const registerOperatorSchema = z.object({
  operatorName: z.string().min(3),
  operatorEmail: z.string().email(),
  adminName: z.string().min(3),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
  stripePriceId: z.string(),
  region: z.string().min(2),
  description: z.string().min(10),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(10)
});

// Nova rota para registro de operadora
router.post('/register-operator', async (req, res, next) => {
  try {
    // Validar dados
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

export default router;
