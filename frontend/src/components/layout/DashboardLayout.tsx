// src/components/layout/DashboardLayout.tsx
import { Outlet, Link, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, Heart, Bell, Settings,
  LogOut, ShieldCheck, Users, BookOpen, Phone, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/index';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/admin/dashboard', end: true },
  { icon: Package,         label: 'Packages',  to: '/admin/packages',  end: false },
  { icon: BookOpen,        label: 'Bookings',  to: '/admin/bookings',  end: false },
  { icon: Phone,           label: 'Enquiries', to: '/admin/enquiries', end: false },
  { icon: Users,           label: 'Users',     to: '/admin/users',     end: false },
];

interface DashboardLayoutProps {
  isAdmin?: boolean;
}

export default function DashboardLayout({ isAdmin = false }: DashboardLayoutProps) {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const nav = ADMIN_NAV;

  return (
    <div className="min-h-screen bg-neutral-50 flex font-sans">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-[280px] bg-navy-900 border-r border-white/5 min-h-screen sticky top-0 overflow-y-auto shrink-0 z-20">
        {/* Logo Section */}
        <div className="p-8 pb-10">
          <Link to="/" className="flex items-center group transition-all duration-300 hover:opacity-90">
            <img src="/assets/logo-white.png" alt="TripInMinutes" className="h-10 w-auto object-contain relative z-10" />
          </Link>
        </div>

        {/* User Context Badge */}
        {isAdmin && (
          <div className="mx-6 mb-8 px-4 py-3 bg-silk-400/10 rounded-2xl border border-silk-400/20 backdrop-blur-md">
            <div className="flex items-center gap-2.5 text-silk-300 text-[11px] font-bold tracking-[0.05em] uppercase">
              <ShieldCheck size={14} className="text-silk-400" /> 
              Admin Control
            </div>
          </div>
        )}

        {/* Navigation Group */}
        <div className="px-5 mb-auto">
          <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] px-4 mb-4">
            Menu
          </div>
          <nav className="space-y-1.5 focus:outline-none">
            {nav.map(({ icon: Icon, label, to, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between px-4 py-3.5 rounded-2xl text-[13px] font-medium transition-all duration-300 relative overflow-hidden',
                    isActive
                      ? 'bg-silk-400 text-navy-950 shadow-[0_4px_20px_rgba(212,175,55,0.15)]'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                  )
                }
              >
                <div className="flex items-center gap-3.5 relative z-10 font-sans">
                  <Icon size={18} className={cn("transition-transform duration-300 group-hover:scale-110")} />
                  {label}
                </div>
                <ChevronRight size={14} className={cn("opacity-0 transition-all duration-300 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0")} />
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Premium Bottom Section */}
        <div className="p-6 mt-8 border-t border-white/5 bg-navy-950/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-5 p-2 rounded-2xl transition-colors hover:bg-white/[0.02]">
            <div className="w-10 h-10 bg-gradient-to-br from-silk-300 to-silk-400 rounded-xl flex items-center justify-center text-navy-950 font-bold text-sm shadow-lg ring-2 ring-white/5 shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="min-w-0 pr-2">
              <p className="text-white text-[13px] font-semibold truncate leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-white/30 text-[11px] truncate mt-0.5 tracking-wide">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl bg-white/5 text-white/60 text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-300 hover:bg-red-500/10 hover:text-red-400 border border-white/5"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content Area */}
      <main className="flex-1 min-w-0 flex flex-col relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-silk-400/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-navy-950/5 blur-[100px] pointer-events-none" />

        {/* Mobile Navbar (Top) */}
        <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-30">
          <Link to="/" className="flex items-center">
            <img src="/assets/logo-color.png" alt="TripInMinutes" className="h-7 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-silk-400 rounded-lg flex items-center justify-center text-navy-950 font-black text-[10px] shadow-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar (Persistent) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-2 py-2 flex justify-around items-center z-40 pb-safe">
          {nav.map(({ icon: Icon, to, label }) => (
            <NavLink 
              key={to} 
              to={to} 
              className={({ isActive }) => cn(
                "flex flex-col items-center gap-1 p-2 min-w-[64px] transition-all rounded-xl",
                isActive ? "text-silk-600" : "text-gray-400"
              )}
            >
              <Icon size={20} className={cn("transition-transform", "group-hover:scale-110")} />
              <span className="text-[9px] font-black uppercase tracking-widest">{label.split(' ')[0]}</span>
            </NavLink>
          ))}
        </div>

        {/* Content Wrapper */}
        <div className="flex-1 p-6 md:p-10 lg:p-12 xl:p-14 min-h-screen relative z-10 overflow-x-hidden animate-in fade-in slide-in-from-bottom-2 duration-700">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
