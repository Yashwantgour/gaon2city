import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { HiOutlineFlag, HiOutlineXMark, HiOutlineShieldExclamation } from 'react-icons/hi2';
import Button from './Button';
import { createReport } from '../../services/reportsApi';

const REPORT_REASONS = [
  { id: 'misleading', label: 'Misleading description or fake product info' },
  { id: 'counterfeit', label: 'Counterfeit / sub-standard goods' },
  { id: 'pricing_scam', label: 'Price gouging or suspected fraudulent activity' },
  { id: 'inappropriate', label: 'Inappropriate or offensive content' },
  { id: 'other', label: 'Other violation' },
];

export default function ReportModal({
  isOpen,
  onClose,
  productId,
  reportedUserId,
  productTitle,
  userName,
}) {
  const [reason, setReason] = useState(REPORT_REASONS[0].id);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await createReport({
        product_id: productId || undefined,
        reported_user_id: reportedUserId || undefined,
        reason,
        description: description.trim() || undefined,
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1800);
    } catch (err) {
      setError(err?.message || 'Failed to submit report. Please try again.');
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
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <HiOutlineFlag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Report Listing / Seller</h3>
                <p className="text-xs text-neutral-500">
                  {productTitle ? `Regarding: ${productTitle}` : `Seller: ${userName || 'User'}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            <div className="py-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <h4 className="text-sm font-bold text-neutral-800">Report Submitted</h4>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Thank you for helping keep the Gaon2City community authentic and trustworthy.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2">
                  Violation Category
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        reason === r.id
                          ? 'border-red-500 bg-red-50/50 font-semibold text-neutral-900'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="report_reason"
                        value={r.id}
                        checked={reason === r.id}
                        onChange={(e) => setReason(e.target.value)}
                        className="mt-0.5 text-red-600 focus:ring-red-500"
                      />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide context to assist community moderation..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 p-3 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                  {error}
                </div>
              )}

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
                  variant="danger"
                  size="md"
                  type="submit"
                  fullWidth
                  isLoading={isSubmitting}
                >
                  Submit Report
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
