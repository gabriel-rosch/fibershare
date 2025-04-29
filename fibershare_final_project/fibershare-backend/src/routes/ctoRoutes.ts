import { Router } from 'express';
import { createCTO, getAllCTOs, getCTODetails, updateCTO, deleteCTO } from '../controllers/ctoController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { RequestHandler } from 'express';

const router = Router();

// Rotas públicas
router.get('/', getAllCTOs as RequestHandler);
router.get('/:id', getCTODetails as RequestHandler);

// Rotas protegidas (requerem autenticação)
router.use(authMiddleware as RequestHandler);
router.post('/', createCTO as RequestHandler);
router.put('/:id', updateCTO as RequestHandler);
router.delete('/:id', deleteCTO as RequestHandler);

export default router;
