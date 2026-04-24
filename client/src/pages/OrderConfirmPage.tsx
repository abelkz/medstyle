import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package } from 'lucide-react';
import { Order } from '../types';
import api from '../api/axios';

export default function OrderConfirmPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data.order));
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
        <div className="w-20 h-20 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-mint-500" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h1 className="font-display text-3xl font-bold text-navy-800 mb-3">Order Confirmed!</h1>
        <p className="text-gray-500 mb-2">Thank you for your purchase.</p>
        <p className="text-sm text-gray-400 mb-8">Order <span className="font-mono text-navy-600">#{id?.slice(-8).toUpperCase()}</span></p>

        {order && (
          <div className="card p-6 text-left mb-8">
            <h2 className="font-semibold text-navy-800 mb-4 flex items-center gap-2">
              <Package size={18} /> Order Details
            </h2>
            <div className="space-y-3 mb-5">
              {order.items.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-navy-800">{item.product.name}</p>
                    <p className="text-xs text-gray-500">{item.size} · {item.color} × {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between font-bold text-navy-800">
                <span>Total</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <p className="font-medium mb-1">Shipping to:</p>
                <p>{(order.shippingAddress as any).fullName}</p>
                <p>{(order.shippingAddress as any).address}, {(order.shippingAddress as any).city}</p>
                <p>{(order.shippingAddress as any).postalCode}, {(order.shippingAddress as any).country}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Link to="/account/orders" className="btn-primary">View My Orders</Link>
          <Link to="/catalog" className="btn-secondary">Continue Shopping</Link>
        </div>
      </motion.div>
    </div>
  );
}
