import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HiOutlineMapPin, HiOutlineHeart, HiHeart, HiOutlineShoppingCart } from 'react-icons/hi2';
import { useState, useEffect } from 'react';
import {
  formatPrice,
  formatDistance,
  getConditionLabel,
  getSellerTypeLabel,
  isProductOutOfStock,
} from '../../utils/helpers';
import { addToCart } from '../../features/cart/cartSlice';
import { showToast } from '../../features/ui/uiSlice';
import { addFavorite, removeFavorite } from '../../services/favoritesApi';

export default function ProductCard({ product, index = 0, favoriteProductIds, onToggleFavorite }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Determine favorite state from external prop set if provided
  const isExternallyControlled = favoriteProductIds instanceof Set;
  const [localFavorite, setLocalFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const isFavorite = isExternallyControlled
    ? favoriteProductIds.has(product.id)
    : localFavorite;

  // Sync localFavorite when favoriteProductIds changes (for non-controlled mode, remains false)
  useEffect(() => {
    if (isExternallyControlled) return;
    // In uncontrolled mode, we don't pre-fetch per-card — it stays false until toggled
  }, [isExternallyControlled]);

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [allImagesFailed, setAllImagesFailed] = useState(false);

  const isOutOfStock = isProductOutOfStock(product);

  const rawImages = (product.images || [])
    .map((img) => (typeof img === 'string' ? img : img?.storage_path))
    .filter(Boolean);

  const imageSource = rawImages[activeImgIndex] || null;

  const handleImageError = () => {
    if (activeImgIndex < rawImages.length - 1) {
      setActiveImgIndex((prev) => prev + 1);
    } else {
      setAllImagesFailed(true);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    dispatch(addToCart(product));
    dispatch(showToast({ type: 'success', message: `${product.title} added to cart` }));
  };

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (favoriteLoading) return;
    setFavoriteLoading(true);

    try {
      if (isFavorite) {
        await removeFavorite(product.id);
        if (onToggleFavorite) {
          onToggleFavorite(product.id);
        } else {
          setLocalFavorite(false);
        }
        dispatch(showToast({ type: 'info', message: 'Removed from wishlist' }));
      } else {
        await addFavorite(product.id);
        if (onToggleFavorite) {
          onToggleFavorite(product.id);
        } else {
          setLocalFavorite(true);
        }
        dispatch(showToast({ type: 'success', message: 'Added to wishlist ❤️' }));
      }
    } catch (err) {
      console.error('Favorite toggle failed:', err);
      dispatch(showToast({ type: 'error', message: err?.message || 'Failed to update wishlist' }));
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 border border-neutral-100 flex flex-col h-full">
          {/* Image & Overlay Area */}
          <div className="relative aspect-4/3 overflow-hidden bg-neutral-100 select-none">
            {/* Real Image vs Missing Image Placeholder */}
            {!allImagesFailed && imageSource ? (
              <img
                src={imageSource}
                alt={product.title}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isOutOfStock ? 'opacity-90 grayscale-20' : 'group-hover:scale-105'
                }`}
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-50 text-neutral-400 p-4 text-center">
                <span className="text-3xl mb-1 opacity-70">🖼️</span>
                <span className="text-[11px] font-semibold text-neutral-500">Image unavailable</span>
              </div>
            )}

            {/* Out of Stock Professional Translucent Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-neutral-950/45 backdrop-blur-2xs flex items-center justify-center p-3 pointer-events-none">
                <div className="px-3 py-1.5 rounded-full bg-neutral-900/90 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-lg border border-white/20 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Out of Stock</span>
                </div>
              </div>
            )}

            {/* Favorite Button */}
            <button
              onClick={handleFavorite}
              disabled={favoriteLoading}
              className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs hover:scale-110 transition-transform z-10 ${
                favoriteLoading ? 'opacity-50' : ''
              }`}
              aria-label="Toggle favorite"
            >
              {isFavorite ? (
                <HiHeart className="w-4 h-4 text-red-500" />
              ) : (
                <HiOutlineHeart className="w-4 h-4 text-neutral-500" />
              )}
            </button>

            {/* Condition Badge */}
            {product.condition && product.condition !== 'new' && (
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-semibold text-neutral-700 shadow-xs z-10">
                {getConditionLabel(product.condition)}
              </span>
            )}

            {/* Quick Add to Cart (Only for In-Stock Products) */}
            {!isOutOfStock && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ scale: 1.05 }}
                onClick={handleAddToCart}
                className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-xl bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                aria-label="Add to cart"
              >
                <HiOutlineShoppingCart className="w-4 h-4" />
              </motion.button>
            )}
          </div>

          {/* Info Area */}
          <div className="p-3.5 flex flex-col flex-1 justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-sm font-semibold text-neutral-800 line-clamp-1">
                  {product.title}
                </h3>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <p className="text-base font-bold text-primary-600">
                  {formatPrice(product.price)}
                  {product.unit ? (
                    <span className="text-xs font-normal text-neutral-400 ml-1">
                      / {product.unit}
                    </span>
                  ) : (
                    <span className="text-xs font-normal text-neutral-400 ml-1">
                      / unit
                    </span>
                  )}
                </p>

                {isOutOfStock ? (
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                    Out of Stock
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    In Stock
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs text-neutral-500">
                <div className="flex items-center gap-1">
                  <HiOutlineMapPin className="w-3.5 h-3.5 text-primary-500" />
                  <span>{formatDistance(product.distance) || 'Local'}</span>
                </div>

                {product.seller && (
                  <div className="flex items-center gap-1.5 max-w-[120px]">
                    {product.seller.avatar_url && (
                      <img
                        src={product.seller.avatar_url}
                        alt={product.seller.name}
                        className="w-3.5 h-3.5 rounded-full object-cover"
                      />
                    )}
                    <span className="truncate text-[11px] text-neutral-500">
                      {getSellerTypeLabel(product.seller.seller_type)}
                    </span>
                  </div>
                )}
              </div>

              {/* Availability Badges */}
              <div className="flex gap-1.5 mt-2">
                {product.pickup_available && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700">
                    Pickup
                  </span>
                )}
                {product.delivery_available && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                    Delivery
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

