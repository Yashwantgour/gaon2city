import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineUser,
  HiOutlineMapPin,
  HiOutlineCog6Tooth,
  HiOutlineBuildingStorefront,
  HiOutlineClipboardDocumentList,
  HiOutlineChatBubbleLeftRight,
  HiOutlineHeart,
  HiOutlineArrowRightOnRectangle,
  HiOutlineChevronRight,
  HiOutlineShieldCheck,
} from 'react-icons/hi2';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { logout } from '../features/auth/authSlice';
import { showToast } from '../features/ui/uiSlice';
import { getSellerTypeLabel } from '../utils/helpers';

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <EmptyState
          title="Sign in to view your profile"
          description="Access your account, orders, and seller dashboard."
          actionLabel="Sign In"
          onAction={() => navigate('/login')}
        />
      </div>
    );
  }

  const handleLogout = () => {
    dispatch(logout());
    dispatch(showToast({ type: 'info', message: 'Signed out successfully' }));
    navigate('/');
  };

  const menuItems = [
    { icon: HiOutlineBuildingStorefront, label: 'Seller Dashboard', to: '/seller/dashboard', color: 'text-primary-600 bg-primary-50' },
    { icon: HiOutlineClipboardDocumentList, label: 'My Orders', to: '/orders', color: 'text-blue-600 bg-blue-50' },
    { icon: HiOutlineHeart, label: 'Favorites', to: '/favorites', color: 'text-red-500 bg-red-50' },
    { icon: HiOutlineChatBubbleLeftRight, label: 'Messages', to: '/chat', color: 'text-purple-600 bg-purple-50' },
    { icon: HiOutlineCog6Tooth, label: 'Settings', to: '/settings', color: 'text-neutral-600 bg-neutral-100' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary-50"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center">
                <HiOutlineUser className="w-8 h-8 text-primary-600" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-neutral-800">{user.name}</h1>
                {user.verification_status === 'verified' && (
                  <HiOutlineShieldCheck className="w-5 h-5 text-primary-500" />
                )}
              </div>
              <p className="text-sm text-neutral-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500">
                <HiOutlineMapPin className="w-3.5 h-3.5 text-primary-500" />
                {user.village}, {user.city}, {user.state}
              </div>
              {user.seller_type && (
                <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                  {getSellerTypeLabel(user.seller_type)}
                </span>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full sm:w-auto"
            onClick={() => navigate('/profile/edit')}
          >
            Edit Profile
          </Button>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-2xl border border-neutral-100 divide-y divide-neutral-100 mb-6">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-neutral-50 transition-colors"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left text-sm font-medium text-neutral-700">{item.label}</span>
              <HiOutlineChevronRight className="w-4 h-4 text-neutral-400" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-red-200 text-danger-500 hover:bg-red-50 transition-colors text-sm font-medium"
        >
          <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
          Sign Out
        </button>
      </motion.div>
    </div>
  );
}
