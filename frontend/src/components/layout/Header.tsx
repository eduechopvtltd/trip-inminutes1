// src/components/layout/Header.tsx
import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Hotel, Map, Briefcase, Tag, PhoneCall, Phone,
  Search, Heart, Bell, User, Menu, X, ChevronDown,
  LogOut, LayoutDashboard, Settings, Package,
} from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store/auth.store';
import { useAuth } from '@/hooks/index';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Tours', href: '/packages', icon: Map },
  { label: 'Flights', href: '/flights', icon: Plane },
  { label: 'Hotels', href: '/hotels', icon: Hotel },
  { label: 'Corporate', href: '/contact?type=corporate', icon: Briefcase },
  { label: 'Deals', href: '/packages?featured=true', icon: Tag },
  { label: 'About', href: '/about', icon: null },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { mobileNavOpen, setMobileNavOpen } = useUIStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Solid header for internal pages, transparent for home until scroll
  const isTransparent = isHomePage && !scrolled && !mobileNavOpen;

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-400',
          !isTransparent
            ? 'bg-white shadow-[0_4px_25px_rgba(0,0,0,0.03)] border-b border-gray-100/60'
            : 'bg-transparent',
        )}
      >
        <div className="container-app">
          <div className={cn(
            'flex items-center transition-all duration-300', 
            (!isTransparent || scrolled) ? 'h-[68px]' : 'h-20'
          )}>
            {/* 3-Column Grid for Stable Centering */}
            <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center">
              
              {/* Logo (Left Column) */}
              <div className="flex justify-start">
                <Link to="/" className="flex items-center group transition-transform hover:scale-105">
                  <img 
                    src={isTransparent ? "/assets/logo-white.png" : "/assets/logo-color.png"} 
                    alt="TripInMinutes" 
                    className={cn(
                      "h-12 w-auto object-contain transition-all duration-300",
                      scrolled ? "h-10" : "h-12"
                    )} 
                  />
                </Link>
              </div>

              {/* Desktop Nav (Center Column) - Absolute/Perfect Centering */}
              <div className="hidden lg:flex items-center justify-center">
                <nav className={cn(
                  'rounded-full px-2 py-1.5 flex items-center gap-1 transition-all duration-300',
                  isTransparent ? 'glass' : 'bg-gray-100/50 border border-gray-200/50'
                )}>
                  {NAV_LINKS.map(({ label, href }) => {
                    const isActiveLink = label === 'Tours' 
                      ? location.pathname === '/packages' && !location.search.includes('featured=true')
                      : label === 'Deals'
                        ? location.pathname === '/packages' && location.search.includes('featured=true')
                        : location.pathname === href;

                    return (
                      <NavLink
                        key={label}
                        to={href}
                        className={cn(
                          'px-5 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300',
                          isActiveLink
                            ? isTransparent 
                              ? 'bg-white/20 text-white shadow-lg shadow-white/5' 
                              : 'bg-navy-900 text-white shadow-lg shadow-navy-900/20'
                            : isTransparent
                              ? 'text-white/70 hover:text-white hover:bg-white/10'
                              : 'text-navy-950 hover:text-navy-900 hover:bg-white',
                        )}
                      >
                        {label}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              {/* Right CTA (Right Column) */}
              <div className="flex items-center justify-end gap-3 sm:gap-6">
               {/* Removed phone number link */}

              {isAuthenticated ? (
                <>
                  {/* Wishlist */}
                  <button
                    onClick={() => navigate('/dashboard/wishlist')}
                    className={cn('p-2 rounded-xl transition-colors hidden sm:flex',
                      isTransparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-navy hover:bg-navy-50')}
                  >
                    <Heart size={18} />
                  </button>

                  {/* Notifications */}
                  <button
                    onClick={() => navigate('/dashboard/notifications')}
                    className={cn('p-2 rounded-xl transition-colors hidden sm:flex relative',
                      isTransparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-navy hover:bg-navy-50')}
                  >
                    <Bell size={18} />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-silk-500 rounded-full" />
                  </button>

                  {/* User Menu */}
                  <div ref={userMenuRef} className="relative">
                    <button
                      onClick={() => setUserMenuOpen((o) => !o)}
                      className={cn('flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all',
                        isTransparent
                          ? 'text-white hover:bg-white/10'
                          : 'text-navy hover:bg-navy-50 border border-transparent hover:border-navy-100')}
                    >
                      <div className="w-7 h-7 bg-silk-200 rounded-lg flex items-center justify-center text-navy-800 font-bold text-xs">
                        {user?.firstName[0]}{user?.lastName[0]}
                      </div>
                      <span className="hidden md:block">{user?.firstName}</span>
                      <ChevronDown size={14} className={cn('transition-transform', userMenuOpen && 'rotate-180')} />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-card-hover border border-navy-800/5 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-navy-800">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          </div>
                          <div className="py-1">
                            {[
                              { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
                              { icon: Package, label: 'My Bookings', to: '/dashboard/bookings' },
                              { icon: Heart, label: 'Wishlist', to: '/dashboard/wishlist' },
                              { icon: Settings, label: 'Profile', to: '/dashboard/profile' },
                              ...(user?.role === 'ADMIN' ? [{ icon: LayoutDashboard, label: 'Admin Panel', to: '/admin/dashboard' }] : []),
                            ].map(({ icon: Icon, label, to }) => (
                              <Link
                                key={to}
                                to={to}
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream hover:text-navy transition-colors"
                              >
                                <Icon size={15} className="text-silk-500" />
                                {label}
                              </Link>
                            ))}
                          </div>
                          <div className="py-1 border-t border-gray-100">
                            <button
                              onClick={() => { logout(); setUserMenuOpen(false); }}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                            >
                              <LogOut size={15} />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  {/* Removed Already Booked? link */}
                  
                  <button
                    className={cn('p-2.5 rounded-full transition-all border shrink-0',
                      isTransparent 
                        ? 'border-white/30 text-white hover:bg-white/10' 
                        : 'border-navy-200 text-navy-800 hover:bg-navy-50')}
                  >
                    <Package size={18} />
                  </button>

                  <Link to="/register" className="btn btn-gold btn-sm hidden md:flex shrink-0">
                    Sign Up
                  </Link>
                </>
              )}

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className={cn('lg:hidden p-2 rounded-xl ml-1 transition-colors',
                  isTransparent ? 'text-white hover:bg-white/10' : 'text-navy hover:bg-navy-50')}
              >
                {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white z-50 lg:hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <span className="font-display font-bold text-navy-800">Menu</span>
                <button onClick={() => setMobileNavOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                {NAV_LINKS.map(({ label, href, icon: Icon }) => {
                  const isActiveLink = label === 'Tours' 
                    ? location.pathname === '/packages' && !location.search.includes('featured=true')
                    : label === 'Deals'
                      ? location.pathname === '/packages' && location.search.includes('featured=true')
                      : location.pathname === href;

                  return (
                    <NavLink
                      key={label}
                      to={href}
                      onClick={() => setMobileNavOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-5 py-4 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300',
                        isActiveLink
                          ? 'bg-cream text-navy'
                          : 'text-gray-700 hover:bg-cream hover:text-navy'
                      )}
                    >
                      {Icon && <Icon size={20} className={cn(isActiveLink ? 'text-navy' : 'text-silk-500')} />}
                      <span className="text-[11px] font-bold tracking-[0.2em] uppercase">{label}</span>
                    </NavLink>
                  );
                })}
              </div>
              <div className="p-6 border-t border-gray-100 space-y-3 mt-auto">
                {isAuthenticated ? (
                  <button onClick={logout} className="w-full btn btn-outline py-4 text-xs tracking-widest uppercase flex items-center justify-center gap-2">
                    <LogOut size={16} /> Sign Out
                  </button>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileNavOpen(false)} className="w-full btn btn-outline justify-center text-sm">
                      Sign In
                    </Link>
                    <Link to="/register" onClick={() => setMobileNavOpen(false)} className="w-full btn btn-gold justify-center text-sm">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
