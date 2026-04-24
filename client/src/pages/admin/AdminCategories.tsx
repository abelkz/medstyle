import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Category } from '../../types';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', image: '' });

  const fetchCategories = () => api.get('/categories').then(r => setCategories(r.data.categories));
  useEffect(() => { fetchCategories(); }, []);

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, image: c.image || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, form);
        toast.success('Category updated');
      } else {
        await api.post('/categories', form);
        toast.success('Category created');
      }
      setShowForm(false);
      setEditing(null);
      fetchCategories();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Deleted');
      fetchCategories();
    } catch { toast.error('Category may have products assigned to it'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy-800">Categories</h1>
          <p className="text-gray-500 mt-1">{categories.length} categories</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', slug: '', image: '' }); setShowForm(true); }} className="btn-mint flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h2 className="font-display text-xl font-bold text-navy-800 mb-6">{editing ? 'Edit Category' : 'New Category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: editing ? f.slug : e.target.value.toLowerCase().replace(/\s+/g, '-') }))} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Slug</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="input-field" required pattern="[a-z0-9-]+" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Image URL (optional)</label>
                <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="input-field" type="url" placeholder="https://…" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat, i) => (
          <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
            <div className="h-32 overflow-hidden bg-gray-100 relative">
              <img src={cat.image || `https://picsum.photos/seed/${cat.slug}/400/200`} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-navy-800">{cat.name}</p>
                <p className="text-xs text-gray-500">/{cat.slug} · {cat._count?.products || 0} products</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
