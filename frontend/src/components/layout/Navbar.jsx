import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineShoppingCart,
  HiOutlineUser,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineMapPin,
  HiOutlinePlus,
  HiOutlineChatBubbleLeftRight,
  HiChevronRight,
  HiOutlineHeart,
} from 'react-icons/hi2';
import { selectCartCount } from '../../features/cart/cartSlice';
import { openLocationDrawer } from '../../features/location/locationSlice';
import { listConversations } from '../../services/conversationsApi';
import Button from '../common/Button';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cartCount = useSelector(selectCartCount);
  const { locationName, radius } = useSelector((state) => state.location);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function checkUnread() {
      try {
        const convs = await listConversations();
        if (convs) {
          const total = convs.reduce((sum, c) => sum + (c.unread_count || 0), 0);
          setUnreadMsgCount(total);
        }
      } catch {
        // silent catch
      }
    }
    checkUnread();
    const interval = setInterval(checkUnread, 4000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <nav className="sticky top-0 z-40 glass border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center shadow-xs">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-neutral-800">
                  Gaon<span className="text-primary-500">2</span>City
                </span>
              </div>
            </Link>

            {/* Location Selector Indicator — Desktop (Flipkart-Style Interactive Badge) */}
            <button
              onClick={() => dispatch(openLocationDrawer())}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-primary-50/80 hover:bg-primary-100 text-primary-800 text-xs font-semibold transition-all border border-primary-200/70 shadow-2xs group cursor-pointer"
              title="Select delivery location"
            >
              <div className="w-6 h-6 rounded-lg bg-primary-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <HiOutlineMapPin className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] text-primary-700 font-medium">Deliver to</span>
                <span className="font-bold text-neutral-900 truncate max-w-[130px]">
                  {locationName || 'Set Location'}
                </span>
              </div>
              {radius && (
                <span className="text-[10px] font-extrabold bg-primary-200/80 text-primary-900 px-1.5 py-0.5 rounded-md ml-0.5">
                  {radius} km
                </span>
              )}
              <HiChevronRight className="w-3.5 h-3.5 text-primary-500 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

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

          {/* Location Indicator — Mobile */}
          <button
            onClick={() => dispatch(openLocationDrawer())}
            className="flex md:hidden items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-200/60 max-w-[160px] truncate"
          >
            <HiOutlineMapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
            <span className="truncate">{locationName || 'Set Location'}</span>
            <span className="text-[10px] text-primary-600 font-bold">• {radius || 10}km</span>
          </button>

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
                {unreadMsgCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-primary-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold shadow-xs"
                  >
                    {unreadMsgCount > 9 ? '9+' : unreadMsgCount}
                  </motion.span>
                )}
              </button>
            )}

            <button
              onClick={() => navigate('/favorites')}
              className="p-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label="Wishlist"
            >
              <HiOutlineHeart className="w-5 h-5" />
            </button>

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

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-neutral-200/60 bg-white/95 backdrop-blur-md px-4 py-4 space-y-3"
          >
            {/* Mobile Search */}
            <div className="relative">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm"
                onFocus={() => {
                  setMobileMenuOpen(false);
                  navigate('/marketplace');
                }}
              />
            </div>

            {/* Mobile Location Selector Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                dispatch(openLocationDrawer());
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-primary-50 text-primary-800 text-sm font-semibold border border-primary-100"
            >
              <div className="flex items-center gap-2">
                <HiOutlineMapPin className="w-4 h-4 text-primary-600" />
                <span>{locationName || 'Set delivery location'}</span>
              </div>
              <span className="text-xs bg-primary-200/80 px-2 py-0.5 rounded-full font-bold">
                {radius || 10} km ›
              </span>
            </button>

            <div className="space-y-1 pt-1">
              <Link
                to="/marketplace"
                className="block px-3 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Marketplace
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/chat"
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Messages</span>
                    {unreadMsgCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-primary-500 text-white rounded-full text-xs font-bold">
                        {unreadMsgCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/sell"
                    className="block px-3 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sell Product
                  </Link>
                  <Link
                    to="/favorites"
                    className="block px-3 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    ❤️ My Wishlist
                  </Link>
                  <Link
                    to="/seller/dashboard"
                    className="block px-3 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Seller Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                </>
              )}
            </div>

            {!isAuthenticated && (
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Login / Register
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
