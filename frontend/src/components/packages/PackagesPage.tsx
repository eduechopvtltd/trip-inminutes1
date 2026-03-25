// src/components/packages/PackagesPage.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, SlidersHorizontal, X, Search, ChevronDown } from 'lucide-react';
import { usePackages } from '@/hooks/index';
import PackageCard, { SkeletonCard } from '@/components/ui/index';
import { cn } from '@/lib/utils';
import type { PackageFilters, PackageType } from '@/types';

const TYPES: { id: PackageType | ''; label: string }[] = [
  { id: '',             label: 'All Types' },
  { id: 'INTERNATIONAL',label: 'International' },
  { id: 'DOMESTIC',     label: 'Domestic' },
  { id: 'HONEYMOON',    label: 'Honeymoon' },
  { id: 'ADVENTURE',    label: 'Adventure' },
  { id: 'CORPORATE',    label: 'Corporate' },
  { id: 'CRUISE',       label: 'Cruise' },
  { id: 'PILGRIMAGE',   label: 'Pilgrimage' },
  { id: 'WILDLIFE',     label: 'Wildlife' },
];

const SORT_OPTS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Highest Rated' },
  { value: 'bookings',   label: 'Most Popular' },
];

const DURATIONS = [
  { label: 'Any', min: 0, max: 999 },
  { label: '1–3 Nights', min: 1, max: 3 },
  { label: '4–6 Nights', min: 4, max: 6 },
  { label: '7–10 Nights', min: 7, max: 10 },
  { label: '11+ Nights', min: 11, max: 999 },
];

