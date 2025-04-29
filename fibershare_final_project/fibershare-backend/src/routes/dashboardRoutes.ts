import { Router } from 'express';
import {
    getDashboardStats,
    getDashboardActivities,
    getDashboardQuickActions,
    getDashboardSummary
} from '../controllers/dashboardController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { RequestHandler } from 'express';

const router = Router();

// Todas as rotas de dashboard requerem autenticação
router.use(authMiddleware as RequestHandler);

router.get('/stats', getDashboardStats as RequestHandler);
router.get('/activities', getDashboardActivities as RequestHandler);
router.get('/quick-actions', getDashboardQuickActions as RequestHandler);
router.get('/summary', getDashboardSummary as RequestHandler);

export default router;
