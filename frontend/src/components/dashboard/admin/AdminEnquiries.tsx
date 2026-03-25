// src/components/dashboard/admin/AdminEnquiries.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Mail, Phone, Clock, Loader2, CheckCircle, Calendar, MessageSquare, ArrowUpRight } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminEnquiries() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-enquiries', search, page],
    queryFn: () => api.get('/enquiries', { params: { search: search || undefined, page, limit: 12 } }).then(r => r.data),
    staleTime: 30_000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/enquiries/${id}`, { isRead: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-enquiries'] });
      toast.success('Concierge status updated.');
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-navy-950 mb-2 leading-tight tracking-tight">
            Concierge Desk
          </h1>
          <p className="text-gray-500 text-[14px] font-medium opacity-80">
            High-priority inbound requests and client communications.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-silk-400 transition-colors" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Client name or email..."
              className="w-72 py-3.5 pl-11 pr-4 bg-white border border-gray-100 rounded-2xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-silk-400/10 transition-all shadow-sm"
            />
          </div>
          <p className="hidden md:block text-[11px] font-bold text-gray-400 uppercase tracking-widest px-4 border-l border-gray-100">
            {data?.meta?.total ?? 0} Requests
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-neutral-50/50">
                {['Client Contact', 'Inquiry Type', 'Message Folio', 'Timestamp', 'Status', ''].map((h) => (
                  <th key={h} className="px-8 py-5 text-left text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 border-b border-gray-50">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-8 py-6"><div className="skeleton h-5 w-24 rounded-lg" /></td>
                  ))}</tr>
                ))
                : data?.data && data.data.length > 0 ? (
                  data.data.map((e: any) => (
                    <tr key={e.id} className={cn("group hover:bg-neutral-50/80 transition-all duration-300 relative", !e.isRead && "bg-silk-50/20")}>
                      <td className="px-8 py-6">
                        {!e.isRead && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-silk-400 rounded-r-full shadow-[2px_0_10px_rgba(201,168,76,0.2)]" />}
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-navy-50 text-navy-600 rounded-2xl flex items-center justify-center font-black text-[11px] shadow-inner">
                            {e.name?.[0]}
                          </div>
                          <div>
                            <p className={cn("text-navy-950 text-[14px]", !e.isRead ? "font-black" : "font-bold")}>{e.name}</p>
                            <p className="text-[10px] font-medium text-gray-400 mt-0.5">{e.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex px-2.5 py-1 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-lg border border-amber-100">
                          {e.enquiryType || 'General'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="max-w-[280px]">
                          <p className={cn("text-navy-950 text-[13px] truncate", !e.isRead ? "font-bold" : "font-medium")}>{e.subject || 'Member Request'}</p>
                          <p className="text-gray-400 text-[11px] truncate italic mt-1 font-medium italic opacity-70">"{e.message}"</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-gray-500 font-medium text-[12px] whitespace-nowrap">
                         <span className="flex items-center gap-1.5 uppercase text-[10px] font-bold opacity-60">
                           <Calendar size={12} className="text-silk-400" />
                           {formatDate(e.createdAt)}
                         </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "inline-flex items-center px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm transition-colors",
                          e.isRead 
                            ? "bg-gray-50 text-gray-400 border-gray-100" 
                            : "bg-silk-400 text-navy-950 border-silk-400/20 shadow-silk-400/5"
                        )}>
                          {e.isRead ? 'Archived' : 'Action Required'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          {!e.isRead && (
                            <button
                              onClick={() => markRead.mutate(e.id)}
                              className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all shadow-sm border border-emerald-100"
                              title="Acknowledge Protocol"
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}
                          <a href={`mailto:${e.email}`} className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-navy-950 hover:border-navy-200 transition-all shadow-sm">
                            <Mail size={15} />
                          </a>
                          <a href={`tel:${e.phone}`} className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-silk-600 hover:border-silk-200 transition-all shadow-sm">
                            <Phone size={15} />
                          </a>
                          <button className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-300 hover:text-silk-500 transition-all shadow-sm">
                             <ArrowUpRight size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={20} className="text-gray-300" />
                      </div>
                      <p className="text-[13px] font-bold text-navy-900 mb-1">No requests match</p>
                      <p className="text-xs text-gray-400">The concierge queue is currently clear for these parameters.</p>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        {data?.meta && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-8 py-5 bg-neutral-50/50 border-t border-gray-50">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Queue: {data.meta.total} cases · Segment {page} / {data.meta.totalPages}
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
