// src/components/dashboard/BookingDetail.tsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Users, MapPin, CreditCard, XCircle, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';
import { bookingsApi } from '@/lib/api';
import { formatCurrency, formatDate, cn, getOptimizedImageUrl } from '@/lib/utils';
import PaymentModal from '@/components/packages/PaymentModal';
import toast from 'react-hot-toast';
import type { BookingStatus } from '@/types';

const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING:   'bg-amber-100 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200',
  REFUNDED:  'bg-purple-100 text-purple-700 border-purple-200',
};

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [showPayment, setShowPayment] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.byId(id!).then((r) => r.data),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => bookingsApi.cancel(id!, cancelReason),
    onSuccess: () => {
      toast.success('Booking cancelled successfully.');
      qc.invalidateQueries({ queryKey: ['booking', id] });
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
      setShowCancel(false);
    },
    onError: () => toast.error('Failed to cancel booking.'),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-silk-300" />
    </div>
  );
  if (!booking) return (
    <div className="text-center py-12">
      <p className="text-gray-500 mb-4">Booking not found.</p>
      <Link to="/dashboard/bookings" className="btn btn-navy btn-sm">Back to Bookings</Link>
    </div>
  );

  const canCancel = ['PENDING', 'CONFIRMED'].includes(booking.status);
  const canPay = booking.paymentStatus === 'PENDING' && booking.status !== 'CANCELLED';

  return (
    <div className="max-w-2xl">
      <Link to="/dashboard/bookings" className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to My Bookings
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-navy-800 mb-1">
              Booking #{booking.bookingRef.slice(-8).toUpperCase()}
            </h1>
            <p className="text-xs text-gray-400">Created {formatDate(booking.createdAt)}</p>
          </div>
          <span className={`badge border text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 ${STATUS_COLORS[booking.status as BookingStatus]}`}>
            {booking.status}
          </span>
        </div>

        {/* Visual Progress Tracker */}
        <div className="card p-8 mb-8 bg-gradient-to-br from-white to-cream/30">
          <div className="relative flex justify-between">
            {/* Connection Lines */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-0" />
            <motion.div 
              initial={{ width: 0 }}
              animate={{ 
                width: booking.status === 'CONFIRMED' ? '100%' : 
                       booking.paymentStatus === 'PAID' ? '50%' : '0%' 
              }}
              className="absolute top-5 left-0 h-0.5 bg-silk-400 -z-0 transition-all duration-1000" 
            />

            {[
              { label: 'Booked', icon: CheckCircle, active: true },
              { label: 'Paid', icon: CreditCard, active: booking.paymentStatus === 'PAID' || booking.status === 'CONFIRMED' },
              { label: 'Confirmed', icon: ShieldCheck, active: booking.status === 'CONFIRMED' }
            ].map((step, i) => (
              <div key={step.label} className="relative z-10 flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500",
                  step.active ? "bg-silk-500 border-silk-100 text-white shadow-lg shadow-silk-500/20" : "bg-white border-gray-100 text-gray-300"
                )}>
                  <step.icon size={18} />
                </div>
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-widest mt-3 transition-colors duration-500",
                  step.active ? "text-navy" : "text-gray-300"
                )}>{step.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Package card */}
        {booking.package && (
          <div className="card overflow-hidden mb-5 flex flex-col sm:flex-row">
            {booking.package.coverImage && (
              <div className="aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden shadow-sm">
                <img src={getOptimizedImageUrl(booking.package.coverImage, 1200)} alt="" loading="lazy"
                  className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-5">
              <p className="font-display font-semibold text-navy-800 text-lg">{booking.package.title}</p>
              {booking.package.duration && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Clock size={11} /> {booking.package.duration}N / {booking.package.duration + 1}D
                </p>
              )}
            </div>
          </div>
        )}

        {/* Details */}
        <div className="card p-5 mb-5 space-y-3 text-sm">
          {[
            { icon: Clock,   label: 'Travel Date',   value: formatDate(booking.travelDate) },
            { icon: Users,   label: 'Travelers',     value: `${booking.adults} Adult${booking.adults > 1 ? 's' : ''}${booking.children > 0 ? `, ${booking.children} Child` : ''}` },
            { icon: CreditCard, label: 'Total Amount', value: formatCurrency(booking.totalAmount) },
            { icon: CreditCard, label: 'Payment',      value: booking.paymentStatus },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
              <span className="flex items-center gap-2 text-gray-500">
                <Icon size={13} className="text-silk-400" /> {label}
              </span>
              <span className="font-medium text-navy-800">{value}</span>
            </div>
          ))}
          {booking.specialRequests && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-gray-500 text-xs mb-1">Special Requests</p>
              <p className="text-sm text-gray-700">{booking.specialRequests}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {canPay && (
            <button onClick={() => setShowPayment(true)} className="btn btn-silk">
              <CreditCard size={15} /> Pay Now
            </button>
          )}
          {booking.paymentStatus === 'PAID' && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
              <CheckCircle size={16} /> Payment Confirmed
            </div>
          )}
          {canCancel && !showCancel && (
            <button onClick={() => setShowCancel(true)} className="btn btn-outline text-red-500 border-red-200 hover:bg-red-50">
              <XCircle size={15} /> Cancel Booking
            </button>
          )}
        </div>

        {/* Cancel form */}
        {showCancel && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="card p-5 mt-5 border-red-100 bg-red-50/50">
            <h3 className="font-semibold text-navy-800 mb-2">Cancel Booking</h3>
            <p className="text-xs text-gray-500 mb-3">Please provide a reason for cancellation (required).</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g., Change in travel plans, visa issue…"
              rows={3}
              className="input-field text-sm resize-none mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelReason.length < 10 || cancelMutation.isPending}
                className="btn btn-sm bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {cancelMutation.isPending ? <><Loader2 size={13} className="animate-spin" /> Cancelling…</> : 'Confirm Cancel'}
              </button>
              <button onClick={() => setShowCancel(false)} className="btn btn-ghost btn-sm">Keep Booking</button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {showPayment && booking && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          bookingId={booking.id}
          bookingRef={booking.bookingRef}
          amount={booking.totalAmount}
          packageTitle={booking.package?.title ?? 'Travel Booking'}
        />
      )}
    </div>
  );
}
