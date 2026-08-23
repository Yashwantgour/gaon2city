import * as favoritesService from '../services/favoritesService.js';

/**
 * GET /api/favorites — list all user favorites with full product data
 */
export async function listFavorites(req, res, next) {
  try {
    const favorites = await favoritesService.getUserFavorites(req.user.id);
    res.json(favorites);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/favorites/ids — list just the product IDs (for bulk-checking)
 */
export async function listFavoriteIds(req, res, next) {
  try {
    const ids = await favoritesService.getUserFavoriteIds(req.user.id);
    res.json(ids);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/favorites — add a product to favorites
 */
export async function addFavorite(req, res, next) {
  try {
    const result = await favoritesService.addFavorite(req.user.id, req.body.product_id);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/favorites/:productId — remove a product from favorites
 */
export async function removeFavorite(req, res, next) {
  try {
    const result = await favoritesService.removeFavorite(req.user.id, req.params.productId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/favorites/check/:productId — check if a product is favorited
 */
export async function checkFavorite(req, res, next) {
  try {
    const result = await favoritesService.checkFavorite(req.user.id, req.params.productId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
