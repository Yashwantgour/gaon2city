import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { HiStar, HiOutlineXMark } from 'react-icons/hi2';
import Button from '../common/Button';
import { createReview } from '../../services/reviewsApi';
import { listOrders } from '../../services/ordersApi';

export default function ReviewFormModal({
  isOpen,
  onClose,
  seller,
  product,
  onSuccess,
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const sellerId = seller?.id || product?.seller_id;

  // Fetch delivered orders for this seller
  useEffect(() => {
    async function loadOrders() {
      if (!isOpen || !sellerId) return;
      setIsLoadingOrders(true);
      setError(null);
      try {
        const res = await listOrders({ role: 'buyer' });
        const eligibleOrders = (res.orders || []).filter(
          (o) => (o.seller_id === sellerId || o.seller?.id === sellerId)
        );
        setOrders(eligibleOrders);
        if (eligibleOrders.length > 0) {
          setSelectedOrderId(eligibleOrders[0].id);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    }
    loadOrders();
  }, [isOpen, sellerId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError('Please select a star rating.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // If user has an eligible order, attach order_id, otherwise use fallback demonstration order ID
      const orderIdToUse = selectedOrderId || orders[0]?.id || 'demo-order-fallback';

      await createReview({
        seller_id: sellerId,
        order_id: orderIdToUse,
        rating: Number(rating),
        review: reviewText.trim() || undefined,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to submit review. You must have a delivered order to review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-5 border border-neutral-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Write a Review</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Share your experience with {seller?.name || 'this seller'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Selector */}
            <div className="text-center py-3 bg-amber-50/60 rounded-2xl border border-amber-100/60">
              <label className="block text-xs font-semibold text-neutral-600 mb-2">
                Overall Rating
              </label>
              <div className="flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                  >
                    <HiStar
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-neutral-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-amber-600 mt-1 inline-block">
                {rating === 5
                  ? 'Excellent (5/5)'
                  : rating === 4
                  ? 'Very Good (4/5)'
                  : rating === 3
                  ? 'Average (3/5)'
                  : rating === 2
                  ? 'Below Average (2/5)'
                  : 'Poor (1/5)'}
              </span>
            </div>

            {/* Order Association (If multiple) */}
            {orders.length > 1 && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Select Order
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      Order #{o.id.slice(0, 8)} ({new Date(o.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Review Comments */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Review Comments (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="How was the product freshness, packaging, and pickup experience?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 p-3 text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                size="md"
                type="button"
                fullWidth
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                fullWidth
                isLoading={isSubmitting}
              >
                Submit Review
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
