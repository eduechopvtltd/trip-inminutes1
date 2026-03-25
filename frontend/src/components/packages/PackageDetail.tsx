import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Clock, Users, MapPin, Check, X as XIcon,
  Heart, Share2, ChevronDown, ChevronRight, Loader2,
  Phone, MessageCircle, Calendar, ShieldCheck, CreditCard
} from 'lucide-react';
import { usePackage, useCreateBooking, useWishlist, useCreatePaymentOrder, useVerifyPayment } from '@/hooks/index';
import { useAuthStore } from '@/store/auth.store';
import { formatCurrency, formatDate, cn, getOptimizedImageUrl } from '@/lib/utils';
import EnquirySidebar from './EnquirySidebar';

// Helper to load Razorpay script
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PackageDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: pkg, isLoading, error } = usePackage(slug ?? '');
  const { mutateAsync: createBooking } = useCreateBooking();
  const { mutateAsync: createOrder } = useCreatePaymentOrder();
  const { mutateAsync: verifyPayment } = useVerifyPayment();
  const { isAuthenticated, user } = useAuthStore();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [isProcessing, setIsProcessing] = useState(false);

  const [activeImg, setActiveImg] = useState(0);
  const [openDay, setOpenDay] = useState<number | null>(0);
  const [bookingForm, setBookingForm] = useState({
    travelDate: '',
    adults: 2,
    children: 0,
    specialRequests: '',
  });

  if (isLoading) return (
    <div className="min-h-screen bg-cream pt-20 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-silk-500" />
    </div>
  );
  if (error || !pkg) return (
    <div className="min-h-screen bg-[#FDFCFB] pt-20 flex items-center justify-center">
      <div className="text-center">
        <p className="text-2xl mb-4">😔</p>
        <h2 className="font-display text-xl text-[#020617] mb-2">Package not found</h2>
        <Link to="/packages" className="btn btn-navy">Browse All Packages</Link>
      </div>
    </div>
  );

  const displayPrice = pkg.discountedPrice ?? pkg.basePrice;
  const totalPrice = displayPrice * (bookingForm.adults + bookingForm.children * 0.5);
  const allImages = [pkg.coverImage, ...pkg.images].filter(Boolean);
  const isFav = isInWishlist(pkg.id);

  const handleBook = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!bookingForm.travelDate) { alert('Please select travel date'); return; }
    
    setIsProcessing(true);
    try {
      // 1. Create Booking
      const booking = await createBooking({
        packageId: pkg.id,
        bookingType: 'PACKAGE',
        travelDate: new Date(bookingForm.travelDate).toISOString(),
        adults: bookingForm.adults,
        children: bookingForm.children,
        infants: 0,
        travelers: Array.from({ length: bookingForm.adults }, (_, i) => ({
          firstName: `Adult ${i + 1}`,
          lastName: 'Traveler',
        })),
        specialRequests: bookingForm.specialRequests,
      });

      // 2. Load Razorpay
      const res = await loadRazorpay();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }

      // 3. Create Razorpay Order
      const order = await createOrder({
        bookingId: booking.id,
        amount: totalPrice,
      });

      // 4. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: order.amount,
        currency: order.currency,
        name: 'TripInMinutes',
        description: `Booking for ${pkg.title}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            navigate('/dashboard/bookings');
          } catch (err) {
            console.error('Payment verification failed', err);
            alert('Payment verification failed. Please contact support.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${user?.firstName} ${user?.lastName}`,
          email: user?.email,
        },
        theme: {
          color: '#020617',
        },
      };

      const rzp = (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Booking/Payment Flow Error:', err);
      alert('Something went wrong during booking. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pt-24">
      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-navy-900/60 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 text-center"
          >
            <div className="bg-[#020617] p-10 rounded-3xl shadow-2xl border border-white/10 max-w-sm w-full">
              <Loader2 size={48} className="animate-spin text-silk-500 mx-auto mb-6" />
              <h3 className="font-display font-bold text-2xl mb-2">Securing your journey</h3>
              <p className="text-white/60 text-sm leading-relaxed lowercase first-letter:uppercase">Please do not refresh. We are connecting with the payment gateway...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Image Gallery - Contained & Premium */}
      <div className="container-app pt-6">
        <div className="bg-navy-900 relative overflow-hidden rounded-[32px] group shadow-2xl border border-navy-900/5" style={{ height: 'clamp(400px, 60vh, 600px)' }}>
          <motion.img
            key={activeImg}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            src={allImages[activeImg]}
            alt={pkg.title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/10 to-transparent" />
          
          {/* Thumbnails - Refined Glassmorphic style */}
          {allImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 p-2.5 glass-dark rounded-2xl backdrop-blur-xl border border-white/10">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    'w-16 h-12 rounded-xl overflow-hidden border-2 transition-all duration-300', 
                    i === activeImg ? 'border-silk-400 scale-110' : 'border-transparent opacity-50 hover:opacity-100'
                  )}
                >
                  <img src={getOptimizedImageUrl(img, 800)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Badge - Luxury Style */}
          {pkg.badge && (
            <div className="absolute top-8 left-8">
              <span className="px-4 py-1.5 bg-silk-200 text-navy text-[10px] font-bold tracking-[0.2em] uppercase rounded-full shadow-lg border border-white/20">
                {pkg.badge}
              </span>
            </div>
          )}

          {/* Action btns */}
          <div className="absolute top-8 right-8 flex gap-3">
            <button
              onClick={() => toggleWishlist(pkg.id)}
              className={cn('p-3 rounded-full backdrop-blur-md transition-all border border-white/20 shadow-lg', isFav ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20')}
            >
              <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
            </button>
            <button className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/20 shadow-lg">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-app py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          {/* Left column — details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-silk-600 text-[10px] font-bold tracking-[0.25em] uppercase mb-4">
                <MapPin size={12} className="text-silk-500" /> {pkg.destination.name}, {pkg.destination.country}
              </div>
              <h1 className="font-display font-medium text-navy tracking-tight leading-[1.1] mb-6" style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}>
                {pkg.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-400" /> <span className="font-num">{pkg.duration}N / {pkg.duration + 1}D</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-gray-400" /> Up to <span className="font-num">{pkg.maxGroupSize}</span> people
                </span>
                <span className="flex items-center gap-1.5">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="font-num">{pkg.averageRating.toFixed(1)}</span> (<span className="font-num">{pkg.reviewCount}</span> reviews)
                </span>
              </div>
            </div>

            {/* Highlights */}
            <div className="card p-6">
              <h2 className="font-display font-semibold text-navy-800 text-lg mb-4">Package Highlights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {pkg.highlights.map((h) => (
                  <div key={h} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={11} className="text-emerald-600" />
                    </div>
                    {h}
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="section-title text-2xl mb-4">About This Package</h2>
              <p className="text-gray-600 leading-relaxed text-base italic font-serif opacity-80 mb-4 border-l-2 border-silk-200 pl-6">
                Discover the essence of {pkg.destination.name} through this curated experience, designed for those who appreciate the finer details of travel.
              </p>
              <p className="text-gray-600 leading-relaxed text-sm">{pkg.description}</p>
            </div>

            {/* Itinerary */}
            <div>
              <h2 className="font-display font-semibold text-[#020617] text-lg mb-4">Day-by-Day Itinerary</h2>
              <div className="space-y-2">
                {(pkg.itinerary as Array<{ day: number; title: string; description: string; activities: string[] }>).map((day) => (
                  <div key={day.day} className="border border-gray-100 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setOpenDay(openDay === day.day ? null : day.day)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-silk-500/10 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-silk-600 font-num">D{day.day}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#020617] text-sm">{day.title}</p>
                        <p className="text-xs text-gray-400 clamp-1">{day.description}</p>
                      </div>
                      <ChevronDown
                        size={16}
                        className={cn('text-gray-400 transition-transform shrink-0', openDay === day.day && 'rotate-180')}
                      />
                    </button>
                    {openDay === day.day && (
                      <div className="px-5 pb-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 mb-3 mt-3">{day.description}</p>
                        {day.activities.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {day.activities.map((act) => (
                              <span key={act} className="text-xs bg-navy-50 text-navy-700 px-3 py-1 rounded-full">
                                {act}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions / Exclusions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="card p-5">
                <h3 className="font-semibold text-navy-800 text-sm mb-3 flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" /> Inclusions
                </h3>
                <ul className="space-y-2">
                  {pkg.inclusions.map((inc) => (
                    <li key={inc} className="text-xs text-gray-600 flex items-start gap-2">
                      <Check size={11} className="text-emerald-500 mt-0.5 shrink-0" /> {inc}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-5">
                <h3 className="font-semibold text-navy-800 text-sm mb-3 flex items-center gap-2">
                  <XIcon size={14} className="text-red-400" /> Exclusions
                </h3>
                <ul className="space-y-2">
                  {pkg.exclusions.map((exc) => (
                    <li key={exc} className="text-xs text-gray-600 flex items-start gap-2">
                      <XIcon size={11} className="text-red-400 mt-0.5 shrink-0" /> {exc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right column — Booking card */}
          <div>
            <div className="card p-6 sticky top-24">
              {/* Price */}
              <div className="mb-5">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Starting from</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-num font-black text-3xl text-[#020617]">
                    {formatCurrency(displayPrice)}
                  </span>
                  {pkg.discountedPrice && (
                    <span className="text-sm text-gray-400 line-through font-num">{formatCurrency(pkg.basePrice)}</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">per person</p>
              </div>

              {/* Booking form */}
              <div className="space-y-3 mb-5">
                <div>
                  <label className="input-label">Travel Date</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingForm.travelDate}
                      onChange={(e) => setBookingForm((f) => ({ ...f, travelDate: e.target.value }))}
                      className="input-field pl-9 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="input-label">Adults</label>
                    <select
                      value={bookingForm.adults}
                      onChange={(e) => setBookingForm((f) => ({ ...f, adults: +e.target.value }))}
                      className="input-field text-sm"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Children</label>
                    <select
                      value={bookingForm.children}
                      onChange={(e) => setBookingForm((f) => ({ ...f, children: +e.target.value }))}
                      className="input-field text-sm"
                    >
                      {[0, 1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="input-label">Special Requests</label>
                  <textarea
                    value={bookingForm.specialRequests}
                    onChange={(e) => setBookingForm((f) => ({ ...f, specialRequests: e.target.value }))}
                    placeholder="Dietary requirements, room preferences…"
                    rows={3}
                    className="input-field text-sm resize-none"
                  />
                </div>
              </div>

              {/* Total */}
              {bookingForm.travelDate && (
                <div className="bg-cream rounded-xl p-3.5 mb-4 text-sm">
                  <div className="flex justify-between text-gray-600 mb-1.5">
                    <span><span className="font-num">{bookingForm.adults}</span> adult × <span className="font-num">{formatCurrency(displayPrice)}</span></span>
                    <span className="font-num">{formatCurrency(displayPrice * bookingForm.adults)}</span>
                  </div>
                  {bookingForm.children > 0 && (
                    <div className="flex justify-between text-gray-600 mb-1.5">
                      <span><span className="font-num">{bookingForm.children}</span> child × <span className="font-num">50%</span></span>
                      <span className="font-num">{formatCurrency(displayPrice * bookingForm.children * 0.5)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-navy-800 pt-1.5 border-t border-gray-200 mt-1.5">
                    <span>Total</span>
                    <span className="font-num">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              )}

                {/* Action Buttons */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleBook}
                    disabled={isProcessing}
                    className="w-full bg-navy hover:bg-navy-800 text-white font-bold py-5 rounded-full transition-all duration-300 shadow-xl hover:shadow-navy/20 flex items-center justify-center gap-3 uppercase tracking-[0.15em] text-[10px]"
                  >
                    {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={14} />}
                    {isProcessing ? 'Processing Securely...' : 'Confirm & Reserve Now'}
                  </button>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <a href="tel:+917411605384" 
                        className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-full border border-navy-100 text-navy text-[10px] font-bold uppercase tracking-wider hover:bg-navy-50 transition-all">
                        <Phone size={12} className="text-silk-500" /> Call Concierge
                      </a>
                      <a href="https://wa.me/917411605384" target="_blank" rel="noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-full bg-[#25D366] text-white text-[10px] font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-[#25D366]/20 transition-all">
                        <MessageCircle size={12} fill="currentColor" /> WhatsApp
                      </a>
                    </div>
                    
                    <div className="pt-2">
                       <EnquirySidebar packageId={pkg.id} packageName={pkg.title} />
                    </div>
                  </div>
                </div>

              <p className="text-[10px] text-gray-400 text-center mt-6 leading-relaxed opacity-60">
                Secure SSL Encrypted Payment via Razorpay.<br/>
                Your journey is protected by our luxury concierge standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
