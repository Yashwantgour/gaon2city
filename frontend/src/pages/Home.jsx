import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineMapPin,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlineChatBubbleLeftRight,
} from 'react-icons/hi2';
import ProductCard from '../components/product/ProductCard';
import Button from '../components/common/Button';
import { CATEGORIES } from '../utils/constants';
import useLocation from '../hooks/useLocation';

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
  const products = useSelector((state) => state.products.items);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { locationName, radius, requestLocation, permissionStatus } = useLocation();

  const nearbyProducts = [...products].sort((a, b) => (a.distance || 0) - (b.distance || 0)).slice(0, 4);
  const recentProducts = [...products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/marketplace');
    }
  };

  return (
    <div className="min-h-screen">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-emerald-500">
        {/* Background pattern */}
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
              Hyperlocal Marketplace
            </motion.div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
              Buy & Sell From
              <br />
              <span className="text-primary-100">People Near You</span>
            </h1>
            <p className="text-primary-100/90 text-base sm:text-lg mb-8 max-w-lg mx-auto">
              A village-to-city marketplace connecting communities. Discover products within your neighbourhood.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-lg mx-auto mb-6">
              <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search for wheat, ghee, handicrafts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-28 py-3.5 sm:py-4 rounded-2xl bg-white text-neutral-800 text-sm sm:text-base placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 sm:py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
              >
                Search
              </button>
            </form>

            {/* Location */}
            <div className="flex items-center justify-center gap-3">
              {permissionStatus === 'granted' && locationName ? (
                <span className="flex items-center gap-1.5 text-white/80 text-sm">
                  <HiOutlineMapPin className="w-4 h-4" />
                  {locationName} • {radius} km radius
                </span>
              ) : (
                <button
                  onClick={requestLocation}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  <HiOutlineMapPin className="w-4 h-4" />
                  Enable Location
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path
              d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
              fill="var(--color-neutral-50)"
            />
          </svg>
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
                Within {radius || 10} km of your location
              </p>
            </div>
            <Link
              to="/marketplace?sort=nearest"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              See all <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {nearbyProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
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

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {recentProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
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
