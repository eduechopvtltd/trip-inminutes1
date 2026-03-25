// src/components/auth/LoginPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/index';
import type { LoginPayload } from '@/types';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
});

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const { login, loginPending } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginPayload>({
    resolver: zodResolver(schema),
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-8"
    >
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-navy-900 mb-3 tracking-tight">Welcome Back</h1>
        <p className="text-navy-600 text-base font-medium">Access your curated travel world.</p>
      </div>

      <form onSubmit={handleSubmit((d) => login(d))} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-navy-500 ml-1">Email Address</label>
          <div className="relative group">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-silk-500 transition-colors" />
            <input 
              {...register('email')} 
              type="email" 
              placeholder="you@example.com" 
              className="w-full bg-silk-50/50 border-b border-navy-100 py-4 pl-12 pr-4 text-navy-900 placeholder-navy-400 focus:outline-none focus:border-silk-500 transition-all rounded-t-xl hover:bg-silk-50" 
              autoComplete="email" 
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-navy-500">Password</label>
            <Link to="/forgot-password" title="reset password" className="text-[10px] font-bold tracking-widest text-silk-600 hover:text-silk-700 uppercase transition-colors">Forgot?</Link>
          </div>
          <div className="relative group">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-silk-500 transition-colors" />
            <input 
              {...register('password')} 
              type={showPass ? 'text' : 'password'} 
              placeholder="••••••••" 
              className="w-full bg-silk-50/50 border-b border-navy-100 py-4 pl-12 pr-12 text-navy-900 placeholder-navy-400 focus:outline-none focus:border-silk-500 transition-all rounded-t-xl hover:bg-silk-50" 
              autoComplete="current-password" 
            />
            <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 transition-colors">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={loginPending} 
          className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-4 rounded-xl shadow-xl shadow-navy-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loginPending ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              <span>Authenticating...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Sign In</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-navy-100"></div></div>
        <div className="relative flex justify-center text-xs uppercase tracking-[0.3em] font-bold">
          <span className="bg-[#FDFCFB] px-4 text-navy-400">Quick Access</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          type="button" 
          onClick={() => login({ email: 'demo@tripinminutes.com', password: 'Demo@123' })}
          className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-white border border-navy-100 hover:border-silk-300 transition-all group shadow-sm hover:shadow-md"
        >
          <span className="text-xs font-bold text-navy-800 group-hover:text-silk-600 transition-colors">User Preview</span>
          <span className="text-[10px] text-navy-500 tracking-tight">demo@tripinminutes.com</span>
        </button>
        <button 
          type="button" 
          onClick={() => login({ email: 'admin@tripinminutes.com', password: 'Admin@123' })}
          className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-white border border-navy-100 hover:border-silk-300 transition-all group shadow-sm hover:shadow-md"
        >
          <span className="text-xs font-bold text-navy-800 group-hover:text-silk-600 transition-colors">Admin Preview</span>
          <span className="text-[10px] text-navy-500 tracking-tight">admin@tripinminutes.com</span>
        </button>
      </div>

      <p className="text-center text-sm text-navy-600 font-medium">
        New to the experience?{' '}
        <Link to="/register" className="text-silk-600 hover:text-silk-700 font-bold transition-colors underline-offset-8 hover:underline decoration-silk-300">Request Access →</Link>
      </p>
    </motion.div>
  );
}
