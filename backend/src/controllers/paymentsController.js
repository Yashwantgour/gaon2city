import * as paymentsService from '../services/paymentsService.js';

/**
 * POST /api/payments/create-order
 */
export async function createPaymentOrder(req, res, next) {
  try {
    const result = await paymentsService.createPaymentOrder(req.body.order_id, req.body.amount);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/payments/verify
 */
export async function verifyPayment(req, res, next) {
  try {
    const result = await paymentsService.verifyPayment(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/payments/webhook
 */
export async function handleWebhook(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const result = await paymentsService.handleWebhook(req.body, signature);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/payments/:id
 */
export async function getPayment(req, res, next) {
  try {
    const result = await paymentsService.getPayment(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
