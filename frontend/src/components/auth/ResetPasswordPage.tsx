// src/components/auth/ResetPasswordPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Hash, Lock, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', otp: '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(form);
      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    } catch {
      toast.error('Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-navy-800 mb-2">Reset your password</h1>
        <p className="text-gray-500 text-sm">Enter the OTP from your email and your new password.</p>
      </div>
      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="input-label">Email Address</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com" className="input-field pl-10" required />
          </div>
        </div>
        <div>
          <label className="input-label">OTP Code</label>
          <div className="relative">
            <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })}
              placeholder="6-digit code" maxLength={6}
              className="input-field pl-10 text-center text-xl tracking-widest font-bold" required />
          </div>
        </div>
        <div>
          <label className="input-label">New Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="Min 8 characters" className="input-field pl-10" required />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full btn btn-navy justify-center py-3.5">
          {loading ? <><Loader2 size={15} className="animate-spin" /> Resetting…</> : 'Reset Password'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        <Link to="/forgot-password" className="text-silk-400 font-semibold hover:text-silk-600 transition-colors underline-offset-4 hover:underline">← Resend OTP</Link>
      </p>
    </motion.div>
  );
}
