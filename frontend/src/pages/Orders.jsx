import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import { mockOrders } from '../services/mockData';
import { formatPrice, formatDate, getOrderStatusLabel, getStatusColor } from '../utils/helpers';

export default function Orders() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

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

  const orders = mockOrders;

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
              {/* Order Header */}
              <div className="flex items-center justify-between px-5 py-3 bg-neutral-50 border-b border-neutral-100">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-neutral-500">
                    Order <span className="font-medium text-neutral-700">{order.id}</span>
                  </span>
                  <span className="text-neutral-300">|</span>
                  <span className="text-neutral-500">{formatDate(order.created_at)}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getOrderStatusLabel(order.status)}
                </span>
              </div>

              {/* Order Items */}
              <div className="p-5">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.product.images?.[0] || ''}
                      alt={item.product.title}
                      className="w-16 h-16 rounded-xl object-cover bg-neutral-100"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-800 text-sm">{item.product.title}</h4>
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
