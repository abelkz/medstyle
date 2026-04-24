import { Outlet, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, ArrowLeft } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-800 text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-navy-700">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-mint-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-bold text-xs">M</span>
            </div>
            <span className="font-display text-lg font-bold">Med<span className="text-mint-400">Style</span></span>
          </Link>
          <p className="text-gray-400 text-xs mt-1 ml-9">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              end={href === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-mint-500/20 text-mint-400'
                    : 'text-gray-400 hover:bg-navy-700 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-navy-700">
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
