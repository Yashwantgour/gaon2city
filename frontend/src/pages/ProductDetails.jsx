import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import {
  HiOutlineMapPin,
  HiOutlineHeart,
  HiHeart,
  HiOutlineShoppingCart,
  HiOutlineChatBubbleLeftRight,
  HiOutlineTruck,
  HiOutlineArrowLeft,
  HiOutlineShare,
  HiOutlineShieldCheck,
  HiChevronLeft,
  HiChevronRight,
} from 'react-icons/hi2';
import Button from '../components/common/Button';
import ProductCard from '../components/product/ProductCard';
import Badge from '../components/common/Badge';
import { formatPrice, formatDistance, getConditionLabel, getSellerTypeLabel, formatRelativeTime } from '../utils/helpers';
import { addToCart } from '../features/cart/cartSlice';
import { showToast } from '../features/ui/uiSlice';
import { getProductById } from '../services/productsApi';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch {
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  const storeItems = useSelector((state) => state.products.items) || [];
  const reduxProduct = storeItems.find((p) => String(p.id) === String(id));
  const activeProduct = product || reduxProduct;

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
  const images = rawImages.map((img) => (typeof img === 'string' ? img : img?.storage_path)).filter(Boolean);
  if (images.length === 0 && activeProduct.storage_path) {
    images.push(activeProduct.storage_path);
  }
  const displayImages = images;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart(activeProduct));
    }
    dispatch(showToast({ type: 'success', message: `${activeProduct.title} added to cart` }));
  };

  const handleChatSeller = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const sellerId =
      activeProduct?.seller_id ||
      activeProduct?.seller?.id ||
      (typeof activeProduct?.seller === 'string' ? activeProduct.seller : null);

    const targetUrl = sellerId
      ? `/chat?seller=${sellerId}&product=${activeProduct?.id || id}`
      : '/chat';

    navigate(targetUrl, {
      state: {
        seller: activeProduct?.seller || null,
        product: activeProduct || null,
      },
    });
  };

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % displayImages.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + displayImages.length) % displayImages.length);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-sm text-neutral-500 mb-6"
      >
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-neutral-700 transition-colors">
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back
        </button>
        <span>/</span>
        <Link to="/marketplace" className="hover:text-primary-600 transition-colors">Marketplace</Link>
        <span>/</span>
        <span className="text-neutral-700 line-clamp-1">{activeProduct.title}</span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 mb-3">
            {!imgError && displayImages.length > 0 ? (
              <img
                src={displayImages[currentImage]}
                alt={activeProduct.title}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 bg-neutral-100">
                <span className="text-6xl mb-2">📦</span>
                <p className="text-sm font-medium text-neutral-500">No image available</p>
              </div>
            )}

            {displayImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
                >
                  <HiChevronLeft className="w-5 h-5 text-neutral-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
                >
                  <HiChevronRight className="w-5 h-5 text-neutral-700" />
                </button>
              </>
            )}

            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              >
                {isFavorite ? (
                  <HiHeart className="w-5 h-5 text-red-500" />
                ) : (
                  <HiOutlineHeart className="w-5 h-5 text-neutral-600" />
                )}
              </button>
              <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                <HiOutlineShare className="w-5 h-5 text-neutral-600" />
              </button>
            </div>

            {displayImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-medium">
                {currentImage + 1} / {displayImages.length}
              </div>
            )}
          </div>

          {displayImages.length > 1 && (
            <div className="flex gap-2">
              {displayImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    currentImage === i ? 'border-primary-500 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-5"
        >
          <div className="flex flex-wrap gap-2">
            {activeProduct.category && (
              <Badge variant="primary">{activeProduct.category.name}</Badge>
            )}
            <Badge variant={activeProduct.condition === 'new' ? 'success' : 'default'}>
              {getConditionLabel(activeProduct.condition)}
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 leading-tight">
            {activeProduct.title}
          </h1>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-primary-600">
              {formatPrice(activeProduct.price)}
            </span>
            {activeProduct.quantity > 1 && (
              <span className="text-sm text-neutral-500">per unit</span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <span className="flex items-center gap-1.5">
              <HiOutlineMapPin className="w-4 h-4 text-primary-500" />
              {formatDistance(activeProduct.distance)}
            </span>
            <span className="text-neutral-300">|</span>
            <span>Listed {formatRelativeTime(activeProduct.created_at)}</span>
          </div>

          <div className="flex gap-3">
            {activeProduct.pickup_available && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-medium">
                <HiOutlineMapPin className="w-4 h-4" />
                Pickup Available
              </div>
            )}
            {activeProduct.delivery_available && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium">
                <HiOutlineTruck className="w-4 h-4" />
                Delivery Available
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-2">Description</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {activeProduct.description}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-500">Available:</span>
            <span className="font-semibold text-neutral-800">{activeProduct.quantity} units</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-neutral-200 rounded-xl">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 rounded-l-xl"
              >
                −
              </button>
              <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(activeProduct.quantity || 99, quantity + 1))}
                className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 rounded-r-xl"
              >
                +
              </button>
            </div>

            <Button
              variant="primary"
              size="lg"
              icon={<HiOutlineShoppingCart />}
              onClick={handleAddToCart}
              className="flex-1"
            >
              Add to Cart
            </Button>
          </div>

          <div className="flex gap-3">
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
            >
              Go to Seller
            </Button>
          </div>

          {activeProduct.seller && (
            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
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
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-neutral-800">{activeProduct.seller.name}</h4>
                    <HiOutlineShieldCheck className="w-4 h-4 text-primary-500" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <span>{getSellerTypeLabel(activeProduct.seller.seller_type)}</span>
                    {activeProduct.seller.village && (
                      <>
                        <span>•</span>
                        <span>{activeProduct.seller.village}, {activeProduct.seller.city}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
