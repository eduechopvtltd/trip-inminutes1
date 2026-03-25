import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, ArrowLeftRight, Search, Clock, Zap,
  ChevronDown, Info, Star, Wifi, Utensils, Luggage,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { LazySection, LoadingScreen } from '@/components/ui/index';
import { useFlightSearch } from '@/hooks/index';
import indigoLogo from '@/assets/airlines/indigo.png';
import airindiaLogo from '@/assets/airlines/airindia.png';
import emiratesLogo from '@/assets/airlines/emirates.png';
import spicejetLogo from '@/assets/airlines/spicejet.png';

// ── Airline mapping for demo
const AIRLINE_MAP: Record<string, { name: string; logo: string }> = {
  '6E': { name: 'IndiGo', logo: indigoLogo },
  'AI': { name: 'Air India', logo: airindiaLogo },
  'EK': { name: 'Emirates', logo: emiratesLogo },
  'SG': { name: 'SpiceJet', logo: spicejetLogo },
};

// ── Data Transformer: Amadeus Flight Offer -> UI Flight
const transformFlight = (offer: any) => {
  const itinerary = offer.itineraries?.[0];
  const firstSegment = itinerary?.segments?.[0];
  const lastSegment = itinerary?.segments?.[itinerary.segments.length - 1];
  const carrier = AIRLINE_MAP[firstSegment?.carrierCode] || { name: firstSegment?.carrierCode || 'Airline', logo: indigoLogo };

  return {
    id: offer.id,
    airline: carrier.name,
    logo: carrier.logo,
    flightNo: `${firstSegment?.carrierCode}-${firstSegment?.number}`,
    from: firstSegment?.departure?.iataCode,
    to: lastSegment?.arrival?.iataCode,
    dep: firstSegment?.departure?.at?.split('T')?.[1]?.slice(0, 5) || '00:00',
    arr: lastSegment?.arrival?.at?.split('T')?.[1]?.slice(0, 5) || '00:00',
    duration: itinerary?.duration?.replace('PT', '').toLowerCase() || 'N/A',
    stops: itinerary?.segments?.length - 1,
    price: Number(offer.price?.total || 0),
    class: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'Economy',
    seatsLeft: offer.numberOfBookableSeats || 0,
    amenities: ['meals', 'wifi'], // Amadeus Basic Search doesn't give amenities without extra calls
    raw: offer, // keep raw for pricing/booking
  };
};

const SORT_OPTS = [
  { id: 'price',    label: 'Cheapest' },
  { id: 'duration', label: 'Fastest' },
  { id: 'dep',      label: 'Departure' },
];

