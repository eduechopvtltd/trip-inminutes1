// src/components/home/TrendingSection.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MapPin, Search } from 'lucide-react';
import { useTrendingPackages, usePackages } from '@/hooks/index';
import type { Package } from '@/types';
import PackageCard, { SkeletonCard } from '@/components/ui/index';
import { SectionHeader } from '@/components/ui/index';
import { cn } from '@/lib/utils';

const FILTERS = [
  { id: '',              label: 'All' },
  { id: 'INTERNATIONAL', label: 'International' },
  { id: 'DOMESTIC',      label: 'Domestic' },
  { id: 'HONEYMOON',     label: 'Honeymoon' },
  { id: 'ADVENTURE',     label: 'Adventure' },
];

export function TrendingSection() {
  const [filter, setFilter] = useState('');
  const { data: trendingData, isLoading: isTrendingLoading } = useTrendingPackages();
  
  // Dynamically fetch by category if filter is active to ensure density
  const { data: categoryData, isLoading: isCategoryLoading } = usePackages(
    filter ? { type: filter as any, limit: 12, sortBy: 'bookings' } : {}
  );

  const packages = filter ? categoryData?.data : trendingData;
  const isLoading = filter ? isCategoryLoading : isTrendingLoading;

  return (
    <section className="section bg-white relative">
      <motion.div 
        className="container-app"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <SectionHeader
            label="🔥 Hot Right Now"
            title="Trending Packages"
            subtitle="Handpicked by our travel experts — selling fast!"
          />
          <Link to="/packages" className="btn btn-outline btn-sm shrink-0 self-start md:self-auto mb-10 md:mb-14">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 relative -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide">
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={cn(
                'relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 whitespace-nowrap shrink-0',
                filter === id ? 'text-white' : 'text-navy-800/50 hover:text-navy-800 hover:bg-gray-100'
              )}
            >
              {filter === id && (
                <motion.div
                  layoutId="activeFilterTrending"
                  className="absolute inset-0 bg-navy-800 rounded-full shadow-lg z-0"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </div>

        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px]"
        >
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : packages && packages.length > 0 ? (
            packages.map((pkg: Package) => (
              <div key={pkg.id}>
                <PackageCard pkg={pkg} />
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <MapPin size={24} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-navy-800 mb-1">No packages found</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                We couldn't find any packages for this category. Try exploring our other curated collections.
              </p>
              <button 
                onClick={() => setFilter('')}
                className="mt-6 text-sm font-bold text-silk-600 hover:text-navy-800 transition-colors uppercase tracking-widest"
              >
                ← Back to All
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// DestinationsSection
// ─────────────────────────────────────────────────────────────
import { useState as useSDS } from 'react';
import { usePackages as usePkgDS } from '@/hooks/index';
import PCds from '@/components/ui/index';
import { SectionHeader as SHds } from '@/components/ui/index';
import { SkeletonCard as SKds } from '@/components/ui/index';
import { Link as LDS } from 'react-router-dom';
import { ArrowRight as ArDS } from 'lucide-react';

export function DestinationsSection() {
  const [tab, setTabDS] = useSDS<'INTERNATIONAL' | 'DOMESTIC'>('INTERNATIONAL');
  const { data, isLoading } = usePkgDS({ type: tab, limit: 8, sortBy: 'bookings' });

  return (
    <section className="section bg-cream">
      <motion.div 
        className="container-app"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <SHds
          label="Explore By Destination"
          title="Destination-Wise Packages"
          subtitle="Choose your world — or rediscover your own backyard."
        />

        <div className="flex border-b border-gray-100 mb-8 gap-1 relative">
          {[['INTERNATIONAL', '🌍 International'], ['DOMESTIC', '🇮🇳 Domestic']].map(([t, l]) => (
            <button
              key={t}
              onClick={() => setTabDS(t as typeof tab)}
              className={cn(
                'relative px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300',
                tab === t ? 'text-navy-900' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <span className="relative z-10">{l}</span>
              {tab === t && (
                <motion.div
                  layoutId="activeTabDest"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-silk-500 z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl font-semibold text-navy-800">
            {tab === 'INTERNATIONAL' ? 'International Destinations' : 'Domestic Destinations'}
          </h3>
          <LDS to={`/packages?type=${tab}`} className="btn btn-outline btn-sm">View All <ArDS size={13} /></LDS>
        </div>

        <motion.div 
          layout
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[350px]"
        >
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SKds key={i} />)
          ) : data?.data && data.data.length > 0 ? (
            data.data.map((pkg: any) => (
              <motion.div 
                key={pkg.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
              >
                <PCds pkg={pkg} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <p className="text-gray-400 text-sm">No packages found for this destination type.</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// BudgetSection
// ─────────────────────────────────────────────────────────────
import { useState as useSBS } from 'react';
import { usePackages as usePkgBS } from '@/hooks/index';
import PCBS from '@/components/ui/index';
import { SectionHeader as SHBS } from '@/components/ui/index';
import { SkeletonCard as SKBS } from '@/components/ui/index';

const BUDGETS = [
  { label: 'All Budgets',   minPrice: 0,       maxPrice: 9999999 },
  { label: 'Under ₹15K',   minPrice: 0,       maxPrice: 15000 },
  { label: '₹15K – ₹30K',  minPrice: 15000,   maxPrice: 30000 },
  { label: '₹30K – ₹60K',  minPrice: 30000,   maxPrice: 60000 },
  { label: '₹60K – ₹1L',   minPrice: 60000,   maxPrice: 100000 },
  { label: 'Above ₹1L',    minPrice: 100000,  maxPrice: 9999999 },
];

export function BudgetSection() {
  const [bIdx, setBIdx] = useSBS(0);
  const budget = BUDGETS[bIdx];
  const { data, isLoading } = usePkgBS({
    minPrice: budget.minPrice > 0 ? budget.minPrice : undefined,
    maxPrice: budget.maxPrice < 9999999 ? budget.maxPrice : undefined,
    limit: 12,
    sortBy: 'price_asc',
  });

  return (
    <section className="section bg-white">
      <motion.div 
        className="container-app"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <SHBS
          label="For Every Wallet"
          title="Budget-Wise Packages"
          subtitle="International & domestic deals tailored to what you want to spend."
          center
        />

        {/* Budget pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {BUDGETS.map((b, i) => (
            <button
              key={b.label}
              onClick={() => setBIdx(i)}
              className={i === bIdx
                ? 'px-5 py-2.5 rounded-full text-sm font-semibold bg-silk-500 text-white border border-silk-500 shadow-lg shadow-silk-500/20'
                : 'px-5 py-2.5 rounded-full text-sm font-semibold border border-gray-200 text-gray-600 hover:border-silk-400 hover:text-navy-800 transition-all'}
            >
              {b.label}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          <motion.div 
            layout 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <motion.div key={`skeleton-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <SKBS />
                  </motion.div>
                ))
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((pkg, i) => (
                  <motion.div 
                    key={pkg.id} 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                  >
                    <PCBS pkg={pkg} />
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="col-span-full flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Search size={24} className="text-gray-300" />
                  </div>
                  <h3 className="font-display text-lg text-navy-800 mb-2">No packages in this range</h3>
                  <p className="text-gray-400 text-sm max-w-xs mx-auto">Try selecting a different budget tier to explore more options.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// PopularSection
// ─────────────────────────────────────────────────────────────
import { usePackages as usePkgPS } from '@/hooks/index';
import PCPS from '@/components/ui/index';
import { SectionHeader as SHPS } from '@/components/ui/index';
import { SkeletonCard as SKPS } from '@/components/ui/index';

export function PopularSection() {
  const { data, isLoading } = usePkgPS({ sortBy: 'bookings', limit: 9 });

  return (
    <section className="section bg-white">
      <motion.div 
        className="container-app"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <SHPS
          label="Most Loved"
          title="Popularity-Wise Packages"
          subtitle="Top-rated by customers. Ranked by bookings, ratings & reviews."
        />
        <div className="min-h-[400px]">
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <motion.div key={`skeleton-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <SKPS />
                  </motion.div>
                ))
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((pkg: any, i: number) => (
                  <motion.div 
                    key={pkg.id} 
                    layout
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <PCPS pkg={pkg} variant="default" rank={i + 1} />
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="col-span-full flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Search size={24} className="text-gray-300" />
                  </div>
                  <h3 className="font-display text-lg text-navy-800 mb-2">No trending packages</h3>
                  <p className="text-gray-400 text-sm max-w-xs mx-auto">We're currently updating our top-rated collections. Check back soon!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// ServicesSection
// ─────────────────────────────────────────────────────────────
import { motion as mSS } from 'framer-motion';
import { SectionHeader as SHSS } from '@/components/ui/index';
import { Plane as PlSS, Hotel as HoSS, Map as MpSS, Headphones, Stamp, ShieldCheck as ShSS, Briefcase as BrSS, DollarSign } from 'lucide-react';


const SERVICES_DATA = [
  { icon: PlSS,       title: 'Flights at Best Fares',      desc: 'Access 500+ airlines worldwide. Our AI-powered tracker ensures you always pay least.' },
  { icon: HoSS,       title: '50,000+ Hotels Worldwide',    desc: 'From budget stays to premium properties. Every property verified by our team.' },
  { icon: MpSS,       title: 'Expert-Curated Itineraries',  desc: 'Our travel experts craft every itinerary with insider knowledge.' },
  { icon: Headphones, title: '24/7 Travel Support',         desc: "Stuck at 3 AM? We're always a call away — worldwide, any time zone." },
  { icon: Stamp,      title: 'Visa Assistance',             desc: 'End-to-end visa support for 100+ countries. Guaranteed approval or full refund.' },
  { icon: ShSS,       title: 'Travel Insurance',            desc: 'Comprehensive cover for medical, trip cancellations & lost baggage.' },
  { icon: BrSS,       title: 'Corporate Travel',            desc: 'Streamlined business travel management with dedicated account managers.' },
  { icon: DollarSign, title: 'Forex & Remittances',         desc: 'Best exchange rates for 40+ currencies with doorstep delivery.' },
];



export function ServicesSection() {
  return (
    <section className="section bg-cream">
      <motion.div 
        className="container-app"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <SHSS label="Why TripInMinutes" title="Everything Travel, Under One Roof" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {SERVICES_DATA.map(({ icon: Icon, title, desc }, i) => (
            <mSS.div
              key={title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="card p-6 hover:-translate-y-2 hover:shadow-card-hover transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-silk-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-silk-500 transition-colors">
                <Icon size={22} className="text-silk-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-display font-semibold text-base text-navy-800 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </mSS.div>
          ))}
        </div>

      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// CorporateMICESection
// ─────────────────────────────────────────────────────────────
import { motion as mCM } from 'framer-motion';
import { Link as LCM } from 'react-router-dom';
import { ArrowRight as ArCM } from 'lucide-react';

export function CorporateMICESection() {
  return (
    <section className="section bg-cream/30">
      <motion.div 
        className="container-app"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-12">
          <p className="section-label">Business Travel</p>
          <h2 className="section-title text-navy-900">Corporate & MICE Solutions</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            {
              emoji: '✈️', label: 'Corporate Travel', title: 'Business Travel, Simplified',
              desc: 'Dedicated account managers, centralized billing, real-time booking management for enterprises of all sizes.',
              features: ['Priority Boarding', 'GST Invoicing', '24/7 Desk', 'Policy Compliance', 'Expense Reports'],
              bg: 'from-white to-silk-50/50', border: 'border-silk-200/50',
            },
            {
              emoji: '🎪', label: 'MICE', title: 'Meetings, Events & Incentive Travel',
              desc: 'End-to-end management for conferences, corporate retreats, award trips & large-scale events worldwide.',
              features: ['Venue Sourcing', 'Group Flights', 'F&B Planning', 'AV & Tech Setup', 'Team Building'],
              bg: 'from-white to-purple-50/30', border: 'border-purple-200/50',
            },
          ].map(({ emoji, label, title, desc, features, bg, border }, i) => (
            <mCM.div
              key={label}
              initial={{ opacity: 0, x: i === 0 ? -24 : 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${bg} border ${border} p-8 md:p-10 shadow-sm shadow-navy-900/5`}
            >
              <div className="text-4xl mb-4">{emoji}</div>
              <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-silk-600 mb-2">{label}</p>
              <h3 className="font-display text-2xl font-bold text-navy-900 mb-3">{title}</h3>
              <p className="text-navy-700/70 text-sm leading-relaxed mb-6">{desc}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {features.map((f) => (
                  <span key={f} className="text-xs bg-navy-50/50 text-navy-600 px-3 py-1.5 rounded-full border border-navy-100/50">{f}</span>
                ))}
              </div>
              <LCM to="/contact" className="btn btn-gold btn-sm">
                Enquire Now <ArCM size={13} />
              </LCM>
              <div className="absolute -bottom-8 -right-8 text-[120px] opacity-5 select-none">{emoji}</div>
            </mCM.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// ReviewsSection
// ─────────────────────────────────────────────────────────────
import { useState as useSRV, useEffect as useERV } from 'react';
import { motion as mRV } from 'framer-motion';
import { Star as StarRV, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionHeader as SHRV } from '@/components/ui/index';

const REVIEWS_DATA = [
  { name: 'Priya Sharma', dest: 'Maldives Package', rating: 5, avatar: 'https://randomuser.me/api/portraits/women/44.jpg', text: 'Absolutely breathtaking! Every detail was taken care of — from the seaplane transfer to the overwater villa. TripInMinutes exceeded every expectation. Already planning our anniversary trip!' },
  { name: 'Rahul Mehra', dest: 'Europe Grand Tour', rating: 5, avatar: 'https://randomuser.me/api/portraits/men/32.jpg', text: '14 nights, 7 countries, zero stress. Our travel manager Anjali was reachable at all times. The hotels were stunning and every transfer was on time. Will never book travel any other way.' },
  { name: 'Deepa & Kiran Nair', dest: 'Kashmir Paradise', rating: 5, avatar: 'https://randomuser.me/api/portraits/women/28.jpg', text: 'Kashmir was everything we dreamed of — and the houseboat stay was pure magic. The whole family had the best week of our lives. Kids are already asking when we go back!' },
  { name: 'Amit Joshi', dest: 'Dubai Extravaganza', rating: 5, avatar: 'https://randomuser.me/api/portraits/men/56.jpg', text: 'First international trip with my parents and TripInMinutes made it flawless. The airport pickup, desert safari, Burj Khalifa — everything clicked perfectly.' },
  { name: 'Sneha Kulkarni', dest: 'Bali Bliss', rating: 5, avatar: 'https://randomuser.me/api/portraits/women/65.jpg', text: 'A solo trip to Bali felt safe and special thanks to TripInMinutes. Private villa, spa day, temple tours — I felt truly special on a budget!' },
  { name: 'Vikram Patel', dest: 'Thailand Explorer', rating: 4, avatar: 'https://randomuser.me/api/portraits/men/41.jpg', text: 'Great value for money! Thailand package covered everything. The Phi Phi island day trip was the highlight. Minor hiccup with check-in time but support team resolved it instantly.' },
];

export function ReviewsSection() {
  const [page, setPage] = useSRV(0);
  const perPage = 3;
  const totalPages = Math.ceil(REVIEWS_DATA.length / perPage);
  const visible = REVIEWS_DATA.slice(page * perPage, page * perPage + perPage);

  useERV(() => {
    const t = setInterval(() => setPage((p) => (p + 1) % totalPages), 5000);
    return () => clearInterval(t);
  }, [totalPages]);

  return (
    <section className="section bg-white">
      <motion.div 
        className="container-app"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <SHRV label="Traveler Stories" title="What Our Customers Say" subtitle="Real experiences from real travelers. See why 2 million people trust us." />
          {/* Rating Overview */}
          <div className="flex items-center gap-4 bg-cream rounded-2xl px-6 py-4 shrink-0">
            <div className="text-center">
              <div className="font-display font-black text-5xl text-navy-800 leading-none">4.9</div>
              <div className="text-amber-400 text-lg mt-1">★★★★★</div>
              <div className="text-xs text-gray-400 mt-1">24,600+ reviews</div>
            </div>
            <div className="w-px h-16 bg-gray-200" />
            <div className="flex flex-col gap-1.5">
              {[[88, '5★'], [9, '4★'], [2, '3★'], [1, '2★'], [0, '1★']].map(([pct, label]) => (
                <div key={String(label)} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-5">{label}</span>
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-silk-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {visible.map((r, i) => (
            <mRV.div
              key={r.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card p-6"
            >
              <Quote size={20} className="text-silk-500/20 mb-3" />
              <p className="text-sm text-gray-600 leading-relaxed italic mb-4 clamp-3">"{r.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <img src={r.avatar} alt={r.name} loading="lazy" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-navy-800 text-sm">{r.name}</p>
                  <p className="text-xs text-silk-500 font-medium flex items-center gap-1">
                    <StarRV size={10} className="fill-current" /> {r.dest}
                  </p>
                </div>
              </div>
            </mRV.div>
          ))}
        </div>

        {/* Pagination dots + arrows */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)} className="p-2 rounded-full border border-gray-200 hover:border-navy text-gray-400 hover:text-navy transition-colors">
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === page ? 'bg-silk-500 w-5' : 'bg-gray-300'}`} />
            ))}
          </div>
          <button onClick={() => setPage((p) => (p + 1) % totalPages)} className="p-2 rounded-full border border-gray-200 hover:border-navy text-gray-400 hover:text-navy transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// TermsSection
// ─────────────────────────────────────────────────────────────
import { useState as useSTR, useRef as useRTR } from 'react';
import { ChevronDown as CvTR } from 'lucide-react';
import { SectionHeader as SHTR } from '@/components/ui/index';
import { cn as cnTR } from '@/lib/utils';

const TERMS_DATA = [
  { title: 'Booking & Payment Policy', body: 'A booking is confirmed only upon receipt of the deposit as specified in your quotation. Full payment must be made at least 30 days prior to departure for international tours and 15 days for domestic tours. We accept UPI, net banking, credit/debit cards, and cheques. Prices are subject to change due to currency fluctuations and airline/hotel revisions.' },
  { title: 'Cancellation & Refund Policy', body: 'Cancellations 60+ days before departure: 10% cancellation charge. 30–59 days: 25% charge. 15–29 days: 50% charge. Less than 15 days: No refund. Refunds are processed within 14 working days. Airline and hotel cancellation penalties are additional as per their respective policies.' },
  { title: 'Visa & Documentation', body: 'TripInMinutes assists with visa applications but cannot guarantee visa approval, as decisions rest solely with respective embassies. Travelers are responsible for ensuring their passports have minimum 6 months validity. Required documentation must be submitted at least 3 weeks before the scheduled appointment.' },
  { title: 'Liability & Force Majeure', body: 'TripInMinutes acts as an agent for hotels, airlines, and other service providers and is not liable for any loss, damage, or delay arising from their actions. We are not responsible for delays due to weather, natural disasters, strikes, government actions, or other force majeure events. Travel insurance is strongly recommended.' },
  { title: 'Privacy & Data Protection', body: 'Your personal information is collected solely for booking and travel purposes and is protected in accordance with applicable data protection laws. We do not sell your data to third parties. Necessary information may be shared with airlines, hotels, and visa authorities as required for your booking.' },
];

export function TermsSection() {
  return (
    <section id="terms" className="section bg-white" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
      <motion.div 
        className="container-app max-w-5xl"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-center mb-10">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-silk-500 mb-2">Legal</p>
          <h2 className="font-display font-bold text-3xl text-navy-900">Terms & Conditions</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TERMS_DATA.map(({ title, body }) => (
            <div key={title} className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 hover:border-silk-200 transition-colors group">
              <h4 className="font-bold text-xs text-navy-900 mb-2 flex items-center gap-2 uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-silk-500 rounded-full group-hover:scale-125 transition-transform" /> 
                {title}
              </h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                {body}
              </p>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <p>© 2026 TRIPINMINUTES. ALL RIGHTS RESERVED.</p>
          <p>
            FOR FULL POLICIES, <a href="#" className="text-silk-600 hover:text-navy-900 transition-colors">CLICK HERE</a>
          </p>
        </div>
      </motion.div>
    </section>
  );
}


function CountUp({ end, suffix }: { end: number; suffix: string }) { return <span>{end}{suffix}</span>; }
