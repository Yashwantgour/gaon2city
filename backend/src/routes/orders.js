import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createOrderValidators,
  updateOrderStatusValidators,
  orderIdValidator,
} from '../validators/orderValidators.js';
import * as ordersController from '../controllers/ordersController.js';

const router = Router();

// All order routes require authentication
router.use(authenticate);

// POST /api/orders — create order
router.post('/', createOrderValidators, validate, ordersController.createOrder);

// GET /api/orders — list my orders (query: role=buyer|seller)
router.get('/', ordersController.listOrders);

// GET /api/orders/:id — get order details
router.get('/:id', orderIdValidator, validate, ordersController.getOrder);

// PATCH /api/orders/:id/status — update order status (seller only)
router.patch('/:id/status', updateOrderStatusValidators, validate, ordersController.updateOrderStatus);

// POST /api/orders/:id/cancel — cancel order (buyer, pending only)
router.post('/:id/cancel', orderIdValidator, validate, ordersController.cancelOrder);

export default router;
