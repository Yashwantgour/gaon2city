import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addFavoriteValidators, productIdParamValidator } from '../validators/favoritesValidators.js';
import * as favoritesController from '../controllers/favoritesController.js';

const router = Router();

// GET /api/favorites — list all favorites with full product data
router.get('/', authenticate, favoritesController.listFavorites);

// GET /api/favorites/ids — list just favorited product IDs (lightweight)
router.get('/ids', authenticate, favoritesController.listFavoriteIds);

// POST /api/favorites — add a product to favorites
router.post('/', authenticate, addFavoriteValidators, validate, favoritesController.addFavorite);

// GET /api/favorites/check/:productId — check if a product is favorited
router.get('/check/:productId', authenticate, productIdParamValidator, validate, favoritesController.checkFavorite);

// DELETE /api/favorites/:productId — remove a product from favorites
router.delete('/:productId', authenticate, productIdParamValidator, validate, favoritesController.removeFavorite);

export default router;
