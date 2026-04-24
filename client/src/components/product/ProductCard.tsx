import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const { addItem } = useCartStore();
  const { user } = useAuthStore();

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to add to cart'); return; }
    if (!product.sizes.length || !product.colors.length) return;
    setAdding(true);
    await addItem(product.id, 1, product.sizes[0], product.colors[0]);
    setAdding(false);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in'); return; }
    try {
      const { data } = await api.post(`/wishlist/${product.id}`);
      setWishlisted(data.added);
      toast.success(data.added ? 'Added to wishlist' : 'Removed from wishlist');
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/products/${product.id}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-[3/4]">
          <img
            src={product.images[imgIdx] || product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onMouseEnter={() => product.images[1] && setImgIdx(1)}
            onMouseLeave={() => setImgIdx(0)}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isFeatured && (
              <span className="badge bg-mint-500 text-white text-xs px-2 py-1">Bestseller</span>
            )}
            {product.stock < 10 && product.stock > 0 && (
              <span className="badge bg-amber-400 text-white text-xs px-2 py-1">Low Stock</span>
            )}
            {product.stock === 0 && (
              <span className="badge bg-red-500 text-white text-xs px-2 py-1">Out of Stock</span>
            )}
          </div>

          {/* Actions overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleQuickAdd}
              disabled={adding || product.stock === 0}
              className="w-full flex items-center justify-center gap-2 bg-navy-800/90 backdrop-blur-sm text-white py-2.5 rounded-xl text-sm font-medium hover:bg-navy-700 transition-colors disabled:opacity-60"
            >
              <ShoppingBag size={15} />
              {adding ? 'Adding…' : 'Quick Add'}
            </button>
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${wishlisted ? 'text-red-500' : 'text-gray-600 hover:text-red-400'}`}
          >
            <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="pt-3 px-1">
          <p className="text-xs text-mint-600 font-medium mb-1">{product.category?.name}</p>
          <h3 className="font-medium text-gray-900 text-sm leading-snug mb-1 group-hover:text-navy-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-navy-800">${product.price.toFixed(2)}</span>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={11} className="text-amber-400" fill="currentColor" />
              ))}
            </div>
          </div>
          {/* Color swatches */}
          {product.colors.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {product.colors.slice(0, 4).map(color => (
                <span key={color} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{color}</span>
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs px-2 py-0.5 text-gray-400">+{product.colors.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
