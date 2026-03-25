// src/components/dashboard/Notifications.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Package, CreditCard, Megaphone, Info } from 'lucide-react';
import { userApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  BOOKING: Package,
  PAYMENT: CreditCard,
  PROMO:   Megaphone,
  SYSTEM:  Info,
};

export default function Notifications() {
  const qc = useQueryClient();

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => userApi.notifications().then((r) => r.data),
  });

  const markAll = useMutation({
    mutationFn: () => userApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read.');
    },
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="min-h-screen bg-surface pt-32 pb-24 px-6 flex justify-center">
      <div className="w-full max-w-3xl space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-bold text-2xl text-navy-800">Notifications</h1>
          {unreadCount > 0 && (
            <span className="badge-silk text-[10px]">{unreadCount} new</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={() => markAll.mutate()}
            className="btn btn-ghost btn-sm text-xs text-gray-500 hover:text-navy">
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 flex gap-3">
              <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell size={40} className="text-gray-200 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-500 mb-1">No notifications</h3>
          <p className="text-xs text-gray-400">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const Icon = TYPE_ICONS[n.type as keyof typeof TYPE_ICONS] ?? Info;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  'card p-4 flex items-start gap-3 transition-all',
                  !n.isRead && 'border-silk-400/30 bg-silk-100/10',
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  !n.isRead ? 'bg-silk-100' : 'bg-gray-100',
                )}>
                  <Icon size={16} className={!n.isRead ? 'text-silk-400' : 'text-gray-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm font-semibold', !n.isRead ? 'text-navy-800' : 'text-gray-700')}>
                      {n.title}
                    </p>
                    {!n.isRead && <div className="w-2 h-2 bg-silk-400 rounded-full shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1.5">{formatDate(n.createdAt)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
