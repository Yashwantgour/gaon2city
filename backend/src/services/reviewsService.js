import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Create a review. Only for completed orders the user was the buyer of.
 */
export async function createReview(reviewerId, { order_id, seller_id, rating, review }) {
  // Verify the order exists, is completed, and the reviewer is the buyer
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, buyer_id, seller_id, status')
    .eq('id', order_id)
    .single();

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.buyer_id !== reviewerId) {
    throw ApiError.forbidden('Only the buyer can review this transaction');
  }

  if (order.status !== 'delivered') {
    throw ApiError.badRequest('Reviews can only be left for completed (delivered) orders');
  }

  if (order.seller_id !== seller_id) {
    throw ApiError.badRequest('Seller ID does not match the order');
  }

  // Check for duplicate review
  const { data: existingReview } = await supabaseAdmin
    .from('reviews')
    .select('id')
    .eq('order_id', order_id)
    .eq('reviewer_id', reviewerId)
    .limit(1)
    .single();

  if (existingReview) {
    throw ApiError.conflict('You have already reviewed this order');
  }

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .insert({
      order_id,
      reviewer_id: reviewerId,
      seller_id,
      rating,
      review: review || null,
    })
    .select()
    .single();

  if (error) {
    throw ApiError.internal('Failed to create review');
  }

  return data;
}

/**
 * Get all reviews for a seller.
 */
export async function getSellerReviews(sellerId) {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviewer_id(id, name, avatar_url)
    `)
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw ApiError.internal('Failed to fetch reviews');
  }

  // Calculate average rating
  const ratings = (data || []).map((r) => r.rating);
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0;

  return {
    reviews: data || [],
    summary: {
      totalReviews: ratings.length,
      averageRating: Math.round(averageRating * 10) / 10,
    },
  };
}
