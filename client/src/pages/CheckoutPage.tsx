import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Lock, CreditCard } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import api from '../api/axios';
import toast from 'react-hot-toast';

const schema = z.object({
  fullName: z.string().min(2, 'Required'),
  address: z.string().min(5, 'Required'),
  city: z.string().min(2, 'Required'),
  postalCode: z.string().min(4, 'Required'),
  country: z.string().min(2, 'Required'),
  phone: z.string().min(7, 'Required'),
  cardNumber: z.string().regex(/^\d{16}$/, '16-digit card number required'),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'MM/YY format required'),
  cvc: z.string().regex(/^\d{3,4}$/, '3-4 digits required'),
});

type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const subtotal = total();
  const shipping = subtotal >= 75 ? 0 : 9.99;
  const orderTotal = subtotal + shipping;

  const onSubmit = async (data: FormData) => {
    setPlacing(true);
    try {
      const { cardNumber: _c, expiry: _e, cvc: _v, ...shippingAddress } = data;

      // Create payment intent (Stripe test mode)
      await api.post('/payments/create-intent');

      // Create order
      const { data: orderData } = await api.post('/orders', { shippingAddress });

      toast.success('Order placed successfully!');
      navigate(`/order-confirm/${orderData.order.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-bold text-navy-800 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left — Shipping + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            <div className="card p-6">
              <h2 className="font-semibold text-navy-800 mb-5">Shipping Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                  <input {...register('fullName')} className="input-field" placeholder="Jane Doe" />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Street Address</label>
                  <input {...register('address')} className="input-field" placeholder="123 Main St" />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">City</label>
                  <input {...register('city')} className="input-field" placeholder="New York" />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Postal Code</label>
                  <input {...register('postalCode')} className="input-field" placeholder="10001" />
                  {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Country</label>
                  <input {...register('country')} className="input-field" placeholder="United States" />
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone</label>
                  <input {...register('phone')} className="input-field" placeholder="+1 555 000 0000" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-navy-800">Payment Details</h2>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Lock size={12} />
                  Secured by Stripe
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-700">
                <strong>Test Mode:</strong> Use card 4242 4242 4242 4242 · Any future date · Any CVC
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Card Number</label>
                  <div className="relative">
                    <input {...register('cardNumber')} className="input-field pr-12" placeholder="4242424242424242" maxLength={16} />
                    <CreditCard size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Expiry</label>
                    <input {...register('expiry')} className="input-field" placeholder="12/27" maxLength={5} />
                    {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">CVC</label>
                    <input {...register('cvc')} className="input-field" placeholder="123" maxLength={4} />
                    {errors.cvc && <p className="text-red-500 text-xs mt-1">{errors.cvc.message}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-display text-lg font-semibold text-navy-800 mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5 max-h-60 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-800 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{item.size} · {item.color} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-navy-700 flex-shrink-0">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-mint-600' : ''}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-navy-800 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="font-display text-xl">${orderTotal.toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" disabled={placing} className="btn-primary w-full flex items-center justify-center gap-2">
                <Lock size={16} />
                {placing ? 'Placing Order…' : `Pay $${orderTotal.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
