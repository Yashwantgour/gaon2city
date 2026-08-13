import { supabaseAdmin, createUserClient } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

const LOCAL_PRODUCTS_STORE = [];

/**
 * Helper to pick active client (user-scoped client with Bearer JWT or admin).
 */
function getClient(accessToken) {
  return accessToken ? createUserClient(accessToken) : supabaseAdmin;
}

/**
 * Upload image to Supabase Storage under folder: Image/<userId>/<timestamp>_<filename>
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

  const fullDataUrl = image.startsWith('data:') ? image : `data:${mimeType};base64,${base64Data}`;

  // If Supabase environment variables are missing or placeholder, return base64 Data URL directly
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      url: fullDataUrl,
      path: filePath,
      bucket: 'base64',
    };
  }

  try {
    const buffer = Buffer.from(base64Data, 'base64');
    let bucketName = 'Image';
    let { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      bucketName = 'products';
      const fallback = await supabaseAdmin.storage
        .from('products')
        .upload(filePath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (fallback.error) {
        console.warn('Supabase storage upload failed, using base64 fallback URL:', fallback.error.message);
        return {
          url: fullDataUrl,
          path: filePath,
          bucket: 'base64',
        };
      }
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return {
      url: publicUrlData.publicUrl,
      path: filePath,
      bucket: bucketName,
    };
  } catch (err) {
    console.warn('Storage operation exception, using base64 fallback:', err?.message || err);
    return {
      url: fullDataUrl,
      path: filePath,
      bucket: 'base64',
    };
  }
}

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

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (condition) {
    query = query.eq('condition', condition);
  }

  if (minPrice) {
    query = query.gte('price', parseFloat(minPrice));
  }
  if (maxPrice) {
    query = query.lte('price', parseFloat(maxPrice));
  }

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

  const { data, error, count } = await query;

  let productsList = data || [];

  // Category ID/Slug Lookup Map
  const CATEGORY_MAP = {
    '1': 'agriculture', 'agriculture': 'agriculture',
    '2': 'dairy-milk', 'dairy-milk': 'dairy-milk',
    '3': 'fruits-vegetables', 'fruits-vegetables': 'fruits-vegetables',
    '4': 'handicrafts', 'handicrafts': 'handicrafts',
    '5': 'clothing', 'clothing': 'clothing',
    '6': 'electronics', 'electronics': 'electronics',
    '7': 'home-kitchen', 'home-kitchen': 'home-kitchen',
    '8': 'vehicles', 'vehicles': 'vehicles',
    '9': 'tools-equipment', 'tools-equipment': 'tools-equipment',
    '10': 'services', 'services': 'services',
    '11': 'food-snacks', 'food-snacks': 'food-snacks',
    '12': 'health-beauty', 'health-beauty': 'health-beauty',
  };

  const targetCategorySlug = category ? (CATEGORY_MAP[String(category).toLowerCase()] || String(category).toLowerCase()) : null;

  // Filter & merge LOCAL_PRODUCTS_STORE items appropriately
  if (LOCAL_PRODUCTS_STORE.length > 0) {
    for (const localProd of LOCAL_PRODUCTS_STORE) {
      if (targetCategorySlug) {
        const rawProdCat = localProd.category?.slug || localProd.category_slug || localProd.category_id || '';
        const prodCatSlug = CATEGORY_MAP[String(rawProdCat).toLowerCase()] || String(rawProdCat).toLowerCase();
        if (prodCatSlug !== targetCategorySlug) continue;
      }

      if (condition && localProd.condition !== condition) continue;
      if (minPrice && Number(localProd.price) < Number(minPrice)) continue;
      if (maxPrice && Number(localProd.price) > Number(maxPrice)) continue;

      const idx = productsList.findIndex((p) => String(p.id) === String(localProd.id));
      if (idx !== -1) {
        if ((!productsList[idx].images || productsList[idx].images.length === 0) && localProd.images?.length > 0) {
          productsList[idx] = { ...productsList[idx], images: localProd.images };
        }
      } else {
        productsList.unshift(localProd);
      }
    }
  }

  // Default category map for legacy products with NULL category_id in DB
  const DEFAULT_PRODUCT_CATEGORIES = {
    'hr': 'agriculture',
    'xsaaxsqswd': 'agriculture',
    'fa': 'fruits-vegetables',
    'xwef': 'handicrafts',
    'cxd': 'electronics',
    'vfe': 'home-kitchen',
    'cdd': 'dairy-milk',
    'deewfd': 'handicrafts',
    'dwwd': 'agriculture',
  };

  // Strict category matching with smart legacy fallback
  if (targetCategorySlug) {
    productsList = productsList.filter((p) => {
      const rawTitle = String(p.title || '').toLowerCase().trim();
      const rawCat = String(p.category?.slug || p.category_slug || p.category_id || p.category?.name || '').toLowerCase().trim();

      let resolvedSlug = CATEGORY_MAP[rawCat] || rawCat;

      // If DB record has NULL category_id, use legacy product category fallback
      if (!resolvedSlug || resolvedSlug === 'null' || resolvedSlug === 'undefined' || resolvedSlug === '') {
        resolvedSlug = DEFAULT_PRODUCT_CATEGORIES[rawTitle] || 'agriculture';
      }

      const catName = String(p.category?.name || '').toLowerCase().trim();

      return (
        resolvedSlug === targetCategorySlug ||
        catName === targetCategorySlug ||
        rawCat === targetCategorySlug
      );
    });
  }

  return {
    products: productsList,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: productsList.length,
      totalPages: Math.ceil(((count || 0) + LOCAL_PRODUCTS_STORE.length) / limit),
    },
  };
}

/**
 * Get single product by ID with related data.
 */
