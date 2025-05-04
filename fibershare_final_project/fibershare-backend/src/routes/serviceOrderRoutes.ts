import { Router } from 'express';
import {
    createOrder,
    getOrders,
    getOrderDetails,
    updateOrderStatus,
    addNote
} from '../controllers/serviceOrderController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { RequestHandler } from 'express';

const router = Router();

// Todas as rotas de ordens de serviço requerem autenticação
router.use(authMiddleware as RequestHandler);

router.post('/', createOrder as RequestHandler);
router.get('/', getOrders as RequestHandler);
router.get('/:orderId', getOrderDetails as RequestHandler);
router.patch('/:orderId/status', updateOrderStatus as RequestHandler);
router.post('/:orderId/notes', addNote as RequestHandler);

export default router;
