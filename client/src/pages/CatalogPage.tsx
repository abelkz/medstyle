import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { Product, Category } from '../types';
import api from '../api/axios';

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
const colorOptions = ['White', 'Navy', 'Ceil Blue', 'Hunter Green', 'Black', 'Wine', 'Pewter', 'Teal'];
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export default function CatalogPage() {
  const { category: categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || 'newest';
  const selectedSize = searchParams.get('size') || '';
  const selectedColor = searchParams.get('color') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '12', sort };
      if (categorySlug) params.category = categorySlug;
      if (selectedSize) params.size = selectedSize;
      if (selectedColor) params.color = selectedColor;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const { data } = await api.get('/products', { params });
      setProducts(data.products);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [categorySlug, page, sort, selectedSize, selectedColor, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { api.get('/categories').then(r => setCategories(r.data.categories)); }, []);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  const currentCategory = categories.find(c => c.slug === categorySlug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-navy-800">
          {currentCategory?.name || 'All Products'}
        </h1>
        <p className="text-gray-500 mt-1">{total} products</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className={`lg:w-64 shrink-0 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="card p-5 space-y-6 sticky top-24">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-navy-800">Filters</h2>
              <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1">
                <X size={12} /> Clear all
              </button>
            </div>

            {/* Category */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Category</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="cat" checked={!categorySlug} onChange={() => setSearchParams({})} className="accent-mint-500" />
                  <span className="text-sm text-gray-600">All</span>
                </label>
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="cat" checked={categorySlug === cat.slug} onChange={() => setParam('category', cat.slug)} className="accent-mint-500" />
                    <span className="text-sm text-gray-600">{cat.name}</span>
                    {cat._count && <span className="text-xs text-gray-400 ml-auto">({cat._count.products})</span>}
                  </label>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map(s => (
                  <button
                    key={s}
                    onClick={() => setParam('size', selectedSize === s ? '' : s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedSize === s ? 'bg-navy-500 text-white border-navy-500' : 'border-gray-200 text-gray-600 hover:border-navy-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Color</h3>
              <div className="space-y-2">
                {colorOptions.map(c => (
                  <label key={c} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedColor === c} onChange={() => setParam('color', selectedColor === c ? '' : c)} className="accent-mint-500" />
                    <span className="text-sm text-gray-600">{c}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Price Range</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={e => setParam('minPrice', e.target.value)}
                  className="input-field text-sm py-2"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={e => setParam('maxPrice', e.target.value)}
                  className="input-field text-sm py-2"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <button
              className="lg:hidden flex items-center gap-2 text-sm text-gray-700 border border-gray-200 rounded-xl px-4 py-2"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-500 hidden sm:block">Sort:</span>
              <select
                value={sort}
                onChange={e => setParam('sort', e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-mint-400"
              >
                {sortOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl aspect-[3/4] mb-3" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl font-display text-gray-400 mb-2">No products found</p>
              <p className="text-gray-500 text-sm mb-6">Try adjusting your filters</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {[...Array(totalPages)].map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setParam('page', String(p))}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                          p === page ? 'bg-navy-500 text-white' : 'border border-gray-200 text-gray-600 hover:border-navy-400'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
