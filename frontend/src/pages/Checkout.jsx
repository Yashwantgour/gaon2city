import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCartTotal, selectCartCount } from '../features/cart/cartSlice';
import Button from '../components/common/Button';
import { formatPrice } from '../utils/helpers';
import { HiOutlineArrowLeft, HiOutlineMapPin, HiOutlineTruck } from 'react-icons/hi2';
import { useState } from 'react';

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const cartTotal = useSelector(selectCartTotal);
  const cartCount = useSelector(selectCartCount);
  const [fulfillment, setFulfillment] = useState('pickup');

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-neutral-100">
            <HiOutlineArrowLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <h1 className="text-2xl font-bold text-neutral-800">Checkout</h1>
        </div>

        <div className="space-y-5">
          {/* Fulfillment */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Fulfillment Method</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFulfillment('pickup')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
                  fulfillment === 'pickup' ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <HiOutlineMapPin className={`w-5 h-5 ${fulfillment === 'pickup' ? 'text-primary-600' : 'text-neutral-400'}`} />
                <div className="text-left">
                  <p className={`text-sm font-medium ${fulfillment === 'pickup' ? 'text-primary-700' : 'text-neutral-700'}`}>Pickup</p>
                  <p className="text-xs text-neutral-500">Collect from seller</p>
                </div>
              </button>
              <button
                onClick={() => setFulfillment('delivery')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
                  fulfillment === 'delivery' ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <HiOutlineTruck className={`w-5 h-5 ${fulfillment === 'delivery' ? 'text-primary-600' : 'text-neutral-400'}`} />
                <div className="text-left">
                  <p className={`text-sm font-medium ${fulfillment === 'delivery' ? 'text-primary-700' : 'text-neutral-700'}`}>Delivery</p>
                  <p className="text-xs text-neutral-500">Local delivery</p>
                </div>
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Name</span>
                <span className="text-neutral-800 font-medium">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Phone</span>
                <span className="text-neutral-800 font-medium">{user?.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Location</span>
                <span className="text-neutral-800 font-medium">{user?.village}, {user?.city}</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Order Summary</h3>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">
                    {item.product.title} × {item.quantity}
                  </span>
                  <span className="font-medium text-neutral-800">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="border-t border-neutral-100 pt-3 flex justify-between font-semibold text-base">
                <span className="text-neutral-800">Total</span>
                <span className="text-primary-600">{formatPrice(cartTotal)}</span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="xl"
            fullWidth
            onClick={() => {
              navigate('/orders');
            }}
          >
            Place Order • {formatPrice(cartTotal)}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
