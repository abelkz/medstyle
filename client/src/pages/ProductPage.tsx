import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star, ChevronLeft, ChevronRight, Check, Truck } from 'lucide-react';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import ProductCard from '../components/product/ProductCard';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const { addItem, isLoading } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`).then(r => {
      setProduct(r.data.product);
      setRelated(r.data.related);
      setSelectedSize(r.data.product.sizes[0] || '');
      setSelectedColor(r.data.product.colors[0] || '');
    }).finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please sign in to add to cart'); return; }
    if (!selectedSize) { toast.error('Please select a size'); return; }
    if (!selectedColor) { toast.error('Please select a color'); return; }
    await addItem(product!.id, quantity, selectedSize, selectedColor);
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Please sign in'); return; }
    const { data } = await api.post(`/wishlist/${id}`);
    setWishlisted(data.added);
    toast.success(data.added ? 'Added to wishlist' : 'Removed');
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-12 animate-pulse">
      <div className="space-y-4">
        <div className="bg-gray-200 rounded-3xl aspect-square" />
        <div className="flex gap-2">{[...Array(3)].map((_, i) => <div key={i} className="w-20 h-20 bg-gray-200 rounded-xl" />)}</div>
      </div>
      <div className="space-y-4 pt-4">
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-20 bg-gray-200 rounded" />
      </div>
    </div>
  );

  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>;

  return (
    <div className="font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link to="/" className="hover:text-navy-600">Home</Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-navy-600">Catalog</Link>
          <span>/</span>
          <Link to={`/catalog/${product.category?.slug}`} className="hover:text-navy-600">{product.category?.name}</Link>
          <span>/</span>
          <span className="text-gray-700">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Gallery */}
          <div className="space-y-4">
            <motion.div
              key={selectedImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative rounded-3xl overflow-hidden aspect-square bg-gray-100"
            >
              <img src={product.images[selectedImg]} alt={product.name} className="w-full h-full object-cover" />
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImg(i => (i - 1 + product.images.length) % product.images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setSelectedImg(i => (i + 1) % product.images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </motion.div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImg === i ? 'border-navy-500' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <span className="text-mint-600 text-sm font-medium">{product.category?.name}</span>
              <button onClick={handleWishlist} className={`p-2 rounded-full transition-colors ${wishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                <Heart size={22} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-navy-800 mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1">{[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-amber-400" fill="currentColor" />)}</div>
              <span className="text-sm text-gray-500">4.9 (128 reviews)</span>
            </div>

            <div className="text-3xl font-display font-bold text-navy-800 mb-6">${product.price.toFixed(2)}</div>

            <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

            {/* Color */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm text-gray-700">Color</span>
                <span className="text-sm text-mint-600">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-4 py-2 rounded-xl text-sm border-2 transition-all ${
                      selectedColor === c ? 'border-navy-500 bg-navy-50 text-navy-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-navy-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm text-gray-700">Size</span>
                <a href="#" className="text-sm text-mint-600 underline">Size guide</a>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-12 h-12 rounded-xl text-sm font-medium border-2 transition-all ${
                      selectedSize === s ? 'border-navy-500 bg-navy-500 text-white' : 'border-gray-200 text-gray-700 hover:border-navy-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Add */}
            <div className="flex gap-3 mb-6">
              <div className="flex items-center border border-gray-200 rounded-xl">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-11 h-11 flex items-center justify-center text-gray-600 hover:text-navy-600 text-lg">−</button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-11 h-11 flex items-center justify-center text-gray-600 hover:text-navy-600 text-lg">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isLoading || product.stock === 0}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                {product.stock === 0 ? 'Out of Stock' : isLoading ? 'Adding…' : 'Add to Cart'}
              </button>
            </div>

            {/* Stock */}
            {product.stock > 0 && product.stock < 10 && (
              <p className="text-amber-600 text-sm mb-4">⚠️ Only {product.stock} left in stock!</p>
            )}

            {/* Perks */}
            <div className="border-t border-gray-100 pt-6 space-y-3">
              {[
                { icon: Truck, text: 'Free shipping on orders over $75' },
                { icon: Check, text: '30-day hassle-free returns' },
                { icon: Check, text: 'Medical-grade antimicrobial fabric' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon size={16} className="text-mint-500" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl font-bold text-navy-800 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
