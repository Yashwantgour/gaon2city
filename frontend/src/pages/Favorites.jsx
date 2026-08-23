import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineArrowLeft,
  HiOutlineBuildingStorefront,
} from 'react-icons/hi2';
import ProductCard from '../components/product/ProductCard';
import Button from '../components/common/Button';
import { getFavorites, removeFavorite } from '../services/favoritesApi';

export default function Favorites() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useSelector((state) => state.auth);

  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getFavorites();
      setFavorites(data || []);
    } catch (err) {
      console.error('Failed to load favorites:', err);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/favorites' } });
      return;
    }
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated, authLoading, navigate, loadFavorites]);

  const handleToggleFavorite = async (productId) => {
    setRemovingId(productId);
    try {
      await removeFavorite(productId);
      setFavorites((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    } finally {
      setRemovingId(null);
    }
  };

  // Build a set of favorited product IDs for ProductCard
  const favoriteIds = new Set(favorites.map((p) => p.id));

  // Auth loading state
  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-600 transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 flex items-center gap-2">
              <HiHeart className="w-7 h-7 text-red-500" />
              My Wishlist
            </h1>
            {!isLoading && favorites.length > 0 && (
              <p className="text-sm text-neutral-500 mt-0.5">
                {favorites.length} saved {favorites.length === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-4/3 rounded-2xl bg-neutral-200 mb-3" />
              <div className="space-y-2 px-1">
                <div className="h-4 bg-neutral-200 rounded-lg w-3/4" />
                <div className="h-5 bg-neutral-200 rounded-lg w-1/2" />
                <div className="h-3 bg-neutral-100 rounded-lg w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && favorites.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="relative mb-6">
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-24 h-24 rounded-3xl bg-red-50 flex items-center justify-center"
            >
              <HiOutlineHeart className="w-12 h-12 text-red-400" />
            </motion.div>
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [0.8, 1.1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center"
            >
              <HiHeart className="w-3 h-3 text-red-400" />
            </motion.div>
          </div>

          <h2 className="text-xl font-bold text-neutral-800 mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-neutral-500 text-sm max-w-sm mb-6 leading-relaxed">
            Tap the heart icon on any product to save it here. Your favorites will be waiting for you when you're ready to buy.
          </p>

          <Button
            variant="primary"
            size="lg"
            icon={<HiOutlineBuildingStorefront />}
            onClick={() => navigate('/marketplace')}
          >
            Explore Marketplace
          </Button>
        </motion.div>
      )}

      {/* Favorites Grid */}
      {!isLoading && favorites.length > 0 && (
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {favorites.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              >
                <ProductCard
                  product={product}
                  index={index}
                  favoriteProductIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
