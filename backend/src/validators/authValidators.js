import { body, param } from 'express-validator';

export const updateProfileValidators = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional({ nullable: true })
    .trim()
    .matches(/^[0-9+-\s]{7,20}$/)
    .withMessage('Please provide a valid phone number'),
  body('village')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Village name must not exceed 100 characters'),
  body('city')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('City name must not exceed 100 characters'),
  body('district')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('District name must not exceed 100 characters'),
  body('state')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('State name must not exceed 100 characters'),
  body('postal_code')
    .optional({ nullable: true })
    .trim()
    .matches(/^[0-9]{6}$/)
    .withMessage('Postal code must be a 6-digit PIN code'),
  body('seller_type')
    .optional()
    .isIn(['farmer', 'artisan', 'trader', 'individual', 'local_shop', 'business', 'service_provider', 'admin'])
    .withMessage('Invalid seller type'),
];

export const sellerIdValidator = [
  param('id').notEmpty().withMessage('Seller ID is required'),
];
