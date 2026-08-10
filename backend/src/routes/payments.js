import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/auth.js';
import * as paymentsController from '../controllers/paymentsController.js';

const router = Router();

// Stricter rate limit for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many payment requests, please try again later.' },
});

router.use(paymentLimiter);

// POST /api/payments/create-order — create Razorpay order (auth required)
router.post('/create-order', authenticate, paymentsController.createPaymentOrder);

// POST /api/payments/verify — verify payment signature (auth required)
router.post('/verify', authenticate, paymentsController.verifyPayment);

// POST /api/payments/webhook — Razorpay webhook (no auth — verified by signature)
router.post('/webhook', paymentsController.handleWebhook);

// GET /api/payments/:id — get payment details (auth required)
router.get('/:id', authenticate, paymentsController.getPayment);

export default router;
