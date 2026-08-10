import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

/**
 * Payments service — Razorpay integration (future).
 * All functions are placeholder-ready. Fill in when Razorpay keys are added to .env.
 */

/**
 * Create a Razorpay order.
 */
export async function createPaymentOrder(orderId, amount) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw ApiError.internal('Payment gateway not configured');
  }

  // TODO: Initialize Razorpay and create order
  // const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  // const order = await razorpay.orders.create({
  //   amount: amount * 100, // Razorpay expects paise
  //   currency: 'INR',
  //   receipt: `order_${orderId}`,
  // });

  logger.info(`Payment order creation requested for order: ${orderId}`);

  return {
    message: 'Payment gateway not yet configured. Add RAZORPAY keys to .env.',
    orderId,
    amount,
  };
}

/**
 * Verify Razorpay payment signature.
 */
export async function verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    throw ApiError.internal('Payment gateway not configured');
  }

  // TODO: Verify signature using crypto.createHmac
  // const generated_signature = crypto
  //   .createHmac('sha256', keySecret)
  //   .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  //   .digest('hex');
  //
  // if (generated_signature !== razorpay_signature) {
  //   throw ApiError.badRequest('Invalid payment signature');
  // }

  logger.info(`Payment verification requested: ${razorpay_payment_id}`);

  return {
    message: 'Payment verification not yet configured. Add RAZORPAY keys to .env.',
  };
}

/**
 * Handle Razorpay webhook event.
 */
export async function handleWebhook(body, signature) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw ApiError.internal('Webhook secret not configured');
  }

  // TODO: Verify webhook signature and process event
  logger.info('Webhook received');

  return { status: 'received' };
}

/**
 * Get payment details.
 */
export async function getPayment(paymentId) {
  // TODO: Fetch from payments table
  logger.info(`Payment details requested: ${paymentId}`);

  return {
    message: 'Payment lookup not yet configured.',
    paymentId,
  };
}
