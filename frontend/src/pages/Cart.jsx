import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { HiOutlineTrash, HiOutlineMinus, HiOutlinePlus, HiOutlineShoppingCart, HiOutlineMapPin } from 'react-icons/hi2';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { removeFromCart, updateQuantity, clearCart, selectCartTotal, selectCartCount } from '../features/cart/cartSlice';
import { showToast } from '../features/ui/uiSlice';
import { formatPrice } from '../utils/helpers';

function CartItemImage({ product }) {
  const [imgError, setImgError] = useState(false);
  const firstImg = product?.images?.[0];
  const imageSource = typeof firstImg === 'string'
    ? firstImg
    : (firstImg?.storage_path || product?.storage_path);

  if (!imgError && imageSource) {
    return (
      <img
        src={imageSource}
        alt={product?.title || 'Product'}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-neutral-100 shrink-0"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-neutral-100 flex items-center justify-center text-2xl shrink-0 border border-neutral-100">
      📦
    </div>
  );
}

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const cartTotal = useSelector(selectCartTotal);
  const cartCount = useSelector(selectCartCount);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <EmptyState
          icon={<HiOutlineShoppingCart className="w-10 h-10 text-neutral-300" />}
          title="Your cart is empty"
          description="Browse the marketplace to find products near you."
          actionLabel="Browse Marketplace"
          onAction={() => navigate('/marketplace')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Your Cart</h1>
            <p className="text-sm text-neutral-500">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => {
              dispatch(clearCart());
              dispatch(showToast({ type: 'info', message: 'Cart cleared' }));
            }}
            className="text-sm text-neutral-500 hover:text-danger-500 transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item, index) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-neutral-100 p-4 flex gap-4"
              >
                <Link to={`/product/${item.product.id}`} className="shrink-0">
                  <CartItemImage product={item.product} />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product.id}`}>
                    <h3 className="font-semibold text-neutral-800 text-sm sm:text-base line-clamp-1 hover:text-primary-600 transition-colors">
                      {item.product.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-neutral-500 mt-0.5">{item.product.seller?.name}</p>

                  <div className="flex items-center gap-1.5 mt-1 text-xs text-neutral-500">
                    <HiOutlineMapPin className="w-3 h-3 text-primary-500" />
                    {item.product.distance ? `${item.product.distance} km away` : 'Nearby'}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-neutral-200 rounded-lg">
                      <button
                        onClick={() =>
                          dispatch(updateQuantity({ productId: item.product.id, quantity: item.quantity - 1 }))
                        }
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 rounded-l-lg"
                      >
                        <HiOutlineMinus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() =>
                          dispatch(updateQuantity({ productId: item.product.id, quantity: item.quantity + 1 }))
                        }
                        className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 rounded-r-lg"
                      >
                        <HiOutlinePlus className="w-3 h-3" />
                      </button>
                    </div>

                    <p className="font-bold text-neutral-800">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    dispatch(removeFromCart(item.product.id));
                    dispatch(showToast({ type: 'info', message: 'Removed from cart' }));
                  }}
                  className="self-start p-2 text-neutral-400 hover:text-danger-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-neutral-100 p-5 sticky top-20">
              <h3 className="font-semibold text-neutral-800 mb-4">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery</span>
                  <span className="text-green-600 font-medium">TBD</span>
                </div>
                <div className="border-t border-neutral-100 pt-3 flex justify-between font-semibold text-neutral-800 text-base">
                  <span>Total</span>
                  <span className="text-primary-600">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                className="mt-5"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </Button>

              <Link
                to="/marketplace"
                className="block text-center text-sm text-primary-600 font-medium mt-3 hover:text-primary-700"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
