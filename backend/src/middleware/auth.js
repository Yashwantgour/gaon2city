import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Authentication middleware.
 * Verifies the Bearer token from the Authorization header using Supabase Auth.
 * Attaches user info to req.user.
 */
export async function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    // Fetch profile for role info
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, seller_type, verification_status')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      ...profile,
    };

    req.accessToken = token;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Optional authentication — does not fail if no token is present,
 * but attaches user if token is valid.
 */
export async function optionalAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      req.user = null;
      return next();
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, seller_type, verification_status')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      ...profile,
    };

    req.accessToken = token;
    next();
  } catch {
    req.user = null;
    next();
  }
}

/**
 * Require admin role.
 * Must be used AFTER authenticate middleware.
 */
export function requireAdmin(req, _res, next) {
  if (!req.user || req.user.seller_type !== 'admin') {
    return next(ApiError.forbidden('Admin access required'));
  }
  next();
}
