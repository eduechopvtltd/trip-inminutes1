// src/components/layout/AuthLayout.tsx
import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 sm:p-12 overflow-hidden bg-silk-200">
      {/* Cinematic Background Layer with Light Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-gradient-to-br from-white/95 via-silk-50/70 to-white/95 z-10" /* Light Airy Overlay */
        />
        <img 
          src="https://images.unsplash.com/photo-1544620347-c4fd4aae3185?auto=format&fit=crop&q=80&w=2000" 
          alt="Luxury Destination" 
          className="w-full h-full object-cover scale-105 animate-subtle-zoom opacity-30" /* Lower opacity for light theme */
        />
      </div>

      {/* Decorative Brand Element (Floating Logo) - Color version for light theme */}
      <div className="absolute top-8 left-8 z-20 hidden lg:block">
        <Link to="/" className="flex items-center group transition-transform hover:scale-105">
          <img src="/assets/logo-color.png" alt="TripInMinutes" className="h-10 w-auto object-contain" />
        </Link>
      </div>

      {/* Main Content Card (Outlet) */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Mobile Centralized Logo */}
        <div className="flex justify-center mb-10 lg:hidden">
          <Link to="/">
            <img src="/assets/logo-color.png" alt="TripInMinutes" className="h-12 w-auto object-contain" />
          </Link>
        </div>
        
        <div className="bg-white/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden border border-white/60">
          <div className="relative z-10">
            <Outlet />
          </div>
          
          {/* Subtle internal glow decoration - soft gold tints */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-silk-400/20 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
