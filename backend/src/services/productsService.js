import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * List products with filters, search, pagination, and sorting.
 */
export async function listProducts({ search, category, condition, minPrice, maxPrice, sort, page = 1, limit = 12 }) {
  let query = supabaseAdmin
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      seller:profiles!seller_id(id, name, seller_type, avatar_url, village, city),
      images:product_images(id, storage_path, display_order)
    `, { count: 'exact' })
    .eq('status', 'active');

  // Search
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Category filter
  if (category) {
    query = query.eq('category_id', category);
  }

  // Condition filter
  if (condition) {
    query = query.eq('condition', condition);
  }

  // Price range
  if (minPrice) {
    query = query.gte('price', parseFloat(minPrice));
  }
  if (maxPrice) {
    query = query.lte('price', parseFloat(maxPrice));
  }

  // Sorting
  switch (sort) {
    case 'price-low':
      query = query.order('price', { ascending: true });
      break;
    case 'price-high':
      query = query.order('price', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw ApiError.internal('Failed to fetch products');
  }

  return {
    products: data || [],
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  };
}

/**
 * Get single product by ID with related data.
 */
export async function getProductById(id) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      seller:profiles!seller_id(id, name, seller_type, avatar_url, village, city, phone),
      images:product_images(id, storage_path, display_order)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    throw ApiError.notFound('Product not found');
  }

  return data;
}

/**
 * Nearby products using PostGIS.
 * Converts radius from km to meters.
 */
export async function getNearbyProducts({ lat, lng, radius = 10 }) {
  const radiusMeters = radius * 1000;

  const { data, error } = await supabaseAdmin.rpc('get_nearby_products', {
    user_lat: parseFloat(lat),
    user_lng: parseFloat(lng),
    radius_meters: radiusMeters,
  });

  if (error) {
    throw ApiError.internal('Failed to fetch nearby products');
  }

  return data || [];
}

/**
 * Create a new product.
 */
export async function createProduct(sellerId, productData) {
  const slug = productData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      seller_id: sellerId,
      category_id: productData.category_id,
      title: productData.title,
      slug: `${slug}-${Date.now()}`,
      description: productData.description,
      price: productData.price,
      quantity: productData.quantity,
      condition: productData.condition,
      status: 'active',
      latitude: productData.latitude || null,
      longitude: productData.longitude || null,
      pickup_available: productData.pickup_available ?? true,
      delivery_available: productData.delivery_available ?? false,
    })
    .select()
    .single();

  if (error) {
    throw ApiError.internal('Failed to create product');
  }

  return data;
}

/**
 * Update a product. Only the owner can update.
 */
export async function updateProduct(productId, sellerId, updates) {
  // Verify ownership
  const { data: existing } = await supabaseAdmin
    .from('products')
    .select('seller_id')
    .eq('id', productId)
    .single();

  if (!existing) {
    throw ApiError.notFound('Product not found');
  }

  if (existing.seller_id !== sellerId) {
    throw ApiError.forbidden('You can only edit your own products');
  }

  const allowedFields = [
    'title', 'description', 'price', 'quantity', 'condition',
    'status', 'category_id', 'latitude', 'longitude',
    'pickup_available', 'delivery_available',
  ];

  const safeUpdates = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      safeUpdates[key] = updates[key];
    }
  }

  safeUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(safeUpdates)
    .eq('id', productId)
    .select()
    .single();

  if (error) {
    throw ApiError.internal('Failed to update product');
  }

  return data;
}

/**
 * Delete a product. Only the owner can delete.
 */
export async function deleteProduct(productId, sellerId) {
  const { data: existing } = await supabaseAdmin
    .from('products')
    .select('seller_id')
    .eq('id', productId)
    .single();

  if (!existing) {
    throw ApiError.notFound('Product not found');
  }

  if (existing.seller_id !== sellerId) {
    throw ApiError.forbidden('You can only delete your own products');
  }

  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    throw ApiError.internal('Failed to delete product');
  }

  return { message: 'Product deleted successfully' };
}
