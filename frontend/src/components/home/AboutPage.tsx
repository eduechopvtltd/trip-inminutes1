// src/components/home/AboutPage.tsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Heart, ShieldCheck, Headphones, MapPin, ArrowRight, Star,
} from 'lucide-react';
import { cn, getOptimizedImageUrl } from '@/lib/utils';
import { LazySection } from '@/components/ui/index';

const VALUES = [
  { icon: Heart,      title: 'Traveler First',      desc: 'Every decision we make is centered around giving you the best possible experience.' },
  { icon: ShieldCheck,     title: 'Trust & Transparency', desc: 'No hidden fees, honest pricing, and full clarity on what is included in your package.' },
  { icon: Headphones, title: '24/7 Support',         desc: 'Whether you\'re at the airport at 3 AM or lost in a foreign city, we\'re always one call away.' },
  { icon: MapPin,        title: 'Expert Curation',      desc: 'Every itinerary is hand-crafted by destination specialists who have been there themselves.' },
];

const TEAM = [
  { name: 'Rajiv Mehta',    role: 'Founder & CEO',           img: 'https://randomuser.me/api/portraits/men/75.jpg' },
  { name: 'Ananya Krishnan', role: 'Head of Destinations',   img: 'https://randomuser.me/api/portraits/women/60.jpg' },
  { name: 'Vikram Patel',   role: 'Corporate Travel Head',   img: 'https://randomuser.me/api/portraits/men/45.jpg' },
  { name: 'Sneha Iyer',     role: 'Customer Experience Lead', img: 'https://randomuser.me/api/portraits/women/35.jpg' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] pt-20">
      {/* Hero */}
      <section className="bg-[#F8F7F4] py-16 sm:py-24 relative overflow-hidden border-b border-navy-100/50">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,rgba(197,160,89,0.15),transparent_50%)]" />
        </div>
        <div className="container-app relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <p className="text-silk-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Our Story</p>
            <h1 className="font-display font-bold text-navy-900 text-4xl md:text-7xl leading-tight mb-8 tracking-tighter">
              We Live &<br />
              <span className="text-silk-600">Breathe Travel</span>
            </h1>
            <p className="text-navy-900/60 text-xl leading-relaxed mb-10 font-medium">
              Since 2009, TripInMinutes has been turning dream trips into unforgettable memories
              for over two million travelers across the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Link to="/packages" className="bg-silk-500 hover:bg-navy-900 text-white font-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-silk-500/20">
                Explore Packages <ArrowRight size={15} />
              </Link>
              <Link to="/contact" className="border border-navy-900/20 hover:bg-navy-900/5 text-navy-900 font-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl transition-all duration-300 uppercase tracking-widest text-xs text-center">
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <LazySection className="section bg-cream">
        <div className="container-app">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p className="text-silk-500 text-[9px] font-black uppercase tracking-[0.3em] mb-4 text-center lg:text-left">Our Evolution</p>
              <h2 className="font-display font-bold text-[#020617] text-3xl md:text-5xl mb-8 tracking-tight text-center lg:text-left leading-tight">From a Small Office to 2 Million Travelers</h2>
              <div className="space-y-6 text-gray-500 text-base leading-relaxed">
                <p>
                  TripInMinutes was founded in 2009 by a group of travel enthusiasts who believed
                  that booking a great trip should be as exciting as the trip itself. Starting from
                  a small office in Mumbai with just five team members, we began crafting bespoke
                  holiday packages for families across India.
                </p>
                <p>
                  Today, we are one of India's most trusted premium travel agencies with over
                  200 travel experts, partnerships with 5,000+ hotels worldwide, and a presence
                  across 25 cities in India. Our IATA and TAAI accreditations ensure that every
                  booking meets the highest international standards.
                </p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="relative rounded-3xl overflow-hidden" style={{ height: 'clamp(280px, 50vw, 420px)' }}>
                <img
                  src={getOptimizedImageUrl("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80", 800)}
                  alt="TripInMinutes team"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-800/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4">
                  <p className="font-display font-bold text-navy-800 text-lg">200+ Travel Experts</p>
                  <p className="text-xs text-gray-500">Hand-picked specialists across every major destination</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </LazySection>

      {/* Values */}
      <LazySection className="section bg-white">
        <div className="container-app">
          <div className="text-center mb-12">
            <p className="section-label">Our Values</p>
            <h2 className="section-title">What Drives Us Every Day</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-cream border border-gold-100 hover:border-gold-300 transition-all text-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-gold-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="text-gold-500" size={24} />
                </div>
                <h3 className="font-display font-bold text-navy-800 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-sans">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </LazySection>

      {/* Team */}
      <LazySection className="section bg-cream">
        <div className="container-app">
          <div className="text-center mb-12">
            <p className="section-label">The People Behind It</p>
            <h2 className="section-title">Meet Our Leadership Team</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM.map(({ name, role, img }, i) => (
              <motion.div key={name} custom={i} initial="hidden" whileInView="show" variants={fadeUp}
                viewport={{ once: true }} className="card p-5 text-center group hover:shadow-card-hover transition-all">
                <div className="relative mx-auto w-20 h-20 mb-4">
                  <img src={getOptimizedImageUrl(img, 200)} alt={name} loading="lazy"
                    className="w-full h-full rounded-2xl object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-silk-400 rounded-full flex items-center justify-center">
                    <Star size={10} className="text-navy-800 fill-current" />
                  </div>
                </div>
                <p className="font-display font-semibold text-navy-800 text-sm">{name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </LazySection>

      {/* CTA */}
      <section className="py-24 bg-[#F8F7F4] relative overflow-hidden border-t border-navy-100/50">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_30%_70%,rgba(197,160,89,0.15),transparent_50%)]" />
        </div>
        <div className="container-app text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display font-bold text-navy-900 text-2xl sm:text-3xl md:text-5xl mb-6 tracking-tight">
              Ready to Plan Your Next Adventure?
            </h2>
            <p className="text-navy-900/60 mb-10 text-lg max-w-xl mx-auto leading-relaxed font-medium">
              Talk to one of our expert travel consultants today. No obligation, just great advice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Link to="/packages" className="bg-silk-500 hover:bg-navy-900 text-white font-black px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl transition-all duration-300 uppercase tracking-widest text-xs shadow-xl shadow-silk-500/20 flex items-center justify-center gap-2">
                Browse Packages <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="border border-navy-900/20 hover:bg-navy-900/5 text-navy-900 font-black px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl transition-all duration-300 uppercase tracking-widest text-xs text-center">
                Contact an Expert
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
