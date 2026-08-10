import { body, param } from 'express-validator';

export const createReportValidators = [
  body('reason')
    .isIn(['spam', 'fraud', 'offensive', 'counterfeit', 'other'])
    .withMessage('Valid reason is required'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description must be under 2000 characters'),
  body('reported_user_id')
    .optional()
    .notEmpty().withMessage('Reported user ID cannot be empty if provided'),
  body('product_id')
    .optional()
    .notEmpty().withMessage('Product ID cannot be empty if provided'),
];

export const reportIdValidator = [
  param('id').notEmpty().withMessage('Report ID is required'),
];

export const updateReportValidators = [
  param('id').notEmpty().withMessage('Report ID is required'),
  body('status')
    .isIn(['pending', 'reviewed', 'resolved', 'dismissed'])
    .withMessage('Invalid report status'),
];
