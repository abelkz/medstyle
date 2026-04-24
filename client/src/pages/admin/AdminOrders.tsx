import { useEffect, useState } from 'react';
import { Order } from '../../types';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-mint-100 text-mint-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = () => {
    const params: any = { page, limit: 20 };
    if (statusFilter) params.status = statusFilter;
    api.get('/admin/orders', { params }).then(r => {
      setOrders(r.data.orders);
      setTotalPages(r.data.totalPages);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/admin/orders/${id}`, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as any } : o));
      toast.success('Order status updated');
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-navy-800">Orders</h1>
        <p className="text-gray-500 mt-1">Manage all customer orders</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', ...statuses].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === s ? 'bg-navy-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-navy-300'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>{['Order', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Update'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-medium text-navy-600">#{order.id.slice(-8).toUpperCase()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-navy-800">{order.user?.name}</p>
                    <p className="text-xs text-gray-500">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.items.length}</td>
                  <td className="px-4 py-3 font-semibold text-sm text-navy-700">${order.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusColors[order.status]}`}>{order.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-mint-400"
                    >
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-xl text-sm ${page === i + 1 ? 'bg-navy-500 text-white' : 'border border-gray-200 text-gray-600'}`}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
