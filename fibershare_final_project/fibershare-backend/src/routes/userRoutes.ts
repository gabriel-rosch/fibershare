import { Router } from 'express';
import { getUserById, updateUser } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { RequestHandler } from 'express'; // Importar RequestHandler

const router = Router();

// Todas as rotas de usuário requerem autenticação
router.use(authMiddleware as RequestHandler); // Fazer cast para RequestHandler

router.get('/profile', getUserById as RequestHandler);
router.put('/profile', updateUser as RequestHandler);
// Adicionar outras rotas de usuário conforme necessário (ex: alterar senha)

export default router;

