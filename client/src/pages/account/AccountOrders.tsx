import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { Order } from '../../types';
import api from '../../api/axios';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-mint-100 text-mint-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function AccountOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data.orders)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-bold text-navy-800 mb-8">My Orders</h1>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package size={56} strokeWidth={1} className="mx-auto mb-4" />
          <h2 className="font-display text-xl text-gray-600 mb-2">No orders yet</h2>
          <Link to="/catalog" className="btn-primary inline-block mt-4">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order.id} to={`/account/orders/${order.id}`} className="card p-5 flex items-center gap-5 hover:shadow-md transition-shadow group">
              <div className="flex gap-2 flex-wrap w-24 shrink-0">
                {order.items.slice(0, 2).map(item => (
                  <img key={item.id} src={item.product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-800">Order #{order.id.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  {' · '}{order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`badge ${statusColors[order.status]}`}>{order.status}</span>
                <span className="font-bold text-navy-800">${order.totalAmount.toFixed(2)}</span>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-navy-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
