// src/components/dashboard/DashboardHome.tsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ArrowRight, Calendar, User, Settings, Shield, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useMyBookings } from '@/hooks/index';
import { formatCurrency, formatDate, cn, getOptimizedImageUrl } from '@/lib/utils';
import type { BookingStatus } from '@/types';

const STATUS_CONFIG: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  PENDING:   { bg: 'bg-amber-50',     text: 'text-amber-700',   label: 'Pending' },
  CONFIRMED: { bg: 'bg-emerald-50',   text: 'text-emerald-700', label: 'Confirmed' },
  CANCELLED: { bg: 'bg-red-50',       text: 'text-red-700',     label: 'Cancelled' },
  COMPLETED: { bg: 'bg-indigo-50',    text: 'text-indigo-700',  label: 'Completed' },
  REFUNDED:  { bg: 'bg-purple-50',    text: 'text-purple-700',  label: 'Refunded' },
};

export default function DashboardHome() {
  const { user } = useAuthStore();
  const { data: bookingsData, isLoading } = useMyBookings({ page: 1 });
  const bookings = bookingsData?.data ?? [];

  return (
    <div className="min-h-screen bg-surface pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-navy-950 flex items-center justify-center text-silk-400 font-display text-4xl shadow-2xl shadow-navy-950/20 overflow-hidden">
            {user?.avatar ? (
              <img src={getOptimizedImageUrl(user.avatar, 200)} alt="" className="w-full h-full object-cover" />
            ) : (
              `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`
            )}
          </div>
          <div>
            <h1 className="font-display text-4xl tracking-tight text-navy-950 mb-2">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-gray-500 font-medium tracking-wide text-sm flex items-center justify-center gap-2">
              {user?.email} <span className="w-1 h-1 rounded-full bg-silk-400" /> Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
            </p>
          </div>
        </motion.div>

        {/* Profile Navigation Hub */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100/50 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
           {[
             { to: '/dashboard/profile', icon: User, label: 'Account Details' },
             { to: '/dashboard/wishlist', icon: Shield, label: 'Preferences' },
             { to: '/contact', icon: Settings, label: 'Concierge Desk' }
           ].map(item => (
              <Link key={item.label} to={item.to} className="flex-1 flex items-center gap-3 p-4 rounded-xl hover:bg-surface transition-colors">
                 <item.icon size={18} className="text-silk-500" />
                 <span className="font-semibold text-sm text-navy-950">{item.label}</span>
                 <ChevronRight size={14} className="ml-auto text-gray-300" />
              </Link>
           ))}
        </motion.div>

        {/* Recent Journeys Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="space-y-8">
          <div className="flex items-end justify-between border-b border-gray-200 pb-4">
            <h2 className="font-display font-semibold text-2xl text-navy-950">Recent Journeys</h2>
            <Link to="/dashboard/bookings" className="text-xs font-bold text-silk-500 uppercase tracking-widest hover:text-silk-600 transition-colors flex items-center gap-1">
              View Itinerary Archive <ArrowRight size={14} />
            </Link>
          </div>

          <div>
             {isLoading ? (
                <div className="flex justify-center p-12">
                   <div className="w-8 h-8 border-2 border-silk-400 border-t-transparent rounded-full animate-spin" />
                </div>
             ) : bookings.length === 0 ? (
                <div className="text-center p-16 bg-white/50 rounded-3xl border border-gray-100 border-dashed">
                   <Package size={24} className="mx-auto text-gray-300 mb-4" />
                   <p className="text-navy-800 font-medium mb-1">No active journeys found.</p>
                   <p className="text-gray-400 text-xs mb-6">Discover our curated escapes to begin planning.</p>
                   <Link to="/packages" className="px-6 py-3 bg-navy-950 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-navy-900 transition-colors">Explore Packages</Link>
                </div>
             ) : (
                <div className="space-y-4">
                   {bookings.slice(0, 3).map(booking => (
                      <div key={booking.id} className="group relative bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-silk-200 flex flex-col md:flex-row md:items-center gap-6">
                         {booking.package?.coverImage ? (
                            <div className="w-full md:w-32 h-40 md:h-24 rounded-2xl overflow-hidden shadow-inner shrink-0">
                               <img src={getOptimizedImageUrl(booking.package.coverImage, 400)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            </div>
                         ) : (
                            <div className="w-full md:w-32 h-40 md:h-24 rounded-2xl bg-surface flex items-center justify-center text-silk-300 shrink-0">
                               <Package size={24} />
                            </div>
                         )}

                         <div className="flex-1">
                            <h3 className="font-display font-semibold text-lg text-navy-950 mb-1 group-hover:text-silk-600 transition-colors">{booking.package?.title ?? 'Private Booking'}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                               <span className="flex items-center gap-1.5"><Calendar size={14} className="text-silk-400" /> {formatDate(booking.travelDate)}</span>
                               <span className="font-num text-gray-400">ID: {booking.bookingRef.slice(-6).toUpperCase()}</span>
                            </div>
                         </div>

                         <div className="flex justify-between items-center md:flex-col md:items-end gap-3 md:pl-6 md:border-l border-gray-100">
                             <div className="text-left md:text-right">
                                <p className="font-num font-bold text-navy-950 text-lg">{formatCurrency(booking.totalAmount)}</p>
                             </div>
                             <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", STATUS_CONFIG[booking.status].bg, STATUS_CONFIG[booking.status].text)}>
                                {STATUS_CONFIG[booking.status].label}
                             </span>
                         </div>
                         
                         <Link to={`/dashboard/bookings/${booking.id}`} className="absolute inset-0 z-10" aria-label="View Booking Details"></Link>
                      </div>
                   ))}
                </div>
             )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
