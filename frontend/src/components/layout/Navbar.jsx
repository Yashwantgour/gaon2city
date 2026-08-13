import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineShoppingCart,
  HiOutlineUser,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineMapPin,
  HiOutlinePlus,
  HiOutlineChatBubbleLeftRight,
} from 'react-icons/hi2';
import { selectCartCount } from '../../features/cart/cartSlice';
import Button from '../common/Button';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cartCount = useSelector(selectCartCount);
  const { locationName, radius } = useSelector((state) => state.location);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 glass border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-neutral-800">
                Gaon<span className="text-primary-500">2</span>City
              </span>
            </div>
          </Link>

          {/* Location Indicator — Desktop */}
          <button
            onClick={() => navigate('/marketplace')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-medium hover:bg-primary-100 transition-colors"
          >
            <HiOutlineMapPin className="w-4 h-4" />
            <span>{locationName || 'Set Location'}</span>
            {radius && <span className="text-primary-500">• {radius} km</span>}
          </button>

          {/* Search — Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search products, sellers..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white
                  transition-all duration-200"
                onFocus={() => navigate('/marketplace')}
              />
            </div>
          </div>

          {/* Actions — Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated && (
              <Button
                variant="primary"
                size="sm"
                icon={<HiOutlinePlus />}
                onClick={() => navigate('/sell')}
              >
                Sell
              </Button>
            )}

            {isAuthenticated && (
              <button
                onClick={() => navigate('/chat')}
                className="relative p-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
                aria-label="Messages"
              >
                <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => navigate('/cart')}
              className="relative p-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label="Cart"
            >
              <HiOutlineShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-500 text-white rounded-full text-xs flex items-center justify-center font-semibold"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-100"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <HiOutlineUser className="w-4 h-4 text-primary-600" />
                  </div>
                )}
              </button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 rounded-lg text-neutral-600"
              aria-label="Cart"
            >
              <HiOutlineShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <HiOutlineXMark className="w-5 h-5" />
              ) : (
                <HiOutlineBars3 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-neutral-100 bg-white overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2">
              {/* Search */}
              <div className="relative">
                <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  onFocus={() => {
                    navigate('/marketplace');
                    setMobileMenuOpen(false);
                  }}
                />
              </div>

              {/* Location */}
              <button
                onClick={() => {
                  navigate('/marketplace');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-neutral-700 hover:bg-neutral-50"
              >
                <HiOutlineMapPin className="w-4 h-4 text-primary-500" />
                {locationName || 'Set Location'} {radius && `• ${radius} km`}
              </button>

              <div className="border-t border-neutral-100 pt-2 space-y-1">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/sell"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-600 hover:bg-primary-50"
                    >
                      <HiOutlinePlus className="w-4 h-4" />
                      Sell a Product
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      <HiOutlineUser className="w-4 h-4" />
                      My Profile
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-600 hover:bg-primary-50"
                  >
                    Login / Sign Up
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
