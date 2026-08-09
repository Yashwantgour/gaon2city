import { createSlice } from '@reduxjs/toolkit';

const loadCart = () => {
  try {
    const cart = localStorage.getItem('gaon2city_cart');
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem('gaon2city_cart', JSON.stringify(items));
};

const initialState = {
  items: loadCart(),
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const product = action.payload;
      const existing = state.items.find((item) => item.product.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ product, quantity: 1 });
      }
      saveCart(state.items);
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((item) => item.product.id !== action.payload);
      saveCart(state.items);
    },
    updateQuantity(state, action) {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.product.id === productId);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
      saveCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      saveCart(state.items);
    },
    toggleCart(state) {
      state.isOpen = !state.isOpen;
    },
    closeCart(state) {
      state.isOpen = false;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, closeCart } = cartSlice.actions;

export const selectCartTotal = (state) =>
  state.cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);

export const selectCartCount = (state) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);

export default cartSlice.reducer;
