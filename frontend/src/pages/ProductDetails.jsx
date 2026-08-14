import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineMapPin,
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowLeft,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineFlag,
  HiStar,
} from 'react-icons/hi2';
import Button from '../components/common/Button';
import ReviewList from '../components/product/ReviewList';
import ReviewFormModal from '../components/product/ReviewFormModal';
import ReportModal from '../components/common/ReportModal';
import { addToCart } from '../features/cart/cartSlice';
import {
  formatPrice,
  formatDistance,
  getConditionLabel,
  getSellerTypeLabel,
  isProductOutOfStock,
} from '../utils/helpers';
import { getProductById } from '../services/productsApi';
import { getSellerReviews } from '../services/reviewsApi';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [reviewsData, setReviewsData] = useState({ reviews: [], summary: { totalReviews: 0, averageRating: 5 } });
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [failedImageUrls, setFailedImageUrls] = useState(new Set());
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProductById(id);
      setProduct(data);
    } catch {
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const storeItems = useSelector((state) => state.products.items) || [];
  const reduxProduct = storeItems.find((p) => String(p.id) === String(id));
  const activeProduct = product || reduxProduct;

  const isOutOfStock = isProductOutOfStock(activeProduct);
  const sellerId = activeProduct?.seller_id || activeProduct?.seller?.id;

  const loadReviews = useCallback(async () => {
    if (!sellerId) return;
    setIsLoadingReviews(true);
    try {
      const data = await getSellerReviews(sellerId);
      setReviewsData(data || { reviews: [], summary: { totalReviews: 0, averageRating: 0 } });
    } catch (err) {
      console.warn('Failed to load seller reviews:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [sellerId]);

  useEffect(() => {
    if (sellerId) {
      loadReviews();
    }
  }, [sellerId, loadReviews]);

  if (isLoading && !activeProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-500">Loading product details...</p>
      </div>
    );
  }

  if (!activeProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-neutral-500 mb-4">Product not found</p>
        <Button variant="primary" onClick={() => navigate('/marketplace')}>
          Browse Marketplace
        </Button>
      </div>
    );
  }

  const rawImages = activeProduct.images || (reduxProduct?.images) || [];
  const displayImages = rawImages
    .map((img) => (typeof img === 'string' ? img : img?.storage_path))
    .filter(Boolean);

  if (displayImages.length === 0 && activeProduct.storage_path) {
    displayImages.push(activeProduct.storage_path);
  }

  const handleImageError = (failedUrl) => {
    setFailedImageUrls((prev) => {
      const updated = new Set(prev);
      updated.add(failedUrl);
      return updated;
    });

    // Automatically switch to the first remaining valid image
    const nextValidIndex = displayImages.findIndex(
      (url) => url && url !== failedUrl && !failedImageUrls.has(url)
    );
    if (nextValidIndex !== -1 && (displayImages[currentImage] === failedUrl || failedImageUrls.has(displayImages[currentImage]))) {
      setCurrentImage(nextValidIndex);
    }
  };

  const currentImageUrl = displayImages[currentImage];
  const isCurrentFailed = !currentImageUrl || failedImageUrls.has(currentImageUrl);
  const allImagesFailed = displayImages.length === 0 || displayImages.every((url) => failedImageUrls.has(url));

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    dispatch(addToCart(activeProduct));
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    handleAddToCart();
    navigate('/checkout');
  };

  const handleChatSeller = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const targetSellerId =
      activeProduct?.seller_id ||
      activeProduct?.seller?.id ||
      (typeof activeProduct?.seller === 'string' ? activeProduct.seller : null);

    const targetUrl = targetSellerId
      ? `/chat?seller=${targetSellerId}&product=${activeProduct?.id || id}`
      : '/chat';

    navigate(targetUrl, {
      state: {
        seller: activeProduct?.seller || null,
        product: activeProduct || null,
      },
    });
  };

  const handleGoToSeller = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const targetSellerId =
      activeProduct?.seller_id ||
      activeProduct?.seller?.id ||
      (typeof activeProduct?.seller === 'string' ? activeProduct.seller : null);

    const targetUrl = targetSellerId
      ? `/directions?seller=${targetSellerId}&product=${activeProduct?.id || id}`
      : `/directions?product=${activeProduct?.id || id}`;

    navigate(targetUrl, {
      state: {
        seller: activeProduct?.seller || null,
        product: activeProduct || null,
      },
    });
  };

  const nextImage = () => {
    if (displayImages.length <= 1) return;
    setCurrentImage((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    if (displayImages.length <= 1) return;
    setCurrentImage((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-10">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between text-sm text-neutral-500"
      >
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-neutral-700 transition-colors">
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span>/</span>
          <Link to="/marketplace" className="hover:text-primary-600 transition-colors">Marketplace</Link>
          <span>/</span>
          <span className="text-neutral-700 line-clamp-1">{activeProduct.title}</span>
        </div>

        {/* Report Listing Trigger */}
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-red-600 transition-colors"
          title="Report this listing"
        >
          <HiOutlineFlag className="w-3.5 h-3.5" />
          <span>Report</span>
        </button>
      </motion.div>

      {/* Main Product Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Product Images Gallery & Out of Stock Overlay */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-neutral-100 border border-neutral-100 shadow-xs select-none">
            {/* Real Valid Image vs Missing Image State */}
            {!allImagesFailed && currentImageUrl && !isCurrentFailed ? (
              <img
                src={currentImageUrl}
                alt={activeProduct.title}
                onError={() => handleImageError(currentImageUrl)}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isOutOfStock ? 'opacity-90 grayscale-15' : ''
                }`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-50 text-neutral-400 p-6 text-center">
                <span className="text-5xl mb-2 opacity-60">🖼️</span>
                <span className="text-xs font-semibold text-neutral-500">Image unavailable</span>
              </div>
            )}

            {/* Out of Stock Translucent Badge Overlay on Image */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-neutral-950/45 backdrop-blur-2xs flex items-center justify-center p-4 pointer-events-none">
                <div className="px-4 py-2 rounded-full bg-neutral-900/90 text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-xl border border-white/20 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span>Out of Stock</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/90 backdrop-blur-xs text-neutral-700 hover:text-red-500 transition-colors shadow-sm z-10"
            >
              {isFavorite ? <HiHeart className="w-5 h-5 text-red-500" /> : <HiOutlineHeart className="w-5 h-5" />}
            </button>

            {displayImages.length > 1 && !allImagesFailed && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-xs text-neutral-700 hover:bg-white shadow-sm z-10"
                >
                  <HiOutlineChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-xs text-neutral-700 hover:bg-white shadow-sm z-10"
                >
                  <HiOutlineChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {activeProduct.condition && (
              <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-xs text-neutral-800 shadow-xs z-10">
                {getConditionLabel(activeProduct.condition)}
              </span>
            )}
          </div>

          {/* Thumbnails Row */}
          {displayImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {displayImages.map((img, i) => {
                const isFailed = failedImageUrls.has(img);
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                      currentImage === i
                        ? 'border-primary-500 ring-2 ring-primary-500/20'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    {!isFailed ? (
                      <img
                        src={img}
                        alt=""
                        onError={() => handleImageError(img)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-xs text-neutral-400">
                        🖼️
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Right: Product Info & Purchase Controls */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              {activeProduct.category && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
                  {activeProduct.category.name}
                </span>
              )}
              {activeProduct.distance != null && (
                <span className="flex items-center gap-1 text-xs text-neutral-500">
                  <HiOutlineMapPin className="w-3.5 h-3.5 text-primary-500" />
                  {formatDistance(activeProduct.distance)} away
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
              {activeProduct.title}
            </h1>

            {/* Rating Score & Stock Status Pill */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
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
                  {reviewsData.summary.averageRating > 0 ? reviewsData.summary.averageRating.toFixed(1) : '5.0'}
                </span>
                <span className="text-xs text-neutral-400">
                  ({reviewsData.summary.totalReviews} reviews)
                </span>
              </div>

              {/* Stock Status Badge */}
              {isOutOfStock ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Out of Stock</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>In Stock ({activeProduct.quantity} available)</span>
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-3xl font-extrabold text-primary-600">
                {formatPrice(activeProduct.price)}
              </span>
              <span className="text-sm text-neutral-500">
                / {activeProduct.unit || 'unit'}
              </span>
            </div>
          </div>

          {activeProduct.description && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-800 mb-1">Description</h3>
              <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-line">
                {activeProduct.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 py-4 border-y border-neutral-100">
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <HiOutlineShieldCheck className="w-4 h-4 text-primary-500 shrink-0" />
              <span>{activeProduct.pickup_available ? 'Direct Farm Pickup' : 'Pickup on Request'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <HiOutlineTruck className="w-4 h-4 text-primary-500 shrink-0" />
              <span>{activeProduct.delivery_available ? 'Local Delivery Available' : 'Self-Pickup Preferred'}</span>
            </div>
          </div>

          {/* Quantity Selector & Purchase Buttons */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-neutral-700">Quantity:</span>
              <div className={`flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-white ${
                isOutOfStock ? 'opacity-50 pointer-events-none' : ''
              }`}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={isOutOfStock}
                  className="px-3.5 py-1.5 hover:bg-neutral-50 text-neutral-600 font-semibold"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-sm font-semibold text-neutral-800 min-w-[40px] text-center">
                  {isOutOfStock ? 0 : quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(activeProduct.quantity || 99, q + 1))}
                  disabled={isOutOfStock}
                  className="px-3.5 py-1.5 hover:bg-neutral-50 text-neutral-600 font-semibold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant={isOutOfStock ? 'secondary' : 'outline'}
                size="lg"
                className="flex-1"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
              >
                {isOutOfStock ? 'Currently Unavailable' : 'Buy Now'}
              </Button>
            </div>
          </div>

          {/* Chat & Navigation Actions (Always Active) */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              type="button"
              icon={<HiOutlineChatBubbleLeftRight />}
              className="flex-1"
              onClick={handleChatSeller}
            >
              Chat Seller
            </Button>
            <Button
              variant="secondary"
              size="md"
              type="button"
              icon={<HiOutlineMapPin />}
              className="flex-1"
              onClick={handleGoToSeller}
            >
              Go to Seller
            </Button>
          </div>

          {/* Seller Trust Card */}
          {activeProduct.seller && (
            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 space-y-3">
              <div className="flex items-center gap-3">
                {activeProduct.seller.avatar_url ? (
                  <img
                    src={activeProduct.seller.avatar_url}
                    alt={activeProduct.seller.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-lg">
                      {activeProduct.seller.name?.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-neutral-800 truncate">{activeProduct.seller.name}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-0.5">
                      <HiOutlineShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                    <span>{getSellerTypeLabel(activeProduct.seller.seller_type)}</span>
                    {activeProduct.seller.village && (
                      <>
                        <span>•</span>
                        <span>{activeProduct.seller.village}, {activeProduct.seller.city || ''}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Customer Reviews Section */}
      <ReviewList
        reviews={reviewsData.reviews}
        summary={reviewsData.summary}
        onWriteReview={() => setIsReviewModalOpen(true)}
        isLoading={isLoadingReviews}
      />

      {/* Review Submission Modal */}
      <ReviewFormModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        seller={activeProduct.seller}
        product={activeProduct}
        onSuccess={loadReviews}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        productId={activeProduct.id}
        reportedUserId={sellerId}
        productTitle={activeProduct.title}
        userName={activeProduct.seller?.name}
      />
    </div>
  );
}
