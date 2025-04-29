import { Router } from 'express';
import {
    createServiceOrder,
    getAllServiceOrders,
    getServiceOrderDetails,
    updateServiceOrderStatus,
    addServiceOrderNote
} from '../controllers/serviceOrderController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { RequestHandler } from 'express';

const router = Router();

// Todas as rotas de ordens de serviço requerem autenticação
router.use(authMiddleware as RequestHandler);

router.post('/', createServiceOrder as RequestHandler);
router.get('/', getAllServiceOrders as RequestHandler);
router.get('/:orderId', getServiceOrderDetails as RequestHandler);
router.patch('/:orderId/status', updateServiceOrderStatus as RequestHandler);
router.post('/:orderId/notes', addServiceOrderNote as RequestHandler);

export default router;
