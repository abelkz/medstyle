import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*[0-9])/, 'Uppercase + number required'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

const addressSchema = z.object({
  fullName: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  postalCode: z.string().min(4),
  country: z.string().min(2),
  phone: z.string().min(7),
});

export default function AccountProfile() {
  const { user, fetchMe } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const profileForm = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: user?.name || '', email: user?.email || '' } });
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });
  const addressForm = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: (user?.address as any) || {},
  });

  const onProfileSave = async (data: any) => {
    setSaving(true);
    try {
      await api.put(`/admin/users/${user?.id}`, { name: data.name });
      await fetchMe();
      toast.success('Profile updated');
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-bold text-navy-800 mb-8">My Profile</h1>

      <div className="space-y-6">
        {/* Profile Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h2 className="font-semibold text-navy-800 mb-5">Personal Information</h2>
          <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Full Name</label>
              <input {...profileForm.register('name')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input {...profileForm.register('email')} className="input-field" disabled />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <button type="submit" disabled={saving} className="btn-primary text-sm px-6 py-2.5">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </motion.div>

        {/* Delivery Address */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
          <h2 className="font-semibold text-navy-800 mb-5">Delivery Address</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                <input {...addressForm.register('fullName')} className="input-field" placeholder="Jane Doe" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Street Address</label>
                <input {...addressForm.register('address')} className="input-field" placeholder="123 Main St" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">City</label>
                <input {...addressForm.register('city')} className="input-field" placeholder="City" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Postal Code</label>
                <input {...addressForm.register('postalCode')} className="input-field" placeholder="10001" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Country</label>
                <input {...addressForm.register('country')} className="input-field" placeholder="Country" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone</label>
                <input {...addressForm.register('phone')} className="input-field" placeholder="+1 555 000" />
              </div>
            </div>
            <button type="submit" className="btn-secondary text-sm px-6 py-2.5">Save Address</button>
          </form>
        </motion.div>

        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
          <h2 className="font-semibold text-navy-800 mb-5">Change Password</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Current Password</label>
              <input {...passwordForm.register('currentPassword')} type="password" className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">New Password</label>
              <input {...passwordForm.register('newPassword')} type="password" className="input-field" />
              {passwordForm.formState.errors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.newPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
              <input {...passwordForm.register('confirmPassword')} type="password" className="input-field" />
              {passwordForm.formState.errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" className="btn-secondary text-sm px-6 py-2.5">Update Password</button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
