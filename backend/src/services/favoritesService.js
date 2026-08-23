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
 * Get all favorited products for a user, with full product + seller + images data.
 */
export async function getUserFavorites(userId, accessToken) {
  const client = getClient(accessToken);
  const { data, error } = await client
    .from('favorites')
    .select(`
      product_id,
      created_at,
      product:products (
        id, seller_id, title, slug, description, price, quantity, condition, status,
        latitude, longitude, pickup_available, delivery_available, created_at,
        seller:profiles!seller_id ( id, name, avatar_url, seller_type, village, city, verification_status ),
        images:product_images ( id, storage_path, display_order )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error(`Failed to fetch favorites for user ${userId}: ${error.message}`);
    throw ApiError.internal(`Failed to fetch favorites: ${error.message}`);
  }

  // Filter out any favorites where the product was deleted or is no longer active
  const favorites = (data || [])
    .filter((f) => f.product && f.product.status !== 'deleted')
    .map((f) => ({
      ...f.product,
      favorited_at: f.created_at,
      images: (f.product.images || []).sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
    }));

  return favorites;
}

/**
 * Get just the product IDs that a user has favorited (for bulk-checking on marketplace).
 */
export async function getUserFavoriteIds(userId, accessToken) {
  const client = getClient(accessToken);
  const { data, error } = await client
    .from('favorites')
    .select('product_id')
    .eq('user_id', userId);

  if (error) {
    logger.error(`Failed to fetch favorite IDs for user ${userId}: ${error.message}`);
    throw ApiError.internal(`Failed to fetch favorite IDs: ${error.message}`);
  }

  return (data || []).map((f) => f.product_id);
}

/**
 * Add a product to favorites.
 */
export async function addFavorite(userId, productId, accessToken) {
  const client = getClient(accessToken);

  // 1. Verify the product exists and is active
  const { data: product, error: prodErr } = await supabaseAdmin
    .from('products')
    .select('id, status')
    .eq('id', productId)
    .maybeSingle();

  if (prodErr || !product || product.status === 'deleted') {
    throw ApiError.notFound('Product not found or has been deleted');
  }

  // 2. Check if already favorited
  const { data: existing } = await client
    .from('favorites')
    .select('user_id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .limit(1)
    .maybeSingle();

  if (existing) {
    // Already favorited — return silently (idempotent)
    return { product_id: productId, already_existed: true };
  }

  // 3. Insert favorite with user-scoped client
  const { data, error } = await client
    .from('favorites')
    .insert({ user_id: userId, product_id: productId })
    .select()
    .single();

  if (error) {
    logger.error(`Failed to insert favorite: ${error.message} (code: ${error.code})`);
    throw ApiError.internal(`Failed to add favorite: ${error.message}`);
  }

  return data;
}

/**
 * Remove a product from favorites.
 */
export async function removeFavorite(userId, productId, accessToken) {
  const client = getClient(accessToken);
  const { error } = await client
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    logger.error(`Failed to delete favorite: ${error.message}`);
    throw ApiError.internal(`Failed to remove favorite: ${error.message}`);
  }

  return { removed: true };
}

/**
 * Check if a specific product is favorited by the user.
 */
export async function checkFavorite(userId, productId, accessToken) {
  const client = getClient(accessToken);
  const { data, error } = await client
    .from('favorites')
    .select('user_id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .limit(1)
    .maybeSingle();

  if (error) {
    logger.error(`Failed to check favorite: ${error.message}`);
  }

  return { isFavorited: !!data };
}

