// src/components/packages/PaymentModal.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Shield, Loader2, CheckCircle2, Lock } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  bookingRef: string;
  amount: number;
  packageTitle: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  image?: string;
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

export default function PaymentModal({ isOpen, onClose, bookingId, bookingRef, amount, packageTitle }: PaymentModalProps) {
  const [paymentDone, setPaymentDone] = useState(false);

  const createOrderMutation = useMutation({
    mutationFn: () => api.post('/payments/create-order', { bookingId }).then((r) => r.data),
  });

  const verifyMutation = useMutation({
    mutationFn: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
      api.post('/payments/verify', data).then((r) => r.data),
    onSuccess: () => {
      setPaymentDone(true);
      toast.success('Payment confirmed! Your booking is now confirmed.');
    },
    onError: () => {
      toast.error('Payment verification failed. Please contact support.');
    },
  });

  const loadRazorpay = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePay = async () => {
    const loaded = await loadRazorpay();
    if (!loaded) { toast.error('Payment gateway failed to load. Please try again.'); return; }

    const order = await createOrderMutation.mutateAsync();

    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: 'TripInMinutes',
      description: packageTitle,
      image: '/logo.png',
      handler: (response) => verifyMutation.mutate(response),
      prefill: {},
      theme: { color: '#F7F5F2' },
      modal: { ondismiss: () => toast('Payment cancelled.') },
    });

    rzp.open();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="bg-navy p-6 flex items-center justify-between">
                <div>
                  <p className="text-silk-200 text-[10px] font-black tracking-widest uppercase">Secure Payment</p>
                  <h2 className="font-display font-bold text-white text-xl mt-1">Complete Your Booking</h2>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6">
                {paymentDone ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={32} className="text-emerald-500" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-navy-800 mb-2">Payment Confirmed!</h3>
                    <p className="text-gray-500 text-sm mb-1">Booking Reference: <strong>#{bookingRef.slice(-8).toUpperCase()}</strong></p>
                    <p className="text-gray-500 text-sm mb-6">A confirmation email has been sent to you.</p>
                    <button onClick={onClose} className="btn btn-navy w-full justify-center">View My Bookings</button>
                  </motion.div>
                ) : (
                  <>
                    {/* Booking summary */}
                    <div className="bg-cream rounded-2xl p-4 mb-5">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Package</span>
                        <span className="font-medium text-navy-800 text-right max-w-[60%]">{packageTitle}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Booking Ref</span>
                        <span className="font-num font-medium text-navy-800">#{bookingRef.slice(-8).toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t border-gray-200 mt-2">
                        <span className="text-navy-800">Total Amount</span>
                        <span className="text-silk-600 font-display text-xl font-num">{formatCurrency(amount)}</span>
                      </div>
                    </div>

                    {/* Pay button */}
                    <button
                      onClick={handlePay}
                      disabled={createOrderMutation.isPending || verifyMutation.isPending}
                      className="w-full bg-[#020617] hover:bg-silk-500 text-white hover:text-white font-black py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-silk-500/20 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs mb-4"
                    >
                      {createOrderMutation.isPending || verifyMutation.isPending
                        ? <><Loader2 size={18} className="animate-spin" /> Processing…</>
                        : <><CreditCard size={18} /> Pay {formatCurrency(amount)} Securely</>}
                    </button>

                    {/* Trust badges */}
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Lock size={11} /> SSL Encrypted</span>
                      <span className="flex items-center gap-1"><Shield size={11} /> RBI Authorised</span>
                      <span className="font-bold text-gray-500">Razorpay</span>
                    </div>

                    <p className="text-[10px] text-gray-400 text-center mt-3">
                      By paying, you agree to our booking terms & cancellation policy.
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
