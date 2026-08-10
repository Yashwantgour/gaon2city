import * as reviewsService from '../services/reviewsService.js';

/**
 * POST /api/reviews
 */
export async function createReview(req, res, next) {
  try {
    const review = await reviewsService.createReview(req.user.id, req.body);
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/sellers/:id/reviews
 */
export async function getSellerReviews(req, res, next) {
  try {
    const result = await reviewsService.getSellerReviews(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