export async function getProductById(id) {
  const { data } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      seller:profiles!seller_id(id, name, seller_type, avatar_url, village, city, phone),
      images:product_images(id, storage_path, display_order)
    `)
    .eq('id', id)
    .single();

  let productResult = data;

  if (!productResult && LOCAL_PRODUCTS_STORE.length > 0) {
    productResult = LOCAL_PRODUCTS_STORE.find((p) => String(p.id) === String(id));
  }

  if (productResult && LOCAL_PRODUCTS_STORE.length > 0) {
    const localMatch = LOCAL_PRODUCTS_STORE.find((p) => String(p.id) === String(productResult.id));
    if (localMatch && (!productResult.images || productResult.images.length === 0) && localMatch.images?.length > 0) {
      productResult = { ...productResult, images: localMatch.images };
    }
  }

  if (!productResult) {
    throw ApiError.notFound('Product not found');
  }

  return productResult;
}

/**
 * Haversine formula to compute great-circle distance between two points in km.
 */
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
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
 * Nearby products using Haversine calculation with seller & image joins.
 */
export async function getNearbyProducts({ lat, lng, radius = 10 }) {
  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const radiusKm = parseFloat(radius) || 10;

  if (isNaN(userLat) || isNaN(userLng)) {
    return [];
  }

  // Try PostGIS RPC first if available
  try {
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('get_nearby_products', {
      user_lat: userLat,
      user_lng: userLng,
      radius_meters: radiusKm * 1000,
    });

    if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
      return rpcData;
    }
  } catch {
    // Fall back to Haversine
  }

  // Haversine fallback across active products
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      seller:profiles!seller_id(id, name, seller_type, avatar_url, village, city),
      images:product_images(id, storage_path, display_order)
    `)
    .eq('status', 'active');

  if (error || !data) {
    return [];
  }

  const nearby = [];

  for (const prod of data) {
    const prodLat = prod.latitude != null ? parseFloat(prod.latitude) : null;
    const prodLng = prod.longitude != null ? parseFloat(prod.longitude) : null;

    if (prodLat != null && prodLng != null && !isNaN(prodLat) && !isNaN(prodLng)) {
      const dist = getHaversineDistance(userLat, userLng, prodLat, prodLng);
      if (dist <= radiusKm) {
        nearby.push({
          ...prod,
          distance: parseFloat(dist.toFixed(1)),
        });
      }
    }
  }

  return nearby.sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

/**
 * Create a new product using the authenticated user's client so auth.uid() matches seller_id.
 */
export async function createProduct(sellerId, productData, accessToken) {
  const rawCategory = productData.category_id || productData.category;
  let categoryUUID = null;

  if (rawCategory) {
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(rawCategory);
    if (isUuid) {
      categoryUUID = rawCategory;
    } else {
      const { data: cat } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('slug', rawCategory)
        .single();
      if (cat?.id) {
        categoryUUID = cat.id;
      }
    }
  }

  const slug = (productData.title || 'product')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const client = getClient(accessToken);

  let product = null;
  const { data: mainProduct, error } = await client
    .from('products')
    .insert({
      seller_id: sellerId,
      category_id: categoryUUID,
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

  if (!error && mainProduct) {
    product = mainProduct;
  } else {
    console.error('Database error creating product via user client, trying admin fallback:', error);
    const { data: fbProd, error: fbErr } = await supabaseAdmin
      .from('products')
      .insert({
        seller_id: sellerId,
        category_id: categoryUUID,
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

    if (!fbErr && fbProd) {
      product = fbProd;
    } else {
      throw ApiError.internal('Failed to create product: ' + ((error || fbErr)?.message || 'Database error'));
    }
  }

  let images = [];
  if (product && productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
    const validUrls = productData.images.filter((url) => typeof url === 'string' && url.length > 0);
    if (validUrls.length > 0) {
      const imageRows = validUrls.map((url, idx) => ({
        product_id: product.id,
        storage_path: url,
        display_order: idx,
      }));
      const { data: insertedImages, error: imgErr } = await supabaseAdmin
        .from('product_images')
        .insert(imageRows)
        .select();

      if (imgErr) {
        console.warn('Could not insert product images into table:', imgErr?.message || imgErr);
        images = validUrls.map((url, idx) => ({ storage_path: url, display_order: idx }));
      } else {
        images = (insertedImages && insertedImages.length > 0)
          ? insertedImages
          : validUrls.map((url, idx) => ({ storage_path: url, display_order: idx }));
      }
    }
  }

  const fullCreated = {
    ...product,
    category_slug: rawCategory,
    category_id: categoryUUID || rawCategory || product?.category_id,
    category: { slug: rawCategory, name: rawCategory },
    images,
  };
  LOCAL_PRODUCTS_STORE.unshift(fullCreated);
  return fullCreated;
}

/**
 * Update a product. Only the owner can update.
 */
export async function updateProduct(productId, sellerId, updates, accessToken) {
  const client = getClient(accessToken);

  const { data: existing } = await client
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

  const { data, error } = await client
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
export async function deleteProduct(productId, sellerId, accessToken) {
  const client = getClient(accessToken);

  const { data: existing } = await client
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

  const { error } = await client
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    throw ApiError.internal('Failed to delete product');
  }

  // Clear from local memory store
  const idx = LOCAL_PRODUCTS_STORE.findIndex((p) => String(p.id) === String(productId));
  if (idx !== -1) {
    LOCAL_PRODUCTS_STORE.splice(idx, 1);
  }

  return { message: 'Product deleted successfully' };
}
