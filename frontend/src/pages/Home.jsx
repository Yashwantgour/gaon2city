import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineMapPin,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineTruck,
} from 'react-icons/hi2';
import ProductCard from '../components/product/ProductCard';
import Button from '../components/common/Button';
import { CATEGORIES } from '../utils/constants';
import useLocation from '../hooks/useLocation';
import { listProducts, getNearbyProducts } from '../services/productsApi';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { locationName, radius, latitude, longitude, requestLocation, permissionStatus, isLoading: isLocating } = useLocation();

  const [nearbyProducts, setNearbyProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(true);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);

  // Load genuine Nearby Products using user coordinates
  useEffect(() => {
    async function loadNearby() {
      if (latitude != null && longitude != null) {
        setIsLoadingNearby(true);
        try {
          const nearby = await getNearbyProducts({
            lat: latitude,
            lng: longitude,
            radius: radius || 10,
          });
          setNearbyProducts(nearby || []);
        } catch {
          setNearbyProducts([]);
        } finally {
          setIsLoadingNearby(false);
        }
      } else {
        setNearbyProducts([]);
        setIsLoadingNearby(false);
      }
    }
    loadNearby();
  }, [latitude, longitude, radius]);

  // Load genuine Recently Added Products from database
  useEffect(() => {
    async function loadRecent() {
      setIsLoadingRecent(true);
      try {
        const res = await listProducts({ limit: 8, sort: 'newest' });
        setRecentProducts(res?.products || []);
      } catch {
        setRecentProducts([]);
      } finally {
        setIsLoadingRecent(false);
      }
    }
    loadRecent();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/marketplace');
    }
  };

  const hasLocation = latitude != null && longitude != null;

  return (
    <div className="min-h-screen">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-emerald-500">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-6"
            >
              <HiOutlineMapPin className="w-4 h-4" />
              <span>{locationName || 'Hyperlocal Village Marketplace'}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4"
            >
              Buy & Sell Fresh from
              <br />
              <span className="text-accent-300">Gaon to City</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-base sm:text-lg text-primary-100 mb-8 max-w-xl mx-auto"
            >
              Discover authentic rural products, fresh farm produce, and local handcrafted goods directly from verified sellers.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative max-w-lg mx-auto"
            >
              <div className="flex items-center bg-white rounded-2xl shadow-xl p-1.5 border border-white/20">
                <div className="pl-4 text-neutral-400">
                  <HiOutlineMagnifyingGlass className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search wheat, mangoes, handicrafts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2.5 text-neutral-800 text-sm placeholder-neutral-400 bg-transparent border-none focus:outline-none"
                />
                <Button type="submit" variant="primary" size="md">
                  Search
                </Button>
              </div>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div {...fadeInUp}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-800">
              Browse Categories
            </h2>
            <Link
              to="/marketplace"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View all <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/marketplace?category=${cat.slug}`}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${cat.color} hover:scale-105 transition-transform duration-200`}
              >
                <span className="text-2xl sm:text-3xl">{cat.icon}</span>
                <span className="text-xs sm:text-sm font-medium text-center leading-tight">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== NEARBY PRODUCTS ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div {...fadeInUp}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-800">
                Nearby Products
              </h2>
              <p className="text-sm text-neutral-500 mt-0.5">
                {hasLocation
                  ? `Within ${radius || 10} km of ${locationName || 'your location'}`
                  : 'Discover authentic goods listed near your village or city'}
              </p>
            </div>
            {hasLocation && (
              <Link
                to="/marketplace?sort=nearest"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                See all <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </motion.div>

        {isLoadingNearby ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-2xl skeleton" />
            ))}
          </div>
        ) : !hasLocation ? (
          <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-3">
              <HiOutlineMapPin className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-neutral-800 mb-1">Set Your Location</h3>
            <p className="text-neutral-500 text-sm mb-4">
              Enable GPS or choose your area to find products directly available in your vicinity.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={requestLocation}
              isLoading={isLocating}
              icon={<HiOutlineMapPin className="w-4 h-4" />}
            >
              Use Current Location
            </Button>
          </div>
        ) : nearbyProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center max-w-lg mx-auto shadow-xs">
            <p className="text-neutral-700 font-medium text-sm mb-1">No nearby products found within {radius || 10} km</p>
            <p className="text-neutral-400 text-xs mb-4">Try expanding your search radius or explore all products.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/marketplace')}
            >
              Browse All Marketplace Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {nearbyProducts.slice(0, 4).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* ===== RECENTLY ADDED ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div {...fadeInUp}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-800">
              Recently Added
            </h2>
            <Link
              to="/marketplace?sort=newest"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              See all <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {isLoadingRecent ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-2xl skeleton" />
            ))}
          </div>
        ) : recentProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center">
            <p className="text-neutral-500 text-sm">No products available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {recentProducts.slice(0, 4).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeInUp} className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 mb-2">
              How It Works
            </h2>
            <p className="text-sm text-neutral-500">
              Simple, local, and trustworthy
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <HiOutlineMapPin className="w-7 h-7" />,
                title: 'Set Your Location',
                desc: 'Enable GPS or select your village/city to discover products nearby.',
                color: 'bg-primary-50 text-primary-600',
              },
              {
                icon: <HiOutlineShieldCheck className="w-7 h-7" />,
                title: 'Browse & Buy Safely',
                desc: 'Explore verified listings from local sellers. Chat before you buy.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: <HiOutlineTruck className="w-7 h-7" />,
                title: 'Pickup or Delivery',
                desc: 'Collect from the seller directly or get local delivery where available.',
                color: 'bg-amber-50 text-amber-600',
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="text-center p-6 rounded-2xl border border-neutral-100 hover:border-neutral-200 hover:shadow-sm transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-4`}>
                  {step.icon}
                </div>
                <h3 className="font-semibold text-neutral-800 mb-1.5">{step.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BECOME A SELLER CTA ===== */}
      {!isAuthenticated && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <motion.div
            {...fadeInUp}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 to-emerald-500 p-8 sm:p-12"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Start Selling Today
                </h2>
                <p className="text-primary-100/90 max-w-md">
                  List your products and reach buyers in your village and nearby cities. It&apos;s free to get started.
                </p>
              </div>
              <Button
                variant="secondary"
                size="xl"
                onClick={() => navigate('/signup')}
                className="bg-white text-primary-600 hover:bg-primary-50 shadow-lg shrink-0"
              >
                Get Started
                <HiOutlineArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
}
