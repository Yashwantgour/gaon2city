import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import store from './store';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import SellerDashboard from './pages/SellerDashboard';
import AddProduct from './pages/AddProduct';
import Chat from './pages/Chat';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import { supabase } from './services/supabase';
import { getMe } from './services/authApi';
import { loginSuccess, logout, setLoading } from './features/auth/authSlice';

function AppRoutes() {
  const dispatch = useDispatch();

  useEffect(() => {
    async function initAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          localStorage.setItem('access_token', data.session.access_token);
          const userProfile = await getMe();
          dispatch(loginSuccess(userProfile));
        } else {
          dispatch(logout());
        }
      } catch {
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    }

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        localStorage.setItem('access_token', session.access_token);
        try {
          const userProfile = await getMe();
          dispatch(loginSuccess(userProfile));
        } catch {
          // ignore
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('access_token');
        dispatch(logout());
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/sell" element={<AddProduct />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}
