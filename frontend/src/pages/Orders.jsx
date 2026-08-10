import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import EmptyState from '../components/common/EmptyState';
import { formatPrice, formatDate, getOrderStatusLabel, getStatusColor } from '../utils/helpers';
import { listOrders } from '../services/ordersApi';

function OrderItemImage({ product }) {
  const [imgError, setImgError] = useState(false);
  const imageSource = typeof product?.images?.[0] === 'string'
    ? product.images[0]
    : product?.images?.[0]?.storage_path;

  if (!imgError && imageSource) {
    return (
      <img
        src={imageSource}
        alt={product?.title || 'Product'}
        className="w-16 h-16 rounded-xl object-cover bg-neutral-100 shrink-0"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center text-xl shrink-0 border border-neutral-100">
      📦
    </div>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!isAuthenticated) return;
      setIsLoading(true);
      try {
        const res = await listOrders({ role: 'buyer' });
        setOrders(res.orders || []);
      } catch {
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <EmptyState
          title="Please sign in"
          description="Sign in to view your orders."
          actionLabel="Sign In"
          onAction={() => navigate('/login')}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-neutral-500">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-neutral-800 mb-6">My Orders</h1>
        <EmptyState
          icon={<HiOutlineClipboardDocumentList className="w-10 h-10 text-neutral-300" />}
          title="No orders yet"
          description="Start shopping to see your orders here."
          actionLabel="Browse Marketplace"
          onAction={() => navigate('/marketplace')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-neutral-800 mb-6">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between px-5 py-3 bg-neutral-50 border-b border-neutral-100">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-neutral-500">
                    Order <span className="font-medium text-neutral-700">{order.id.slice(0, 8)}...</span>
                  </span>
                  <span className="text-neutral-300">|</span>
                  <span className="text-neutral-500">{formatDate(order.created_at)}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getOrderStatusLabel(order.status)}
                </span>
              </div>

              <div className="p-5 space-y-3">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <OrderItemImage product={item.product} />
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-800 text-sm">{item.product?.title || 'Product'}</h4>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Qty: {item.quantity} × {formatPrice(item.unit_price)}
                      </p>
                    </div>
                    <p className="font-semibold text-neutral-800 text-sm">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                ))}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <span className="capitalize">{order.fulfillment_type}</span>
                    <span className="text-neutral-300">•</span>
                    <span>Payment: {order.payment_status}</span>
                  </div>
                  <p className="font-bold text-primary-600">{formatPrice(order.total_amount)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
