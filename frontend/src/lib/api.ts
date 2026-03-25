/// <reference types="vite/client" />
// src/lib/api.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth.store';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends HttpOnly refresh token cookie
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ── Request interceptor: attach access token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: silent token refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token as string);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const isAuthRequest = originalRequest.url?.includes('/auth/login') || 
                         originalRequest.url?.includes('/auth/register') ||
                         originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{ accessToken: string }>(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        useAuthStore.getState().setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ── Typed API helpers
export const authApi = {
  register: (data: unknown) => api.post('/auth/register', data),
  login: (data: unknown) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  verifyEmail: (data: unknown) => api.post('/auth/verify-email', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: unknown) => api.post('/auth/reset-password', data),
};

export const packagesApi = {
  list: (params?: unknown) => api.get('/packages', { params }),
  trending: () => api.get('/packages/trending'),
  featured: () => api.get('/packages/featured'),
  bySlug: (slug: string) => api.get(`/packages/${slug}`),
  create: (data: unknown) => api.post('/packages', data),
  update: (id: string, data: unknown) => api.put(`/packages/${id}`, data),
  delete: (id: string) => api.delete(`/packages/${id}`),
};

export const destinationsApi = {
  list: (params?: unknown) => api.get('/destinations', { params }),
  bySlug: (slug: string) => api.get(`/destinations/${slug}`),
};

export const bookingsApi = {
  create: (data: unknown) => api.post('/bookings', data),
  myBookings: (params?: unknown) => api.get('/bookings/my', { params }),
  byId: (id: string) => api.get(`/bookings/my/${id}`),
  cancel: (id: string, reason: string) => api.patch(`/bookings/my/${id}/cancel`, { reason }),
};

export const reviewsApi = {
  forPackage: (packageId: string) => api.get(`/reviews/package/${packageId}`),
  create: (data: unknown) => api.post('/reviews', data),
};

export const wishlistApi = {
  list: () => api.get('/wishlist'),
  add: (packageId: string) => api.post(`/wishlist/${packageId}`),
  remove: (packageId: string) => api.delete(`/wishlist/${packageId}`),
};

export const userApi = {
  updateProfile: (data: unknown) => api.patch('/users/profile', data),
  changePassword: (data: unknown) => api.patch('/users/change-password', data),
  notifications: () => api.get('/users/notifications'),
  markAllRead: () => api.patch('/users/notifications/read-all'),
};

export const dealsApi = {
  list: () => api.get('/deals'),
  validate: (code: string, amount: number) => api.post('/deals/validate', { code, amount }),
};

export const enquiryApi = {
  submit: (data: unknown) => api.post('/enquiries', data),
};

export const newsletterApi = {
  subscribe: (email: string) => api.post('/newsletter/subscribe', { email }),
};

export const paymentApi = {
  createOrder: (data: { bookingId: string; amount: number; currency?: string }) => 
    api.post('/payments/create-order', data),
  verifyPayment: (data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) => 
    api.post('/payments/verify', data),
};

export const flightsApi = {
  search: (params: { origin: string; destination: string; departureDate: string; adults: number; travelClass?: string }) => 
    api.get('/flights/search', { params }),
  price: (flightOffer: any) => 
    api.post('/flights/price', { flightOffer }),
};
