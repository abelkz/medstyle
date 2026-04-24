import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Users, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { AdminStats } from '../../types';
import api from '../../api/axios';

interface StatCard {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data));
  }, []);

  if (!stats) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-mint-400 border-t-transparent rounded-full animate-spin" /></div>;

  const cards: StatCard[] = [
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: 'text-mint-600', bg: 'bg-mint-50' },
    { label: 'Total Users', value: stats.totalUsers.toString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'New Users Today', value: stats.newUsersToday.toString(), icon: TrendingUp, color: 'text-navy-600', bg: 'bg-navy-50' },
    { label: 'Pending Orders', value: stats.pendingOrders.toString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-navy-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your store's performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {cards.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
              <Icon size={22} className={color} />
            </div>
            <p className="text-2xl font-display font-bold text-navy-800">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-navy-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add Product', href: '/admin/products' },
            { label: 'View Orders', href: '/admin/orders' },
            { label: 'Manage Users', href: '/admin/users' },
            { label: 'Categories', href: '/admin/categories' },
          ].map(a => (
            <a key={a.href} href={a.href} className="py-3 px-4 bg-gray-50 hover:bg-mint-50 rounded-xl text-sm font-medium text-gray-700 hover:text-mint-700 transition-colors text-center">
              {a.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
