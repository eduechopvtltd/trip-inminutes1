// src/components/dashboard/Profile.tsx
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Camera, Loader2, Lock, Save } from 'lucide-react';
import { api, userApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { getOptimizedImageUrl } from '@/lib/utils';
import type { User } from '@/types';

interface ProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
  nationality: string;
  passportNumber: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'profile' | 'security'>('profile');

  const profileForm = useForm<ProfileForm>({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
      nationality: user?.nationality ?? '',
      passportNumber: user?.passportNumber ?? '',
    },
  });

  const pwForm = useForm<PasswordForm>();

  const profileMutation = useMutation({
    mutationFn: (data: Partial<ProfileForm>) => userApi.updateProfile(data).then((r) => r.data.user),
    onSuccess: (updated) => {
      setUser(updated);
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Failed to update profile.'),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      userApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      pwForm.reset();
    },
    onError: () => toast.error('Incorrect current password.'),
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(r => r.data.user as User);
    },
    onSuccess: (updated: User) => {
      setUser(updated);
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('Portrait updated successfully.');
    },
    onError: () => toast.error('Failed to upload portrait.'),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error('Image must be under 2MB.');
      avatarMutation.mutate(file);
    }
  };

  const onPasswordSubmit = (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    passwordMutation.mutate({ currentPassword: data.currentPassword, newPassword: data.newPassword });
  };

  return (
    <div className="min-h-screen bg-surface pt-32 pb-24 px-6 flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100/50">
      <h1 className="font-display font-bold text-3xl text-navy-950 mb-8 text-center">Account Details</h1>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8">
        <div className="relative">
          <input type="file" id="avatar-input" className="hidden" accept="image/*" onChange={handleAvatarChange} />
          {user?.avatar ? (
            <img src={getOptimizedImageUrl(user.avatar, 200)} alt="" className="w-20 h-20 rounded-2xl object-cover shadow-inner" />
          ) : (
            <div className="w-20 h-20 bg-silk-500/10 rounded-2xl flex items-center justify-center text-silk-600 font-black text-2xl font-display">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          )}
          <label 
            htmlFor="avatar-input"
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-silk-400 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-md cursor-pointer group/cam active:scale-90"
          >
            {avatarMutation.isPending ? <Loader2 size={12} className="animate-spin text-navy-800" /> : <Camera size={14} className="text-navy-800 group-hover/cam:scale-110 transition-transform" />}
          </label>
        </div>
        <div>
          <p className="font-display font-semibold text-navy-800">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`badge text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-navy-900 text-white'}`}>
              {user?.role}
            </span>
            {user?.isEmailVerified && (
              <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">Verified</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[['profile', 'Profile Details'], ['security', 'Security']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t as typeof tab)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-[2px] transition-all ${tab === t ? 'border-silk-500 text-navy-800' : 'border-transparent text-gray-500 hover:text-navy-800'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <motion.form
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate(d))}
          className="space-y-6 mt-6"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">First Name</label>
              <input {...profileForm.register('firstName', { required: true })} className="input-field text-sm" />
            </div>
            <div>
              <label className="input-label">Last Name</label>
              <input {...profileForm.register('lastName', { required: true })} className="input-field text-sm" />
            </div>
          </div>
          <div>
            <label className="input-label">Phone</label>
            <input {...profileForm.register('phone')} type="tel" placeholder="+91 98765 43210" className="input-field text-sm" />
          </div>
          <div>
            <label className="input-label">Nationality</label>
            <input {...profileForm.register('nationality')} placeholder="Indian" className="input-field text-sm" />
          </div>
          <div>
            <label className="input-label">Passport Number <span className="text-gray-400 normal-case tracking-normal font-normal">(optional)</span></label>
            <input {...profileForm.register('passportNumber')} placeholder="A1234567" className="input-field text-sm" />
          </div>
          <button type="submit" disabled={profileMutation.isPending} className="btn btn-navy w-full justify-center">
            {profileMutation.isPending ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Save size={15} /> Save Changes</>}
          </button>
        </motion.form>
      )}

      {tab === 'security' && (
        <motion.form
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onSubmit={pwForm.handleSubmit(onPasswordSubmit)}
          className="space-y-6 mt-6"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-navy-800 mb-2">
            <Lock size={15} className="text-silk-500" /> Change Password
          </div>
          {[
            { name: 'currentPassword' as const, label: 'Current Password', placeholder: '••••••••' },
            { name: 'newPassword' as const,     label: 'New Password',     placeholder: 'Min 8 characters' },
            { name: 'confirmPassword' as const, label: 'Confirm New Password', placeholder: '••••••••' },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="input-label">{label}</label>
              <input {...pwForm.register(name, { required: true })} type="password" placeholder={placeholder} className="input-field text-sm" autoComplete="new-password" />
            </div>
          ))}
          <button type="submit" disabled={passwordMutation.isPending} className="btn btn-navy w-full justify-center">
            {passwordMutation.isPending ? <><Loader2 size={15} className="animate-spin" /> Updating…</> : 'Update Password'}
          </button>
        </motion.form>
      )}
      </div>
    </div>
  );
}
