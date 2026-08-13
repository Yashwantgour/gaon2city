import { motion } from 'framer-motion';
import { HiStar, HiOutlineShieldCheck, HiOutlinePencilSquare } from 'react-icons/hi2';
import Button from '../common/Button';

export default function ReviewList({
  reviews = [],
  summary = { totalReviews: 0, averageRating: 0 },
  onWriteReview,
  canReview = true,
  isLoading = false,
}) {
  const { totalReviews, averageRating } = summary;

  // Compute breakdown percentages
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
  });

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-xs space-y-6">
      {/* Header & Rating Breakdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
        <div className="flex items-center gap-4">
          <div className="text-center p-4 bg-amber-50 rounded-2xl border border-amber-100/60 min-w-[100px]">
            <span className="text-3xl font-extrabold text-amber-600 leading-none">
              {averageRating > 0 ? averageRating.toFixed(1) : '5.0'}
            </span>
            <div className="flex justify-center text-amber-400 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <HiStar
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating || 5)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-neutral-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-neutral-500 mt-1 block">
              {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex-1 space-y-1.5 min-w-[180px]">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star] || 0;
              const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : star === 5 ? 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="w-5 font-medium">{star}★</span>
                  <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[11px] text-neutral-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {canReview && (
          <div className="self-start sm:self-center">
            <Button
              variant="outline"
              size="md"
              icon={<HiOutlinePencilSquare className="w-4 h-4" />}
              onClick={onWriteReview}
            >
              Write a Review
            </Button>
          </div>
        )}
      </div>

      {/* Reviews Stream */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-neutral-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-2 text-xl">
              ⭐
            </div>
            <h4 className="text-sm font-semibold text-neutral-800">No reviews yet</h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              Be the first to share your experience with this seller!
            </p>
          </div>
        ) : (
          reviews.map((rev) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-neutral-50/70 border border-neutral-100 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                    {rev.reviewer?.avatar_url ? (
                      <img src={rev.reviewer.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (rev.reviewer?.name || 'B').charAt(0)
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-neutral-800">
                      {rev.reviewer?.name || 'Verified Buyer'}
                    </h5>
                    <div className="flex items-center gap-1.5">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <HiStar
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'text-amber-400' : 'text-neutral-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-100">
                  <HiOutlineShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Purchase</span>
                </div>
              </div>

              {rev.review && (
                <p className="text-xs text-neutral-700 leading-relaxed pl-10">
                  {rev.review}
                </p>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
