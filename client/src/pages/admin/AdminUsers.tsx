import { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, Shield, User as UserIcon } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = () => {
    const params: any = { page, limit: 20 };
    if (search) params.search = search;
    api.get('/admin/users', { params }).then(r => {
      setUsers(r.data.users);
      setTotalPages(r.data.totalPages);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const updateUser = async (id: string, data: Partial<AdminUser>) => {
    try {
      await api.put(`/admin/users/${id}`, data);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
      toast.success('User updated');
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-navy-800">Users</h1>
        <p className="text-gray-500 mt-1">Manage customer accounts and roles</p>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email…" className="input-field pl-11" />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>{['User', 'Role', 'Orders', 'Joined', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center">
                        <span className="text-navy-600 font-medium text-sm">{u.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-navy-800">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.role === 'ADMIN' ? 'bg-mint-100 text-mint-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u._count.orders}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateUser(u.id, { role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' } as any)}
                        title={u.role === 'ADMIN' ? 'Remove admin' : 'Make admin'}
                        className={`p-1.5 rounded-lg transition-colors ${u.role === 'ADMIN' ? 'text-mint-600 hover:bg-mint-50' : 'text-gray-400 hover:bg-gray-100'}`}
                      >
                        <Shield size={15} />
                      </button>
                      <button
                        onClick={() => updateUser(u.id, { isActive: !u.isActive })}
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                        className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                      >
                        {u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                    </div>
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
