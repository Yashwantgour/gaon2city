import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Get authenticated user's profile.
 */
export async function getMe(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw ApiError.notFound('Profile not found');
  }

  return data;
}

/**
 * Update user's profile.
 */
export async function updateProfile(userId, updates) {
  const allowedFields = [
    'name', 'phone', 'avatar_url', 'village', 'city',
    'district', 'state', 'postal_code', 'seller_type',
  ];

  const safeUpdates = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      safeUpdates[key] = updates[key];
    }
  }

  safeUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(safeUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw ApiError.internal('Failed to update profile');
  }

  return data;
}
