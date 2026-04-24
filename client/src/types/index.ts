export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  address?: ShippingAddress | null;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  category: { name: string; slug: string };
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  size: string;
  color: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
  };
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
  product: { id: string; name: string; images: string[] };
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: ShippingAddress;
  createdAt: string;
  items: OrderItem[];
  user?: { id: string; name: string; email: string };
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  totalPages: number;
  data: T[];
}

export interface AdminStats {
  totalOrders: number;
  totalUsers: number;
  newUsersToday: number;
  revenue: number;
  pendingOrders: number;
}
