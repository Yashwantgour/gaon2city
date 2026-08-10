import * as productsService from '../services/productsService.js';

/**
 * GET /api/products
 */
export async function listProducts(req, res, next) {
  try {
    const result = await productsService.listProducts({
      search: req.query.search,
      category: req.query.category,
      condition: req.query.condition,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      sort: req.query.sort,
      page: req.query.page,
      limit: req.query.limit,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/nearby
 */
export async function getNearbyProducts(req, res, next) {
  try {
    const result = await productsService.getNearbyProducts({
      lat: req.query.lat,
      lng: req.query.lng,
      radius: req.query.radius,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/:id
 */
export async function getProduct(req, res, next) {
  try {
    const product = await productsService.getProductById(req.params.id);
    res.json(product);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/products
 */
export async function createProduct(req, res, next) {
  try {
    const product = await productsService.createProduct(req.user.id, req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/products/:id
 */
export async function updateProduct(req, res, next) {
  try {
    const product = await productsService.updateProduct(req.params.id, req.user.id, req.body);
    res.json(product);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/products/:id
 */
export async function deleteProduct(req, res, next) {
  try {
    const result = await productsService.deleteProduct(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
