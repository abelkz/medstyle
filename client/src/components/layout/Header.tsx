import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Heart, Menu, X, Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

const navLinks = [
  { label: 'Catalog', href: '/catalog' },
  { label: 'Scrubs', href: '/catalog/scrubs' },
  { label: 'Lab Coats', href: '/catalog/lab-coats' },
  { label: 'Footwear', href: '/catalog/medical-footwear' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { count, toggleCart } = useCartStore();
  const navigate = useNavigate();
  const cartCount = count();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-3' : 'bg-white/95 backdrop-blur-sm py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-navy-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">M</span>
            </div>
            <span className="font-display text-xl font-bold text-navy-700 tracking-tight">
              Med<span className="text-mint-500">Style</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors duration-200 ${
                    isActive ? 'text-mint-500' : 'text-gray-700 hover:text-navy-600'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="hidden md:flex p-2 text-gray-600 hover:text-navy-600 transition-colors">
              <Search size={20} />
            </button>

            {/* User menu */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1 p-2 text-gray-600 hover:text-navy-600 transition-colors"
              >
                <User size={20} />
                {user && <ChevronDown size={14} />}
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100 mb-1">
                          <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <Link to="/account" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Account</Link>
                        <Link to="/account/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Orders</Link>
                        <Link to="/account/wishlist" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Wishlist</Link>
                        {user.role === 'ADMIN' && (
                          <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-mint-600 font-medium hover:bg-mint-50">Admin Panel</Link>
                        )}
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">Sign Out</button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Sign In</Link>
                        <Link to="/register" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Create Account</Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/account/wishlist" className="hidden md:flex p-2 text-gray-600 hover:text-navy-600 transition-colors">
              <Heart size={20} />
            </Link>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-600 hover:text-navy-600 transition-colors"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-mint-500 text-white text-xs rounded-full flex items-center justify-center font-semibold"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </motion.span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-4 pb-2 flex flex-col gap-1 border-t border-gray-100 mt-4">
                {navLinks.map(link => (
                  <NavLink
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-2 py-2 text-sm font-medium text-gray-700 hover:text-navy-600 rounded-lg hover:bg-gray-50"
                  >
                    {link.label}
                  </NavLink>
                ))}
                <div className="h-px bg-gray-100 my-2" />
                {user ? (
                  <>
                    <Link to="/account" onClick={() => setMobileOpen(false)} className="px-2 py-2 text-sm text-gray-700">My Account</Link>
                    <Link to="/account/orders" onClick={() => setMobileOpen(false)} className="px-2 py-2 text-sm text-gray-700">Orders</Link>
                    {user.role === 'ADMIN' && (
                      <Link to="/admin" onClick={() => setMobileOpen(false)} className="px-2 py-2 text-sm text-mint-600 font-medium">Admin Panel</Link>
                    )}
                    <button onClick={handleLogout} className="px-2 py-2 text-sm text-red-500 text-left">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="px-2 py-2 text-sm text-gray-700">Sign In</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="px-2 py-2 text-sm text-gray-700">Create Account</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
