import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters').regex(/^(?=.*[A-Z])(?=.*[0-9])/, 'Must contain uppercase and number'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const { fetchCart } = useCartStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { confirmPassword: _, ...payload } = data;
      const res = await api.post('/auth/register', payload);
      setUser(res.data.user);
      await fetchCart();
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src="https://picsum.photos/seed/register/800/900" alt="register" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy-900/60 flex flex-col items-center justify-center p-12 text-white text-center">
          <div className="w-12 h-12 bg-mint-500 rounded-xl flex items-center justify-center mb-4">
            <span className="font-display font-bold text-xl">M</span>
          </div>
          <h2 className="font-display text-4xl font-bold mb-3">Join MedStyle</h2>
          <p className="text-gray-300 text-lg">Create your account to start shopping premium medical apparel</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-navy-800 mb-2">Create Account</h1>
            <p className="text-gray-500">Already have one? <Link to="/login" className="text-mint-600 hover:underline font-medium">Sign in</Link></p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input {...register('name')} className="input-field" placeholder="Jane Doe" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input {...register('email')} type="email" className="input-field" placeholder="you@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPass ? 'text' : 'password'} className="input-field pr-10" placeholder="Min. 8 chars, uppercase + number" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input {...register('confirmPassword')} type={showPass ? 'text' : 'password'} className="input-field" placeholder="Repeat password" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>

            <p className="text-xs text-center text-gray-400">
              By creating an account you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
