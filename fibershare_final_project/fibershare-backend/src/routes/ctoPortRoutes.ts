import { Router } from 'express';
import { createCTOPort, getPortsByCTO, getPortDetails, updateCTOPort, deleteCTOPort, reserveCTOPort } from '../controllers/ctoPortController';
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
router.post('/:portId/reserve', reserveCTOPort as RequestHandler); // Nova rota para reservar porta
router.delete('/:portId', deleteCTOPort as RequestHandler);

export default router;
