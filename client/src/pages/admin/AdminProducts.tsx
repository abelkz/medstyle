import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Product, Category } from '../../types';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '', sizes: '', colors: '', stock: '', isFeatured: false });

  const fetchProducts = () => {
    api.get(`/products?limit=50${search ? `&search=${search}` : ''}&page=1`).then(r => setProducts(r.data.products)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [search]);
  useEffect(() => { api.get('/categories').then(r => setCategories(r.data.categories)); }, []);

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: String(p.price), categoryId: p.categoryId, sizes: p.sizes.join(', '), colors: p.colors.join(', '), stock: String(p.stock), isFeatured: p.isFeatured });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, price: Number(form.price), stock: Number(form.stock), sizes: JSON.stringify(form.sizes.split(',').map(s => s.trim())), colors: JSON.stringify(form.colors.split(',').map(s => s.trim())) };
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, data);
        toast.success('Product updated');
      } else {
        await api.post('/products', data);
        toast.success('Product created');
      }
      setShowForm(false);
      setEditing(null);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Deleted');
    fetchProducts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy-800">Products</h1>
          <p className="text-gray-500 mt-1">{products.length} products</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', description: '', price: '', categoryId: '', sizes: 'XS, S, M, L, XL, 2XL, 3XL', colors: 'Navy, White, Black', stock: '50', isFeatured: false }); setShowForm(true); }} className="btn-mint flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" className="input-field pl-11" />
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8">
            <h2 className="font-display text-xl font-bold text-navy-800 mb-6">{editing ? 'Edit Product' : 'New Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field h-24 resize-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Price ($)</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="input-field" required min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="input-field" required min="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Category</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="input-field" required>
                  <option value="">Select category…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Sizes (comma-separated)</label>
                <input value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))} className="input-field" placeholder="XS, S, M, L, XL" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Colors (comma-separated)</label>
                <input value={form.colors} onChange={e => setForm(f => ({ ...f, colors: e.target.value }))} className="input-field" placeholder="Navy, White, Black" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="accent-mint-500 w-4 h-4" />
                <span className="text-sm text-gray-700">Featured / Bestseller</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>{['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-medium text-sm text-navy-800 line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.category?.name}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-navy-700">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.isFeatured ? 'bg-mint-100 text-mint-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.isFeatured ? 'Featured' : 'Standard'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
