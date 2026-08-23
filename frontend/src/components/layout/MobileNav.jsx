import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  HiOutlineHome,
  HiOutlineBuildingStorefront,
  HiOutlineShoppingCart,
  HiOutlineClipboardDocumentList,
  HiOutlineUser,
  HiHome,
  HiBuildingStorefront,
  HiShoppingCart,
  HiClipboardDocumentList,
  HiUser,
  HiOutlineHeart,
  HiHeart,
} from 'react-icons/hi2';
import { selectCartCount } from '../../features/cart/cartSlice';

const navItems = [
  {
    to: '/',
    label: 'Home',
    icon: HiOutlineHome,
    activeIcon: HiHome,
  },
  {
    to: '/marketplace',
    label: 'Market',
    icon: HiOutlineBuildingStorefront,
    activeIcon: HiBuildingStorefront,
  },
  {
    to: '/favorites',
    label: 'Wishlist',
    icon: HiOutlineHeart,
    activeIcon: HiHeart,
  },
  {
    to: '/cart',
    label: 'Cart',
    icon: HiOutlineShoppingCart,
    activeIcon: HiShoppingCart,
    badge: true,
  },
  {
    to: '/orders',
    label: 'Orders',
    icon: HiOutlineClipboardDocumentList,
    activeIcon: HiClipboardDocumentList,
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: HiOutlineUser,
    activeIcon: HiUser,
  },
];

export default function MobileNav() {
  const cartCount = useSelector(selectCartCount);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-neutral-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors relative ${
                isActive
                  ? 'text-primary-600'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {isActive ? (
                    <item.activeIcon className="w-6 h-6" />
                  ) : (
                    <item.icon className="w-6 h-6" />
                  )}
                  {item.badge && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-primary-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary-500 rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
