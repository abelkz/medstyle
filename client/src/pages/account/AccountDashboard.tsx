import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, User, Heart, MapPin, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Order } from '../../types';
import api from '../../api/axios';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-mint-100 text-mint-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function AccountDashboard() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data.orders.slice(0, 3)));
  }, []);

  const cards = [
    { icon: Package, label: 'My Orders', href: '/account/orders', value: orders.length + '+' },
    { icon: Heart, label: 'Wishlist', href: '/account/wishlist', value: '♥' },
    { icon: User, label: 'Profile', href: '/account/profile', value: '→' },
    { icon: MapPin, label: 'Addresses', href: '/account/profile', value: '→' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-navy-800 mb-1">
          Hello, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mb-8">Welcome to your account dashboard</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {cards.map(({ icon: Icon, label, href, value }) => (
            <Link key={href + label} to={href} className="card p-5 flex flex-col gap-3 hover:border-mint-200 hover:shadow-md transition-all group">
              <div className="w-10 h-10 bg-mint-50 rounded-xl flex items-center justify-center group-hover:bg-mint-100 transition-colors">
                <Icon size={20} className="text-mint-600" />
              </div>
              <div>
                <p className="font-semibold text-navy-800">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-navy-800">Recent Orders</h2>
            <Link to="/account/orders" className="text-sm text-mint-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package size={40} strokeWidth={1} className="mx-auto mb-3" />
              <p>No orders yet</p>
              <Link to="/catalog" className="text-mint-600 text-sm hover:underline mt-2 block">Start shopping</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <Link key={order.id} to={`/account/orders/${order.id}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-sm text-navy-800">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${statusColors[order.status]}`}>{order.status}</span>
                    <span className="font-semibold text-sm text-navy-800">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
