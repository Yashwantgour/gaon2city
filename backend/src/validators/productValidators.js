import { body, query, param } from 'express-validator';

export const createProductValidators = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 5000 }).withMessage('Description must be under 5000 characters'),
  body('price')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('category_id')
    .optional({ nullable: true }),
  body('condition')
    .optional({ nullable: true })
    .isIn(['new', 'used-like-new', 'used-good', 'used-fair', 'used', 'refurbished'])
    .withMessage('Invalid condition value'),
  body('latitude')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('pickup_available')
    .optional()
    .isBoolean().withMessage('pickup_available must be boolean'),
  body('delivery_available')
    .optional()
    .isBoolean().withMessage('delivery_available must be boolean'),
];

export const updateProductValidators = [
  param('id').notEmpty().withMessage('Product ID is required'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description must be under 5000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Quantity must be 0 or more'),
  body('condition')
    .optional()
    .isIn(['new', 'used-like-new', 'used-good', 'used-fair', 'used', 'refurbished'])
    .withMessage('Invalid condition value'),
];

export const nearbyProductValidators = [
  query('lat')
    .isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  query('lng')
    .isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  query('radius')
    .optional()
    .isFloat({ min: 1, max: 500 }).withMessage('Radius must be between 1 and 500 km'),
];

export const productIdValidator = [
  param('id').notEmpty().withMessage('Product ID is required'),
];
