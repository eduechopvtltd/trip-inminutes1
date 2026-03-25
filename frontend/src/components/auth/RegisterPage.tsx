// src/components/auth/RegisterPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/index';
import type { RegisterPayload } from '@/types';

const schema = z.object({
  firstName: z.string().min(2, 'Min 2 characters'),
  lastName: z.string().min(2, 'Min 2 characters'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  password: z.string()
    .min(8, 'Min 8 characters')
    .regex(/[a-z]/, 'Must include lowercase letter')
    .regex(/[A-Z]/, 'Must include uppercase letter')
    .regex(/[0-9]/, 'Must include a number')
    .regex(/[^a-zA-Z0-9]/, 'Must include a special character'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = RegisterPayload & { confirmPassword: string };

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const { register: registerUser, registerPending } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = ({ confirmPassword: _cp, ...data }: FormData) => registerUser(data);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-8"
    >
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-navy-900 mb-3 tracking-tight">Create Account</h1>
        <p className="text-navy-600 text-base font-medium">Join our global world of luxury travel.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-navy-500 ml-1">First Name</label>
            <div className="relative group">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-silk-500 transition-colors" />
              <input 
                {...register('firstName')} 
                placeholder="Priya" 
                className="w-full bg-silk-50/50 border-b border-navy-100 py-3.5 pl-11 pr-4 text-navy-900 placeholder-navy-400 focus:outline-none focus:border-silk-500 transition-all rounded-t-xl hover:bg-silk-50 text-sm" 
              />
            </div>
            {errors.firstName && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-navy-500 ml-1">Last Name</label>
            <input 
              {...register('lastName')} 
              placeholder="Sharma" 
              className="w-full bg-silk-50/50 border-b border-navy-100 py-3.5 px-4 text-navy-900 placeholder-navy-400 focus:outline-none focus:border-silk-500 transition-all rounded-t-xl hover:bg-silk-50 text-sm" 
            />
            {errors.lastName && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-navy-500 ml-1">Email Address</label>
          <div className="relative group">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-silk-500 transition-colors" />
            <input 
              {...register('email')} 
              type="email" 
              placeholder="you@example.com" 
              className="w-full bg-silk-50/50 border-b border-navy-100 py-3.5 pl-11 pr-4 text-navy-900 placeholder-navy-400 focus:outline-none focus:border-silk-500 transition-all rounded-t-xl hover:bg-silk-50 text-sm" 
            />
          </div>
          {errors.email && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-navy-500 ml-1">Phone (Optional)</label>
          <div className="relative group">
            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-silk-500 transition-colors" />
            <input 
              {...register('phone')} 
              type="tel" 
              placeholder="+91 98765 43210" 
              className="w-full bg-silk-50/50 border-b border-navy-100 py-3.5 pl-11 pr-4 text-navy-900 placeholder-navy-400 focus:outline-none focus:border-silk-500 transition-all rounded-t-xl hover:bg-silk-50 text-sm" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-navy-500 ml-1">Password</label>
          <div className="relative group">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-silk-500 transition-colors" />
            <input 
              {...register('password')} 
              type={showPass ? 'text' : 'password'} 
              placeholder="Min 8 chars, uppercase, number, symbol" 
              className="w-full bg-silk-50/50 border-b border-navy-100 py-3.5 pl-11 pr-11 text-navy-900 placeholder-navy-400 focus:outline-none focus:border-silk-500 transition-all rounded-t-xl hover:bg-silk-50 text-sm" 
            />
            <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 transition-colors">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-navy-500 ml-1">Confirm Password</label>
          <input 
            {...register('confirmPassword')} 
            type="password" 
            placeholder="••••••••" 
            className="w-full bg-silk-50/50 border-b border-navy-100 py-3.5 px-4 text-navy-900 placeholder-navy-400 focus:outline-none focus:border-silk-500 transition-all rounded-t-xl hover:bg-silk-50 text-sm" 
          />
          {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.confirmPassword.message}</p>}
        </div>

        <p className="text-[10px] text-navy-400 leading-relaxed font-medium px-1">
          By signing up, you acknowledge our{' '}
          <Link to="#" className="text-silk-600 hover:text-silk-700 transition-colors underline-offset-4 hover:underline">Terms</Link> and{' '}
          <Link to="#" className="text-silk-600 hover:text-silk-700 transition-colors underline-offset-4 hover:underline">Privacy Policy</Link>.
        </p>

        <button 
          type="submit" 
          disabled={registerPending} 
          className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-4 rounded-xl shadow-xl shadow-navy-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
        >
          {registerPending ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              <span>Creating Profile...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Join Now</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-navy-500 font-medium">
        Already an explorer?{' '}
        <Link to="/login" className="text-silk-600 hover:text-silk-700 font-bold transition-colors underline-offset-8 hover:underline decoration-silk-300">Sign In →</Link>
      </p>
    </motion.div>
  );
}
