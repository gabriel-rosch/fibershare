import { Router } from 'express';
import {
    createPortServiceOrder,
    getAllPortServiceOrders,
    getPortServiceOrderDetails,
    updatePortServiceOrderStatus,
    addPortServiceOrderNote
} from '../controllers/portServiceOrderController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { RequestHandler } from 'express';

const router = Router();

// Todas as rotas de ordens de serviço de porta requerem autenticação
router.use(authMiddleware as RequestHandler);

router.post('/', createPortServiceOrder as RequestHandler);
router.get('/', getAllPortServiceOrders as RequestHandler);
router.get('/:orderId', getPortServiceOrderDetails as RequestHandler);
router.patch('/:orderId/status', updatePortServiceOrderStatus as RequestHandler);
router.post('/:orderId/notes', addPortServiceOrderNote as RequestHandler);

export default router;
