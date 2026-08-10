import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Get authenticated user's profile.
 * If profile row doesn't exist yet, auto-create it from Supabase Auth metadata.
 */
export async function getMe(userId) {
  let { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    // Attempt auto-creation from auth metadata
    try {
      const { data: authRes } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (authRes?.user) {
        const u = authRes.user;
        const meta = u.user_metadata || {};
        const newProfile = {
          id: u.id,
          email: u.email,
          name: meta.name || u.email?.split('@')[0] || 'User',
          phone: meta.phone || null,
          village: meta.village || null,
          city: meta.city || null,
          seller_type: meta.seller_type || 'individual',
          verification_status: 'unverified',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: created, error: createErr } = await supabaseAdmin
          .from('profiles')
          .upsert(newProfile)
          .select()
          .single();

        if (!createErr && created) {
          return created;
        }
      }
    } catch {
      // Fallback
    }

    throw ApiError.notFound('Profile not found');
  }

  return data;
}

/**
 * Update user's profile using upsert so missing profile rows are created automatically.
 */
export async function updateProfile(userId, updates) {
  const allowedFields = [
    'name', 'phone', 'avatar_url', 'village', 'city',
    'district', 'state', 'postal_code', 'seller_type',
  ];

  const safeUpdates = { id: userId };
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      safeUpdates[key] = updates[key];
    }
  }

  safeUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert(safeUpdates)
    .select()
    .single();

  if (error) {
    throw ApiError.internal('Failed to update profile');
  }

  return data;
}