export default function FlightsPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    from: searchParams.get('from') || 'Delhi (DEL)',
    to: searchParams.get('to') || 'Dubai (DXB)',
    depart: searchParams.get('depart') || '',
    returnDate: searchParams.get('return') || '',
    passengers: searchParams.get('passengers') || '1',
    travelClass: searchParams.get('class') || 'Economy',
    tripType: (searchParams.get('return') ? 'round-trip' : 'one-way') as 'one-way' | 'round-trip',
  });
  const [searched, setSearched] = useState(!!searchParams.get('from'));
  const [sortBy, setSortBy] = useState('price');
  const [stopFilter, setStopFilter] = useState<number | null>(null);

  // Re-run search if URL params change
  useEffect(() => {
    if (searchParams.get('from')) {
      setForm({
        from: searchParams.get('from') || '',
        to: searchParams.get('to') || '',
        depart: searchParams.get('depart') || '',
        returnDate: searchParams.get('return') || '',
        passengers: searchParams.get('passengers') || '1',
        travelClass: searchParams.get('class') || 'Economy',
        tripType: (searchParams.get('return') ? 'round-trip' : 'one-way') as 'one-way' | 'round-trip',
      });
      setSearched(true);
    }
  }, [searchParams]);

  // Extract IATA code from "City (IATA)" format
  const getIATA = (val: string) => val.match(/\(([A-Z]{3})\)/)?.[1] || val.slice(0, 3).toUpperCase();

  const { data: rawFlights, isLoading, isError, error } = useFlightSearch({
    origin: getIATA(form.from),
    destination: getIATA(form.to),
    departureDate: form.depart,
    adults: parseInt(form.passengers),
    travelClass: form.travelClass.toUpperCase(),
    enabled: searched && !!form.depart,
  });

  const flights = (rawFlights || []).map(transformFlight);

  const filteredFlights = flights
    .filter((f: any) => stopFilter === null || f.stops === stopFilter)
    .sort((a: any, b: any) => sortBy === 'price' ? a.price - b.price : a.duration.localeCompare(b.duration));

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
                Flight <span className="text-silk-600">Search</span>
              </h1>
              <p className="text-navy-900/60 text-sm max-w-xs lowercase first-letter:uppercase">Premium air travel curated for your bespoke journey.</p>
            </div>

            <div className="flex bg-navy-900/5 backdrop-blur-md rounded-xl p-1 border border-navy-900/10 w-fit">
              {(['one-way', 'round-trip'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setForm((f) => ({ ...f, tripType: t }))}
                  className={cn(
                    'px-6 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all duration-300',
                    form.tripType === t
                      ? 'bg-silk-500 text-white shadow-lg shadow-silk-500/20'
                      : 'text-navy-900/60 hover:text-navy-900 hover:bg-navy-900/5'
                  )}
                >
                  {t === 'one-way' ? 'One Way' : 'Round Trip'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-navy-100/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400 ml-1">From</label>
                <div className="relative">
                  <input value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-semibold text-navy-800 focus:ring-2 focus:ring-[#C5A059]/30 transition-all outline-none" placeholder="Origin city" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400 ml-1">To</label>
                <div className="relative">
                  <input value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-semibold text-navy-800 focus:ring-2 focus:ring-[#C5A059]/30 transition-all outline-none pr-10" placeholder="Destination" />
                  <button
                    onClick={() => setForm((f) => ({ ...f, from: f.to, to: f.from }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-silk-500 transition-colors">
                    <ArrowLeftRight size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400 ml-1">Departure</label>
                <input type="date" value={form.depart}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm({ ...form, depart: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-semibold text-navy-800 focus:ring-2 focus:ring-[#C5A059]/30 transition-all outline-none" />
              </div>

              {form.tripType === 'round-trip' ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400 ml-1">Return</label>
                  <input type="date" value={form.returnDate}
                    min={form.depart || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-semibold text-navy-800 focus:ring-2 focus:ring-[#C5A059]/30 transition-all outline-none" />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400 ml-1">Travellers & Class</label>
                  <select value={`${form.passengers} · ${form.travelClass}`}
                    onChange={(e) => {
                      const [p, c] = e.target.value.split(' · ');
                      setForm({ ...form, passengers: p, travelClass: c });
                    }}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-semibold text-navy-800 focus:ring-2 focus:ring-[#C5A059]/30 transition-all outline-none appearance-none">
                    {['1 · Economy', '2 · Economy', '1 · Business', '2 · Business', '1 · First Class'].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={() => setSearched(true)}
                className="flex items-center justify-center gap-2 bg-[#020617] hover:bg-silk-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-silk-600/20"
              >
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
            <Plane size={48} className="text-gray-200 mx-auto mb-4" />
            <h2 className="font-display text-xl text-navy-800 mb-2">Find your perfect flight</h2>
            <p className="text-gray-500 text-sm">Enter your departure and destination above to see available flights.</p>
            <div className="mt-6 grid grid-cols-3 gap-4 max-w-sm mx-auto text-center">
              {[['500+', 'Airlines'], ['200+', 'Destinations'], ['24/7', 'Support']].map(([n, l]) => (
                <div key={l} className="card p-3">
                  <div className="font-display font-bold text-gray-400 text-lg font-num">{n}</div>
                  <div className="text-xs text-gray-500">{l}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex gap-6">
            <aside className="hidden md:block w-64 shrink-0">
              <div className="bg-white rounded-2xl p-6 sticky top-28 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-50">
                <h3 className="font-display font-semibold text-[#020617] text-lg mb-6">Refine Search</h3>
                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400 mb-4">Stops</p>
                    <div className="space-y-2">
                      {[[null, 'Any'], [0, 'Non-stop'], [1, '1 Stop']].map(([val, label]) => (
                        <label key={String(label)} className="flex items-center gap-3 py-1 cursor-pointer group">
                          <input type="radio" name="stops" checked={stopFilter === val}
                            onChange={() => setStopFilter(val as number | null)} className="accent-silk-400 w-4 h-4" />
                          <span className="text-sm text-gray-600 group-hover:text-[#020617] transition-colors">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400 mb-4">Price Range</p>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[11px] font-semibold text-gray-500">
                        <span className="font-num">₹9,899</span>
                        <span className="font-num">₹18,750</span>
                      </div>
                      <input type="range" min="9000" max="20000" defaultValue="20000"
                        className="w-full accent-silk-400 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 bg-white p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
                <p className="text-xs text-gray-500 font-medium">
                  Showing <span className="text-[#020617] font-bold font-num">{filteredFlights.length}</span> bespoke flight options
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full sm:w-auto">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mr-1 shrink-0">Sort:</span>
                  {SORT_OPTS.map(({ id, label }) => (
                    <button key={id} onClick={() => setSortBy(id)}
                      className={cn('px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all duration-300',
                        sortBy === id ? 'bg-[#020617] text-white shadow-lg' : 'text-gray-400 hover:text-[#020617] hover:bg-gray-50')}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

                {isLoading && (
                  <div className="py-20 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <LoadingScreen className="h-20" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-4">Curating your bespoke flight options...</p>
                  </div>
                )}

                {isError && (
                  <div className="py-20 text-center bg-white rounded-2xl border border-red-50">
                    <p className="text-red-500 font-bold mb-2">Search failed</p>
                    <p className="text-gray-500 text-sm">{(error as any)?.message || 'Something went wrong while fetching flights.'}</p>
                    <button onClick={() => setSearched(true)} className="mt-4 text-silk-500 font-bold text-xs uppercase tracking-widest">Try again</button>
                  </div>
                )}

                {!isLoading && !isError && filteredFlights.length === 0 && searched && (
                  <div className="py-20 text-center bg-white rounded-2xl border border-gray-100">
                    <Plane size={32} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-800 font-bold mb-1">No flights found</p>
                    <p className="text-gray-500 text-sm">Try adjusting your filters or search criteria.</p>
                  </div>
                )}

                {!isLoading && !isError && filteredFlights.map((flight: any, i: number) => (
                  <motion.div
                    key={flight.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl p-4 sm:p-6 mb-4 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 border border-transparent hover:border-gray-100 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-8 flex-wrap lg:flex-nowrap">
                      <div className="flex items-center gap-4 min-w-[160px]">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden p-2 group-hover:bg-white transition-colors duration-500 ring-1 ring-gray-100/50 shrink-0">
                          <img src={flight.logo} alt={flight.airline} loading="lazy"
                            className="w-full h-full object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 ease-in-out" />
                        </div>
                        <div>
                          <p className="font-display font-bold text-[#020617] text-sm tracking-tight">{flight.airline}</p>
                          <p className="text-[10px] font-black tracking-widest text-gray-300 uppercase">{flight.flightNo}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-center min-w-0">
                        <div className="text-right">
                          <p className="font-display font-black text-2xl text-[#020617] tracking-tight font-num">{flight.dep}</p>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{flight.from}</p>
                        </div>
                        <div className="flex flex-col items-center flex-1 max-w-[140px]">
                          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mb-1 font-num">{flight.duration}</p>
                          <div className="relative w-full flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full h-[1.5px] bg-gray-100" />
                            </div>
                            <div className="relative z-10 bg-white px-2">
                              <Plane size={14} className="text-gray-400 transform rotate-45" />
                            </div>
                          </div>
                          <p className={cn('text-[9px] font-black uppercase tracking-[0.15em] mt-3', flight.stops === 0 ? 'text-emerald-500' : 'text-amber-500')}>
                            {flight.stops === 0 ? 'Non-stop' : <><span className="font-num">{flight.stops}</span> stop</>}
                          </p>
                        </div>
                        <div>
                          <p className="font-display font-black text-2xl text-[#020617] tracking-tight font-num">{flight.arr}</p>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{flight.to}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 lg:pl-8 lg:border-l lg:border-gray-100 w-full lg:w-auto pt-4 sm:pt-6 lg:pt-0 border-t lg:border-t-0 border-gray-50">
                        <div className="text-left lg:text-right min-w-[100px] lg:min-w-[120px]">
                          <div className="font-display font-black text-xl lg:text-2xl text-[#020617] font-num">{formatCurrency(flight.price)}</div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{flight.class}</p>
                        </div>
                        <button className="bg-[#020617] hover:bg-silk-500 text-white hover:text-white px-6 lg:px-8 py-3 lg:py-3.5 rounded-xl text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-lg shadow-navy-800/10 hover:shadow-silk-500/20 whitespace-nowrap">
                          Book Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 card p-5 bg-navy-50 border-navy-100">
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-navy-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-navy-800 mb-1">Live Flight Data</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      These are demo results. Integrate the Amadeus Self-Service API to display real-time availability and pricing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </LazySection>
    </div>
  );
}
