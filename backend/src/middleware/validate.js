import { validationResult } from 'express-validator';

/**
 * Validation middleware.
 * Runs after express-validator checks and returns 400 if errors are found.
 *
 * Usage:
 *   router.post('/products', [...productValidators], validate, controller.create);
 */
export function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return res.status(400).json({
      message: 'Validation failed',
      errors: messages,
    });
  }

  next();
}
