// src/components/dashboard/admin/AdminDashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, Phone, ArrowUpRight } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [bookings, packages, users, enquiries] = await Promise.all([
        api.get('/bookings?limit=100').then((r) => r.data),
        api.get('/packages?limit=100').then((r) => r.data),
        api.get('/users?limit=100').then((r) => r.data),
        api.get('/enquiries?limit=50').then((r) => r.data),
      ]);
      const totalRevenue = bookings.data?.reduce((s: number, b: { totalAmount: number; status: string }) =>
        b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? s + b.totalAmount : s, 0) ?? 0;
      return {
        totalBookings: bookings.meta?.total ?? 0,
        totalPackages: packages.meta?.total ?? 0,
        totalUsers: users.meta?.total ?? 0,
        totalEnquiries: enquiries.meta?.total ?? 0,
        totalRevenue,
        pendingBookings: bookings.data?.filter((b: { status: string }) => b.status === 'PENDING').length ?? 0,
        recentBookings: bookings.data?.slice(0, 5) ?? [],
        recentEnquiries: enquiries.data?.slice(0, 5) ?? [],
      };
    },
    staleTime: 60_000,
  });
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();


  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex justify-between items-end border-b border-gray-100 pb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-navy-950 mb-1 leading-tight tracking-tight">
            Concierge CRM
          </h1>
          <p className="text-gray-500 text-[14px] font-medium opacity-80">
            Platform overview & active client requests.
          </p>
        </div>
        <div className="flex gap-3">
           <Link to="/admin/bookings" className="btn btn-outline text-xs py-2 px-4 h-auto">View All Bookings</Link>
           <Link to="/admin/enquiries" className="btn btn-gold text-xs py-2 px-4 h-auto shadow-sm">Manage Requests</Link>
        </div>
      </motion.div>

      {/* CRM Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { icon: ShoppingBag, label: 'Total Reservations', value: stats?.totalBookings ?? 0, trend: '+12% this month' },
          { icon: DollarSign,  label: 'Revenue (USD)',      value: formatCurrency(stats?.totalRevenue ?? 0), trend: '+8% this month' },
          { icon: Phone,       label: 'Active Inbound Requests', value: stats?.pendingBookings ?? 0, trend: '4 High Priority' },
        ].map(({ icon: Icon, label, value, trend }, i) => (
          <motion.div 
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:border-navy-200 transition-colors"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
              <Icon size={16} className="text-silk-400" />
            </div>
            <div className="font-num font-bold text-2xl text-navy-950 tracking-tight leading-none mb-2">
              {isLoading ? '—' : value}
            </div>
            <div className="text-[11px] font-semibold text-emerald-600">{trend}</div>
          </motion.div>
        ))}
      </div>

      {/* CRM Data Table: Active Concierge Requests */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-display font-bold text-lg text-navy-950">Active Concierge Requests</h2>
            <span className="text-xs font-semibold text-gray-500">{stats?.recentEnquiries.length || 0} recent items</span>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-silk-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-white">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30">Client Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30">Request Type</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30">Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats?.recentEnquiries.map((e: any) => (
                    <tr key={e.id} className="hover:bg-neutral-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-navy-50 flex items-center justify-center text-navy-900 font-bold text-[10px]">
                             {e.name.substring(0,2).toUpperCase()}
                           </div>
                           <div>
                             <p className="font-bold text-navy-950 text-sm">{e.name}</p>
                             <p className="text-[11px] text-gray-500">{e.email}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[12px] font-medium text-gray-700">{e.subject || 'General Inquiry'}</span>
                      </td>
                      <td className="px-6 py-4">
                         <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border",
                            !e.isRead ? "text-amber-600 bg-amber-50 border-amber-200" : "text-emerald-600 bg-emerald-50 border-emerald-200"
                          )}>
                            {!e.isRead ? 'Pending' : 'Fulfilled'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-[12px] font-medium text-gray-500 font-num">
                        {new Date(e.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <a href={`mailto:${e.email}`} className="p-2 rounded-lg bg-white border border-gray-200 text-navy-900 hover:bg-navy-50 hover:border-navy-200 transition-all shadow-sm">
                             <ArrowUpRight size={14} />
                           </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!stats?.recentEnquiries || stats.recentEnquiries.length === 0) && (
                     <tr>
                       <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-gray-400">No active concierge requests.</td>
                     </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
