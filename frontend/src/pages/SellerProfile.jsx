import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineShieldCheck,
  HiOutlineMapPin,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCalendar,
  HiStar,
  HiOutlineBuildingStorefront,
} from 'react-icons/hi2';
import Button from '../components/common/Button';
import ProductGrid from '../components/product/ProductGrid';
import ReviewList from '../components/product/ReviewList';
import ReviewFormModal from '../components/product/ReviewFormModal';
import ReportModal from '../components/common/ReportModal';
import { listProducts } from '../services/productsApi';
import { getSellerReviews } from '../services/reviewsApi';
import { getSellerTypeLabel } from '../utils/helpers';
import api from '../services/api';

export default function SellerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviewsData, setReviewsData] = useState({ reviews: [], summary: { totalReviews: 0, averageRating: 5 } });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'reviews'

  const loadSellerData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch public seller profile
      const sellerRes = await api.get(`/auth/seller/${id}`);
      setSeller(sellerRes);

      // 2. Fetch products by this seller
      const prodRes = await listProducts({ seller_id: id, limit: 20 });
      setProducts(prodRes.products || []);

      // 3. Fetch reviews
      setIsLoadingReviews(true);
      const revData = await getSellerReviews(id);
      setReviewsData(revData || { reviews: [], summary: { totalReviews: 0, averageRating: 0 } });
    } catch (err) {
      console.warn('Failed to load seller details:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingReviews(false);
    }
  }, [id]);

  useEffect(() => {
    loadSellerData();
  }, [loadSellerData]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-500 text-sm">Loading seller profile...</p>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-neutral-800 mb-2">Seller Not Found</h2>
        <p className="text-sm text-neutral-500 mb-6">The requested seller profile could not be found.</p>
        <Button variant="primary" onClick={() => navigate('/marketplace')}>
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const memberYear = seller.created_at
    ? new Date(seller.created_at).getFullYear()
    : '2026';

  const sellerLocation = [seller.village, seller.city, seller.state]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between text-sm text-neutral-500">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 hover:text-neutral-800 transition-colors cursor-pointer"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="text-xs text-neutral-400 hover:text-red-600 transition-colors"
        >
          Report Seller
        </button>
      </div>

      {/* Seller Header Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-neutral-100 p-6 sm:p-8 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            {seller.avatar_url ? (
              <img
                src={seller.avatar_url}
                alt={seller.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-primary-50 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-3xl shadow-xs">
                {seller.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">{seller.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                  <HiOutlineShieldCheck className="w-3.5 h-3.5" />
                  Verified Local Seller
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-neutral-500 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-medium">
                  {getSellerTypeLabel(seller.seller_type)}
                </span>
                {sellerLocation && (
                  <span className="flex items-center gap-1">
                    <HiOutlineMapPin className="w-3.5 h-3.5 text-primary-500" />
                    {sellerLocation}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <HiOutlineCalendar className="w-3.5 h-3.5 text-neutral-400" />
                  Member since {memberYear}
                </span>
              </div>

              {/* Rating score */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <HiStar
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(reviewsData.summary.averageRating || 5)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-neutral-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-neutral-800">
                  {reviewsData.summary.averageRating > 0
                    ? reviewsData.summary.averageRating.toFixed(1)
                    : '5.0'}
                </span>
                <span className="text-xs text-neutral-400">
                  ({reviewsData.summary.totalReviews} customer reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              icon={<HiOutlineChatBubbleLeftRight />}
              className="flex-1 sm:flex-none"
              onClick={() => navigate(`/chat?seller=${seller.id}`)}
            >
              Chat Seller
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<HiOutlineMapPin />}
              className="flex-1 sm:flex-none"
              onClick={() => navigate(`/directions?seller=${seller.id}`)}
            >
              Get Directions
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'listings'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <span>Available Listings ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'reviews'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <span>Reviews & Ratings ({reviewsData.summary.totalReviews})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'listings' ? (
        <div>
          {products.length > 0 ? (
            <ProductGrid products={products} isLoading={false} />
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-neutral-100 p-8">
              <HiOutlineBuildingStorefront className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
              <h3 className="font-semibold text-neutral-700 text-sm">No Active Listings</h3>
              <p className="text-xs text-neutral-400 mt-1">This seller currently has no active products listed.</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <ReviewList
            reviews={reviewsData.reviews}
            summary={reviewsData.summary}
            onWriteReview={() => setIsReviewModalOpen(true)}
            isLoading={isLoadingReviews}
          />
        </div>
      )}

      {/* Review Modal */}
      <ReviewFormModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        seller={seller}
        onSuccess={loadSellerData}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportedUserId={seller.id}
        userName={seller.name}
      />
    </div>
  );
}
