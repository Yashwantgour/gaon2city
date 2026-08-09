import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
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

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);
  const product = products.find((p) => p.id === id);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-neutral-500 mb-4">Product not found</p>
        <Button variant="primary" onClick={() => navigate('/marketplace')}>
          Browse Marketplace
        </Button>
      </div>
    );
  }

  const images = product.images || [];
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category?.slug === product.category?.slug)
    .slice(0, 4);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart(product));
    }
    dispatch(showToast({ type: 'success', message: `${product.title} added to cart` }));
  };

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
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
        <span className="text-neutral-700 line-clamp-1">{product.title}</span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 mb-3">
            {images.length > 0 ? (
              <img
                src={images[currentImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl opacity-30">📦</span>
              </div>
            )}

            {images.length > 1 && (
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

            {/* Actions */}
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

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-medium">
                {currentImage + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
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

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-5"
        >
          {/* Category + Condition */}
          <div className="flex flex-wrap gap-2">
            {product.category && (
              <Badge variant="primary">{product.category.name}</Badge>
            )}
            <Badge variant={product.condition === 'new' ? 'success' : 'default'}>
              {getConditionLabel(product.condition)}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 leading-tight">
            {product.title}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-primary-600">
              {formatPrice(product.price)}
            </span>
            {product.quantity > 1 && (
              <span className="text-sm text-neutral-500">per unit</span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <span className="flex items-center gap-1.5">
              <HiOutlineMapPin className="w-4 h-4 text-primary-500" />
              {formatDistance(product.distance)}
            </span>
            <span className="text-neutral-300">|</span>
            <span>Listed {formatRelativeTime(product.created_at)}</span>
          </div>

          {/* Availability */}
          <div className="flex gap-3">
            {product.pickup_available && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-medium">
                <HiOutlineMapPin className="w-4 h-4" />
                Pickup Available
              </div>
            )}
            {product.delivery_available && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium">
                <HiOutlineTruck className="w-4 h-4" />
                Delivery Available
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-2">Description</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-500">Available:</span>
            <span className="font-semibold text-neutral-800">{product.quantity} units</span>
          </div>

          {/* Quantity + Add to Cart */}
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
                onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
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

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="md"
              icon={<HiOutlineChatBubbleLeftRight />}
              className="flex-1"
              onClick={() => navigate('/chat')}
            >
              Chat Seller
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<HiOutlineMapPin />}
              className="flex-1"
            >
              Go to Seller
            </Button>
          </div>

          {/* Seller Card */}
          {product.seller && (
            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
              <div className="flex items-center gap-3">
                {product.seller.avatar_url ? (
                  <img
                    src={product.seller.avatar_url}
                    alt={product.seller.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-lg">
                      {product.seller.name?.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-neutral-800">{product.seller.name}</h4>
                    <HiOutlineShieldCheck className="w-4 h-4 text-primary-500" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <span>{getSellerTypeLabel(product.seller.seller_type)}</span>
                    {product.seller.village && (
                      <>
                        <span>•</span>
                        <span>{product.seller.village}, {product.seller.city}</span>
                      </>
                    )}
                  </div>
                </div>
                <Link
                  to={`/seller/${product.seller.id}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  View Profile
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-800 mb-6">Similar Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
