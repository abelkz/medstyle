import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { WishlistItem } from '../../types';
import ProductCard from '../../components/product/ProductCard';
import api from '../../api/axios';

export default function AccountWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist').then(r => setItems(r.data.items)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-bold text-navy-800 mb-8">My Wishlist</h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Heart size={56} strokeWidth={1} className="mx-auto mb-4" />
          <h2 className="font-display text-xl text-gray-600 mb-2">Your wishlist is empty</h2>
          <p className="text-sm mb-6">Save items you love to buy them later</p>
          <Link to="/catalog" className="btn-primary inline-block">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <ProductCard key={item.id} product={item.product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
