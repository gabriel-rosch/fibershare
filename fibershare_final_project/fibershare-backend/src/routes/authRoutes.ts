import { Router } from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/authController';
import { RequestHandler } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', registerUser as RequestHandler);
router.post('/login', loginUser as RequestHandler);
router.get('/profile', authMiddleware, getUserProfile);

export default router;
