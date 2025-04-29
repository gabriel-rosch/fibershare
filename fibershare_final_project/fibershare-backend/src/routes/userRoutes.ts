import { Router } from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { RequestHandler } from 'express'; // Importar RequestHandler

const router = Router();

// Todas as rotas de usuário requerem autenticação
router.use(authMiddleware as RequestHandler); // Fazer cast para RequestHandler

router.get('/profile', getUserProfile as RequestHandler);
router.put('/profile', updateUserProfile as RequestHandler);
// Adicionar outras rotas de usuário conforme necessário (ex: alterar senha)

export default router;

