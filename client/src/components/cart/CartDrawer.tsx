import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateItem, removeItem, total } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-navy-600" />
                <h2 className="font-display text-lg font-semibold text-navy-800">Shopping Cart</h2>
                {items.length > 0 && (
                  <span className="badge bg-mint-100 text-mint-700">{items.length}</span>
                )}
              </div>
              <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                  <ShoppingBag size={56} strokeWidth={1} />
                  <p className="text-lg font-display">Your cart is empty</p>
                  <button onClick={closeCart} className="btn-primary text-sm px-8">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      className="flex gap-4"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-navy-800 truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.size} · {item.color}</p>
                        <p className="text-sm font-semibold text-navy-700 mt-1">${item.product.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                            className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-navy-400 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-navy-400 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-auto p-1 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="font-display text-xl font-bold text-navy-800">${total().toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400 mb-4">Shipping & taxes calculated at checkout</p>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="btn-primary w-full text-center block"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="block text-center text-sm text-gray-500 hover:text-navy-600 mt-3 transition-colors"
                >
                  View full cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
