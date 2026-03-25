// src/components/auth/VerifyEmailPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setLoading(true);
    try {
      await authApi.verifyEmail({ email: user.email, otp });
      setVerified(true);
      toast.success('Email verified!');
      setTimeout(() => navigate('/'), 2000);
    } catch {
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h1 className="font-display text-2xl font-bold text-navy-800 mb-2">Email Verified! 🎉</h1>
        <p className="text-gray-500 text-sm">Redirecting you to the homepage…</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8">
        <div className="w-14 h-14 bg-silk-100 rounded-2xl flex items-center justify-center mb-4">
          <Mail size={28} className="text-silk-400" />
        </div>
        <h1 className="font-display text-3xl font-bold text-navy-800 mb-2">Verify your email</h1>
        <p className="text-gray-500 text-sm">
          We sent a 6-digit OTP to{' '}
          <strong className="text-navy-800">{user?.email ?? 'your email'}</strong>.
          Enter it below to activate your account.
        </p>
      </div>
      <form onSubmit={handleVerify} className="space-y-5">
        <div>
          <label className="input-label">6-Digit OTP</label>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="• • • • • •"
            maxLength={6}
            className="input-field text-center text-3xl font-bold tracking-[0.5em] py-4"
            required
          />
        </div>
        <button type="submit" disabled={loading || otp.length < 6} className="w-full btn btn-navy justify-center py-3.5">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying…</> : 'Verify Email'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        Didn't receive it?{' '}
        <button className="text-silk-400 font-semibold hover:text-silk-600 transition-colors underline-offset-4 hover:underline" onClick={async () => {
          if (!user?.email) return;
          await authApi.forgotPassword(user.email).catch(() => null);
          toast.success('New OTP sent!');
        }}>
          Resend OTP
        </button>
      </p>
      <p className="text-center text-xs text-gray-400 mt-2">
        <Link to="/" className="hover:text-navy">Skip for now →</Link>
      </p>
    </motion.div>
  );
}
