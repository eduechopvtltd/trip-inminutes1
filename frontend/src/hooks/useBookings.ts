import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { bookingsApi, paymentApi } from '@/lib/api';
import type { CreateBookingPayload, PaginatedResponse, Booking } from '@/types';

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingPayload) =>
      bookingsApi.create(data).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      toast.success('Booking recorded! Initiating payment...');
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Booking failed. Please try again.');
    },
  });
}

/**
 * Hook to create a Razorpay order from a booking
 */
export function useCreatePaymentOrder() {
  return useMutation({
    mutationFn: (data: { bookingId: string; amount: number }) =>
      paymentApi.createOrder(data).then((r) => r.data),
    onError: () => {
      toast.error('Failed to initiate payment. Please contact support.');
    },
  });
}

/**
 * Hook to verify a Razorpay payment signature
 */
export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
      paymentApi.verifyPayment(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      toast.success('Payment verified! Your booking is confirmed.');
    },
    onError: () => {
      toast.error('Payment verification failed. Please contact support.');
    },
  });
}

export function useMyBookings(params?: { status?: string; page?: number }) {
  return useQuery<PaginatedResponse<Booking>>({
    queryKey: ['my-bookings', params],
    queryFn: () => bookingsApi.myBookings(params).then((r) => r.data),
    staleTime: 60 * 1000,
  });
}
