// src/components/dashboard/MyBookings.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Package } from 'lucide-react';
import { useMyBookings } from '@/hooks/index';
import { formatCurrency, formatDate, cn, getOptimizedImageUrl } from '@/lib/utils';
import type { BookingStatus } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-700 border border-amber-100',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  CANCELLED: 'bg-red-50 text-red-700 border border-red-100',
  COMPLETED: 'bg-blue-50 text-blue-700 border border-blue-100',
  REFUNDED:  'bg-purple-50 text-purple-700 border border-purple-100',
  PAID:      'bg-silk-500/10 text-silk-600 border border-silk-500/20',
};

const STATUS_TABS: Array<BookingStatus | ''> = ['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function MyBookings() {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const { data, isLoading } = useMyBookings({ status: statusFilter || undefined });

  return (
    <div className="min-h-screen bg-surface pt-32 pb-24 px-6 flex justify-center">
      <div className="w-full max-w-4xl space-y-8">
      <div>
        <h1 className="font-display font-bold text-3xl text-[#020617] tracking-tight mb-2">Your Journeys</h1>
        <p className="text-sm text-gray-500">Track and manage your handpicked travel experiences.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {STATUS_TABS.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn(
              'px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300',
              s === statusFilter 
                ? 'bg-[#020617] text-white shadow-lg shadow-navy-800/20' 
                : 'bg-white text-gray-400 hover:text-[#020617] border border-gray-100'
            )}>
            {s || 'All Journeys'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading your bookings…</div>
      ) : data?.data.length === 0 ? (
        <div className="card p-12 text-center">
          <Package size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500 mb-1">No bookings found</p>
          <p className="text-sm text-gray-400 mb-4">
            {statusFilter ? `No ${statusFilter.toLowerCase()} bookings.` : "You haven't made any bookings yet."}
          </p>
          <Link to="/packages" className="btn btn-navy btn-sm">Explore Packages</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.data.map((b) => (
            <Link key={b.id} to={`/dashboard/bookings/${b.id}`}
              className="bg-white rounded-3xl p-6 flex items-center gap-6 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 group border border-transparent hover:border-gray-50">
              {b.package?.coverImage && (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0">
                  <img src={getOptimizedImageUrl(b.package.coverImage, 400)} alt="" loading="lazy"
                    className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <p className="font-display font-bold text-[#020617] text-lg tracking-tight truncate">
                    {b.package?.title ?? b.bookingType}
                  </p>
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${STATUS_COLORS[b.status]}`}>
                    {b.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <span className="font-num">{formatDate(b.travelDate)}</span>
                  <span className="w-1 h-1 bg-gray-200 rounded-full" />
                  <span><span className="font-num">{b.adults}</span> Guest{b.adults > 1 ? 's' : ''}</span>
                  <span className="w-1 h-1 bg-gray-200 rounded-full hidden sm:block" />
                  <span className="hidden sm:inline">Ref #<span className="font-num">{b.bookingRef.slice(-8).toUpperCase()}</span></span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-lg font-black text-[#020617] font-num">{formatCurrency(b.totalAmount)}</span>
                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${STATUS_COLORS[b.paymentStatus]}`}>
                  {b.paymentStatus}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#020617] group-hover:text-white transition-all duration-300">
                <ChevronRight size={18} />
              </div>
            </Link>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
