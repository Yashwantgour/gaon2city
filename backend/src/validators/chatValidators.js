import { body, param } from 'express-validator';

export const createConversationValidators = [
  body('seller_id')
    .notEmpty().withMessage('Seller ID is required'),
  body('product_id')
    .optional()
    .notEmpty().withMessage('Product ID cannot be empty if provided'),
];

export const sendMessageValidators = [
  param('id').notEmpty().withMessage('Conversation ID is required'),
  body('message')
    .trim()
    .notEmpty().withMessage('Message cannot be empty')
    .isLength({ max: 2000 }).withMessage('Message must be under 2000 characters'),
];

export const conversationIdValidator = [
  param('id').notEmpty().withMessage('Conversation ID is required'),
];

export const messageIdValidator = [
  param('id').notEmpty().withMessage('Message ID is required'),
];
