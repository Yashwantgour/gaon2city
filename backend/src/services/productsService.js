import { supabaseAdmin, createUserClient } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Helper to pick active client (user-scoped client with Bearer JWT or admin).
 */
function getClient(accessToken) {
  return accessToken ? createUserClient(accessToken) : supabaseAdmin;
}

/**
 * Format image path to full public URL if relative.
 */
export function formatImageUrl(storagePath) {
  if (!storagePath) return null;
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath;
  }
  const { data } = supabaseAdmin.storage.from('products').getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Upload image to Supabase Storage under folder: <userId>/<timestamp>_<filename>
 * Strict: Fails with ApiError if Supabase Storage upload fails. Never falls back to base64.
 */
export async function uploadProductImage(userId, { image, name }) {
  if (!image) {
    throw ApiError.badRequest('No image data provided');
  }

  // Parse base64 string
  let mimeType = 'image/jpeg';
  let base64Data = image;

  if (image.startsWith('data:')) {
    const matches = image.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    } else {
      base64Data = image.split(',')[1] || image;
    }
  }

  if (mimeType === 'image/jpg') {
    mimeType = 'image/jpeg';
  }

  const ext = mimeType.split('/')[1] || 'jpeg';
  const cleanName = (name || 'photo').replace(/[^a-zA-Z0-9_\.-]/g, '_');
  const fileName = `${Date.now()}_${cleanName}.${ext}`;
  const filePath = `${userId}/${fileName}`;

  const buffer = Buffer.from(base64Data, 'base64');
  let bucketName = 'products';

  // Attempt upload to 'products' bucket
  let { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  // Fallback check to 'Image' bucket if 'products' does not exist
  if (error && error.message?.includes('not found')) {
    bucketName = 'Image';
    const retry = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    throw ApiError.internal(`Failed to upload image to Supabase Storage: ${error.message}`);
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return {
    url: publicUrlData.publicUrl,
    path: filePath,
    bucket: bucketName,
  };
}

/**
 * Great-circle distance helper (Haversine formula).
 */
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * List products with filtering, search, pagination, and sorting.
 */
export async function listProducts({
  page = 1,
  limit = 12,
  search,
  category,
  condition,
  minPrice,
  maxPrice,
  pickup,
  delivery,
  sort = 'newest',
  seller_id,
}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      seller:profiles!seller_id(id, name, seller_type, avatar_url, village, city),
      images:product_images(id, storage_path, display_order)
    `, { count: 'exact' });

  // Only active products
  query = query.eq('status', 'active');

  // Filter by seller_id
  if (seller_id) {
    query = query.eq('seller_id', seller_id);
  }

  // Filter by category slug
  if (category) {
    const { data: catData } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single();

    if (catData) {
      query = query.eq('category_id', catData.id);
    }
  }

  // Filter by condition
  if (condition) {
    query = query.eq('condition', condition);
  }

  // Filter by price range
  if (minPrice) {
    query = query.gte('price', parseFloat(minPrice));
  }
  if (maxPrice) {
    query = query.lte('price', parseFloat(maxPrice));
  }

  // Filter by pickup / delivery
  if (pickup === 'true' || pickup === true) {
    query = query.eq('pickup_available', true);
  }
  if (delivery === 'true' || delivery === true) {
    query = query.eq('delivery_available', true);
  }

  // Text search
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
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
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw ApiError.internal('Failed to fetch products: ' + error.message);
  }

  const formattedProducts = (data || []).map((p) => ({
    ...p,
    images: (p.images || []).map((img) => ({
      ...img,
      storage_path: formatImageUrl(img.storage_path),
    })),
  }));

  return {
    products: formattedProducts,
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
      seller:profiles!seller_id(id, name, email, phone, avatar_url, village, city, seller_type, verification_status),
      images:product_images(id, storage_path, display_order)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    throw ApiError.notFound('Product not found');
  }

  return {
    ...data,
    images: (data.images || []).map((img) => ({
      ...img,
      storage_path: formatImageUrl(img.storage_path),
    })),
  };
}

/**
 * Get nearby products using PostGIS / Haversine formula.
 */
export async function getNearbyProducts({ lat, lng, radius = 10 }) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radiusKm = parseFloat(radius);

  if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
    throw ApiError.badRequest('lat, lng, and radius must be valid numbers');
  }

  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      seller:profiles!seller_id(id, name, seller_type, avatar_url, village, city, latitude, longitude),
      images:product_images(id, storage_path, display_order)
    `)
    .eq('status', 'active');

  if (error) {
    throw ApiError.internal('Failed to fetch nearby products: ' + error.message);
  }

  const nearbyList = [];
  for (const prod of (products || [])) {
    const prodLat = prod.latitude != null ? parseFloat(prod.latitude) : prod.seller?.latitude != null ? parseFloat(prod.seller.latitude) : null;
    const prodLng = prod.longitude != null ? parseFloat(prod.longitude) : prod.seller?.longitude != null ? parseFloat(prod.seller.longitude) : null;

    if (prodLat != null && prodLng != null && !isNaN(prodLat) && !isNaN(prodLng)) {
      const distance = getHaversineDistance(latitude, longitude, prodLat, prodLng);
      if (distance <= radiusKm) {
        nearbyList.push({
          ...prod,
          distance: parseFloat(distance.toFixed(1)),
          images: (prod.images || []).map((img) => ({
            ...img,
            storage_path: formatImageUrl(img.storage_path),
          })),
        });
      }
    }
  }

  nearbyList.sort((a, b) => a.distance - b.distance);
  return nearbyList;
}

/**
 * Create a new product.
 */
