// src/components/home/HeroSection.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Plane, Hotel, Package, Search, ArrowRight, Star } from 'lucide-react';
import { useUIStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';



const SEARCH_TABS = [
  { id: 'flights',  label: 'Flights',  icon: Plane },
  { id: 'hotels',   label: 'Hotels',   icon: Hotel },
  { id: 'packages', label: 'Packages', icon: Package },
] as const;

const CLASSES = ['Economy', 'Premium Economy', 'Business', 'First Class'];
const BUDGET_OPTS = ['Under ₹15,000', '₹15K – ₹30K', '₹30K – ₹60K', '₹60K – ₹1L', 'Above ₹1L'];

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6, ease: [0.4, 0, 0.2, 1] } }) };

export default function HeroSection() {
  const { searchTab, setSearchTab } = useUIStore();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  // Scroll-linked transition
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 600], [1, 1.1]);
  const overlayOpacity = useTransform(scrollY, [300, 600], [0, 1]);

  // Flight state
  const [flight, setFlight] = useState({ from: '', to: '', depart: '', tripType: 'round-trip', passengers: '1 Adult', travelClass: 'Economy' });
  // Hotel state
  const [hotel, setHotel] = useState({ city: '', checkIn: '', checkOut: '', rooms: '1 Room', guests: '2 Guests' });
  // Package state
  const [pkg, setPkg] = useState({ dest: '', month: '', duration: '5-7 Nights', budget: '' });

  const handleSearch = () => {
    if (searchTab === 'packages') {
      const params = new URLSearchParams();
      if (pkg.dest) params.append('search', pkg.dest);
      if (pkg.month) params.append('month', pkg.month);
      if (pkg.budget) params.append('budget', pkg.budget);
      navigate(`/packages?${params.toString()}`);
    } else if (searchTab === 'flights') {
      const params = new URLSearchParams({
        from: flight.from,
        to: flight.to,
        depart: flight.depart,
        class: flight.travelClass,
        passengers: flight.passengers
      });
      navigate(`/flights?${params.toString()}`);
    } else {
      const params = new URLSearchParams({
        city: hotel.city,
        checkIn: hotel.checkIn,
        checkOut: hotel.checkOut,
        guests: hotel.guests
      });
      navigate(`/hotels?${params.toString()}`);
    }
  };

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden">
      {/* Background Video */}
      <motion.div style={{ opacity: shouldReduceMotion ? 1 : opacity, scale: shouldReduceMotion ? 1 : scale }} className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover will-change-transform"
        >
          <source src="/assets/hero-video.mp4" type="video/mp4" />
          <source src="/assets/hero-video.webm" type="video/webm" />
        </video>
        {/* Fades for seamless integration */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-navy-800/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/10 to-transparent z-10" />

        {/* Scroll-linked Bottom Overlay to force seamless merge */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-white z-20 pointer-events-none"
        />

        {/* Dark Overlay (Minimal) */}
        <div className="absolute inset-0 bg-navy-800/10" />
      </motion.div>

      {/* Animated orbs - Hidden on mobile to prevent overflow */}
      <div className="hidden md:block absolute top-1/4 left-1/4 w-96 h-96 bg-silk/10 rounded-full blur-2xl animate-float pointer-events-none" style={{ animationDuration: '12s' }} />
      <div className="hidden md:block absolute bottom-1/3 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl animate-float pointer-events-none" style={{ animationDuration: '15s', animationDelay: '2s' }} />

      <div className="relative z-10 container-app pt-24 pb-8 px-4 sm:px-6 flex flex-col items-center text-center">
        {/* Badge - Premium Glassmorphic style */}
        {/* Removed lifestyle badge */}

        {/* Title - Modern & Expansive Serif Style */}
        <motion.h1 custom={1} initial="hidden" animate="show" variants={fadeUp}
          className="font-accent font-bold text-white leading-[1.05] mb-6 tracking-tight"
          style={{ fontSize: 'clamp(48px, 8vw, 110px)' }}>
          Explore The World
        </motion.h1>

        <motion.p custom={2} initial="hidden" animate="show" variants={fadeUp}
          className="text-white/80 text-base md:text-xl max-w-2xl mb-12 leading-relaxed">
          What we offer is an unforgettable journey and experience. Every detail, perfectly planned.
        </motion.p>
      </div>

      {/* Search Container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 container-app pb-16 md:pb-32 flex flex-col items-center gap-4"
      >
        {/* Tabs - Centered Pill Style with Neutral High-End Glass */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-full p-1 sm:p-1.5 flex gap-0.5 sm:gap-1 shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-white/20 relative">
          {SEARCH_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSearchTab(id)}
              className={cn(
                'relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider z-10 transition-colors duration-300',
                searchTab === id
                  ? 'text-navy-800'
                  : 'text-white/70 hover:text-white',
              )}
            >
              {/* Smooth fade-in/out for the active pill — no spring bounce */}
              <AnimatePresence>
                {searchTab === id && (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
                    exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="absolute inset-0 bg-white/80 rounded-full shadow-sm z-0"
                  />
                )}
              </AnimatePresence>
              <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                <Icon size={14} /><span className="hidden sm:inline">{label}</span><span className="sm:hidden">{label.slice(0, 3)}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar Pill - Premium Glass Style */}
        <div className="bg-white/90 sm:bg-white/80 backdrop-blur-md sm:backdrop-blur-2xl rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-3 sm:p-2 sm:pl-4 md:pl-10 shadow-[0_32px_96px_rgba(2,6,23,0.15)] flex flex-col lg:flex-row items-stretch lg:items-center gap-3 sm:gap-2 md:gap-4 max-w-6xl w-full border border-white/50">
          
          {/* ── Dynamic Fields Based on Tab — crossfade between panels ── */}
          <div className="relative flex-1 w-full overflow-hidden">
            <AnimatePresence mode="wait">
              {searchTab === 'flights' && (
                <motion.div
                  key="flights"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row items-center gap-3 sm:gap-4 w-full p-2 lg:p-0"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 lg:border-r border-navy-800/[0.05] lg:pr-6">
                    <div className="w-11 h-11 bg-navy-50/80 rounded-2xl flex items-center justify-center text-navy-600 border border-navy-100/50 shrink-0"><Plane size={20} /></div>
                    <div className="flex flex-col w-full text-left">
                      <span className="text-[10px] font-black text-silk-700 uppercase tracking-[0.15em] mb-0.5">From</span>
                      <input value={flight.from} onChange={(e) => setFlight({ ...flight, from: e.target.value })} placeholder="City/Airport" className="bg-transparent border-none p-0 text-[15px] font-bold text-navy-900 placeholder-navy-400/60 focus:ring-0 w-full" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-1 min-w-0 border-r border-navy-800/[0.05] pr-6">
                    <div className="w-11 h-11 bg-navy-50/80 rounded-2xl flex items-center justify-center text-navy-600 border border-navy-100/50 shrink-0"><Plane size={20} className="rotate-90" /></div>
                    <div className="flex flex-col w-full text-left">
                      <span className="text-[10px] font-black text-silk-700 uppercase tracking-[0.15em] mb-0.5">To</span>
                      <input value={flight.to} onChange={(e) => setFlight({ ...flight, to: e.target.value })} placeholder="City/Airport" className="bg-transparent border-none p-0 text-[15px] font-bold text-navy-900 placeholder-navy-400/60 focus:ring-0 w-full" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-1 min-w-0 border-r border-navy-800/[0.05] pr-6">
                    <div className="w-11 h-11 bg-navy-50/80 rounded-2xl flex items-center justify-center text-navy-600 border border-navy-100/50 shrink-0"><Search size={20} /></div>
                    <div className="flex flex-col w-full text-left">
                      <span className="text-[10px] font-black text-silk-700 uppercase tracking-[0.15em] mb-0.5">Departure</span>
                      <input type="date" value={flight.depart} onChange={(e) => setFlight({ ...flight, depart: e.target.value })} className="bg-transparent border-none p-0 text-[15px] font-bold text-navy-900 focus:ring-0 w-full cursor-pointer appearance-none" style={{ colorScheme: 'light' }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 bg-navy-50/80 rounded-2xl flex items-center justify-center text-navy-600 border border-navy-100/50 shrink-0"><Package size={20} /></div>
                    <div className="flex flex-col w-full text-left">
                      <span className="text-[10px] font-black text-silk-700 uppercase tracking-[0.15em] mb-0.5">Class</span>
                      <select value={flight.travelClass} onChange={(e) => setFlight({ ...flight, travelClass: e.target.value })} className="bg-transparent border-none p-0 text-[15px] font-bold text-navy-900 focus:ring-0 w-full cursor-pointer appearance-none">
                        {CLASSES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {searchTab === 'hotels' && (
                <motion.div
                  key="hotels"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="flex flex-col lg:flex-row items-center gap-4 w-full p-2 lg:p-0"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0 border-r border-navy-800/[0.05] pr-6">
                    <div className="w-11 h-11 bg-navy-50/80 rounded-2xl flex items-center justify-center text-navy-600 border border-navy-100/50 shrink-0"><Hotel size={20} /></div>
                    <div className="flex flex-col w-full text-left">
                      <span className="text-[10px] font-black text-silk-700 uppercase tracking-[0.15em] mb-0.5">City / Hotel</span>
                      <input value={hotel.city} onChange={(e) => setHotel({ ...hotel, city: e.target.value })} placeholder="Where to stay?" className="bg-transparent border-none p-0 text-[15px] font-bold text-navy-900 placeholder-navy-400/60 focus:ring-0 w-full" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-1 min-w-0 border-r border-navy-800/[0.05] pr-6">
                    <div className="w-11 h-11 bg-navy-50/80 rounded-2xl flex items-center justify-center text-navy-600 border border-navy-100/50 shrink-0"><Search size={20} /></div>
                    <div className="flex flex-col w-full text-left">
                      <span className="text-[10px] font-black text-silk-700 uppercase tracking-[0.15em] mb-0.5">Check-In</span>
                      <input type="date" value={hotel.checkIn} onChange={(e) => setHotel({ ...hotel, checkIn: e.target.value })} className="bg-transparent border-none p-0 text-[15px] font-bold text-navy-900 focus:ring-0 w-full cursor-pointer appearance-none" style={{ colorScheme: 'light' }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-1 min-w-0 pr-6">
                    <div className="w-11 h-11 bg-navy-50/80 rounded-2xl flex items-center justify-center text-navy-600 border border-navy-100/50 shrink-0"><Search size={20} /></div>
                    <div className="flex flex-col w-full text-left">
                      <span className="text-[10px] font-black text-silk-700 uppercase tracking-[0.15em] mb-0.5">Rooms & Guests</span>
                      <select value={hotel.rooms} onChange={(e) => setHotel({ ...hotel, rooms: e.target.value })} className="bg-transparent border-none p-0 text-[15px] font-bold text-navy-900 focus:ring-0 w-full cursor-pointer appearance-none">
                        {['1 Room · 2 Guests','2 Rooms · 4 Guests','3 Rooms · 6 Guests'].map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {searchTab === 'packages' && (
                <motion.div
                  key="packages"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="flex flex-col lg:flex-row items-center gap-4 w-full p-2 lg:p-0"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0 border-r border-navy-800/[0.05] pr-6">
                    <div className="w-11 h-11 bg-navy-50/80 rounded-2xl flex items-center justify-center text-navy-600 border border-navy-100/50 shrink-0"><Package size={20} /></div>
                    <div className="flex flex-col w-full text-left">
                      <span className="text-[10px] font-black text-silk-700 uppercase tracking-[0.15em] mb-0.5">Destinations</span>
                      <input value={pkg.dest} onChange={(e) => setPkg({ ...pkg, dest: e.target.value })} placeholder="Where to go?" className="bg-transparent border-none p-0 text-[15px] font-bold text-navy-900 placeholder-navy-400/60 focus:ring-0 w-full" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-1 min-w-0 border-r border-navy-800/[0.05] pr-6 px-4">
                    <div className="w-11 h-11 bg-navy-50/80 rounded-2xl flex items-center justify-center text-navy-600 border border-navy-100/50 shrink-0"><Star size={20} /></div>
                    <div className="flex flex-col w-full text-left">
                      <span className="text-[10px] font-black text-silk-700 uppercase tracking-[0.15em] mb-0.5">Budget</span>
                      <select value={pkg.budget} onChange={(e) => setPkg({ ...pkg, budget: e.target.value })} className="bg-transparent border-none p-0 text-[15px] font-bold text-navy-900 focus:ring-0 w-full cursor-pointer appearance-none">
                        <option value="">Any Budget</option>
                        {BUDGET_OPTS.map((b) => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-1 min-w-0 px-4">
                    <div className="w-11 h-11 bg-navy-50/80 rounded-2xl flex items-center justify-center text-navy-600 border border-navy-100/50 shrink-0"><Search size={20} /></div>
                    <div className="flex flex-col w-full text-left">
                      <span className="text-[10px] font-black text-silk-700 uppercase tracking-[0.15em] mb-0.5">Duration</span>
                      <select value={pkg.duration} onChange={(e) => setPkg({ ...pkg, duration: e.target.value })} className="bg-transparent border-none p-0 text-[15px] font-bold text-navy-900 focus:ring-0 w-full cursor-pointer appearance-none">
                        {['3-5 Nights','5-7 Nights','7-10 Nights','10+ Nights'].map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleSearch}
            className="group relative bg-silk-500 hover:bg-navy-800 text-white font-bold text-sm px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-full transition-all duration-300 shadow-xl shadow-silk-500/20 hover:shadow-navy-800/20 overflow-hidden shrink-0 m-1 w-full lg:w-auto"
          >
            <span className="relative z-10 flex items-center gap-2">
              {searchTab === 'packages' ? 'Find Packages' : 'Search Now'}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
          </button>
        </div>
      </motion.div>
    </section>
  );
}

