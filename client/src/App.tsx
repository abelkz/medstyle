import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';

import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';

import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmPage from './pages/OrderConfirmPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import AccountDashboard from './pages/account/AccountDashboard';
import AccountOrders from './pages/account/AccountOrders';
import AccountOrderDetail from './pages/account/AccountOrderDetail';
import AccountProfile from './pages/account/AccountProfile';
import AccountWishlist from './pages/account/AccountWishlist';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';

export default function App() {
  const { fetchMe, user } = useAuthStore();
  const { fetchCart } = useCartStore();
  const location = useLocation();

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:category" element={<CatalogPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirm/:id" element={<OrderConfirmPage />} />
            <Route path="/account" element={<AccountDashboard />} />
            <Route path="/account/orders" element={<AccountOrders />} />
            <Route path="/account/orders/:id" element={<AccountOrderDetail />} />
            <Route path="/account/profile" element={<AccountProfile />} />
            <Route path="/account/wishlist" element={<AccountWishlist />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
