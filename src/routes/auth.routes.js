// src/routes/authRoutes.js
import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validate-request.js';
import { protect } from '../middlewares/auth.js';
import { registerSchema, loginSchema } from '../validation/auth.schema.js';
import { apiLimiter } from '../middlewares/rate-limiter.js';

const router = express.Router();

router.post('/register', apiLimiter,validateBody(registerSchema), register);
router.post('/login', apiLimiter, validateBody(loginSchema), login);
router.get('/me', protect, getMe);

export default router;
