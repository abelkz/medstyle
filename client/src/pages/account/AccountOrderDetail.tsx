import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CheckCircle, Truck, Clock } from 'lucide-react';
import { Order } from '../../types';
import api from '../../api/axios';

const statusSteps = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default function AccountOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => { api.get(`/orders/${id}`).then(r => setOrder(r.data.order)); }, [id]);

  if (!order) return <div className="text-center py-20"><div className="w-8 h-8 border-4 border-mint-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>;

  const stepIdx = statusSteps.indexOf(order.status);
  const addr = order.shippingAddress as any;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/account/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-navy-600 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy-800">Order #{id?.slice(-8).toUpperCase()}</h1>
          <p className="text-gray-500 text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Status Timeline */}
      {order.status !== 'CANCELLED' && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-navy-800 mb-6">Order Status</h2>
          <div className="relative flex justify-between">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
              <div className="h-full bg-mint-500 transition-all" style={{ width: `${Math.max(0, stepIdx) * 33.33}%` }} />
            </div>
            {statusSteps.map((step, i) => (
              <div key={step} className="flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  i <= stepIdx ? 'border-mint-500 bg-mint-500 text-white' : 'border-gray-300 bg-white text-gray-400'
                }`}>
                  {i < stepIdx ? <CheckCircle size={18} /> : i === 0 ? <Clock size={18} /> : i === 2 ? <Truck size={18} /> : <Package size={18} />}
                </div>
                <p className="text-xs mt-2 text-center text-gray-600 font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 card p-6">
          <h2 className="font-semibold text-navy-800 mb-5">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map(item => (
              <div key={item.id} className="flex gap-4">
                <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="font-medium text-navy-800">{item.product.name}</p>
                  <p className="text-sm text-gray-500">{item.size} · {item.color} · Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-navy-800">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-5 pt-4 flex justify-between font-bold text-navy-800">
            <span>Total</span>
            <span className="font-display text-xl">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={18} className="text-mint-500" />
            <h2 className="font-semibold text-navy-800">Shipping Address</h2>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-medium text-navy-800">{addr.fullName}</p>
            <p>{addr.address}</p>
            <p>{addr.city}, {addr.postalCode}</p>
            <p>{addr.country}</p>
            <p>{addr.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
