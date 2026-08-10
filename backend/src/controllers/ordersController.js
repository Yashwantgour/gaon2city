import * as ordersService from '../services/ordersService.js';

/**
 * POST /api/orders
 */
export async function createOrder(req, res, next) {
  try {
    const order = await ordersService.createOrder(req.user.id, req.body);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders
 */
export async function listOrders(req, res, next) {
  try {
    const result = await ordersService.listOrders(req.user.id, {
      role: req.query.role,
      page: req.query.page,
      limit: req.query.limit,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders/:id
 */
export async function getOrder(req, res, next) {
  try {
    const order = await ordersService.getOrderById(req.params.id, req.user.id);
    res.json(order);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/orders/:id/status
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const order = await ordersService.updateOrderStatus(req.params.id, req.user.id, req.body.status);
    res.json(order);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/orders/:id/cancel
 */
export async function cancelOrder(req, res, next) {
  try {
    const order = await ordersService.cancelOrder(req.params.id, req.user.id);
    res.json(order);
  } catch (err) {
    next(err);
  }
}
