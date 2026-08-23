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
    let { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, seller_type, verification_status')
      .eq('id', user.id)
      .single();

    // Auto-create profile row if missing
    if (!profile) {
      const meta = user.user_metadata || {};
      const newProf = {
        id: user.id,
        email: user.email,
        name: meta.name || user.email?.split('@')[0] || 'User',
        phone: meta.phone || null,
        village: meta.village || null,
        city: meta.city || null,
        seller_type: meta.seller_type || 'individual',
        verification_status: 'unverified',
        created_at: new Date().toISOString(),
      };

      const { data: created } = await supabaseAdmin
        .from('profiles')
        .upsert(newProf)
        .select()
        .single();

      profile = created || newProf;
    }

    req.user = {
      ...profile,
      id: user.id,
      email: user.email,
    };

    req.accessToken = token;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Optional authentication middleware.
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
      ...profile,
      id: user.id,
      email: user.email,
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
 */
export function requireAdmin(req, _res, next) {
  if (!req.user || req.user.seller_type !== 'admin') {
    return next(ApiError.forbidden('Admin access required'));
  }
  next();
}
