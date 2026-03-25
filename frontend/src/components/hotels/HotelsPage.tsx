import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Hotel, Search, Star, Wifi, Car, UtensilsCrossed,
  Dumbbell, MapPin, Info, Filter,
} from 'lucide-react';
import { cn, formatCurrency, getOptimizedImageUrl } from '@/lib/utils';
import { LazySection } from '@/components/ui/index';

const MOCK_HOTELS = [
  {
    id: '1', name: 'The Oberoi, Dubai', stars: 5, rating: 4.9, reviews: 2840,
    location: 'Business Bay, Dubai', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
    pricePerNight: 18500, originalPrice: 22000,
    amenities: ['wifi', 'pool', 'gym', 'restaurant', 'parking'],
    badge: 'Luxury Pick',
  },
  {
    id: '2', name: 'JW Marriott Marquis', stars: 5, rating: 4.8, reviews: 5120,
    location: 'Sheikh Zayed Rd, Dubai', image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&q=80',
    pricePerNight: 14200, originalPrice: null,
    amenities: ['wifi', 'pool', 'gym', 'restaurant', 'spa'],
    badge: 'Bestseller',
  },
  {
    id: '3', name: 'Rove Downtown Hotel', stars: 4, rating: 4.6, reviews: 3210,
    location: 'Downtown, Dubai', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80',
    pricePerNight: 6800, originalPrice: 8500,
    amenities: ['wifi', 'pool', 'gym', 'restaurant'],
    badge: 'Value Pick',
  },
  {
    id: '4', name: 'Premier Inn Ibn Battuta', stars: 3, rating: 4.4, reviews: 1890,
    location: 'Ibn Battuta, Dubai', image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&q=80',
    pricePerNight: 3900, originalPrice: null,
    amenities: ['wifi', 'restaurant', 'parking'],
    badge: null,
  },
  {
    id: '5', name: 'Atlantis The Palm', stars: 5, rating: 4.7, reviews: 9800,
    location: 'Palm Jumeirah, Dubai', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
    pricePerNight: 26000, originalPrice: 31000,
    amenities: ['wifi', 'pool', 'gym', 'restaurant', 'spa', 'waterpark'],
    badge: 'Top Rated',
  },
  {
    id: '6', name: 'Ibis Styles Dubai Jumeira', stars: 3, rating: 4.2, reviews: 740,
    location: 'Jumeirah, Dubai', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80',
    pricePerNight: 2800, originalPrice: null,
    amenities: ['wifi', 'restaurant'],
    badge: 'Budget Friendly',
  },
];

const AMENITY_ICONS: Record<string, { icon: typeof Wifi; label: string }> = {
  wifi:       { icon: Wifi,            label: 'Free WiFi' },
  pool:       { icon: Hotel,           label: 'Pool' },
  gym:        { icon: Dumbbell,        label: 'Gym' },
  restaurant: { icon: UtensilsCrossed, label: 'Restaurant' },
  parking:    { icon: Car,             label: 'Parking' },
  spa:        { icon: Star,            label: 'Spa' },
};

const STAR_FILTERS = [0, 3, 4, 5];

