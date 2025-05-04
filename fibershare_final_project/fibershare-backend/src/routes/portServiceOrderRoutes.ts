import { Router } from 'express';
import {
    createPortOrder,
    getPortOrders,
    getPortOrderById,
    updatePortOrder,
    addNoteToOrder
} from '../controllers/portServiceOrderController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { RequestHandler } from 'express';

const router = Router();

// Todas as rotas de ordens de serviço de porta requerem autenticação
router.use(authMiddleware as RequestHandler);

router.post('/', createPortOrder as RequestHandler);
router.get('/', getPortOrders as RequestHandler);
router.get('/:orderId', getPortOrderById as RequestHandler);
router.patch('/:orderId/status', updatePortOrder as RequestHandler);
router.post('/:orderId/notes', addNoteToOrder as RequestHandler);

export default router;
