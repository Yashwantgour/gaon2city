import * as authService from '../services/authService.js';

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile.
 */
export async function getMe(req, res, next) {
  try {
    const profile = await authService.getMe(req.user.id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/auth/profile
 * Update the authenticated user's profile.
 */
export async function updateProfile(req, res, next) {
  try {
    const updated = await authService.updateProfile(req.user.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}
