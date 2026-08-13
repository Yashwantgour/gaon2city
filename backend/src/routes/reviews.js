import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createReviewValidators, sellerIdValidator } from '../validators/reviewValidators.js';
import * as reviewsController from '../controllers/reviewsController.js';

const router = Router();

// POST /api/reviews — create review (auth required)
router.post('/', authenticate, createReviewValidators, validate, reviewsController.createReview);

// GET /api/reviews/sellers/:id/reviews & /api/reviews/seller/:id — get seller reviews (public)
router.get('/sellers/:id/reviews', sellerIdValidator, validate, reviewsController.getSellerReviews);
router.get('/seller/:id', sellerIdValidator, validate, reviewsController.getSellerReviews);

export default router;
