import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Get all favorited products for a user, with full product + seller + images data.
 */
export async function getUserFavorites(userId) {
  const { data, error } = await supabaseAdmin
    .from('favorites')
    .select(`
      product_id,
      created_at,
      product:products!product_id (
        id, seller_id, title, slug, description, price, quantity, condition, status,
        latitude, longitude, pickup_available, delivery_available, created_at,
        seller:profiles!seller_id ( id, name, avatar_url, seller_type, village, city, verification_status ),
        images:product_images ( id, storage_path, display_order )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw ApiError.internal('Failed to fetch favorites');
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
export async function getUserFavoriteIds(userId) {
  const { data, error } = await supabaseAdmin
    .from('favorites')
    .select('product_id')
    .eq('user_id', userId);

  if (error) {
    throw ApiError.internal('Failed to fetch favorite IDs');
  }

  return (data || []).map((f) => f.product_id);
}

/**
 * Add a product to favorites.
 */
export async function addFavorite(userId, productId) {
  // Verify the product exists and is active
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('id, status')
    .eq('id', productId)
    .single();

  if (!product || product.status === 'deleted') {
    throw ApiError.notFound('Product not found');
  }

  // Check if already favorited
  const { data: existing } = await supabaseAdmin
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

  const { data, error } = await supabaseAdmin
    .from('favorites')
    .insert({ user_id: userId, product_id: productId })
    .select()
    .single();

  if (error) {
    throw ApiError.internal('Failed to add favorite');
  }

  return data;
}

/**
 * Remove a product from favorites.
 */
export async function removeFavorite(userId, productId) {
  const { error } = await supabaseAdmin
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    throw ApiError.internal('Failed to remove favorite');
  }

  return { removed: true };
}

/**
 * Check if a specific product is favorited by the user.
 */
export async function checkFavorite(userId, productId) {
  const { data } = await supabaseAdmin
    .from('favorites')
    .select('user_id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .limit(1)
    .maybeSingle();

  return { isFavorited: !!data };
}
