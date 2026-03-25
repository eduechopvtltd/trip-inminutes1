// src/components/ui/SectionHeader.tsx
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  dark?: boolean;
  action?: ReactNode;
}

export default function SectionHeader({ label, title, subtitle, center, dark, action }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        'mb-10 md:mb-14',
        center && 'text-center',
        action && 'flex items-end justify-between gap-4',
      )}
    >
      <div>
        {label && <p className="section-label">{label}</p>}
        <h2 className={cn('section-title', dark && 'text-white')}>{title}</h2>
        {subtitle && (
          <p className={cn('section-sub mt-3', dark ? 'text-white/60' : '', center && 'mx-auto')}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.div>
  );
}
