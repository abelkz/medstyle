import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import api from '../api/axios';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const { fetchCart } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      setUser(res.data.user);
      await fetchCart();
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate(res.data.user.role === 'ADMIN' ? '/admin' : from);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Image side */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src="https://picsum.photos/seed/login/800/900" alt="auth" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy-900/60 flex flex-col items-center justify-center p-12 text-white text-center">
          <div className="w-12 h-12 bg-mint-500 rounded-xl flex items-center justify-center mb-4">
            <span className="font-display font-bold text-xl">M</span>
          </div>
          <h2 className="font-display text-4xl font-bold mb-3">Welcome Back</h2>
          <p className="text-gray-300 text-lg">Sign in to access your account and orders</p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-navy-800 mb-2">Sign In</h1>
            <p className="text-gray-500">Don't have an account? <Link to="/register" className="text-mint-600 hover:underline font-medium">Sign up</Link></p>
          </div>

          {/* Demo credentials */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm">
            <p className="font-medium text-blue-700 mb-1">Demo Credentials:</p>
            <p className="text-blue-600">User: user@medstyle.com / User123!</p>
            <p className="text-blue-600">Admin: admin@medstyle.com / Admin123!</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input {...register('email')} type="email" className="input-field" placeholder="you@example.com" autoComplete="email" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-xs text-mint-600 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <input {...register('password')} type={showPass ? 'text' : 'password'} className="input-field pr-10" placeholder="••••••••" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
