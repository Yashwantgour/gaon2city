import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Create an order with items.
 */
export async function createOrder(buyerId, orderData) {
  const { items, fulfillment_type, delivery_location } = orderData;

  // Fetch product details to calculate totals and identify seller
  const productIds = items.map((i) => i.product_id);

  const { data: products, error: prodError } = await supabaseAdmin
    .from('products')
    .select('id, seller_id, price, quantity, status')
    .in('id', productIds);

  if (prodError || !products || products.length !== items.length) {
    throw ApiError.badRequest('One or more products not found');
  }

  // Validate all products are active and have enough stock
  for (const item of items) {
    const product = products.find((p) => p.id === item.product_id);
    if (!product) {
      throw ApiError.badRequest(`Product ${item.product_id} not found`);
    }
    if (product.status !== 'active') {
      throw ApiError.badRequest(`Product ${item.product_id} is not available`);
    }
    if (product.quantity < item.quantity) {
      throw ApiError.badRequest(`Insufficient stock for product ${item.product_id}`);
    }
  }

  // All items must be from the same seller (for single-seller orders)
  const sellerIds = [...new Set(products.map((p) => p.seller_id))];
  if (sellerIds.length > 1) {
    throw ApiError.badRequest('All items in an order must be from the same seller');
  }

  const sellerId = sellerIds[0];

  // Cannot buy from yourself
  if (sellerId === buyerId) {
    throw ApiError.badRequest('You cannot buy your own products');
  }

  // Calculate totals
  let totalAmount = 0;
  const orderItems = items.map((item) => {
    const product = products.find((p) => p.id === item.product_id);
    const subtotal = product.price * item.quantity;
    totalAmount += subtotal;
    return {
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: product.price,
      subtotal,
    };
  });

  // Create order
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      buyer_id: buyerId,
      seller_id: sellerId,
      total_amount: totalAmount,
      status: 'pending',
      payment_status: 'pending',
      fulfillment_type,
      delivery_location: delivery_location || null,
    })
    .select()
    .single();

  if (orderError) {
    throw ApiError.internal('Failed to create order');
  }

  // Create order items
  const itemsWithOrderId = orderItems.map((item) => ({
    ...item,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(itemsWithOrderId);

  if (itemsError) {
    throw ApiError.internal('Failed to create order items');
  }

  // Reduce stock
  for (const item of items) {
    const product = products.find((p) => p.id === item.product_id);
    await supabaseAdmin
      .from('products')
      .update({ quantity: product.quantity - item.quantity })
      .eq('id', item.product_id);
  }

  return { ...order, items: orderItems };
}

/**
 * List orders for a user (as buyer or seller).
 */
export async function listOrders(userId, { role = 'buyer', page = 1, limit = 20 }) {
  const column = role === 'seller' ? 'seller_id' : 'buyer_id';

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      items:order_items(
        id, product_id, quantity, unit_price, subtotal,
        product:products(id, title, slug, images:product_images(storage_path))
      ),
      buyer:profiles!buyer_id(id, name, avatar_url),
      seller:profiles!seller_id(id, name, avatar_url)
    `, { count: 'exact' })
    .eq(column, userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw ApiError.internal('Failed to fetch orders');
  }

  return {
    orders: data || [],
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count || 0,
    },
  };
}

/**
 * Get single order by ID. User must be buyer or seller.
 */
export async function getOrderById(orderId, userId) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      items:order_items(
        id, product_id, quantity, unit_price, subtotal,
        product:products(id, title, slug, images:product_images(storage_path))
      ),
      buyer:profiles!buyer_id(id, name, avatar_url, phone),
      seller:profiles!seller_id(id, name, avatar_url, phone)
    `)
    .eq('id', orderId)
    .single();

  if (error || !data) {
    throw ApiError.notFound('Order not found');
  }

  // Authorization: must be buyer or seller
  if (data.buyer_id !== userId && data.seller_id !== userId) {
    throw ApiError.forbidden('You do not have access to this order');
  }

  return data;
}

/**
 * Update order status. Only seller or admin can update.
 */
export async function updateOrderStatus(orderId, userId, newStatus) {
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('seller_id, status')
    .eq('id', orderId)
    .single();

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.seller_id !== userId) {
    throw ApiError.forbidden('Only the seller can update order status');
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    throw ApiError.internal('Failed to update order status');
  }

  return data;
}

/**
 * Cancel an order. Only buyer can cancel pending orders.
 */
export async function cancelOrder(orderId, userId) {
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('buyer_id, status')
    .eq('id', orderId)
    .single();

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.buyer_id !== userId) {
    throw ApiError.forbidden('Only the buyer can cancel this order');
  }

  if (order.status !== 'pending') {
    throw ApiError.badRequest('Only pending orders can be cancelled');
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    throw ApiError.internal('Failed to cancel order');
  }

  // Restore stock
  const { data: orderItems } = await supabaseAdmin
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', orderId);

  if (orderItems) {
    for (const item of orderItems) {
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('quantity')
        .eq('id', item.product_id)
        .single();

      if (product) {
        await supabaseAdmin
          .from('products')
          .update({ quantity: product.quantity + item.quantity })
          .eq('id', item.product_id);
      }
    }
  }

  return data;
}
