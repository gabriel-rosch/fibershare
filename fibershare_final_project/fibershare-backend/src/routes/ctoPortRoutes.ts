import { Router } from 'express';
import { createCTOPort, getPortsByCTO, getPortDetails, updateCTOPort, deleteCTOPort } from '../controllers/ctoPortController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { RequestHandler } from 'express';

const router = Router();

// Rotas públicas
router.get('/cto/:ctoId', getPortsByCTO as RequestHandler);
router.get('/:portId', getPortDetails as RequestHandler);

// Rotas protegidas (requerem autenticação)
router.use(authMiddleware as RequestHandler);
router.post('/cto/:ctoId', createCTOPort as RequestHandler);
router.put('/:portId', updateCTOPort as RequestHandler);
router.delete('/:portId', deleteCTOPort as RequestHandler);

export default router;
