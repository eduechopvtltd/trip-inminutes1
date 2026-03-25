// src/components/auth/ForgotPasswordPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-navy-800 mb-2">Check your inbox</h1>
        <p className="text-gray-500 text-sm mb-6">
          If <strong>{email}</strong> is registered, you'll receive a 6-digit OTP to reset your password.
        </p>
        <Link to="/reset-password" className="btn btn-navy w-full justify-center">
          Enter OTP & Reset Password →
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-navy-800 mb-2">Forgot password?</h1>
        <p className="text-gray-500 text-sm">Enter your email and we'll send a reset OTP.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="input-label">Email Address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" className="input-field pl-10" required />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full btn btn-navy justify-center py-3.5">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : 'Send Reset OTP'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        Remember it? <Link to="/login" className="text-silk-400 font-semibold hover:text-silk-600 transition-colors underline-offset-4 hover:underline">Back to login →</Link>
      </p>
    </motion.div>
  );
}
