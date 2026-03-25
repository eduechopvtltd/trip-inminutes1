// src/components/dashboard/admin/AdminBookings.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, Loader2, Filter, Calendar, User, Package, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  PENDING:   { label: 'Awaiting Confirmation', class: 'bg-amber-50 text-amber-700 border-amber-100' },
  CONFIRMED: { label: 'Securely Booked',       class: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  CANCELLED: { label: 'Archived / Void',       class: 'bg-red-50 text-red-700 border-red-100' },
  COMPLETED: { label: 'Excursion Finished',    class: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  REFUNDED:  { label: 'Funds Reverted',        class: 'bg-purple-50 text-purple-700 border-purple-100' },
};

export default function AdminBookings() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', search, statusFilter, page],
    queryFn: () => api.get('/bookings', { params: { search, status: statusFilter || undefined, page, limit: 12 } }).then((r) => r.data),
    staleTime: 30_000,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/bookings/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Status synchronized with mainframe.');
    },
    onError: () => toast.error('Transmission error.'),
  });

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-navy-950 mb-2 leading-tight tracking-tight">
            Reservation Hub
          </h1>
          <p className="text-gray-500 text-[14px] font-medium opacity-80">
            Monitor and validate global excursion protocols.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-silk-400 transition-colors" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Ref or Email..."
              className="w-64 py-3.5 pl-11 pr-4 bg-white border border-gray-100 rounded-2xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-silk-400/10 transition-all shadow-sm"
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="py-3.5 px-6 bg-white border border-gray-100 rounded-2xl text-[12px] font-bold uppercase tracking-widest text-navy-950 focus:outline-none shadow-sm cursor-pointer hover:border-silk-400 transition-colors"
          >
            <option value="">Global View</option>
            {Object.keys(STATUS_CONFIG).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-neutral-50/50">
                {['Protocol Ref', 'Client Folio', 'Excursion', 'Timeline', 'Party', 'Amex Val', 'Status', ''].map((h) => (
                  <th key={h} className="px-8 py-5 text-left text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 whitespace-nowrap border-b border-gray-50">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-8 py-6"><div className="skeleton h-5 w-24 rounded-lg" /></td>
                    ))}
                  </tr>
                ))
                : data?.data && data.data.length > 0 ? (
                  data.data.map((b: any) => (
                    <tr key={b.id} className="group hover:bg-neutral-50/80 transition-all duration-300">
                      <td className="px-8 py-6">
                        <p className="font-num font-bold text-gray-400 text-[11px] tracking-widest uppercase">
                          #{b.bookingRef.slice(-8).toUpperCase()}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-navy-50 text-navy-600 rounded-xl flex items-center justify-center font-black text-[10px] shadow-inner">
                            {b.user?.firstName?.[0]}{b.user?.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-navy-950 text-[13px] leading-tight">{b.user?.firstName} {b.user?.lastName}</p>
                            <p className="text-[10px] font-medium text-gray-400 mt-0.5">{b.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <p className="text-[13px] font-semibold text-gray-600 max-w-[150px] truncate">{b.package?.title || 'Custom Plan'}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1.5 text-gray-500 font-medium text-[12px]">
                          <Calendar size={13} className="text-silk-400" />
                          {formatDate(b.travelDate)}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[12px] font-bold text-navy-950">
                          {b.adults} <span className="text-[10px] text-gray-400 font-normal uppercase">Adults</span>
                          {b.children > 0 && <span className="ml-1.5"> {b.children} <span className="text-[10px] text-gray-400 font-normal uppercase">Kids</span></span>}
                        </p>
                      </td>
                      <td className="px-8 py-6 font-num font-bold text-navy-950 text-[14px]">
                        {formatCurrency(b.totalAmount)}
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          'inline-flex items-center px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm',
                          STATUS_CONFIG[b.status]?.class || 'bg-gray-50 text-gray-500'
                        )}>
                          {STATUS_CONFIG[b.status]?.label || b.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          {b.status === 'PENDING' && (
                            <button
                              onClick={() => updateStatus.mutate({ id: b.id, status: 'CONFIRMED' })}
                              disabled={updateStatus.isPending}
                              className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all shadow-sm border border-emerald-100"
                              title="Confirm Protocol"
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}
                          {['PENDING', 'CONFIRMED'].includes(b.status) && (
                            <button
                              onClick={() => updateStatus.mutate({ id: b.id, status: 'CANCELLED' })}
                              disabled={updateStatus.isPending}
                              className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all shadow-sm border border-red-100"
                              title="Void Reservation"
                            >
                              <XCircle size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-8 py-20 text-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={20} className="text-gray-300" />
                      </div>
                      <p className="text-[13px] font-bold text-navy-950 mb-1">No reservations found</p>
                      <p className="text-xs text-gray-400">Try adjusting your status filter or search query.</p>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        {data?.meta && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-8 py-5 bg-neutral-50/50 border-t border-gray-50">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Ledger: {data.meta.total} units · Folio {page} / {data.meta.totalPages}
            </p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[11px] font-bold uppercase tracking-widest disabled:opacity-30 transition-all hover:border-silk-400">Back</button>
              <button disabled={page >= data.meta.totalPages} onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[11px] font-bold uppercase tracking-widest disabled:opacity-30 transition-all hover:border-silk-400">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
