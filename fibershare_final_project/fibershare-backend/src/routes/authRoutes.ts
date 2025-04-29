import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authController';
import { RequestHandler } from 'express';

const router = Router();

router.post('/register', registerUser as RequestHandler);
router.post('/login', loginUser as RequestHandler);

export default router;
