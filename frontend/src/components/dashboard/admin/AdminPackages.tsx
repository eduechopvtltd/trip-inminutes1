// src/components/dashboard/admin/AdminPackages.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Star, Search,
  X, Loader2, Check, ExternalLink, Filter, ChevronRight
} from 'lucide-react';
import { packagesApi } from '@/lib/api';
import { cn, formatCurrency, getOptimizedImageUrl } from '@/lib/utils';
import toast from 'react-hot-toast';
import PackageFormModal from './PackageFormModal';

export default function AdminPackages() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-packages', search, page],
    queryFn: () => packagesApi.list({ search: search || undefined, page, limit: 12 }).then((r) => r.data),
    staleTime: 30_000,
  });

  const deactivateMu = useMutation({
    mutationFn: (id: string) => packagesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-packages'] });
      qc.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Inventory updated safely.');
    },
    onError: () => toast.error('Standard protocol failure.'),
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to archive "${title}"?`)) {
      deactivateMu.mutate(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-navy-950 mb-2 leading-tight tracking-tight">
            Package Inventory
          </h1>
          <p className="text-gray-500 text-[14px] font-medium opacity-80">
            Curate and manage your high-end travel portfolio.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-silk-400 transition-colors" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Filter by title..."
              className="w-64 py-3.5 pl-11 pr-4 bg-white border border-gray-100 rounded-2xl text-[13px] font-medium placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-silk-400/10 focus:border-silk-400/30 transition-all shadow-sm"
            />
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2.5 px-6 py-3.5 bg-silk-400 text-navy-950 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-lg shadow-silk-400/10 transition-all hover:bg-silk-300 hover:scale-[1.02] active:scale-100">
            <Plus size={16} /> New Package
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-neutral-50/50">
                {['Curated Package', 'Category', 'Destination', 'Exchange Value', 'Reputation', 'Sales', 'Status', ''].map((h) => (
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
                  data.data.map((p: any) => (
                    <tr key={p.id} className="group hover:bg-neutral-50/80 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="relative shrink-0 w-20 h-14 overflow-hidden rounded-xl shadow-md">
                            <img src={getOptimizedImageUrl(p.coverImage, 200)} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-navy-950/10 group-hover:bg-transparent transition-colors" />
                          </div>
                          <div>
                            <p className="font-bold text-navy-950 text-[14px] leading-tight group-hover:text-silk-600 transition-colors max-w-[220px] truncate">{p.title}</p>
                            {p.isFeatured && (
                              <div className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-silk-500 mt-1.5">
                                <Star size={10} className="fill-current" /> Exclusive
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex px-2.5 py-1 bg-navy-50 text-navy-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-navy-100/50">
                          {p.type}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-gray-500 font-medium text-[13px] whitespace-nowrap">
                        {p.destination.name}, {p.destination.country}
                      </td>
                      <td className="px-8 py-6 font-num font-bold text-navy-950 text-[14px] whitespace-nowrap">
                        {formatCurrency(p.discountedPrice ?? p.basePrice)}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1.5 text-amber-500 font-bold text-[13px]">
                          <Star size={14} className="fill-current" />
                          {p.averageRating.toFixed(1)}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-gray-400 font-num font-medium text-[13px] tracking-tight">{p.totalBookings.toLocaleString()} orders</td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border',
                          p.isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-red-50 text-red-700 border-red-100',
                        )}>
                          {p.isActive ? <Check size={10} /> : <X size={10} />}
                          {p.isActive ? 'Live' : 'Archived'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                          <button
                            onClick={() => { setSelectedPkg(p); setShowForm(true); }}
                            className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-navy-950 hover:border-navy-200 transition-all shadow-sm"
                            title="Edit Portfolio"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            disabled={deactivateMu.isPending}
                            className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                            title="Archive"
                          >
                            {deactivateMu.isPending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                          </button>
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
                      <p className="text-[13px] font-bold text-navy-900 mb-1">No matches found</p>
                      <p className="text-xs text-gray-400">Try refining your search parameters.</p>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        {data?.meta && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-8 py-5 bg-neutral-50/50 border-t border-gray-50">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Collection: {data.meta.total} units · Folio {page} / {data.meta.totalPages}
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

      {/* Add/Edit Package Modal */}
      <AnimatePresence>
        {showForm && (
          <PackageFormModal 
            pkg={selectedPkg}
            onClose={() => { setShowForm(false); setSelectedPkg(null); }} 
            onSuccess={() => {
              setShowForm(false);
              setSelectedPkg(null);
              qc.invalidateQueries({ queryKey: ['admin-packages'] });
              qc.invalidateQueries({ queryKey: ['packages'] });
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
