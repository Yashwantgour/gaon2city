import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = Router();

// GET /api/auth/me — get current user's profile
router.get('/me', authenticate, authController.getMe);

// GET /api/auth/seller/:id — get public seller profile
router.get('/seller/:id', authController.getSellerProfile);

// PATCH /api/auth/profile — update current user's profile
router.patch('/profile', authenticate, authController.updateProfile);

export default router;
