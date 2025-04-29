import { Router } from 'express';
import {
    sendMessage,
    getConversation,
    getContacts
} from '../controllers/chatController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { RequestHandler } from 'express';

const router = Router();

// Todas as rotas de chat requerem autenticação
router.use(authMiddleware as RequestHandler);

router.post('/messages', sendMessage as RequestHandler);
router.get('/conversations/:otherUserId', getConversation as RequestHandler);
router.get('/contacts', getContacts as RequestHandler);

export default router;