export async function createProduct(sellerId, productData, accessToken) {
  const {
    title,
    description,
    category_id,
    category: rawCategory,
    price,
    quantity = 1,
    unit = 'unit',
    condition = 'new',
    pickup_available = true,
    delivery_available = false,
    latitude,
    longitude,
    images = [],
  } = productData;

  const client = getClient(accessToken);

  // Auto-generate slug
  const baseSlug = (title || 'product')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const slug = `${baseSlug}-${Date.now()}`;

  // Validate category_id
  let validCategoryId = category_id;
  if (!validCategoryId && rawCategory) {
    const { data: catRow } = await supabaseAdmin
      .from('categories')
      .select('id')
      .ilike('slug', rawCategory)
      .single();
    if (catRow) validCategoryId = catRow.id;
  }

  const insertPayload = {
    seller_id: sellerId,
    title,
    slug,
    description,
    category_id: validCategoryId || null,
    price: parseFloat(price),
    quantity: parseInt(quantity) || 1,
    condition,
    status: 'active',
    pickup_available: pickup_available === true || pickup_available === 'true',
    delivery_available: delivery_available === true || delivery_available === 'true',
    latitude: latitude ? parseFloat(latitude) : null,
    longitude: longitude ? parseFloat(longitude) : null,
  };

  const { data: product, error } = await client
    .from('products')
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    throw ApiError.internal('Failed to create product: ' + error.message);
  }

  // Insert image records
  if (images && images.length > 0) {
    const imageInserts = images.map((img, index) => {
      const storagePath = typeof img === 'string' ? img : img.storage_path || img.url;

      // Reject base64 data URLs from permanent storage
      if (storagePath && storagePath.startsWith('data:image/')) {
        throw ApiError.badRequest('Direct Data URLs cannot be saved as permanent product images. Please upload images via the upload endpoint first.');
      }

      return {
        product_id: product.id,
        storage_path: storagePath,
        display_order: index,
      };
    });

    const { error: imgError } = await supabaseAdmin
      .from('product_images')
      .insert(imageInserts);

    if (imgError) {
      console.error('Failed to insert product images:', imgError);
    }
  }

  return await getProductById(product.id);
}

/**
 * Update a product. Only the owner can update.
 */
export async function updateProduct(productId, sellerId, updates, accessToken) {
  const client = getClient(accessToken);

  const { data: existing } = await client
    .from('products')
    .select('id, seller_id')
    .eq('id', productId)
    .single();

  if (!existing) {
    throw ApiError.notFound('Product not found');
  }

  if (existing.seller_id !== sellerId) {
    throw ApiError.forbidden('You can only update your own products');
  }

  const {
    title,
    description,
    category_id,
    category: rawCategory,
    price,
    quantity,
    unit,
    condition,
    pickup_available,
    delivery_available,
    latitude,
    longitude,
    images,
  } = updates;

  // Validate category_id if raw category slug provided
  let validCategoryId = category_id;
  if (!validCategoryId && rawCategory) {
    const { data: catRow } = await supabaseAdmin
      .from('categories')
      .select('id')
      .ilike('slug', rawCategory)
      .single();
    if (catRow) validCategoryId = catRow.id;
  }

  const updatePayload = {};
  if (title !== undefined) updatePayload.title = title;
  if (description !== undefined) updatePayload.description = description;
  if (validCategoryId !== undefined) updatePayload.category_id = validCategoryId || null;
  if (price !== undefined) updatePayload.price = parseFloat(price);
  if (quantity !== undefined) updatePayload.quantity = parseInt(quantity);
  if (condition !== undefined) updatePayload.condition = condition;
  if (pickup_available !== undefined) {
    updatePayload.pickup_available = pickup_available === true || pickup_available === 'true';
  }
  if (delivery_available !== undefined) {
    updatePayload.delivery_available = delivery_available === true || delivery_available === 'true';
  }
  if (latitude !== undefined) updatePayload.latitude = latitude ? parseFloat(latitude) : null;
  if (longitude !== undefined) updatePayload.longitude = longitude ? parseFloat(longitude) : null;

  if (Object.keys(updatePayload).length > 0) {
    const { error } = await client
      .from('products')
      .update(updatePayload)
      .eq('id', productId);

    if (error) {
      throw ApiError.internal('Failed to update product: ' + error.message);
    }
  }

  // Update image rows if provided
  if (Array.isArray(images)) {
    // Delete existing product_images for this product
    await supabaseAdmin
      .from('product_images')
      .delete()
      .eq('product_id', productId);

    if (images.length > 0) {
      const imageInserts = images.map((img, index) => {
        const storagePath = typeof img === 'string' ? img : img.storage_path || img.url;

        // Reject raw base64 data URLs
        if (storagePath && storagePath.startsWith('data:image/')) {
          throw ApiError.badRequest('Direct Data URLs cannot be saved as permanent product images. Please upload images via the upload endpoint first.');
        }

        return {
          product_id: productId,
          storage_path: storagePath,
          display_order: index,
        };
      });

      const { error: imgError } = await supabaseAdmin
        .from('product_images')
        .insert(imageInserts);

      if (imgError) {
        console.error('Failed to update product images:', imgError);
      }
    }
  }

  return await getProductById(productId);
}

/**
 * Delete a product. Only the owner can delete.
 */
export async function deleteProduct(productId, sellerId, accessToken) {
  const client = getClient(accessToken);

  const { data: existing } = await client
    .from('products')
    .select('id, seller_id')
    .eq('id', productId)
    .single();

  if (!existing) {
    throw ApiError.notFound('Product not found');
  }

  if (existing.seller_id !== sellerId) {
    throw ApiError.forbidden('You can only delete your own products');
  }

  const { error } = await client
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    throw ApiError.internal('Failed to delete product: ' + error.message);
  }

  return { message: 'Product deleted successfully' };
}