export default function PackagesPage() {
  const [params, setParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState<PackageFilters>({
    page: 1,
    limit: 12,
    type: (params.get('type') as PackageType) || undefined,
    search: params.get('search') || undefined,
    featured: params.get('featured') === 'true' || undefined,
    sortBy: 'newest',
  });

  const { data, isLoading, isFetching } = usePackages(filters);

  const updateFilter = (update: Partial<PackageFilters>) =>
    setFilters((f) => ({ ...f, ...update, page: 1 }));

  // Sync with URL params
  useEffect(() => {
    const search = params.get('search') || undefined;
    const type = (params.get('type') as PackageType) || undefined;
    const featured = params.get('featured') === 'true' || undefined;
    
    setFilters(f => ({
      ...f,
      search,
      type,
      featured,
      page: 1
    }));
  }, [params]);

  const activeFilterCount = [
    filters.type, filters.minPrice, filters.maxPrice,
    filters.minDuration, filters.search,
  ].filter(Boolean).length;

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h4 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">Search</h4>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Destination, package name…"
            value={filters.search ?? ''}
            onChange={(e) => updateFilter({ search: e.target.value || undefined })}
            className="input-field pl-9 text-sm"
          />
        </div>
      </div>

      {/* Type */}
      <div>
        <h4 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">Package Type</h4>
        <div className="space-y-1.5">
          {TYPES.map(({ id, label }) => (
            <label key={label} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="type"
                checked={filters.type === id || (!filters.type && id === '')}
                 onChange={() => updateFilter({ type: id as PackageType | undefined })}
                className="accent-silk-400"
              />
              <span className="text-sm text-gray-600 group-hover:text-navy transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <h4 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">Price Range</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="input-label text-[9px]">Min Price</label>
            <input
              type="number"
              placeholder="₹0"
              value={filters.minPrice ?? ''}
              onChange={(e) => updateFilter({ minPrice: e.target.value ? +e.target.value : undefined })}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="input-label text-[9px]">Max Price</label>
            <input
              type="number"
              placeholder="Any"
              value={filters.maxPrice ?? ''}
              onChange={(e) => updateFilter({ maxPrice: e.target.value ? +e.target.value : undefined })}
              className="input-field text-sm"
            />
          </div>
        </div>
      </div>

      {/* Duration */}
      <div>
        <h4 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">Duration</h4>
        <div className="space-y-1.5">
          {DURATIONS.map(({ label, min, max }) => (
            <label key={label} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="duration"
                checked={filters.minDuration === (min || undefined) && filters.maxDuration === (max < 999 ? max : undefined)}
                onChange={() => updateFilter({
                  minDuration: min || undefined,
                  maxDuration: max < 999 ? max : undefined,
                })}
                className="accent-silk-400"
              />
              <span className="text-sm text-gray-600 group-hover:text-navy transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear */}
      {activeFilterCount > 0 && (
        <button
          onClick={() => setFilters({ page: 1, limit: 12, sortBy: 'newest' })}
          className="w-full btn btn-outline btn-sm text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
        >
          <X size={13} /> Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] pt-20">
      {/* Page Header */}
      <div className="bg-[#F8F7F4] py-16 relative overflow-hidden border-b border-navy-100/50">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-silk blur-[120px] -mr-48 -mt-48 rounded-full" />
        </div>
        <div className="container-app relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-silk-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              {filters.featured ? 'Exclusive' : 'Explore'}
            </p>
            <h1 className="font-display font-bold text-navy-900 text-4xl md:text-6xl mb-4 tracking-tight">
              {filters.featured ? (
                <>Limited Time <span className="text-silk-500">Deals</span></>
              ) : (
                <>Curated <span className="text-silk-500">Escapes</span></>
              )}
            </h1>
            <p className="text-navy-700/60 text-base max-w-md font-medium">
              {data 
                ? `${data.meta.total} ${filters.featured ? 'exclusive offers' : 'bespoke journeys'} waiting for you.` 
                : 'Discover amazing destinations'}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-app py-8 md:py-12">
        <div className="flex gap-8">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-3xl p-8 sticky top-28 shadow-[0_32px_64px_rgba(0,0,0,0.04)] border border-gray-50/50">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-display font-bold text-xl text-navy-900 tracking-tight">Filters</h3>
                {activeFilterCount > 0 && (
                  <span className="bg-silk-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest">{activeFilterCount} Active</span>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-8 flex-wrap bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-gray-50/50">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-[200px]">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden bg-silk-500 text-white px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-silk-500/20 active:scale-95 transition-transform"
                >
                  <Filter size={14} /> Filters
                </button>
                {data && (
                  <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest truncate">
                    <span className="text-navy-900">{data.meta.total}</span> Journeys
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="hidden sm:inline text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sort by</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter({ sortBy: e.target.value as PackageFilters['sortBy'] })}
                  className="text-[11px] font-bold text-navy-900 bg-gray-50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-silk-500/30 transition-all appearance-none cursor-pointer border border-transparent"
                >
                  {SORT_OPTS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="min-h-[600px]">
              <motion.div 
                layout
                className={cn(
                  'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity', 
                  isFetching && 'opacity-70'
                )}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    Array.from({ length: 9 }).map((_, i) => (
                      <motion.div key={`skeleton-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <SkeletonCard />
                      </motion.div>
                    ))
                  ) : data?.data && data.data.length > 0 ? (
                    data.data.map((pkg, i) => (
                      <motion.div
                        key={pkg.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: i * 0.02 }}
                      >
                        <PackageCard pkg={pkg} />
                      </motion.div>
                    ))
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="col-span-full flex flex-col items-center justify-center py-24 text-center"
                    >
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Search size={32} className="text-gray-300" />
                      </div>
                      <h3 className="font-display text-2xl text-navy-900 mb-3 tracking-tight">No escapes found</h3>
                      <p className="text-navy-700/50 text-base max-w-xs mx-auto font-medium">
                        We couldn't find any packages matching these criteria. Try adjusting your filters or searching for something else.
                      </p>
                      <button 
                        onClick={() => setFilters({ page: 1, limit: 12, sortBy: 'newest' })}
                        className="mt-8 text-[11px] font-black uppercase tracking-[0.2em] text-silk-600 hover:text-navy-900 transition-colors"
                      >
                        ← Reset all filters
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Pagination */}
            {data && data.meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  disabled={!data.meta.hasPrevPage}
                  onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                  className="btn btn-outline btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(data.meta.totalPages, 7) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilters((f) => ({ ...f, page: p }))}
                      className={cn(
                        'w-9 h-9 rounded-xl text-sm font-semibold transition-all',
                        p === filters.page
                          ? 'bg-navy text-white'
                          : 'border border-gray-200 text-gray-600 hover:border-navy hover:text-navy',
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  disabled={!data.meta.hasNextPage}
                  onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                  className="btn btn-outline btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
                <h3 className="font-display font-semibold text-navy-800">Filters</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5">
                <FilterPanel />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
