import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Truck, Star, RefreshCw } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import ProductCard from '../components/product/ProductCard';
import { Product, Category } from '../types';
import api from '../api/axios';

const heroImages = [
  'https://picsum.photos/seed/hero1/1400/700',
  'https://picsum.photos/seed/hero2/1400/700',
  'https://picsum.photos/seed/hero3/1400/700',
];

const perks = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $75' },
  { icon: Shield, title: 'Premium Quality', desc: 'Medical-grade fabrics' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: Star, title: '4.9★ Rated', desc: 'By 10k+ professionals' },
];

const testimonials = [
  { name: 'Dr. Sarah Kim', role: 'ER Physician', text: "I've tried dozens of scrub brands — Galium is leagues above the rest. The fit is impeccable.", avatar: 'https://picsum.photos/seed/dr1/80/80' },
  { name: 'Nurse Marcus L.', role: 'ICU Nurse', text: "Finally scrubs that look and feel amazing after a 12-hour shift. The fabric is incredible.", avatar: 'https://picsum.photos/seed/dr2/80/80' },
  { name: 'Dr. Alina Petrov', role: 'Surgeon', text: "The lab coats are perfectly tailored. I always get compliments from patients and colleagues.", avatar: 'https://picsum.photos/seed/dr3/80/80' },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const [heroIdx, setHeroIdx] = useState(0);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get('/products?featured=true&limit=8').then(r => setFeatured(r.data.products));
    api.get('/categories').then(r => setCategories(r.data.categories));
    const timer = setInterval(() => setHeroIdx(i => (i + 1) % heroImages.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-body">
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[500px] overflow-hidden">
        {heroImages.map((src, i) => (
          <motion.div
            key={src}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: i === heroIdx ? 1 : 0 }}
            transition={{ duration: 1 }}
          >
            <img src={src} alt="hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 via-navy-900/50 to-transparent" />
          </motion.div>
        ))}

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              key={heroIdx}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-xl"
            >
              <span className="inline-block text-mint-400 text-sm font-medium tracking-widest uppercase mb-4">
                New Collection 2024
              </span>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                Where Medicine<br />Meets <span className="text-mint-400">Style</span>
              </h1>
              <p className="text-gray-200 text-lg mb-8 leading-relaxed">
                Premium medical apparel crafted for healthcare professionals who demand excellence in both performance and aesthetics.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/catalog" className="btn-mint inline-flex items-center gap-2">
                  Shop Collection <ArrowRight size={18} />
                </Link>
                <Link to="/catalog/scrubs" className="btn-secondary border-white text-white hover:bg-white hover:text-navy-800 inline-flex items-center gap-2">
                  View Scrubs
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === heroIdx ? 'bg-mint-400 w-6' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      {/* Perks */}
      <section className="bg-navy-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-mint-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-mint-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{title}</p>
                  <p className="text-gray-400 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">Find exactly what you need</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <FadeIn key={cat.id} delay={i * 0.08}>
                <Link
                  to={`/catalog/${cat.slug}`}
                  className="group relative overflow-hidden rounded-2xl aspect-square bg-navy-100"
                >
                  <img
                    src={cat.image || `https://picsum.photos/seed/${cat.slug}/300/300`}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-display font-semibold text-sm">{cat.name}</p>
                    {cat._count && (
                      <p className="text-gray-300 text-xs">{cat._count.products} products</p>
                    )}
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="section-title">Bestsellers</h2>
                <p className="text-gray-500">Loved by thousands of healthcare professionals</p>
              </div>
              <Link to="/catalog?featured=true" className="text-sm font-medium text-navy-600 hover:text-mint-500 flex items-center gap-1 transition-colors">
                View all <ArrowRight size={16} />
              </Link>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <FadeIn>
        <section className="mx-4 md:mx-8 mb-20 rounded-3xl overflow-hidden relative">
          <img src="https://picsum.photos/seed/promo/1200/400" alt="promo" className="w-full h-64 md:h-80 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 to-navy-900/40 flex items-center">
            <div className="px-8 md:px-16 max-w-lg">
              <span className="text-mint-400 text-xs font-semibold tracking-widest uppercase mb-3 block">Limited Time</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                15% Off Your First Order
              </h2>
              <p className="text-gray-300 text-sm mb-6">Use code <span className="text-mint-400 font-semibold">MEDSTYLE15</span> at checkout</p>
              <Link to="/catalog" className="btn-mint inline-flex items-center gap-2 text-sm">
                Shop Now <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="section-title">Trusted by Professionals</h2>
              <p className="section-subtitle">What healthcare workers are saying</p>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className="card p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-amber-400" fill="currentColor" />)}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-sm text-navy-800">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
