// src/components/layout/Footer.tsx
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Youtube, Twitter, Linkedin, Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { newsletterApi } from '@/lib/api';
import toast from 'react-hot-toast';

const SERVICES = ['Tour Packages', 'Flight Booking', 'Hotel Booking', 'Corporate Travel', 'MICE Solutions', 'Visa Services', 'Travel Insurance', 'Forex'];
const DESTINATIONS = ['Maldives', 'Europe Tours', 'Dubai', 'Thailand', 'Kashmir', 'Rajasthan', 'Kerala', 'Ladakh'];
const COMPANY = ['About Us', 'Our Team', 'Careers', 'Testimonials', 'Blog', 'Media', 'Terms & Conditions', 'Privacy Policy'];

const SOCIAL = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      await newsletterApi.subscribe(email);
      toast.success('Subscribed! Welcome to the TripInMinutes family 🎉');
      setEmail('');
    } catch {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-navy-800 text-white">
      {/* Newsletter Strip */}
      <div className="bg-silk py-8 sm:py-12">
        <div className="container-app">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl md:text-3xl text-navy-800 font-bold">Get the Best Deals First</h3>
              <p className="text-navy-800/70 mt-1 text-sm">Early bird offers, flash sales, and exclusive packages — right in your inbox.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:min-w-[380px]">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 px-5 py-3 rounded-full text-navy-800 text-sm font-medium outline-none focus:ring-2 focus:ring-navy/30"
                required
              />
              <button
                type="submit"
                disabled={subscribing}
                className="flex items-center gap-2 bg-navy-800 text-white px-5 py-3 rounded-full text-sm font-semibold hover:bg-navy-700 transition-colors disabled:opacity-60 whitespace-nowrap"
              >
                <Send size={14} />
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-app py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center mb-6 group transition-transform hover:scale-105">
              <img src="/assets/logo-white.png" alt="TripInMinutes" className="h-12 w-auto object-contain" />
            </Link>
            <p className="text-white/55 text-sm leading-relaxed mb-5 max-w-xs">
              Crafting extraordinary travel experiences since 2009. Your journey is our passion — from the first search to the last memory.
            </p>
            <div className="flex gap-3 mb-6">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-10 h-10 rounded-xl bg-white/8 hover:bg-silk hover:text-navy-800 flex items-center justify-center text-white/60 transition-all duration-200 active:scale-90">
                  <Icon size={18} />
                </a>
              ))}
            </div>
            <div className="space-y-3.5 text-sm text-white/55">
              <div className="flex items-start gap-2.5">
                <Phone size={13} className="text-silk-200 mt-0.5 shrink-0" />
                <div className="flex flex-col gap-1">
                  <span className="font-num">+91 74116 05384</span>
                  <span className="font-num">+91 86600 47495</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail size={13} className="text-silk-200 mt-0.5 shrink-0" />
                <span>hello@tripinminutes.in</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin size={13} className="text-silk-200 mt-0.5 shrink-0" />
                <div className="flex flex-col gap-2">
                  <p><strong>Bangalore:</strong> 1009 B Wing, 10th Floor, Mittal Tower, MG Road - 560001</p>
                  <p><strong>Mumbai:</strong> Office 230, 2nd floor, Sudama Space, Virar West - 401303</p>
                </div>
              </div>
            </div>
          </div>

          {/* Links */}
          {[{ 
            title: 'Services', 
            items: [
              { label: 'Tour Packages', href: '/packages' },
              { label: 'Flight Booking', href: '/flights' },
              { label: 'Hotel Booking', href: '/hotels' },
              { label: 'Corporate Travel', href: '/packages?type=CORPORATE' },
              { label: 'MICE Solutions', href: '/contact' },
              { label: 'Visa Services', href: '/contact' },
            ] 
          }, { 
            title: 'Destinations', 
            items: [
              { label: 'Maldives', href: '/packages?search=Maldives' },
              { label: 'Europe Tours', href: '/packages?search=Europe' },
              { label: 'Dubai', href: '/packages?search=Dubai' },
              { label: 'Thailand', href: '/packages?search=Thailand' },
              { label: 'Kerala', href: '/packages?search=Kerala' },
              { label: 'Kashmir', href: '/packages?search=Kashmir' },
            ] 
          }, { 
            title: 'Company', 
            items: [
              { label: 'About Us', href: '/about' },
              { label: 'Our Team', href: '/about' },
              { label: 'Terms & Conditions', href: '/terms' },
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Contact Us', href: '/contact' },
            ] 
          }].map(({ title, items }) => (
            <div key={title}>
              <h4 className="text-[11px] font-bold tracking-[0.15em] uppercase text-silk-200 mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link to={item.href} className="text-sm text-white/55 hover:text-silk-200 transition-colors flex items-center gap-1.5 group">
                      <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-200 text-silk-200">›</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-white/8">
        <div className="container-app py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs text-center sm:text-left">
            © <span className="font-num">2026</span> TripInMinutes Pvt. Ltd. All rights reserved. IATA Accredited · TAAI Member
          </p>
          <div className="flex items-center gap-3">
            {['IATA', 'TAAI', 'ATOL'].map((badge) => (
              <span key={badge} className="text-[11px] font-bold text-white/30 border border-white/15 px-2.5 py-1 rounded">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