export default function HotelsPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    city: searchParams.get('city') || 'Dubai',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    rooms: searchParams.get('rooms') || '1',
    guests: searchParams.get('guests') || '2'
  });
  const [searched, setSearched] = useState(!!searchParams.get('city'));
  const [sortBy, setSortBy] = useState('rating');
  const [starFilter, setStarFilter] = useState(0);
  const [maxPrice, setMaxPrice] = useState(35000);

  // Re-run search if URL params change
  useEffect(() => {
    if (searchParams.get('city')) {
      setForm({
        city: searchParams.get('city') || '',
        checkIn: searchParams.get('checkIn') || '',
        checkOut: searchParams.get('checkOut') || '',
        rooms: searchParams.get('rooms') || '1',
        guests: searchParams.get('guests') || '2'
      });
      setSearched(true);
    }
  }, [searchParams]);

  const filteredHotels = MOCK_HOTELS
    .filter((h) => (starFilter === 0 || h.stars === starFilter) && h.pricePerNight <= maxPrice)
    .sort((a, b) => sortBy === 'price' ? a.pricePerNight - b.pricePerNight : b.rating - a.rating);

  return (
    <div className="min-h-screen bg-[#FDFCFB] pt-24">
      {/* Search Header */}
      <div className="bg-[#F8F7F4] py-12 px-4 relative overflow-hidden border-b border-navy-100/50">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(197,160,89,0.15),transparent_50%)]" />
        </div>

        <div className="container-app relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="font-display font-bold text-navy-900 text-3xl md:text-4xl tracking-tight mb-2">
                Hotel <span className="text-silk-600">Boutique</span>
              </h1>
              <p className="text-navy-900/60 text-sm max-w-xs lowercase first-letter:uppercase">Handpicked sanctuaries across the globe’s most iconic cities.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-navy-100/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="sm:col-span-2 lg:col-span-1 space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400 ml-1">Destination</label>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Where are you headed?" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-semibold text-navy-800 focus:ring-2 focus:ring-[#C5A059]/30 transition-all outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400 ml-1">Check-In</label>
                <input type="date" value={form.checkIn} min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm({ ...form, checkIn: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-semibold text-navy-800 focus:ring-2 focus:ring-[#C5A059]/30 transition-all outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400 ml-1">Check-Out</label>
                <input type="date" value={form.checkOut} min={form.checkIn || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm({ ...form, checkOut: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-semibold text-navy-800 focus:ring-2 focus:ring-[#C5A059]/30 transition-all outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400 ml-1">Guests</label>
                <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-semibold text-navy-800 focus:ring-2 focus:ring-[#C5A059]/30 transition-all outline-none appearance-none" value={`${form.rooms}R ${form.guests}G`}
                  onChange={(e) => { const [r, g] = e.target.value.split(' '); setForm({ ...form, rooms: r[0], guests: g[0] }); }}>
                  {['1R 2G', '1R 3G', '2R 4G', '3R 6G'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <button onClick={() => setSearched(true)}
                className="flex items-center justify-center gap-2 bg-[#020617] hover:bg-silk-600 hover:text-white text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-silk-600/20">
                <Search size={16} /> <span className="text-xs uppercase tracking-widest">Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <LazySection className="container-app py-8">
        {!searched ? (
          <div className="text-center py-20">
            <Hotel size={48} className="text-gray-200 mx-auto mb-4" />
            <h2 className="font-display text-xl text-navy-800 mb-2">Find your perfect stay</h2>
            <p className="text-gray-500 text-sm">Search from 50,000+ properties across 200+ destinations.</p>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Sidebar */}
            <aside className="hidden md:block w-64 shrink-0">
              <div className="bg-white rounded-2xl p-6 sticky top-28 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-50 space-y-8">
                <h3 className="font-display font-semibold text-[#020617] text-lg">Filters</h3>
                
                <div>
                  <p className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400 mb-4">Star Rating</p>
                  <div className="space-y-2">
                    {STAR_FILTERS.map((s) => (
                      <label key={s} className="flex items-center gap-3 py-1 cursor-pointer group">
                        <input type="radio" name="stars" checked={starFilter === s} onChange={() => setStarFilter(s)} className="accent-silk-400 w-4 h-4" />
                        <span className="text-sm text-gray-600 group-hover:text-[#020617] transition-colors flex items-center gap-1">
                          {s === 0 ? 'Any' : (<><span className="text-gray-400">{'★'.repeat(s)}</span> & up</>)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400 mb-4">Max Price / Night</p>
                  <p className="text-sm font-bold text-[#020617] mb-3 font-num">{formatCurrency(maxPrice)}</p>
                  <input type="range" min="2000" max="35000" step="1000" value={maxPrice}
                    onChange={(e) => setMaxPrice(+e.target.value)} className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-silk-400" />
                </div>
              </div>
            </aside>

            {/* Hotel cards */}
            <div className="flex-1 min-w-0">
              {/* Sort Bar */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4 bg-white p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
                <p className="text-xs text-gray-500 font-medium">
                  Showing <span className="text-[#020617] font-bold font-num">{filteredHotels.length}</span> luxury stays in {form.city}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mr-1">Sort by:</span>
                  {[{ id: 'rating', label: 'Top Rated' }, { id: 'price', label: 'Cheapest' }].map(({ id, label }) => (
                    <button key={id} onClick={() => setSortBy(id)}
                      className={cn('px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all duration-300',
                        sortBy === id ? 'bg-[#020617] text-white shadow-lg' : 'text-gray-400 hover:text-[#020617] hover:bg-gray-50')}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredHotels.map((hotel, i) => (
                  <motion.div key={hotel.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden border border-transparent hover:border-gray-100 group">
                    <div className="flex flex-col sm:flex-row h-full">
                      {/* Image */}
                      <div className="relative sm:w-64 h-56 sm:h-auto shrink-0 overflow-hidden">
                        <img src={getOptimizedImageUrl(hotel.image, 600)} alt={hotel.name} loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        {hotel.badge && (
                          <div className="absolute top-4 left-4 bg-[#020617]/80 backdrop-blur-md text-silk-200 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg">
                            {hotel.badge}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <h3 className="font-display font-bold text-[#020617] text-xl tracking-tight mb-1">{hotel.name}</h3>
                              <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
                                <MapPin size={12} className="text-gray-400" /> {hotel.location}
                              </p>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0 bg-silk-100 rounded-lg px-2 py-1">
                              <span className="text-gray-400 text-[10px]">{'★'.repeat(hotel.stars)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mb-6">
                            <div className="bg-[#020617] text-white text-[11px] font-black px-2.5 py-1 rounded-lg font-num">
                              {hotel.rating}
                            </div>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest"><span className="font-num">{hotel.reviews.toLocaleString()}</span> global reviews</span>
                          </div>

                          {/* Amenities */}
                          <div className="flex flex-wrap gap-4">
                            {hotel.amenities.slice(0, 4).map((a) => {
                              const meta = AMENITY_ICONS[a];
                              if (!meta) return null;
                              const Icon = meta.icon;
                              return (
                                <span key={a} className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                  <Icon size={14} className="text-gray-300" /> {meta.label}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-end justify-between mt-8 pt-6 border-t border-gray-50">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Starting from</p>
                            <div className="flex items-baseline gap-2">
                              <span className="font-num font-black text-3xl text-[#020617]">
                                {formatCurrency(hotel.pricePerNight)}
                              </span>
                              {hotel.originalPrice && (
                                <span className="text-sm text-gray-300 line-through font-bold font-num">
                                  {formatCurrency(hotel.originalPrice)}
                                </span>
                              )}
                            </div>
                          </div>
                          <button className="bg-[#020617] hover:bg-silk-500 text-white hover:text-white px-8 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-lg shadow-navy-800/10 hover:shadow-silk-500/20 whitespace-nowrap">
                            Book Stay
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* API note */}
              <div className="mt-8 card p-5 bg-navy-50 border-navy-100">
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-navy-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500 leading-relaxed">
                    These are demo results. Integrate the{' '}
                    <a href="https://developers.booking.com/demand/en-us/" target="_blank" rel="noreferrer" className="text-gold hover:underline">Booking.com Affiliate API</a>
                    {' '}or{' '}
                    <a href="https://rapidapi.com/apidojo/api/hotels4" target="_blank" rel="noreferrer" className="text-gold hover:underline">Hotels.com via RapidAPI</a>
                    {' '}for live hotel availability and booking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </LazySection>
    </div>
  );
}
