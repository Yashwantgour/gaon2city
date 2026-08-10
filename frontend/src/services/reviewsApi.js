import api from './api';

export async function createReview(reviewData) {
  return await api.post('/reviews', reviewData);
}

export async function getSellerReviews(sellerId) {
  return await api.get(`/reviews/sellers/${sellerId}/reviews`);
}
