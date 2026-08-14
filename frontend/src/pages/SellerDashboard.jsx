import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineShoppingCart,
  HiOutlineChartBarSquare,
  HiOutlineCube,
  HiOutlineBanknotes,
} from 'react-icons/hi2';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { formatPrice, getStatusColor, getOrderStatusLabel } from '../utils/helpers';
import { listProducts, deleteProduct } from '../services/productsApi';
import { listOrders } from '../services/ordersApi';
import { showToast } from '../features/ui/uiSlice';

function SellerProductRow({ product, index, navigate, handleDeleteProduct }) {
  const rawImages = (product.images || [])
    .map((img) => (typeof img === 'string' ? img : img?.storage_path))
    .filter(Boolean);

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [allImagesFailed, setAllImagesFailed] = useState(rawImages.length === 0);

  const imageSource = rawImages[activeImgIndex] || null;

  const handleImageError = () => {
    if (activeImgIndex < rawImages.length - 1) {
      setActiveImgIndex((prev) => prev + 1);
    } else {
      setAllImagesFailed(true);
    }
  };

  const isOutOfStock = (Number(product.quantity) || 0) <= 0 || product.status === 'out_of_stock';

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-neutral-100 p-4 flex items-center gap-4"
    >
      {!allImagesFailed && imageSource ? (
        <img
          src={imageSource}
          alt={product.title}
          className={`w-14 h-14 rounded-xl object-cover bg-neutral-100 shrink-0 ${
            isOutOfStock ? 'opacity-80 grayscale-20' : ''
          }`}
          onError={handleImageError}
        />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-neutral-50 flex items-center justify-center text-lg shrink-0 border border-neutral-100 text-neutral-400">
          🖼️
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-neutral-800 text-sm line-clamp-1">{product.title}</h3>
          {isOutOfStock && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
              Out of Stock
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-neutral-500">
          <span className="font-bold text-primary-600">{formatPrice(product.price)}</span>
          <span>•</span>
          <span className={isOutOfStock ? 'text-red-600 font-medium' : 'text-neutral-600'}>
            Stock: <strong>{product.quantity ?? 0}</strong> {product.unit || 'units'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => navigate(`/product/${product.id}`)}
          className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors"
          title="View"
        >
          <HiOutlineEye className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate(`/edit/${product.id}`)}
          className="p-2 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Edit"
        >
          <HiOutlinePencilSquare className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDeleteProduct(product.id)}
          className="p-2 rounded-lg text-neutral-400 hover:text-danger-500 hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <HiOutlineTrash className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default function SellerDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [myProducts, setMyProducts] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!isAuthenticated || !user) return;
      setIsLoading(true);
      try {
        const [prodRes, orderRes] = await Promise.allSettled([
          listProducts({ limit: 50 }),
          listOrders({ role: 'seller' }),
        ]);

        if (prodRes.status === 'fulfilled') {
          const userProds = (prodRes.value.products || []).filter((p) => p.seller_id === user.id);
          setMyProducts(userProds);
        }

        if (orderRes.status === 'fulfilled') {
          setSellerOrders(orderRes.value.orders || []);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <EmptyState
          title="Sign in to access seller dashboard"
          actionLabel="Sign In"
          onAction={() => navigate('/login')}
        />
      </div>
    );
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deleteProduct(id);
      setMyProducts((prev) => prev.filter((p) => p.id !== id));
      dispatch(showToast({ type: 'success', message: 'Product deleted' }));
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err?.message || 'Failed to delete' }));
    }
  };

  const totalRevenue = sellerOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const stats = [
    {
      label: 'Active Listings',
      value: myProducts.length,
      icon: HiOutlineCube,
      color: 'text-primary-600 bg-primary-50',
    },
    {
      label: 'Total Orders',
      value: sellerOrders.length,
      icon: HiOutlineShoppingCart,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Revenue',
      value: formatPrice(totalRevenue),
      icon: HiOutlineBanknotes,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Store Status',
      value: user?.verification_status === 'verified' ? 'Verified' : 'Active',
      icon: HiOutlineChartBarSquare,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Seller Dashboard</h1>
            <p className="text-sm text-neutral-500">Manage your listings and orders</p>
          </div>
          <Button variant="primary" icon={<HiOutlinePlus />} onClick={() => navigate('/sell')}>
            Add Product
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-neutral-100 p-4"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-neutral-800">{stat.value}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-neutral-800 mb-4">My Listings</h2>
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center">
              <p className="text-neutral-500 text-sm">Loading listings...</p>
            </div>
          ) : myProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center">
              <p className="text-neutral-500 mb-3">You haven&apos;t listed any products yet</p>
              <Button variant="primary" size="sm" onClick={() => navigate('/sell')}>
                Create Listing
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {myProducts.map((product, i) => (
                <SellerProductRow
                  key={product.id}
                  product={product}
                  index={i}
                  navigate={navigate}
                  handleDeleteProduct={handleDeleteProduct}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-neutral-800 mb-4">Recent Orders</h2>
          {sellerOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center">
              <p className="text-neutral-500">No seller orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sellerOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-neutral-100 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600">
                      {order.buyer?.name?.charAt(0) || 'B'}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800 text-sm">{order.buyer?.name || 'Buyer'}</p>
                      <p className="text-xs text-neutral-500">{(order.items || []).length} item(s) • {order.fulfillment_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-800 text-sm">{formatPrice(order.total_amount)}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
