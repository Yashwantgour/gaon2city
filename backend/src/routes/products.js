import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createProductValidators,
  updateProductValidators,
  nearbyProductValidators,
  productIdValidator,
} from '../validators/productValidators.js';
import * as productsController from '../controllers/productsController.js';

const router = Router();

// GET /api/products — list products (public, optional auth for personalization)
router.get('/', optionalAuth, productsController.listProducts);

// GET /api/products/nearby — nearby products (public)
router.get('/nearby', nearbyProductValidators, validate, productsController.getNearbyProducts);

// GET /api/products/:id — single product (public)
router.get('/:id', productIdValidator, validate, productsController.getProduct);

// POST /api/products — create product (auth required)
router.post('/', authenticate, createProductValidators, validate, productsController.createProduct);

// PATCH /api/products/:id — update product (auth required, owner only)
router.patch('/:id', authenticate, updateProductValidators, validate, productsController.updateProduct);

// DELETE /api/products/:id — delete product (auth required, owner only)
router.delete('/:id', authenticate, productIdValidator, validate, productsController.deleteProduct);

export default router;
