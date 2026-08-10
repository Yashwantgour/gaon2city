import { body, param } from 'express-validator';

export const createReviewValidators = [
  body('order_id')
    .notEmpty().withMessage('Order ID is required'),
  body('seller_id')
    .notEmpty().withMessage('Seller ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Review must be under 2000 characters'),
];

export const sellerIdValidator = [
  param('id').notEmpty().withMessage('Seller ID is required'),
];
