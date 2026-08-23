import { body, param } from 'express-validator';

export const addFavoriteValidators = [
  body('product_id')
    .isUUID()
    .withMessage('product_id must be a valid UUID'),
];

export const productIdParamValidator = [
  param('productId')
    .isUUID()
    .withMessage('productId must be a valid UUID'),
];
