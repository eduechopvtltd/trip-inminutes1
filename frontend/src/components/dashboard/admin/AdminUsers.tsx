// src/components/dashboard/admin/AdminUsers.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserCheck, UserX, ShieldCheck, Mail, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: () =>
      api.get('/users', { params: { search: search || undefined, page, limit: 12 } }).then((r) => r.data),
    staleTime: 30_000,
  });

  const toggleActive = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/toggle-active`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Membership status synchronized.');
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-navy-950 mb-2 leading-tight tracking-tight">
            Member Registry
          </h1>
          <p className="text-gray-500 text-[14px] font-medium opacity-80">
            Oversee the prestigious TripInMinutes clientele and administrative roles.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-silk-400 transition-colors" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email..."
              className="w-72 py-3.5 pl-11 pr-4 bg-white border border-gray-100 rounded-2xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-silk-400/10 transition-all shadow-sm"
            />
          </div>
          <p className="hidden md:block text-[11px] font-bold text-gray-400 uppercase tracking-widest px-4 border-l border-gray-100">
            {data?.meta?.total ?? 0} Members
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-neutral-50/50">
                {['Member Profile', 'Access Role', 'Activity', 'Induction', 'Status', ''].map((h) => (
                  <th key={h} className="px-8 py-5 text-left text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 border-b border-gray-50">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-8 py-6"><div className="skeleton h-5 w-24 rounded-lg" /></td>
                    ))}
                  </tr>
                ))
                : data?.data?.map((u: any) => (
                  <tr key={u.id} className="group hover:bg-neutral-50/80 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-silk-400/10 text-silk-600 rounded-2xl flex items-center justify-center font-black text-[11px] shadow-inner">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-navy-950 text-[14px] leading-tight group-hover:text-silk-600 transition-colors">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-[10px] font-medium text-gray-400 mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1 bg-white border rounded-lg text-[9px] font-black uppercase tracking-widest',
                        u.role === 'ADMIN' ? 'text-purple-600 border-purple-100' :
                        u.role === 'AGENT' ? 'text-blue-600 border-blue-100' :
                        'text-gray-400 border-gray-100',
                      )}>
                        {u.role === 'ADMIN' && <ShieldCheck size={10} />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[12px] font-bold text-navy-950">
                        {u._count?.bookings ?? 0} <span className="text-[10px] text-gray-400 font-normal uppercase ml-1">Orders</span>
                      </p>
                    </td>
                    <td className="px-8 py-6 text-gray-500 font-medium text-[12px]">
                       <span className="flex items-center gap-1.5 uppercase text-[10px] font-bold opacity-60">
                         <Calendar size={12} className="text-silk-400" />
                         {formatDate(u.createdAt)}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        'inline-flex items-center px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm',
                        u.isActive 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-red-50 text-red-700 border-red-100',
                      )}>
                        {u.isActive ? 'Active Member' : 'Access Restricted'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <a href={`mailto:${u.email}`} className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-navy-950 hover:border-navy-200 transition-all shadow-sm">
                          <Mail size={15} />
                        </a>
                        <button
                          onClick={() => toggleActive.mutate(u.id)}
                          disabled={toggleActive.isPending}
                          className={cn(
                            'p-2.5 rounded-xl transition-all shadow-sm border',
                            u.isActive
                              ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100',
                          )}
                          title={u.isActive ? 'Suspend Access' : 'Restore Access'}
                        >
                          {u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {data?.meta && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-8 py-5 bg-neutral-50/50 border-t border-gray-50">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Folio: {data.meta.total} records · Entry {page} / {data.meta.totalPages}
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
