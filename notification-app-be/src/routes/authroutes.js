import { Router } from 'express';
import { registerController, loginController, profileController } from '../controllers/authcontroller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';

const router = Router();

router.post('/register', validate(registerSchema), registerController);
router.post('/login', validate(loginSchema), loginController);
router.get('/profile', authenticate, profileController);

export default router;