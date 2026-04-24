import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function CartPage() {
  const { items, updateItem, removeItem, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-gray-400 px-4">
        <ShoppingBag size={72} strokeWidth={1} />
        <h1 className="font-display text-2xl text-gray-600">Your cart is empty</h1>
        <Link to="/catalog" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  const subtotal = total();
  const shipping = subtotal >= 75 ? 0 : 9.99;
  const orderTotal = subtotal + shipping;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-bold text-navy-800 mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ delay: i * 0.05 }}
              className="card p-5 flex gap-5"
            >
              <Link to={`/products/${item.productId}`} className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </Link>

              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.productId}`} className="font-semibold text-navy-800 hover:text-navy-600 transition-colors line-clamp-2">
                  {item.product.name}
                </Link>
                <p className="text-sm text-gray-500 mt-1">{item.size} · {item.color}</p>
                <p className="font-bold text-navy-700 mt-2">${item.product.price.toFixed(2)}</p>
              </div>

              <div className="flex flex-col items-end justify-between">
                <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-2">
                  <button onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-navy-600">
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                  <button onClick={() => updateItem(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-navy-600">
                    <Plus size={14} />
                  </button>
                </div>
                <p className="font-semibold text-navy-800">${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-display text-lg font-semibold text-navy-800 mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-mint-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              {subtotal < 75 && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  Add ${(75 - subtotal).toFixed(2)} more for free shipping!
                </p>
              )}
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between font-semibold text-navy-800">
                <span>Total</span>
                <span className="font-display text-xl">${orderTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo Code */}
            <div className="flex gap-2 mb-6">
              <input placeholder="Promo code" className="input-field text-sm py-2 flex-1" />
              <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:border-navy-400 transition-colors">Apply</button>
            </div>

            <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
              Checkout <ArrowRight size={16} />
            </Link>
            <Link to="/catalog" className="block text-center text-sm text-gray-500 hover:text-navy-600 mt-3 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
