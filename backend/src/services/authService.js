import { supabaseAdmin, createUserClient } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

/**
 * Helper to pick active client (user-scoped client with Bearer JWT or admin).
 */
function getClient(accessToken) {
  return accessToken ? createUserClient(accessToken) : supabaseAdmin;
}

/**
 * Get authenticated user's profile.
 * If profile row doesn't exist yet, auto-create it from Supabase Auth metadata.
 */
export async function getMe(userId, accessToken) {
  const client = getClient(accessToken);
  let { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

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
 * Get public seller profile by ID.
 */
export async function getSellerProfile(sellerId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, name, avatar_url, village, city, district, state, seller_type, verification_status, created_at')
    .eq('id', sellerId)
    .single();

  if (error || !data) {
    throw ApiError.notFound('Seller profile not found');
  }

  return data;
}

export async function updateProfile(userId, updates, accessToken) {
  const client = getClient(accessToken);

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

  // Check if profile exists, if not get email from auth user
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id, name, email')
    .eq('id', userId)
    .maybeSingle();

  if (!existingProfile) {
    try {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (authUser?.user) {
        safeUpdates.email = authUser.user.email;
        if (!safeUpdates.name) {
          safeUpdates.name = authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0] || 'User';
        }
      }
    } catch {
      // Ignore
    }
  }

  // 1. Try upsert via supabaseAdmin (service role key bypasses RLS)
  let { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert(safeUpdates, { onConflict: 'id' })
    .select()
    .single();

  // 2. If supabaseAdmin had an issue, fallback to user-scoped client
  if (error && client !== supabaseAdmin) {
    logger.warn(`supabaseAdmin upsert failed (${error.message}), trying user client...`);
    const userRes = await client
      .from('profiles')
      .upsert(safeUpdates, { onConflict: 'id' })
      .select()
      .single();
    data = userRes.data;
    error = userRes.error;
  }

  if (error) {
    logger.error(`Failed to update profile for user ${userId}: ${error.message} (code: ${error.code})`);
    throw ApiError.internal(`Failed to update profile: ${error.message}`);
  }

  return data;
}

