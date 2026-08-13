import { query } from 'express-validator';

export const routeValidators = [
  query('origin_lat')
    .notEmpty()
    .withMessage('origin_lat is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('origin_lat must be a valid latitude between -90 and 90'),

  query('origin_lng')
    .notEmpty()
    .withMessage('origin_lng is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('origin_lng must be a valid longitude between -180 and 180'),

  query('dest_lat')
    .notEmpty()
    .withMessage('dest_lat is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('dest_lat must be a valid latitude between -90 and 90'),

  query('dest_lng')
    .notEmpty()
    .withMessage('dest_lng is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('dest_lng must be a valid longitude between -180 and 180'),

  query('profile')
    .optional()
    .isIn(['driving', 'walking', 'cycling'])
    .withMessage('profile must be driving, walking, or cycling'),
];
