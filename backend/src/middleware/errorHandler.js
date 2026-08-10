import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Global error handler middleware.
 * Catches all errors and returns clean JSON responses.
 * Never exposes stack traces or internal details in production.
 */
export function errorHandler(err, _req, res, _next) {
  // Known API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Validation errors from express-validator (if thrown as generic Error)
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  // Log unexpected errors
  logger.error('Unexpected error:', err.message);

  // Never leak stack traces in production
  const isDev = process.env.NODE_ENV !== 'production';

  res.status(500).json({
    message: 'Internal server error',
    ...(isDev && { detail: err.message }),
  });
}
