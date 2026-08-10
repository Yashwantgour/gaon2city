import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HiOutlineMapPin, HiOutlineHeart, HiHeart, HiOutlineShoppingCart } from 'react-icons/hi2';
import { useState } from 'react';
import { formatPrice, formatDistance, getConditionLabel, getSellerTypeLabel } from '../../utils/helpers';
import { addToCart } from '../../features/cart/cartSlice';
import { showToast } from '../../features/ui/uiSlice';

export default function ProductCard({ product, index = 0 }) {
  const dispatch = useDispatch();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imageSource = typeof product.images?.[0] === 'string'
    ? product.images[0]
    : product.images?.[0]?.storage_path;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart(product));
    dispatch(showToast({ type: 'success', message: `${product.title} added to cart` }));
  };

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
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
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-100">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
            {!imgError && imageSource ? (
              <img
                src={imageSource}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-100">
                <span className="text-4xl opacity-40">📦</span>
              </div>
            )}

            {/* Favorite Button */}
            <button
              onClick={handleFavorite}
              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
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
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-neutral-700 shadow-sm">
                {getConditionLabel(product.condition)}
              </span>
            )}

            {/* Quick Add to Cart */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleAddToCart}
              className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Add to cart"
            >
              <HiOutlineShoppingCart className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Info */}
          <div className="p-3.5">
            <h3 className="text-sm font-semibold text-neutral-800 line-clamp-1 mb-1">
              {product.title}
            </h3>

            <p className="text-lg font-bold text-primary-600 mb-2">
              {formatPrice(product.price)}
              {product.quantity > 1 && (
                <span className="text-xs font-normal text-neutral-400 ml-1">
                  / unit
                </span>
              )}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-neutral-500">
                <HiOutlineMapPin className="w-3.5 h-3.5 text-primary-500" />
                <span className="text-xs">{formatDistance(product.distance)}</span>
              </div>

              {product.seller && (
                <div className="flex items-center gap-1.5">
                  {product.seller.avatar_url && (
                    <img
                      src={product.seller.avatar_url}
                      alt={product.seller.name}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  )}
                  <span className="text-xs text-neutral-500 line-clamp-1">
                    {getSellerTypeLabel(product.seller.seller_type)}
                  </span>
                </div>
              )}
            </div>

            {/* Availability Tags */}
            <div className="flex gap-1.5 mt-2">
              {product.pickup_available && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-600">
                  Pickup
                </span>
              )}
              {product.delivery_available && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600">
                  Delivery
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
