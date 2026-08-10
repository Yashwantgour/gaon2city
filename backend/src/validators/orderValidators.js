import { body, param } from 'express-validator';

export const createOrderValidators = [
  body('items')
    .isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.product_id')
    .notEmpty().withMessage('Product ID is required for each item'),
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Each item quantity must be at least 1'),
  body('fulfillment_type')
    .isIn(['pickup', 'delivery']).withMessage('Fulfillment type must be pickup or delivery'),
  body('delivery_location')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Delivery location too long'),
];

export const updateOrderStatusValidators = [
  param('id').notEmpty().withMessage('Order ID is required'),
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
];

export const orderIdValidator = [
  param('id').notEmpty().withMessage('Order ID is required'),
];
