// src/hooks/useAuth.ts
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types';

export function useAuth() {
  const { user, accessToken, isAuthenticated, isLoading, setAuth, setUser, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Fetch current user on mount if we have a token
  useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await authApi.me();
      setUser(data.user);
      return data.user;
    },
    enabled: !!accessToken && !user,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) =>
      authApi.login(payload).then((r) => r.data as AuthResponse),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success(`Welcome back, ${data.user.firstName}! ✈️`);
      navigate(data.user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      toast.error(err.response?.data?.error ?? 'Login failed. Check your credentials.');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) =>
      authApi.register(payload).then((r) => r.data as AuthResponse),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      toast.success(`Welcome to TripInMinutes, ${data.user.firstName}! 🎉`);
      navigate('/verify-email');
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      toast.error(err.response?.data?.error ?? 'Registration failed. Please try again.');
    },
  });

  // Logout
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      storeLogout();
      qc.clear();
      navigate('/');
      toast.success('Logged out successfully.');
    }
  }, [storeLogout, qc, navigate]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    loginPending: loginMutation.isPending,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    registerPending: registerMutation.isPending,
    logout,
  };
}
