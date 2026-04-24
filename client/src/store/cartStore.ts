import { create } from 'zustand';
import { CartItem } from '../types';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number, size: string, color: string) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
  closeCart: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  isLoading: false,

  fetchCart: async () => {
    try {
      const { data } = await api.get('/cart');
      set({ items: data.items });
    } catch {
      // not logged in — empty cart is fine
    }
  },

  addItem: async (productId, quantity, size, color) => {
    set({ isLoading: true });
    try {
      await api.post('/cart', { productId, quantity, size, color });
      await get().fetchCart();
      set({ isOpen: true });
      toast.success('Added to cart');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (itemId, quantity) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      set(state => ({
        items: state.items.map(i => i.id === itemId ? { ...i, quantity } : i),
      }));
    } catch {
      toast.error('Failed to update');
    }
  },

  removeItem: async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      set(state => ({ items: state.items.filter(i => i.id !== itemId) }));
      toast.success('Removed from cart');
    } catch {
      toast.error('Failed to remove');
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart');
      set({ items: [] });
    } catch {
      // silent
    }
  },

  toggleCart: () => set(state => ({ isOpen: !state.isOpen })),
  closeCart: () => set({ isOpen: false }),

  total: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  count: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
