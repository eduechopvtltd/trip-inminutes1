// src/App.tsx
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import AuthLayout from '@/components/layout/AuthLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminRoute } from '@/components/auth/AdminRoute';
import LoadingScreen from '@/components/ui/LoadingScreen';

// Code-split lazy routes
const HomePage       = lazy(() => import('@/components/home/HomePage'));
const PackagesPage   = lazy(() => import('@/components/packages/PackagesPage'));
const PackageDetail  = lazy(() => import('@/components/packages/PackageDetail'));
const LoginPage      = lazy(() => import('@/components/auth/LoginPage'));
const RegisterPage   = lazy(() => import('@/components/auth/RegisterPage'));
const ForgotPage     = lazy(() => import('@/components/auth/ForgotPasswordPage'));
const ResetPage      = lazy(() => import('@/components/auth/ResetPasswordPage'));
const VerifyPage     = lazy(() => import('@/components/auth/VerifyEmailPage'));
const DashboardHome  = lazy(() => import('@/components/dashboard/DashboardHome'));
const MyBookings     = lazy(() => import('@/components/dashboard/MyBookings'));
const BookingDetail  = lazy(() => import('@/components/dashboard/BookingDetail'));
const Profile        = lazy(() => import('@/components/dashboard/Profile'));
const Wishlist       = lazy(() => import('@/components/dashboard/Wishlist'));
const Notifications  = lazy(() => import('@/components/dashboard/Notifications'));
const FlightsPage    = lazy(() => import('@/components/flights/FlightsPage'));
const HotelsPage     = lazy(() => import('@/components/hotels/HotelsPage'));
const ContactPage    = lazy(() => import('@/components/home/ContactPage'));
const AboutPage      = lazy(() => import('@/components/home/AboutPage'));
const NotFoundPage   = lazy(() => import('@/components/ui/NotFoundPage'));
const AdminDashboard = lazy(() => import('@/components/dashboard/admin/AdminDashboard'));
const AdminPackages  = lazy(() => import('@/components/dashboard/admin/AdminPackages'));
const AdminBookings  = lazy(() => import('@/components/dashboard/admin/AdminBookings'));
const AdminEnquiries = lazy(() => import('@/components/dashboard/admin/AdminEnquiries'));
const AdminUsers     = lazy(() => import('@/components/dashboard/admin/AdminUsers'));

// ── Optimized QueryClient for commercial scale
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,      // 5 min — reduce redundant fetches
      gcTime: 10 * 60 * 1000,         // 10 min — keep cache longer
      refetchOnReconnect: true,        // important for mobile users
    },
    mutations: { retry: 0 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public routes */}
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="packages" element={<PackagesPage />} />
              <Route path="packages/:slug" element={<PackageDetail />} />
              <Route path="flights" element={<FlightsPage />} />
              <Route path="hotels" element={<HotelsPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="about" element={<AboutPage />} />
            </Route>

            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPage />} />
              <Route path="reset-password" element={<ResetPage />} />
              <Route path="verify-email" element={<VerifyPage />} />
            </Route>

            {/* Protected user dashboard / profile */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="dashboard" element={<DashboardHome />} />
                <Route path="dashboard/bookings" element={<MyBookings />} />
                <Route path="dashboard/bookings/:id" element={<BookingDetail />} />
                <Route path="dashboard/profile" element={<Profile />} />
                <Route path="dashboard/wishlist" element={<Wishlist />} />
                <Route path="dashboard/notifications" element={<Notifications />} />
              </Route>
            </Route>

            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route element={<DashboardLayout isAdmin />}>
                <Route path="admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="admin/dashboard" element={<AdminDashboard />} />
                <Route path="admin/packages" element={<AdminPackages />} />
                <Route path="admin/bookings" element={<AdminBookings />} />
                <Route path="admin/enquiries" element={<AdminEnquiries />} />
                <Route path="admin/users" element={<AdminUsers />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontFamily: '"DM Sans", sans-serif', fontSize: '14px', fontWeight: 500 },
            success: { iconTheme: { primary: '#C9A84C', secondary: '#fff' } },
          }}
        />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />}
      </BrowserRouter>
    </QueryClientProvider>
  );
}
