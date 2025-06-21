export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: 'admin' | 'user' | 'store_owner';
  createdAt?: string;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  rating: number;
  totalRatings: number;
  ownerId: string;
  createdAt?: string;
}

export interface Rating {
  id: string;
  userId: string;
  storeId: string;
  rating: number;
  userName?: string;
  storeName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'store_owner';
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  address: string;
  password: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface FilterOptions {
  name?: string;
  email?: string;
  address?: string;
  role?: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}